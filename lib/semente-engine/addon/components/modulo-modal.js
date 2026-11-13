import Ember from 'ember';
import mensagemDeErroApi from '../utils/mensagem-erro-api';

function normalizar(texto) {
    return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export default Ember.Component.extend({
    tagName: 'aside',
    classNames: ['modal', 'modal--is-show'],
    store: Ember.inject.service(),
    escopoGestor: Ember.inject.service('escopo-gestor'),

    titulo: '',
    codigo: '',
    descricao: '',
    autores: '',
    inicio: '', // 'YYYY-MM-DD'
    fim: '', // 'YYYY-MM-DD'
    buscaInstituicao: '',
    erro: null,
    instituicoes: null,

    // valor = role da pessoa
    perfisDisponiveis: [
        { valor: 'aluno', nome: 'Aluno' },
        { valor: 'instrutor', nome: 'Professor' },
        { valor: 'coordenador', nome: 'Coordenador' },
        { valor: 'gestor', nome: 'Gestor' }
    ],

    // "Incluir no motor de recomendação" (modulo.isDesenvolvimento)
    incluirRecomendacao: false,

    init() {
        this._super(...arguments);
        // Seleções guardadas como { id: true } e substituídas a cada mudança, para os checkboxes re-renderizarem
        this.set('instituicoesSelecionadas', {});
        this.set('perfisSelecionados', {});
        this.set('anosSelecionados', {});
        // { competenciaId: { peso } }; peso '' = marcada mas ainda sem peso (objeto para o template saber que está marcada)
        this.set('competenciasSelecionadas', {});

        // Edição: preenche o formulário com o módulo recebido
        let modulo = this.get('modulo');
        if (modulo) this.preencherComModulo(modulo);

        let person = JSON.parse(localStorage.getItem('person_logged') || 'null');
        this.set('isAdmin', !!person && person.role == 'admin');
        if (this.get('isAdmin')) {
            this.get('store').findAll('instituicao').then(instituicoes => {
                if (!this.get('isDestroyed')) this.set('instituicoes', instituicoes);
            });
        } else {
            // Gestor: só a própria instituição e as descendentes (escopo devolvido pela API, em pré-ordem)
            this.get('escopoGestor').carregarEscopoConteudos().then(escopo => {
                if (this.get('isDestroyed')) return;
                this.set('instituicoes', this.instituicoesDoEscopo(escopo.instituicoes || []));
                this.aplicarAnosDoEscopo(escopo.plataformaAnos || []);
            });
        }
        this.get('store').findAll('comp', { include: 'dominio' }).then(competencias => {
            if (!this.get('isDestroyed')) this.set('competencias', competencias);
        });
    },

    // Lista do gestor: objetos simples { id, name, nivel, recuo }. O save envia records de instituicao
    // (relacionamento do modulo), então as que ainda não estão no store entram só com id e nome
    // (sem buscar cada uma na API); as já carregadas não são tocadas
    instituicoesDoEscopo(nos) {
        let store = this.get('store');
        let faltando = nos.filter(no => !store.hasRecordForId('instituicao', no.id));
        if (faltando.length) {
            store.push({ data: faltando.map(no => ({ id: no.id, type: 'instituicao', attributes: { name: no.nome } })) });
        }
        return nos.map(no => ({
            id: no.id,
            name: no.nome,
            nivel: no.nivel,
            recuo: Ember.String.htmlSafe('padding-left: ' + (no.nivel * 1.5) + 'rem;')
        }));
    },

    // Anos do gestor: vêm do escopo (anos da subárvore + o de idx 20). Mesma ideia das instituições:
    // records mínimos de plataforma-ano/segmento só para os que ainda não estão no store
    aplicarAnosDoEscopo(anos) {
        let store = this.get('store');
        let segmentosFaltando = [];
        anos.forEach(ano => {
            if (ano.segmentoId && !store.hasRecordForId('segmento', ano.segmentoId) &&
                !segmentosFaltando.some(seg => seg.id == ano.segmentoId)) {
                segmentosFaltando.push({ id: ano.segmentoId, type: 'segmento', attributes: { titulo: ano.segmentoNome } });
            }
        });
        if (segmentosFaltando.length) store.push({ data: segmentosFaltando });
        let anosFaltando = anos.filter(ano => !store.hasRecordForId('plataforma-ano', ano.id));
        if (anosFaltando.length) {
            store.push({
                data: anosFaltando.map(ano => ({
                    id: ano.id,
                    type: 'plataforma-ano',
                    attributes: { name: ano.nome, idx: ano.idx },
                    relationships: ano.segmentoId ? { segmento: { data: { id: ano.segmentoId, type: 'segmento' } } } : {}
                }))
            });
        }

        let anoOutrosPerfis = anos.find(ano => ano.idx == 20);
        this.set('anosEscopo', anos);
        this.set('anoOutrosPerfisEscopoId', anoOutrosPerfis ? anoOutrosPerfis.id : null);
        // Edição: o ano de idx 20 não aparece como ano marcado (mesma regra do preencherComModulo)
        if (anoOutrosPerfis && this.get('anosSelecionados')[anoOutrosPerfis.id]) {
            let selecionados = Ember.assign({}, this.get('anosSelecionados'));
            delete selecionados[anoOutrosPerfis.id];
            this.set('anosSelecionados', selecionados);
        }

        // Agrupados por segmento, na ordem em que vieram (sem o de idx 20)
        let grupos = [];
        anos.filter(ano => ano.idx != 20).forEach(ano => {
            let chave = ano.segmentoId || '';
            let grupo = grupos.find(g => g.chave == chave);
            if (!grupo) {
                grupo = { chave: chave, segmento: { titulo: ano.segmentoNome }, anos: [] };
                grupos.push(grupo);
            }
            grupo.anos.push({ id: ano.id, name: ano.nome });
        });
        this.set('anosPorSegmentoEscopo', grupos);
    },

    preencherComModulo(modulo) {
        let paraMapa = (ids, valor) => ids.reduce((mapa, id) => { mapa[id] = valor(id); return mapa; }, {});
        // O ano de idx 20 é incluído automaticamente para professor/coordenador; não aparece como ano marcado
        let anosIds = modulo.hasMany('plataformaAnos').ids().filter(id => {
            let ano = this.get('store').peekRecord('plataforma-ano', id);
            return !ano || ano.get('idx') != 20;
        });
        let pesos = {};
        (modulo.get('competencias') || []).forEach(item => { pesos[item.competencia] = { peso: item.peso }; });

        this.setProperties({
            titulo: modulo.get('name') || '',
            codigo: modulo.get('codigo') || '',
            descricao: modulo.get('description') || '',
            autores: modulo.get('autor') || '',
            inicio: modulo.get('inicio') || '',
            fim: modulo.get('fim') || '',
            instituicoesSelecionadas: paraMapa(modulo.hasMany('instituicoes').ids(), () => true),
            perfisSelecionados: paraMapa(modulo.get('perfis') || [], () => true),
            anosSelecionados: paraMapa(anosIds, () => true),
            competenciasSelecionadas: pesos,
            incluirRecomendacao: modulo.get('isDesenvolvimento') === true
        });
    },

    pesosCompetencia: [1, 2, 3],

    // Competências agrupadas por domínio, na ordem dos domínios
    competenciasPorDominio: Ember.computed('competencias.@each.name', function () {
        let grupos = [];
        (this.get('competencias') || []).sortBy('dominio.idx', 'idx').forEach(competencia => {
            let nome = competencia.get('dominio.name') || 'Outras';
            let grupo = grupos.find(g => g.nome == nome);
            if (!grupo) {
                grupo = { nome: nome, competencias: [] };
                grupos.push(grupo);
            }
            grupo.competencias.push(competencia);
        });
        return grupos;
    }),

    totalCompetenciasSelecionadas: Ember.computed('competenciasSelecionadas', function () {
        return Object.keys(this.get('competenciasSelecionadas')).length;
    }),

    didInsertElement() {
        this._super(...arguments);
        document.body.classList.add('overflow-hidden');
    },

    willDestroyElement() {
        this._super(...arguments);
        document.body.classList.remove('overflow-hidden');
    },

    instituicoesFiltradas: Ember.computed('instituicoes.@each.name', 'buscaInstituicao', function () {
        if (!this.get('instituicoes')) return [];
        let busca = normalizar(this.get('buscaInstituicao'));
        // Gestor: mantém a ordem da árvore (pré-ordem), para a indentação fazer sentido
        let insts = this.get('isAdmin') ? this.get('instituicoes').sortBy('name') : this.get('instituicoes');
        if (busca) insts = insts.filter(inst => normalizar(Ember.get(inst, 'name')).includes(busca));
        return insts;
    }),

    totalInstituicoesSelecionadas: Ember.computed('instituicoesSelecionadas', function () {
        return Object.keys(this.get('instituicoesSelecionadas')).length;
    }),

    alunoSelecionado: Ember.computed('perfisSelecionados', function () {
        return !!this.get('perfisSelecionados').aluno;
    }),

    anosPorSegmento: Ember.computed('anosPorSegmentoEscopo', function () {
        if (!this.get('isAdmin')) return this.get('anosPorSegmentoEscopo') || [];
        let anos = this.get('store').peekAll('plataforma-ano');
        return this.get('store').peekAll('segmento').sortBy('idx').map(segmento => ({
            segmento: segmento,
            anos: anos.filterBy('segmento.id', segmento.get('id')).sortBy('idx')
        })).filter(segmentoAnos => segmentoAnos.anos.length > 0);
    }),

    actions: {
        instituicaoChanged(instId) {
            let selecionadas = Ember.assign({}, this.get('instituicoesSelecionadas'));
            if (selecionadas[instId]) delete selecionadas[instId];
            else selecionadas[instId] = true;
            this.set('instituicoesSelecionadas', selecionadas);
        },
        selectAllInstituicoes() {
            let selecionadas = Ember.assign({}, this.get('instituicoesSelecionadas'));
            this.get('instituicoesFiltradas').forEach(inst => { selecionadas[Ember.get(inst, 'id')] = true; });
            this.set('instituicoesSelecionadas', selecionadas);
        },
        clearInstituicoes() {
            this.set('instituicoesSelecionadas', {});
        },
        perfilChanged(perfil) {
            let selecionados = Ember.assign({}, this.get('perfisSelecionados'));
            if (selecionados[perfil]) delete selecionados[perfil];
            else selecionados[perfil] = true;
            this.set('perfisSelecionados', selecionados);
            // Gestor: desmarcar Aluno limpa os anos (inclusive os fora do escopo, que não aparecem na lista)
            if (!this.get('isAdmin') && perfil == 'aluno' && !selecionados.aluno) this.set('anosSelecionados', {});
        },
        competenciaChanged(competenciaId) {
            let selecionadas = Ember.assign({}, this.get('competenciasSelecionadas'));
            if (selecionadas[competenciaId]) delete selecionadas[competenciaId];
            else selecionadas[competenciaId] = { peso: '' };
            this.set('competenciasSelecionadas', selecionadas);
        },
        // Lê do evento: no Ember 2.16, value="target.value" seria aplicado ao 1º argumento (o id), não ao evento
        pesoChanged(competenciaId, event) {
            let selecionadas = Ember.assign({}, this.get('competenciasSelecionadas'));
            selecionadas[competenciaId] = { peso: event.target.value ? parseInt(event.target.value) : '' };
            this.set('competenciasSelecionadas', selecionadas);
        },
        platAnoChanged(anoId) {
            let selecionados = Ember.assign({}, this.get('anosSelecionados'));
            if (selecionados[anoId]) delete selecionados[anoId];
            else selecionados[anoId] = true;
            this.set('anosSelecionados', selecionados);
        },
        save() {
            let titulo = (this.get('titulo') || '').trim();
            let codigo = (this.get('codigo') || '').trim();
            let inicio = this.get('inicio');
            let fim = this.get('fim');
            let instIds = Object.keys(this.get('instituicoesSelecionadas'));
            let perfisSelecionados = this.get('perfisSelecionados');
            let perfis = this.get('perfisDisponiveis').filter(perfil => perfisSelecionados[perfil.valor]).map(perfil => perfil.valor);
            let alunoSelecionado = this.get('alunoSelecionado');
            // Os anos só valem para o perfil de aluno
            let anoIds = alunoSelecionado ? Object.keys(this.get('anosSelecionados')) : [];

            let erro = null;
            if (!titulo) erro = 'Informe o título do conteúdo próprio.';
            else if (!codigo) erro = 'Informe o código do conteúdo próprio.';
            else if (!inicio || !fim) erro = 'Informe a data de início e de fim.';
            else if (fim < inicio) erro = 'A data de fim não pode ser antes da data de início.';
            else if (instIds.length == 0) erro = 'Selecione ao menos uma instituição.';
            else if (perfis.length == 0) erro = 'Selecione ao menos um perfil.';
            else if (alunoSelecionado && anoIds.length == 0) erro = 'Selecione ao menos um ano para o perfil de aluno.';

            let competenciasSelecionadas = this.get('competenciasSelecionadas');
            let competencias = Object.keys(competenciasSelecionadas).map(id => ({
                competencia: parseInt(id),
                peso: competenciasSelecionadas[id].peso
            }));
            if (!erro && competencias.some(competencia => !competencia.peso)) erro = 'Selecione o peso de todas as competências marcadas.';
            let incluirRecomendacao = this.get('incluirRecomendacao') === true;
            if (!erro && incluirRecomendacao && competencias.length == 0) erro = 'Para incluir no motor de recomendação, marque ao menos uma competência.';
            let store = this.get('store');
            let plataformaAnos = anoIds.map(id => store.peekRecord('plataforma-ano', id));

            // Perfis diferentes de aluno (professor, coordenador, gestor) entram pelo plataforma-ano de idx 20
            if (!erro && perfis.some(perfil => perfil != 'aluno')) {
                // Gestor: o ano de idx 20 vem do escopo (não do GET plataforma-anos)
                let anoOutrosPerfis = this.get('isAdmin') ?
                    store.peekAll('plataforma-ano').find(ano => ano.get('idx') == 20) :
                    (this.get('anoOutrosPerfisEscopoId') ? store.peekRecord('plataforma-ano', this.get('anoOutrosPerfisEscopoId')) : null);
                if (!anoOutrosPerfis) erro = 'Não foi encontrado o ano (idx 20) usado para os perfis de professor e coordenador.';
                else if (!plataformaAnos.includes(anoOutrosPerfis)) plataformaAnos.push(anoOutrosPerfis);
            }

            // Gestor editando: instituição marcada que não está mais no escopo dele (não aparece na lista)
            if (!erro && !this.get('isAdmin') && instIds.some(id => !store.peekRecord('instituicao', id))) {
                erro = 'Há instituições marcadas que não estão mais disponíveis para você. Use "Limpar seleção" e marque novamente.';
            }
            // Gestor editando: ano marcado que não está no escopo dele (não aparece na lista)
            if (!erro && !this.get('isAdmin')) {
                let anosEscopoIds = (this.get('anosEscopo') || []).map(ano => ano.id);
                if (anoIds.some(id => !anosEscopoIds.includes(String(id)) || !store.peekRecord('plataforma-ano', id))) {
                    erro = 'Há anos marcados que não estão mais disponíveis para você. Desmarque e marque de novo o perfil Aluno para refazer a escolha dos anos.';
                }
            }

            this.set('erro', erro);
            if (erro) return;

            this.set('salvando', true);
            Ember.RSVP.resolve(this.get('onSave')({
                name: titulo,
                codigo: codigo,
                description: (this.get('descricao') || '').trim(),
                autor: (this.get('autores') || '').trim(),
                inicio: inicio,
                fim: fim,
                perfis: perfis,
                competencias: competencias,
                isDesenvolvimento: incluirRecomendacao,
                instituicoes: instIds.map(id => store.peekRecord('instituicao', id)),
                plataformaAnos: plataformaAnos
            })).catch(erro => {
                if (this.get('isDestroyed')) return;
                this.set('salvando', false);
                this.set('erro', mensagemDeErroApi(erro) || 'Não foi possível salvar o conteúdo próprio. Tente novamente.');
            });
        }
    }
});
