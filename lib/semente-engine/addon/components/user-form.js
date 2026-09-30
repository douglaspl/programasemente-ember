import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    buttonLabel: function() {
        return (this.get('changeset.id')) ? "Salvar" : "Adicionar";
    }.property(),

    pessoaLogged: Ember.computed('model',function(){
        $('.phone').mask('(00) 00000-0000');
        $('.cpf').mask('000.000.000-00', {reverse: true});
        let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
        return this.get('store').peekRecord('pessoa', infosLogged.id);
    }),

    selectedPlataformaAno: '',
    plataformaAnos:Ember.computed('model',function(){
        return this.get('instituicao').get('plataformaAnos');
    }),

    plataformaTurmas:Ember.computed('model',function(){
        return this.get('instituicao').get('plataformaTurmas');
    }),

    sEnabled: Ember.computed('instituicao', function () {
        var s = this.get('instituicao').get('sistemas').find((x) => { return x.get('idx') === 2 });
        if (s) this.get('instituicao').set('sEnabled', true);
        return this.get('instituicao').get('sEnabled');
    }),

    // csEnabled: Ember.computed('instituicao', function () {
    //     var cs = this.get('instituicao').get('sistemas').find((x) => { return x.get('idx') === 3 });
    //     if (cs) this.get('instituicao').set('csEnabled', true);
    //     return this.get('instituicao').get('csEnabled');
    // }),

    apTurma: Ember.computed('instituicao', function () {
        var turmas = this.get('store').peekAll('plataforma-turma');
        var ap;
        turmas.forEach(x =>{
            if(x.get('name').toLowerCase().includes('academia de professores')){
                ap = x;
            }
        })
        return ap;
    }),

    setRole(value) {
        this.set('activeProfile', value);
    },

    // ---------------------------------------------------------------------
    // Vínculo existente (mesmo login em várias instituições) — SESI feature 03.
    // Ativo SOMENTE quando o pai passa `verificarVinculo=true` (hoje apenas
    // createuser.hbs). Nas demais telas (edição) nada disto é executado.
    // Params: verificarVinculo, instituicaoId, onVinculoExistente(loginOuNull).
    // ---------------------------------------------------------------------
    verificarVinculo: false,
    instituicaoId: null,
    vinculoAviso: null,
    _vinculoLogin: null,
    _ultimoLoginVerificado: null,
    _vinculoSeq: 0,
    _vinculoAutoPreenchidos: null,

    // ---------------------------------------------------------------------
    // Escola principal (SESI feature 03, fase 3).
    // Ativo SOMENTE quando o pai passa `verificarEscolaPrincipal=true` (hoje apenas
    // edituser.hbs). Params: verificarEscolaPrincipal, pessoaId.
    // Só exibe algo se o GET responder multiEscola=true; qualquer erro = tela atual.
    // O checkbox #new_user_tornar_principal (só existe quando principal=false) é
    // lido pelo controller edituser no save.
    // ---------------------------------------------------------------------
    verificarEscolaPrincipal: false,
    pessoaId: null,
    escolaPrincipalInfo: null,
    _escolaPrincipalSeq: 0,

    _carregarEscolaPrincipal() {
        let pessoaId = this.get('pessoaId');
        this._escolaPrincipalPessoaId = pessoaId;
        if (!pessoaId) return;
        let seq = ++this._escolaPrincipalSeq;
        let adapter = this.get('store').adapterFor('application');
        let headers = adapter.get('headers') || {};
        let url = adapter.get('host') + '/' + adapter.get('namespace') +
            '/vinculos/pessoa/' + encodeURIComponent(pessoaId);
        new Ember.RSVP.Promise((resolve, reject) => {
            Ember.$.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': headers['Authorization'],
                    'pessoaid': headers['pessoaid']
                }
            }).then(resolve, reject);
        }).then((resp) => {
            if (this.get('isDestroyed') || this.get('isDestroying')) return;
            if (seq !== this._escolaPrincipalSeq) return;
            if (!resp || resp.multiEscola !== true) return;
            this.set('escolaPrincipalInfo', {
                principal: resp.principal === true,
                principalInstituicaoNome: resp.principalInstituicaoNome || null
            });
        }).catch(() => {
            // qualquer falha = comportamento atual (nenhuma UI nova)
        });
    },

    didUpdateAttrs() {
        this._super(...arguments);
        if (!this.get('verificarEscolaPrincipal')) return;
        // mesma instância reaproveitada para outra pessoa: reinicia o estado
        if (this.get('pessoaId') !== this._escolaPrincipalPessoaId) {
            this._escolaPrincipalSeq++;
            this.set('escolaPrincipalInfo', null);
            this._carregarEscolaPrincipal();
        }
    },

    didInsertElement() {
        this._super(...arguments);
        if (this.get('verificarEscolaPrincipal')) this._carregarEscolaPrincipal();
        if (!this.get('verificarVinculo')) return;
        let container = this.element && this.element.querySelector('.js-login-vinculo');
        if (!container) return;
        this._onLoginInput = (event) => Ember.run(() => this._loginEditado(event));
        this._onLoginFocusOut = () => Ember.run(() => this._loginSaiuDoFoco());
        container.addEventListener('input', this._onLoginInput);
        container.addEventListener('focusout', this._onLoginFocusOut);
        this._vinculoContainer = container;
        this._notificarVinculo(null);
    },

    willDestroyElement() {
        if (this._vinculoContainer) {
            this._vinculoContainer.removeEventListener('input', this._onLoginInput);
            this._vinculoContainer.removeEventListener('focusout', this._onLoginFocusOut);
            this._vinculoContainer = null;
        }
        Ember.run.cancel(this._vinculoDebounce);
        if (this.get('verificarEscolaPrincipal')) {
            // invalida GET pendente e limpa o estado ao sair da tela
            this._escolaPrincipalSeq++;
            this.set('escolaPrincipalInfo', null);
        }
        if (this.get('verificarVinculo')) {
            // Estado é por instância; ao reabrir o modal nasce um componente novo e limpo.
            this._vinculoSeq++;
            this.set('_vinculoAutoPreenchidos', null);
            this.set('_vinculoLogin', null);
            let cb = this.get('onVinculoExistente');
            if (typeof cb === 'function') cb(null);
        }
        this._super(...arguments);
    },

    _notificarVinculo(login) {
        this.set('_vinculoLogin', login);
        let cb = this.get('onVinculoExistente');
        if (typeof cb === 'function') cb(login);
    },

    _limparVinculo() {
        if (this.get('vinculoAviso')) this.set('vinculoAviso', null);
        if (this.get('_vinculoLogin')) this._notificarVinculo(null);
        this._desbloquearCamposVinculo(true);
    },

    // Evento nativo 'input' (dispara antes do {{input}} sincronizar o changeset),
    // por isso usa event.target.value.
    _loginEditado(event) {
        let valor = event && event.target ? event.target.value : null;
        if (valor !== this.get('_ultimoLoginVerificado')) {
            this.set('_ultimoLoginVerificado', null);
            this._vinculoSeq++;
        }
        let flag = this.get('_vinculoLogin');
        if (flag && valor !== flag) this._limparVinculo();
    },

    _loginSaiuDoFoco() {
        let login = this.get('changeset.email');
        if (typeof login !== 'string' || login.trim() === '') return;
        if (login === this.get('_ultimoLoginVerificado')) return;
        this._vinculoDebounce = Ember.run.debounce(this, this._verificarVinculo, login, 300);
    },

    _verificarVinculo(login) {
        if (this.get('isDestroyed') || this.get('isDestroying')) return;
        if (login !== this.get('changeset.email')) return;
        if (login === this.get('_ultimoLoginVerificado')) return;
        this.set('_ultimoLoginVerificado', login);
        let seq = ++this._vinculoSeq;

        this._buscarVinculoExistente(login).then((resp) => {
            if (this.get('isDestroyed') || this.get('isDestroying')) return;
            // resposta atrasada para um login que já não é o atual: ignora
            if (seq !== this._vinculoSeq || login !== this.get('changeset.email')) return;
            if (!resp || resp.podeVincular !== true) {
                // existe=false, ou existe && !podeVincular: nada novo (fluxo atual segue no submit)
                this._limparVinculo();
                return;
            }
            let insts = (resp.instituicoes || []).filter(Boolean).join(', ');
            let onde = insts ? ('Este login já existe em: ' + insts + '.') : 'Este login já existe em outra instituição.';
            this.set('vinculoAviso', onde + ' Ao salvar, será criado um novo vínculo nesta instituição com o perfil escolhido. ' +
                'E-mail, telefone, CPF, gênero e ano de nascimento são compartilhados com o usuário existente; ' +
                'deixe a senha em branco para manter a senha atual.');
            this._preencherDadosVinculo(resp.dados);
            this._notificarVinculo(login);
        }).catch(() => {
            if (this.get('isDestroyed') || this.get('isDestroying')) return;
            // qualquer falha (404, rede, etc.) = comportamento atual; permite nova tentativa
            if (seq === this._vinculoSeq) this.set('_ultimoLoginVerificado', null);
        });
    },

    _buscarVinculoExistente(login) {
        let adapter = this.get('store').adapterFor('application');
        let headers = adapter.get('headers') || {};
        let url = adapter.get('host') + '/' + adapter.get('namespace') +
            '/vinculos/existente?login=' + encodeURIComponent(login) +
            '&instituicaoId=' + encodeURIComponent(this.get('instituicaoId'));
        return new Ember.RSVP.Promise((resolve, reject) => {
            Ember.$.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': headers['Authorization'],
                    'pessoaid': headers['pessoaid']
                }
            }).then(resolve, reject);
        });
    },

    _formatarMascara(valor, tipo) {
        let digitos = String(valor).replace(/\D/g, '');
        if (tipo === 'telefone' && digitos.length === 11) {
            return '(' + digitos.substr(0, 2) + ') ' + digitos.substr(2, 5) + '-' + digitos.substr(7, 4);
        }
        if (tipo === 'cpf' && digitos.length === 11) {
            return digitos.substr(0, 3) + '.' + digitos.substr(3, 3) + '.' + digitos.substr(6, 3) + '-' + digitos.substr(9, 2);
        }
        return String(valor);
    },

    // Vínculo existente: o dado do usuário existente prevalece (é compartilhado).
    // Todo campo com valor em `dados` é sobrescrito e bloqueado (readonly/disabled +
    // classe is-vinculo-bloqueado). Campos sem valor em `dados` ficam intocados.
    // Um campo cujo valor não passe na validação do form NÃO é bloqueado, para não
    // impedir o save (o usuário precisa poder corrigir).
    _preencherDadosVinculo(dados) {
        this._desbloquearCamposVinculo(false);
        if (!dados) return;
        let bloqueados = {};

        let campos = [
            { campo: 'emailCadastrado', valor: dados.emailCadastrado },
            { campo: 'telefone', valor: dados.telefone != null && dados.telefone !== '' ? this._formatarMascara(dados.telefone, 'telefone') : null },
            { campo: 'cpf', valor: dados.cpf != null && dados.cpf !== '' ? this._formatarMascara(dados.cpf, 'cpf') : null }
        ];
        let changeset = this.get('changeset');
        let seq = this._vinculoSeq;
        let validacoes = campos.map(({ campo, valor }) => {
            if (valor == null || String(valor).trim() === '') return Ember.RSVP.resolve();
            changeset.set(campo, valor);
            bloqueados[campo] = valor; // registra o auto-preenchido (mesmo se não bloquear), p/ limpar no desbloqueio
            return Ember.RSVP.resolve(changeset.validate(campo)).then(() => {
                if (this.get('isDestroyed') || this.get('isDestroying')) return;
                // login editado enquanto validava: o vínculo já foi limpo, não bloqueia
                if (seq !== this._vinculoSeq || this.get('_vinculoAutoPreenchidos') !== bloqueados) return;
                if (changeset.get('error.' + campo)) return;
                if (campo === 'cpf' && !this._cpfValido(valor)) return;
                if (changeset.get(campo) !== valor) return;
                let input = this.element && this.element.querySelector('.js-vinculo-' + campo + ' input');
                if (!input) return;
                this._bloquearElemento(input, false);
            });
        });

        let genero = dados.genero != null ? String(dados.genero).toLowerCase() : null;
        let selGenero = document.getElementById('new_user_gender');
        if (genero && selGenero) {
            let existeOpcao = Array.prototype.some.call(selGenero.options, (o) => o.value === genero);
            if (existeOpcao) {
                selGenero.value = genero;
                this.set('new_user_gender', genero);
                this._bloquearElemento(selGenero, true);
                bloqueados.genero = genero;
            }
        }

        let inputAno = document.getElementById('new_user_birth');
        if (dados.anoNascimento != null && String(dados.anoNascimento) !== '' && inputAno) {
            let ano = String(dados.anoNascimento);
            this.set('new_user_birth', ano);
            inputAno.value = ano;
            this._bloquearElemento(inputAno, false);
            bloqueados.anoNascimento = ano;
        }

        this.set('_vinculoAutoPreenchidos', bloqueados);
        return Ember.RSVP.all(validacoes);
    },

    _cpfValido(cpf) {
        let s = String(cpf).replace(/\D/g, '');
        if (s.length !== 11 || s === '00000000000') return false;
        let dv = (n) => {
            let soma = 0;
            for (let i = 1; i <= n; i++) soma += parseInt(s.substring(i - 1, i)) * (n + 2 - i);
            let resto = (soma * 10) % 11;
            return (resto === 10 || resto === 11) ? 0 : resto;
        };
        return dv(9) === parseInt(s.substring(9, 10)) && dv(10) === parseInt(s.substring(10, 11));
    },

    _bloquearElemento(el, isSelect) {
        if (isSelect) el.disabled = true;
        else el.readOnly = true;
        el.setAttribute('aria-readonly', 'true');
        el.setAttribute('title', 'Dado compartilhado com o usuário existente');
        el.setAttribute('aria-describedby', 'vinculo-aviso');
        el.classList.add('is-vinculo-bloqueado');
    },

    _desbloquearElemento(el) {
        el.disabled = false;
        el.readOnly = false;
        el.removeAttribute('aria-readonly');
        el.removeAttribute('title');
        el.removeAttribute('aria-describedby');
        el.classList.remove('is-vinculo-bloqueado');
    },

    // Remove o bloqueio de todos os campos bloqueados; se `limparValores`, apaga os
    // valores que ainda são iguais ao auto-preenchido (pertencem a outra pessoa).
    // Valores digitados pelo usuário nunca são apagados.
    _desbloquearCamposVinculo(limparValores) {
        let auto = this.get('_vinculoAutoPreenchidos');
        if (this.element) {
            Array.prototype.forEach.call(this.element.querySelectorAll('.is-vinculo-bloqueado'), (el) => this._desbloquearElemento(el));
        }
        if (!auto) return;
        if (limparValores) {
            ['emailCadastrado', 'telefone', 'cpf'].forEach((campo) => {
                if (auto[campo] != null && this.get('changeset.' + campo) === auto[campo]) {
                    this.get('changeset').set(campo, null);
                }
            });
            let selGenero = document.getElementById('new_user_gender');
            if (auto.genero != null && selGenero && selGenero.value === auto.genero) {
                selGenero.value = '';
                this.set('new_user_gender', '');
            }
            let inputAno = document.getElementById('new_user_birth');
            if (auto.anoNascimento != null && inputAno && inputAno.value === auto.anoNascimento) {
                inputAno.value = '';
                this.set('new_user_birth', null);
            }
        }
        this.set('_vinculoAutoPreenchidos', null);
    },

    startInformation: Ember.computed('model',function(){
        if(this.get('changeset.id')){
            let pessoa = this.changeset;
            this.set('new_user_id', pessoa.get('id'));
            this.set('activeProfile', pessoa.get('role'));
            this.set('new_user_role', pessoa.get('role'));
            this.set('new_user_enabled', pessoa.get('enabled'));
            this.set('new_user_acessoPlataformaS', pessoa.get('acessoPlataformaS'));
            this.set('new_user_acessoCs', pessoa.get('acessoCs'));
            this.set('new_user_gender', pessoa.get('gender'));
            this.set('new_user_birth', pessoa.get('nascimentoPlataforma'));
            
            if(pessoa.get('role') == 'aluno'){
                this.set('new_user_ano', pessoa.get('plataformaAnos'));
                this.set('selectedPlataformaAno', pessoa.get('plataformaAnos').get('firstObject'));
                this.set('new_user_turma', pessoa.get('plataformaTurmas'));
            }
            else{
                this.set('new_user_function', pessoa.get('function'));
            }

            if(pessoa.get('role') == 'instrutor'){
                this.set('new_user_aplicador', pessoa.get('isAplicador'));
                this.set('isAplicador', pessoa.get('isAplicador'));
                this.set('new_user_ano', pessoa.get('plataformaAnos'));
                this.set('new_user_turma', pessoa.get('plataformaTurmas'));
            }
        }
        else{
            this.set('activeProfile', '');
            this.set('new_user_role', '');
            this.set('new_user_function', '');
            this.set('new_user_enabled', true);
            if(this.get('instituicao').get('sEnabled')) this.set('new_user_acessoPlataformaS', true);
            // if(this.get('instituicao').get('csEnabled')){
            //     this.set('new_user_acessoCs', false);
            // } 
            this.set('new_user_aplicador', false);
            this.set('isAplicador', false);
            this.set('new_user_gender', '');
            this.set('new_user_birth', '');
            this.set('new_user_ano', '');
            this.set('new_user_turma', '');
        }
    }),

    afterRenderInformation: Ember.computed('model',function(){
        if(this.get('changeset.id')){
            let pessoa = this.changeset;
            
            document.getElementById('new_user_role').value = pessoa.get('role');
            document.getElementById('new_user_gender').value = pessoa.get('genero');
            document.getElementById('new_user_enabled').checked = false;
            if (pessoa.get('enabled')) document.getElementById('new_user_enabled').checked = true;

            if(this.get('instituicao').get('sEnabled')){
                document.getElementById('new_user_acessoPlataformaS').checked = false;
                if (pessoa.get('acessoPlataformaS')) document.getElementById('new_user_acessoPlataformaS').checked = true;
            }
            // if(this.get('instituicao').get('csEnabled')){
            //     document.getElementById('new_user_acessoCs').checked = false;
            //     if (pessoa.get('acessoCs')) document.getElementById('new_user_acessoCs').checked = true;
            // }

            if(pessoa.get('role') == 'aluno'){
                if (pessoa.get('plataformaAnos').get('firstObject') != null) {
                    document.getElementById('new_user_ano').value = pessoa.get('plataformaAnos').get('firstObject').get('id');
                }
                if (pessoa.get('plataformaTurmas').get('firstObject') != null){
                    document.getElementById('new_user_turma').value = pessoa.get('plataformaTurmas').get('firstObject').get('id');
                }
            }
            else{
                document.getElementById('new_user_function').value = pessoa.get('function');

                let turmaAdulto = pessoa.get('plataformaTurmas').filterBy('plataformaAno.idx', 20).get('firstObject');
                if (turmaAdulto != null){
                    document.getElementById('new_user_turma').value = turmaAdulto.get('id');
                }
            }

            if(pessoa.get('role') == 'instrutor'){
                pessoa.get('plataformaTurmas').forEach(pt => {
                    if(pt.get('plataformaAno.idx') != 20){
                        document.getElementById('plat_turma' + pt.get('id')).checked = true;
                    }
                })
            }
        }
    }),

    actions: {
        submit: function () {
            this.action(this.changeset)
        }, 

        checkaplicador(v) {
            this.set('isAplicador', v.currentTarget.checked);
            this.set('new_user_aplicador', v.currentTarget.checked);
        },

        addPAPT(plataformaTurmaId){
            let platTurma = this.get('store').peekRecord('plataforma-turma', plataformaTurmaId);
            let platAno = this.get('store').peekRecord('plataforma-ano', platTurma.get('plataformaAno').get('id'));
            let checkbox = document.getElementById('plat_turma' + plataformaTurmaId).checked;
            if (checkbox) {
                this.changeset.get('plataformaTurmas').pushObject(platTurma);
                var platAnoIds = this.changeset.get('plataformaAnos').map(x => x.get('id'));
                if(platAnoIds.indexOf(platAno.get('id')) == -1){
                    this.changeset.get('plataformaAnos').pushObject(platAno);
                }
            } else {
                this.changeset.get('plataformaTurmas').removeObject(platTurma);
                var platAnoIds = this.changeset.get('plataformaTurmas').map(x => x.get('plataformaAno').get('id'));
                if(platAnoIds.indexOf(platAno.get('id')) == -1){
                    this.changeset.get('plataformaAnos').removeObject(platAno);
                }
            }
        },
    
        refreshPlataformaTurmas(plataformaAnoId) {
            if (plataformaAnoId != "0") {
                let plataformaAnos = this.get('plataformaAnos');
                plataformaAnos.forEach(pa => {
                    if(pa.get('id') == plataformaAnoId) this.set('selectedPlataformaAno', pa);
                });
            } else {
                this.set('selectedPlataformaAno', "");
            }
        },

    }
})