import Ember from 'ember';
import mensagemDeErroApi from '../utils/mensagem-erro-api';

const TOTAL_BOTOES = 3;

function preenchido(valor) {
    return !!(valor || '').trim();
}

// O modal edita rascunhos (cópias) e só aplica nos registros ao salvar; cancelar apenas fecha.
// Nos rascunhos os campos se chamam titulo/descricao; nos models do EAD são atividade.name/description e secao.nome.
function rascunhoBotoes(botoes) {
    let lista = [];
    for (let i = 0; i < TOTAL_BOTOES; i++) {
        let botao = (botoes || [])[i] || {};
        lista.push(Ember.Object.create({ titulo: botao.titulo || '', link: botao.link || '' }));
    }
    return Ember.A(lista);
}

// Mesmas regras do back: Vimeo = só dígitos, vimeo.com/{id} ou player.vimeo.com/video/{id} (com /hash opcional);
// YouTube = watch?v=, youtu.be/, embed/ ou shorts/ com id de 11 caracteres. Devolve 'vimeo' | 'youtube' | null
const VIMEO_ID = /^\d+$/;
const VIMEO_URL = /^(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)(?:\/[A-Za-z0-9]+)?\/?(?:[?#].*)?$/;
const YOUTUBE_URL = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/;
function provedorVideo(valor) {
    let entrada = (valor || '').trim();
    if (!entrada) return null;
    if (VIMEO_ID.test(entrada) || VIMEO_URL.test(entrada)) return 'vimeo';
    if (YOUTUBE_URL.test(entrada)) return 'youtube';
    return null;
}

const RascunhoSecao = Ember.Object.extend({
    // Provedor detectado pela entrada digitada, exibido abaixo do campo de vídeo
    provedorNome: Ember.computed('videoId', function () {
        let provedor = provedorVideo(this.get('videoId'));
        return provedor == 'vimeo' ? 'Vimeo' : provedor == 'youtube' ? 'YouTube' : null;
    }),
    // 'questoes' não é mais oferecido; só aparece (como descontinuado) em seção já gravada com esse tipo
    tipoDescontinuado: Ember.computed('tipo', function () {
        return this.get('tipo') == 'questoes';
    })
});

function rascunhoSecao(secao) {
    let videoId = (secao && secao.get('videoId')) || '';
    // O back guarda só o id; para YouTube o campo mostra a URL completa, para o gestor reconhecer o vídeo
    if (videoId && secao.get('provedor') == 'youtube') videoId = 'https://www.youtube.com/watch?v=' + videoId;
    return RascunhoSecao.create({
        record: secao || null,
        titulo: (secao && secao.get('nome')) || '',
        tipo: (secao && secao.get('tipo')) || '',
        descricao: (secao && secao.get('descricao')) || '',
        videoId: videoId,
        botoes: rascunhoBotoes(secao && secao.get('botoes'))
    });
}

function erroSecao(secao) {
    if (!preenchido(secao.get('titulo'))) return 'Informe o título de todos os objetos de aprendizagem.';
    switch (secao.get('tipo')) {
        case 'arquivo': {
            let botoes = secao.get('botoes');
            if (botoes.any(botao => preenchido(botao.get('titulo')) != preenchido(botao.get('link')))) return 'Cada botão do objeto de aprendizagem de arquivo precisa de título e link.';
            if (!botoes.any(botao => preenchido(botao.get('link')))) return 'Informe ao menos um link no objeto de aprendizagem de arquivo.';
            return null;
        }
        case 'texto':
            return preenchido(secao.get('descricao')) ? null : 'Informe o texto do objeto de aprendizagem de texto.';
        case 'video':
            // A entrada vai como está (trim) em video-id; o back normaliza para o id e grava o provedor
            return provedorVideo(secao.get('videoId')) ? null : 'Informe o id ou a URL de um vídeo do Vimeo, ou a URL de um vídeo do YouTube.';
        case 'questoes':
            // Tipo descontinuado: seção já gravada continua aceita no re-save até ser removida ou trocada de tipo
            return null;
        default:
            return 'Selecione o tipo de todos os objetos de aprendizagem.';
    }
}

// Grava só os campos do tipo escolhido, descartando o que foi digitado em outros tipos
function dadosSecao(secao, idx) {
    let tipo = secao.get('tipo');
    return {
        secaoId: secao.get('record.id') || null,
        idx: idx,
        nome: secao.get('titulo').trim(),
        tipo: tipo,
        descricao: (tipo == 'arquivo' || tipo == 'texto') ? secao.get('descricao') : null,
        videoId: tipo == 'video' ? secao.get('videoId').trim() : null,
        botoes: tipo == 'arquivo'
            ? secao.get('botoes').filter(botao => preenchido(botao.get('link'))).map(botao => ({ titulo: botao.get('titulo').trim(), link: botao.get('link').trim() }))
            : null
    };
}

function rascunhoAtividade(atividade) {
    let secoes = atividade ? atividade.get('secoes').sortBy('idx').map(secao => rascunhoSecao(secao)) : [rascunhoSecao()];
    return Ember.Object.create({
        record: atividade || null,
        titulo: (atividade && atividade.get('name')) || '',
        descricao: (atividade && atividade.get('description')) || '',
        secoes: Ember.A(secoes),
        secaoAtiva: secoes[0] || null
    });
}

export default Ember.Component.extend({
    tagName: 'aside',
    classNames: ['modal', 'modal--is-show'],
    store: Ember.inject.service(),

    erro: null,
    tiposSecao: [
        { valor: 'arquivo', nome: 'Arquivo' },
        { valor: 'texto', nome: 'Texto' },
        { valor: 'video', nome: 'Vídeo' }
        // 'questoes' descontinuado: não é mais oferecido para seções novas (o back rejeita com 400)
    ],

    init() {
        this._super(...arguments);
        let atividades = this.get('modulo.atividades').sortBy('idx').map(atividade => rascunhoAtividade(atividade));
        if (atividades.length == 0) atividades.push(rascunhoAtividade());
        this.set('atividades', Ember.A(atividades));
        this.set('atividadeAtiva', atividades[0]);
    },

    didInsertElement() {
        this._super(...arguments);
        document.body.classList.add('overflow-hidden');
    },

    willDestroyElement() {
        this._super(...arguments);
        document.body.classList.remove('overflow-hidden');
    },

    actions: {
        selectAtividade(atividade) {
            this.set('atividadeAtiva', atividade);
        },
        addAtividade() {
            let atividade = rascunhoAtividade();
            this.get('atividades').pushObject(atividade);
            this.set('atividadeAtiva', atividade);
        },
        removeAtividade(atividade) {
            let atividades = this.get('atividades');
            let idx = atividades.indexOf(atividade);
            atividades.removeObject(atividade);
            this.set('atividadeAtiva', atividades.objectAt(Math.min(idx, atividades.get('length') - 1)) || null);
        },
        selectSecao(atividade, secao) {
            atividade.set('secaoAtiva', secao);
        },
        // Lê do evento: no Ember 2.16, value="target.value" seria aplicado ao 1º argumento (a seção), não ao evento
        selectTipoSecao(secao, event) {
            secao.set('tipo', event.target.value);
        },
        addSecao(atividade) {
            let secao = rascunhoSecao();
            atividade.get('secoes').pushObject(secao);
            atividade.set('secaoAtiva', secao);
        },
        removeSecao(atividade, secao) {
            let secoes = atividade.get('secoes');
            let idx = secoes.indexOf(secao);
            secoes.removeObject(secao);
            atividade.set('secaoAtiva', secoes.objectAt(Math.min(idx, secoes.get('length') - 1)) || null);
        },
        save() {
            let atividades = this.get('atividades');

            let atividadeSemTitulo = atividades.find(atividade => !preenchido(atividade.get('titulo')));
            if (atividadeSemTitulo) {
                this.set('atividadeAtiva', atividadeSemTitulo);
                this.set('erro', 'Informe o título de todas as unidades.');
                return;
            }
            for (let atividade of atividades) {
                let secaoInvalida = atividade.get('secoes').find(secao => erroSecao(secao));
                if (secaoInvalida) {
                    this.set('atividadeAtiva', atividade);
                    atividade.set('secaoAtiva', secaoInvalida);
                    this.set('erro', erroSecao(secaoInvalida));
                    return;
                }
            }
            this.set('erro', null);

            // A árvore inteira vai no PATCH do módulo (serializers/modulo.js) e o ModuloesController da API
            // cria/edita/remove atividades e seções: id null = novo, id existente = edição, ausente = remover
            let payload = atividades.map((atividade, i) => ({
                atividadeId: atividade.get('record.id') || null,
                idx: i,
                name: atividade.get('titulo').trim(),
                description: atividade.get('descricao'),
                secoes: atividade.get('secoes').map((secao, j) => dadosSecao(secao, j))
            }));

            let modulo = this.get('modulo');
            this.set('salvando', true);
            // A resposta do PATCH já traz as atividades e seções com os ids gerados (no "included")
            modulo.save({ adapterOptions: { atividades: payload } })
                .then(() => {
                    if (!this.get('isDestroyed')) this.get('onClose')();
                })
                .catch(erro => {
                    if (this.get('isDestroyed')) return;
                    this.set('salvando', false);
                    this.set('erro', mensagemDeErroApi(erro, 'Não foi possível salvar o conteúdo próprio. Tente novamente.'));
                });
        }
    }
});
