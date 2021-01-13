import Controller from '@ember/controller';
import { typeOf } from '@ember/utils';
import Ember from 'ember';


export default Controller.extend({
    update: false,
    session: Ember.inject.service(),
    modController: Ember.inject.controller('aulas.modulos'),
    lastAtividade: [], //last atividade visited by the user
    appController: Ember.inject.controller('application'),
    appstate: Ember.inject.service(),
    prog_tgt: '',
    setPosition: Ember.computed('appController.transited', function() {        
        let mq = window.matchMedia("(max-width: 1023px)");
        let res = '';
        if (mq.matches && (this.get('mobileView') === false || typeOf(this.get('mobileView') === undefined))) {
            res = true;
        }
        else if (!mq.matches && (this.get('mobileView') === true || typeOf(this.get('mobileView') === undefined))) {
            res = false;
        }
        let that = this;
        Ember.run.once(function(){
            that.set('mobileView', res);
        })
        return this.get('appController.transited');
    }),
    ativ_ativa_id: '',
    ativ_ativa_name: '',
    modulo_completed: Ember.computed('model', 'update', function() {
        let shi = this.get('update');
        let result = 0;
        // let total = 0;
        // let parcial = 0;
        // let atividades = this.get('model').get('atividades');        
        let result_array = [];
        // if (atividades) {
        //     let enable_next = true;
        //     atividades.forEach(ativ => {
                // let progressos = ativ.get('progressos').get('firstObject');
                // let sum_prog = 0;
                // if (progressos) {
                //     total = total + 500;
                //     // total = total + 600;
                //     sum_prog = progressos.get('ts1') + progressos.get('ts2') + progressos.get('ts3') + progressos.get('ts4') + progressos.get('ts5'); // + progressos.get('ts6');
                //     parcial = parcial + sum_prog;
                // }
                // if (enable_next) {
                //     result_array.pushObject(ativ);
                // }
                // // if (sum_prog == 600) {
                // if (sum_prog == 500) {
                //     enable_next = true;
                // }
                // else {
                //     enable_next = false;
                // }
        //     });
        // }
        // if (total > 0) {
        //     result = Math.round(100*parcial/total);
        // }
        let that = this;
        //that.get('appstate').updateApp();
        Ember.run.schedule('afterRender', function(){            
            that.set('ativ_enabled', result_array);
        });
        return result;
    }),
    moduloId() {
        return this.get('model').get('id');
    },
    atividadeModal() {
        document.getElementById('aulas_list_modal').style.display = 'block';
    },
    actions: {
        goAtividade(param1, param2) {
            document.getElementById('aulas_list_modal').style.display = 'none';
            let path = 'modulos.modetails.ativdetails';
            this.transitionToRoute(path, param1, param2);
        },
        closeModal() {
            document.getElementById('aulas_list_modal').style.display = 'none';
        },
        logOut() {
            localStorage.clear();  
            this.get('session').invalidate();
        }
    }
});