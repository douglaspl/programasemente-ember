import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    didInsertElement() {
        $(".numeric").mask("#0", { reverse: true})
        if (this.get('isAdminSemente')) this._iniciarFlags();
    },
    buttonLabel: function() {
        return (this.get('changeset.id')) ? "salvar alterações " : "Adicionar";
    }.property(),

    instituicao:Ember.computed('model',function(){
        return this.changeset;
    }),

    // Opções do select "Instituição mãe": todas as instituições, menos a própria e (na edição)
    // os descendentes dela — escolher um deles criaria um ciclo na hierarquia. Os descendentes
    // são calculados aqui a partir de `instituicaoPaiId` da lista completa (findAll), protegido
    // contra ciclo já existente com um conjunto de visitados. Na criação só a própria é excluída
    // (não tem id), como antes.
    instituicoesMaeOpcoes: Ember.computed('instituicoes.@each.instituicaoPaiId', 'changeset.{id,instituicaoPaiId}', function () {
        let instituicoes = this.get('instituicoes') || [];
        let lista = instituicoes.toArray ? instituicoes.toArray() : instituicoes;
        let selfId = this.get('changeset.id');
        // mesma regra de antes (helper equalstr, comparação ==): na criação exclui registros sem id
        lista = lista.filter((inst) => !(inst.get('id') == selfId)); // eslint-disable-line eqeqeq
        if (selfId === undefined || selfId === null || selfId === '') return lista;
        selfId = String(selfId);

        let filhasPorPai = {};
        lista.forEach((inst) => {
            let paiId = inst.get('instituicaoPaiId');
            if (paiId === undefined || paiId === null || paiId === '') return;
            paiId = String(paiId);
            (filhasPorPai[paiId] = filhasPorPai[paiId] || []).push(String(inst.get('id')));
        });

        let excluidos = {};
        excluidos[selfId] = true;
        let fila = [selfId];
        while (fila.length) {
            let atual = fila.shift();
            (filhasPorPai[atual] || []).forEach((filhaId) => {
                if (excluidos[filhaId]) return;
                excluidos[filhaId] = true;
                fila.push(filhaId);
            });
        }
        // a mãe atual nunca some da lista (só aconteceria com um ciclo já gravado); senão o select
        // cairia em "Nenhuma" e o save apagaria o vínculo sem o usuário perceber
        let paiAtual = this.get('changeset.instituicaoPaiId');
        if (paiAtual !== undefined && paiAtual !== null && String(paiAtual) !== selfId) delete excluidos[String(paiAtual)];
        return lista.filter((inst) => !excluidos[String(inst.get('id'))]);
    }),

    totalCodigosAlunos: 0,
    totalUtilizadosAlunos: 0,
    totalCodigosInstrutores: 0,
    totalUtilizadosInstrutores: 0,
    codigos: Ember.computed('model',function(){
        let codigos = this.get('instituicao').get('codigosCadastro');
        let tca = 0;
        let tua = 0;
        let tci = 0;
        let tui = 0;
        codigos.forEach(cod => {
            if(cod.get('typeCadastro') == "aluno"){
                tca = tca + 1;
                if(cod.get('utilizado')){
                    tua = tua + 1;
                }
            }
            if(cod.get('typeCadastro') == "instrutor"){
                tci = tci + 1;
                if(cod.get('utilizado')){
                    tui = tui + 1;
                }
            }
        });
        this.set('totalCodigosAlunos', tca);
        this.set('totalUtilizadosAlunos', tua);
        this.set('totalCodigosInstrutores', tci);
        this.set('totalUtilizadosInstrutores', tui);

        return codigos;
    }),

    carregaBarras: Ember.computed('model', function() {
        let percAluno = (this.get('instituicao').get('nralunosAtivos') / this.get('instituicao').get('nralunos')) * 100;
        let percProf = (this.get('instituicao').get('nrinstrutoresAtivos') / this.get('instituicao').get('nrinstrutores')) * 100;
        // let percAluno = (this.get('totalUtilizadosAlunos') / this.get('totalCodigosAlunos')) * 100;
        // let percProf = (this.get('totalUtilizadosInstrutores') / this.get('totalCodigosInstrutores')) * 100;

        if(percAluno >= 100) document.getElementById('barra-alunos').style.backgroundColor = "#dc1b1b";
        if(percProf >= 100) document.getElementById('barra-professores').style.backgroundColor = "#dc1b1b";

        const style = document.createElement('style');
        style.type = 'text/css';
        const keyframes = `
            @keyframes growAluno {
                0% {
                    width: 0%;
                }
                100% {
                    width: ${percAluno}%;
                }
            }

            @keyframes growProf {
                0% {
                    width: 0%;
                }
                100% {
                    width: ${percProf}%;
                }
            }
        `;
        style.appendChild(document.createTextNode(keyframes));
        document.head.appendChild(style);
    }),

    // ---------------------------------------------------------------------
    // Features opcionais (offline / multi escolas / personificação) — endpoint próprio
    // /instituicao-flags (JSON puro, não JSON:API). Visível SOMENTE para o admin
    // Semente (person_logged.role === 'admin', mesmo teste de routes/aulas/index.js).
    // Para qualquer outro perfil nada é renderizado, nenhuma requisição é feita
    // e o submit chama `action(changeset)` exatamente como antes.
    // No save, o pai recebe um 2º argumento `flagsSesi` ({ salvar(instId) })
    // somente quando há algo a enviar; caso contrário, nada muda.
    // ---------------------------------------------------------------------
    isAdminSemente: Ember.computed(function () {
        try {
            let p = JSON.parse(localStorage.getItem('person_logged'));
            return !!(p && p.role === 'admin');
        } catch (e) {
            return false;
        }
    }),

    flagsVisivel: false,
    flagOffline: false,
    flagMultiEscola: false,
    flagPersonificacao: false,
    flagHierarquiaMultinivel: false,
    flagAplicarDescendentes: false,
    flagsOriginal: null, // edição: { offlineHabilitado, multiEscolaHabilitado, personificacaoHabilitado, hierarquiaMultinivelHabilitado, usuariosMultiEscola, qtdDescendentes }
    _flagsSeq: 0,
    _flagsInstId: null,
    _flagsIniciado: false,

    flagsUsuariosMultiEscola: Ember.computed.readOnly('flagsOriginal.usuariosMultiEscola'),
    // Desligar "Multi escolas" é bloqueado enquanto houver usuários com vínculo em mais de uma escola
    flagMultiEscolaBloqueado: Ember.computed('flagsOriginal.{multiEscolaHabilitado,usuariosMultiEscola}', function () {
        let o = this.get('flagsOriginal');
        return !!(o && o.multiEscolaHabilitado === true && o.usuariosMultiEscola > 0);
    }),
    flagsQtdDescendentes: Ember.computed.readOnly('flagsOriginal.qtdDescendentes'),

    didUpdateAttrs() {
        this._super(...arguments);
        if (!this._flagsIniciado) return;
        // mesma instância reaproveitada para outra instituição: reinicia o estado
        if (this.get('changeset.id') !== this._flagsInstId) this._iniciarFlags();
    },

    willDestroyElement() {
        if (this._flagsIniciado) this._resetFlags();
        this._super(...arguments);
    },

    _resetFlags() {
        this._flagsSeq++;
        this.setProperties({
            flagsVisivel: false, flagOffline: false, flagMultiEscola: false,
            flagPersonificacao: false, flagHierarquiaMultinivel: false,
            flagAplicarDescendentes: false, flagsOriginal: null
        });
    },

    _iniciarFlags() {
        this._flagsIniciado = true;
        this._resetFlags();
        if (!this.get('isEdit')) {
            // criação: seção com as flags desmarcadas, sem GET
            this._flagsInstId = null;
            this.set('flagsVisivel', true);
            return;
        }
        let instId = this.get('changeset.id');
        this._flagsInstId = instId;
        if (!instId) return;
        let seq = this._flagsSeq;
        this._flagsRequest('GET', instId).then((resp) => {
            if (this.get('isDestroyed') || this.get('isDestroying') || seq !== this._flagsSeq) return;
            if (!resp) return;
            let original = {
                offlineHabilitado: resp.offlineHabilitado === true,
                multiEscolaHabilitado: resp.multiEscolaHabilitado === true,
                // back antigo sem o campo: undefined === true -> false
                personificacaoHabilitado: resp.personificacaoHabilitado === true,
                hierarquiaMultinivelHabilitado: resp.hierarquiaMultinivelHabilitado === true,
                usuariosMultiEscola: parseInt(resp.usuariosMultiEscola, 10) || 0,
                qtdDescendentes: parseInt(resp.qtdDescendentes, 10) || 0
            };
            this.setProperties({
                flagsOriginal: original,
                flagOffline: original.offlineHabilitado,
                flagMultiEscola: original.multiEscolaHabilitado,
                flagPersonificacao: original.personificacaoHabilitado,
                flagHierarquiaMultinivel: original.hierarquiaMultinivelHabilitado,
                flagAplicarDescendentes: false,
                flagsVisivel: true
            });
        }).catch(() => {
            // qualquer erro (403/404/rede): seção fica oculta
        });
    },

    _flagsRequest(type, instId, body) {
        let adapter = this.get('store').adapterFor('application');
        let headers = adapter.get('headers') || {};
        let url = adapter.get('host') + '/' + adapter.get('namespace') +
            '/instituicao-flags/' + encodeURIComponent(instId);
        let opts = {
            url: url,
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
            Ember.$.ajax(opts).then(resolve, reject);
        });
    },

    // Corpo do PUT (null = nada a enviar; o back responde 400 se todas as flags vierem null).
    _montarPayloadFlags() {
        if (!this.get('isAdminSemente') || !this.get('flagsVisivel')) return null;
        let offline = this.get('flagOffline') === true;
        let multi = this.get('flagMultiEscola') === true || this.get('flagMultiEscolaBloqueado');
        let personificacao = this.get('flagPersonificacao') === true;
        let hierarquia = this.get('flagHierarquiaMultinivel') === true;
        let original = this.get('flagsOriginal');
        if (!original) {
            if (this.get('isEdit')) return null;
            // criação: só envia o que foi marcado
            if (!offline && !multi && !personificacao && !hierarquia) return null;
            return {
                offlineHabilitado: offline ? true : null,
                multiEscolaHabilitado: multi ? true : null,
                personificacaoHabilitado: personificacao ? true : null,
                hierarquiaMultinivelHabilitado: hierarquia ? true : null,
                aplicarDescendentes: false
            };
        }
        if (this.get('flagAplicarDescendentes') === true && original.qtdDescendentes > 0) {
            // propagar às descendentes: envia o estado atual de todas as flags
            return {
                offlineHabilitado: offline, multiEscolaHabilitado: multi, personificacaoHabilitado: personificacao,
                hierarquiaMultinivelHabilitado: hierarquia, aplicarDescendentes: true
            };
        }
        let payload = {
            offlineHabilitado: offline !== original.offlineHabilitado ? offline : null,
            multiEscolaHabilitado: multi !== original.multiEscolaHabilitado ? multi : null,
            personificacaoHabilitado: personificacao !== original.personificacaoHabilitado ? personificacao : null,
            hierarquiaMultinivelHabilitado: hierarquia !== original.hierarquiaMultinivelHabilitado ? hierarquia : null,
            aplicarDescendentes: false
        };
        if (payload.offlineHabilitado === null && payload.multiEscolaHabilitado === null &&
            payload.personificacaoHabilitado === null && payload.hierarquiaMultinivelHabilitado === null) return null;
        return payload;
    },

    _enviarAoPai() {
        let payload = this._montarPayloadFlags();
        if (!payload) return this.action(this.changeset);
        let that = this;
        let seq = this._flagsSeq;
        let flagsSesi = {
            // Nunca rejeita: resolve null em sucesso, ou a mensagem de erro.
            salvar(instId) {
                if (!instId) return Ember.RSVP.resolve('instituição não identificada.');
                return that._flagsRequest('PUT', instId, payload).then(() => {
                    if (!that.get('isDestroyed') && !that.get('isDestroying') && seq === that._flagsSeq && that.get('flagsOriginal')) {
                        // o estado salvo passa a ser a referência para "alterado"
                        that.set('flagsOriginal', Ember.assign({}, that.get('flagsOriginal'), {
                            offlineHabilitado: that.get('flagOffline') === true,
                            multiEscolaHabilitado: that.get('flagMultiEscola') === true,
                            personificacaoHabilitado: that.get('flagPersonificacao') === true,
                            hierarquiaMultinivelHabilitado: that.get('flagHierarquiaMultinivel') === true
                        }));
                        that.set('flagAplicarDescendentes', false);
                    }
                    return null;
                }, (xhr) => {
                    let msg = xhr && xhr.responseJSON && xhr.responseJSON.mensagem;
                    return msg || 'erro ao salvar as features opcionais.';
                });
            }
        };
        this.action(this.changeset, flagsSesi);
    },

    actions: {
        submit: function () {
            if (!this.get('isAdminSemente')) return this.action(this.changeset);
            this._enviarAoPai();
        },
    }
})