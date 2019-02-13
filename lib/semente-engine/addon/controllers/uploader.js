import Controller from '@ember/controller';

export default Controller.extend({
    session: Ember.inject.service(),
    store: Ember.inject.service(),
    appController: Ember.inject.controller('application'),
    role: Ember.computed('appController', function() {
        let ac = this.get('appController');
        return ac.get('role');
    }),
    selected_type: '',
    selected_action: '',
    selected_modulo: '',
    selected_aula: '',
    actions: {
        selectType() {
            let type = document.getElementById('select_type').value;
            if (type) {
                if (type === 'none') {
                    this.set('selected_type', '');
                    this.set('selected_action', '');
                    this.set('selected_modulo', '');
                    this.set('selected_aula', '');
                }
                else {
                    this.set('selected_type', type);
                    this.set('selected_action', '');
                    this.set('selected_modulo', '');
                    this.set('selected_aula', '');
                }
            }
        },
        selectAction() {
            let action = document.getElementById('select_action').value;
            if (action === 'editar' || action === 'criar') {
                this.set('selected_action', action);
                this.set('selected_modulo', '');
                this.set('selected_aula', '');
            }
            else {
                this.set('selected_action', '');
                this.set('selected_modulo', '');
                this.set('selected_aula', '');
            }
        },
        selectModulo() {
            let modulo_id = document.getElementById('select_modulo').value;
            this.set('modulo_resultado', '');
            if (modulo_id) {
                if (modulo_id === 'none') {
                    this.set('selected_modulo', '');
                    this.set('selected_aula', '');
                }
                else {
                    let modulo = this.get('store').peekRecord('modulo', modulo_id);
                    this.set('selected_modulo', modulo);
                    this.set('selected_aula', '');
                }
            }
        },
        selectAula() {
            let aula_id = document.getElementById('select_aula').value;
            if (aula_id) {
                if (aula_id === 'none') {
                    this.set('selected_aula', '');
                }
                else {
                    let aula = this.get('store').peekRecord('atividade', aula_id);
                    this.set('selected_aula', aula);
                }
            }
        },
        cancelaSelectionMod() {
            this.set('selected_type', '');
            this.set('selected_modulo', '');
            this.set('selected_action', '');
            this.set('selected_aula', '');
            this.set('modulo_resultado', '');
        },
        limpaSelectionMod() {
            this.set('selected_modulo', '');
            document.getElementById('new_modulo_name').value = '';
            document.getElementById('new_modulo_description').value = '';
            this.set('modulo_resultado', '');
        },
        confirmaMod(modulo_id) {
            let modulo_name = document.getElementById('new_modulo_name').value;
            let modulo_description = document.getElementById('new_modulo_description').value;
            if (modulo_name.length < 10 || modulo_description.length < 10) {
                this.set('modulo_resultado', 'Favor preenche o nome e descricao do modulo com pelo menos 10 caracteres cada');
            }
            else {
                document.getElementById('button_conf_mod').disabled = true;
                if (modulo_id) {
                    let modulo = this.get('store').peekRecord('modulo', modulo_id);
                    modulo.set('name', modulo_name);
                    modulo.set('description', modulo_description);
                    modulo.save().then(()=>{
                        this.set('modulo_resultado', 'Sucesso ao editar modulo!');
                        document.getElementById('button_conf_mod').disabled = false;                        
                    }).catch((erro)=>{
                        this.set('modulo_resultado', 'Erro: ' + erro);
                        document.getElementById('button_conf_mod').disabled = false;
                        modulo.rollbackAttributes();
                    });
                }
                else {
                    let new_modulo = this.get('store').createRecord('modulo', {name: modulo_name, description: modulo_description});
                    new_modulo.save().then(()=>{
                        this.set('modulo_resultado', 'Sucesso ao criar modulo!');
                        document.getElementById('button_conf_mod').disabled = false;                        
                    }).catch((erro)=>{
                        this.set('modulo_resultado', 'Erro: ' + erro);
                        document.getElementById('button_conf_mod').disabled = false;
                        new_modulo.rollbackAttributes();
                    });
                }
            }
        },
        limpaSelectionAula() {
            this.set('selected_aula', '');
            document.getElementById('new_aula_name').value = '';
            document.getElementById('new_aula_description').value = '';
            // document.getElementById('new_aula_abertura').value = '';
            // document.getElementById('new_aula_video').value = '';
            // document.getElementById('new_aula_quiz').value = '';
            // document.getElementById('new_aula_teoria').value = '';
            // document.getElementById('new_aula_atividade').value = '';
        },
        confirmaAula() {
        },
        selSecao(param) {
            let aula = this.get('selected_aula');
            if (aula) {
                let elements = document.getElementsByClassName('sections_div');
                for (let i = 0; i < elements.length; i++) { 
                    elements[i].style.display = 'none';
                }
                document.getElementById('secao_div_' + aula + '_' + param).style.display = 'block';
            }
        }
    }
});