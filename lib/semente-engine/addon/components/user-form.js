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

    // Perfis adultos entram pelo plataforma-ano de idx 21 em empresas e de idx 20 nas demais instituições
    idxAnoAdulto: Ember.computed('instituicao.isEscola', function () {
        return this.get('instituicao.isEscola') == 'empresa' ? 21 : 20;
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

                let turmaAdulto = pessoa.get('plataformaTurmas').filterBy('plataformaAno.idx', this.get('idxAnoAdulto')).get('firstObject');
                if (turmaAdulto != null){
                    document.getElementById('new_user_turma').value = turmaAdulto.get('id');
                }
            }

            if(pessoa.get('role') == 'instrutor'){
                pessoa.get('plataformaTurmas').forEach(pt => {
                    if(pt.get('plataformaAno.idx') != 20 && pt.get('plataformaAno.idx') != 21){
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