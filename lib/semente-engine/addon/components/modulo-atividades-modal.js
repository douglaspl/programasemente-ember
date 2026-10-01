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

function rascunhoSecao(secao) {
    return Ember.Object.create({
        record: secao || null,
        titulo: (secao && secao.get('nome')) || '',
        tipo: (secao && secao.get('tipo')) || '',
        descricao: (secao && secao.get('descricao')) || '',
        videoId: (secao && secao.get('videoId')) || '',
        botoes: rascunhoBotoes(secao && secao.get('botoes'))
    });
}

function erroSecao(secao) {
    if (!preenchido(secao.get('titulo'))) return 'Informe o título de todas as seções.';
    switch (secao.get('tipo')) {
        case 'arquivo': {
            let botoes = secao.get('botoes');
            if (botoes.any(botao => preenchido(botao.get('titulo')) != preenchido(botao.get('link')))) return 'Cada botão da seção de arquivo precisa de título e link.';
            if (!botoes.any(botao => preenchido(botao.get('link')))) return 'Informe ao menos um link na seção de arquivo.';
            return null;
        }
        case 'texto':
            return preenchido(secao.get('descricao')) ? null : 'Informe a descrição da seção de texto.';
        case 'video':
            return preenchido(secao.get('videoId')) ? null : 'Informe o videoId da seção de vídeo.';
        case 'questoes':
            return null;
        default:
            return 'Selecione o tipo de todas as seções.';
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
        { valor: 'video', nome: 'Vídeo' },
        { valor: 'questoes', nome: 'Questões' }
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
                this.set('erro', 'Informe o título de todas as atividades.');
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
                    this.set('erro', mensagemDeErroApi(erro, 'Não foi possível salvar o módulo. Tente novamente.'));
                });
        }
    }
});
