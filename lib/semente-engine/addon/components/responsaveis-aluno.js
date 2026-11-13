import Ember from 'ember';

// Seção "Responsáveis (máx. 2)" na edição de um aluno já salvo.
// Usa chamadas ajax diretas (JSON puro) aos endpoints api/v0/responsaveis — de propósito
// sem Ember Data, para não interferir no model `pessoa` legado (responsaveis/dependentes).
// Recebe: pessoaId (id da pessoa editada; o back resolve a pessoa correspondente da plataforma).
const MAX_RESPONSAVEIS = 2;
const ORIGENS = {
    1: 'Autocadastro (chave)', 2: 'Cadastro pelo Admin', 3: 'Carga em lote',
    chave: 'Autocadastro (chave)', admin: 'Cadastro pelo Admin', carga: 'Carga em lote'
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default Ember.Component.extend({
    store: Ember.inject.service(),
    tagName: 'section',
    classNames: ['sections__subsection', 'responsaveis-aluno'],

    maxResponsaveis: MAX_RESPONSAVEIS,
    carregando: false,
    erroLista: null,
    responsaveis: null,

    formAberto: false,
    novoNome: '',
    novoEmail: '',
    novoTelefone: '',
    erroNome: null,
    erroEmail: null,
    erroForm: null,
    salvando: false,

    confirmandoRemocaoId: null,
    removendoId: null,
    erroRemocao: null,
    sucesso: null,

    _seq: 0,

    totalResponsaveis: Ember.computed('responsaveis.[]', function () {
        return (this.get('responsaveis') || []).length;
    }),
    podeAdicionar: Ember.computed('totalResponsaveis', 'carregando', 'erroLista', function () {
        return !this.get('carregando') && !this.get('erroLista') && this.get('totalResponsaveis') < MAX_RESPONSAVEIS;
    }),

    didReceiveAttrs() {
        this._super(...arguments);
        let id = this.get('pessoaId');
        if (id && id !== this._pessoaIdCarregado) {
            this._pessoaIdCarregado = id;
            this._resetForm();
            this.setProperties({ formAberto: false, confirmandoRemocaoId: null, erroRemocao: null, sucesso: null });
            this._carregar();
        }
    },

    willDestroyElement() {
        this._seq++;
        this._super(...arguments);
    },

    _vivo(seq) {
        return !this.get('isDestroyed') && !this.get('isDestroying') && seq === this._seq;
    },

    _request(type, path, body) {
        let adapter = this.get('store').adapterFor('application');
        let headers = adapter.get('headers') || {};
        let opts = {
            url: adapter.get('host') + '/' + adapter.get('namespace') + '/' + path,
            type: type,
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Authorization': headers['Authorization'],
                'pessoaid': headers['pessoaid']
            }
        };
        if (body) {
            opts.contentType = 'application/json';
            opts.data = JSON.stringify(body);
        }
        return new Ember.RSVP.Promise((resolve, reject) => {
            Ember.$.ajax(opts).then(resolve, (xhr) => {
                // 201/204 sem corpo com dataType json caem aqui como "parsererror"
                if (xhr && xhr.status >= 200 && xhr.status < 300) return resolve(null);
                reject(xhr);
            });
        });
    },

    _mensagemErro(xhr, padrao) {
        let r = xhr && xhr.responseJSON;
        let msg = r && (r.mensagem || r.message || r.Message || r.erro);
        if (msg) return msg;
        if (xhr && xhr.status === 409) return 'Não foi possível vincular: o aluno já tem 2 responsáveis ou o e-mail pertence a uma conta que não pode ser vinculada.';
        if (xhr && xhr.status === 403) return 'Você não tem permissão para gerenciar os responsáveis deste aluno.';
        return padrao;
    },

    _normalizar(lista) {
        return (lista || []).map((r) => ({
            vinculoId: r.vinculoId,
            responsavelPessoaId: r.responsavelPessoaId,
            nome: r.nome,
            email: r.email,
            telefone: r.telefone,
            ativo: r.ativo !== false,
            origemLabel: ORIGENS[r.origem] || '—'
        }));
    },

    _carregar() {
        let seq = ++this._seq;
        this.setProperties({ carregando: true, erroLista: null });
        let id = this.get('pessoaId');
        return this._request('GET', 'responsaveis?dependentePessoaId=' + encodeURIComponent(id)).then((resp) => {
            if (!this._vivo(seq)) return;
            this.setProperties({ responsaveis: this._normalizar(resp), carregando: false });
        }, (xhr) => {
            if (!this._vivo(seq)) return;
            this.setProperties({
                responsaveis: [],
                carregando: false,
                erroLista: this._mensagemErro(xhr, 'Não foi possível carregar os responsáveis.')
            });
        });
    },

    _resetForm() {
        this.setProperties({
            novoNome: '', novoEmail: '', novoTelefone: '',
            erroNome: null, erroEmail: null, erroForm: null, salvando: false
        });
    },

    actions: {
        abrirForm() {
            this._resetForm();
            this.setProperties({ formAberto: true, sucesso: null, confirmandoRemocaoId: null });
        },

        cancelarForm() {
            this._resetForm();
            this.set('formAberto', false);
        },

        adicionar() {
            if (this.get('salvando')) return;
            let nome = (this.get('novoNome') || '').trim();
            let email = (this.get('novoEmail') || '').trim();
            let telefone = (this.get('novoTelefone') || '').trim();
            let erroNome = nome ? null : 'Informe o nome do responsável.';
            let erroEmail = !email ? 'Informe o e-mail do responsável.' :
                (EMAIL_RE.test(email) ? null : 'E-mail inválido.');
            this.setProperties({ erroNome: erroNome, erroEmail: erroEmail, erroForm: null, sucesso: null });
            if (erroNome || erroEmail) return;

            let seq = this._seq;
            this.set('salvando', true);
            this._request('POST', 'responsaveis', {
                dependentePessoaId: this.get('pessoaId'),
                nome: nome,
                email: email,
                telefone: telefone || null
            }).then(() => {
                if (!this._vivo(seq)) return;
                this._resetForm();
                this.setProperties({ formAberto: false, sucesso: 'Responsável adicionado.' });
                this._carregar();
            }, (xhr) => {
                if (!this._vivo(seq)) return;
                this.setProperties({
                    salvando: false,
                    erroForm: this._mensagemErro(xhr, 'Não foi possível adicionar o responsável.')
                });
            });
        },

        pedirRemocao(vinculoId) {
            this.setProperties({ confirmandoRemocaoId: vinculoId, erroRemocao: null, sucesso: null });
        },

        cancelarRemocao() {
            this.set('confirmandoRemocaoId', null);
        },

        confirmarRemocao(vinculoId) {
            if (this.get('removendoId')) return;
            let seq = this._seq;
            this.setProperties({ removendoId: vinculoId, erroRemocao: null });
            this._request('DELETE', 'responsaveis/vinculos/' + encodeURIComponent(vinculoId)).then(() => {
                if (!this._vivo(seq)) return;
                this.setProperties({ removendoId: null, confirmandoRemocaoId: null, sucesso: 'Responsável removido.' });
                this._carregar();
            }, (xhr) => {
                if (!this._vivo(seq)) return;
                this.setProperties({
                    removendoId: null,
                    erroRemocao: this._mensagemErro(xhr, 'Não foi possível remover o responsável.')
                });
            });
        }
    }
});
