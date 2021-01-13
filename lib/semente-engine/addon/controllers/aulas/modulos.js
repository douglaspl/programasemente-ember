import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
    appController: Ember.inject.controller('application'),
    session: Ember.inject.service(),
    parentController: Ember.inject.controller('aulas'),

    // appstate: Ember.inject.service(),
    rootURL: Ember.computed('appController', function() {
        let ac = this.get('appController');
        return ac.get('rootURL');
    }),
    // moduloSaved: Ember.computed('model', function() {
    //     let obj = localStorage.getItem('person_logged');
    //     this.get('appstate').updateApp();
    //     obj = JSON.parse(obj);
    //     let pessoa_id = obj.id;
    //     let modulos = this.get('model.modulos').sortBy('idx', 'DimensionName');
    //     let result = [];
    //     if (modulos.get('length') > 0) {
    //         modulos.forEach(element => {
    //             let obj = {};
    //             obj['modulo_id'] = element.get('id');
    //             obj['modulo_name'] = element.get('name');
    //             let atividades = element.get('atividades').sortBy('idx', 'DimensionName');
    //             if (atividades.get('length') > 0) {
    //                 obj['atividade_id'] = atividades.get('firstObject').get('id');
    //                 if (atividades.get('firstObject').get('secoes').get('length') > 0) { 
    //                     obj['section'] = atividades.get('firstObject').get('secoes').get('firstObject').get('id');
    //                 }
    //                 else obj['section'] = '';
    //                 let ativ_completas = 0;
    //                 let total = 0;
    //                 let parcial = 0;
    //                 atividades.forEach(ativ => {
    //                     let obj_ativ = {};
    //                     obj_ativ['atividade_id'] = ativ.get('id');
    //                     if (ativ.get('secoes').get('length') > 0) {
    //                         let secoes = ativ.get('secoes').sortBy('idx', 'DimensioName');
    //                         obj_ativ['section'] = secoes.get('firstObject').get('id');
    //                     }
    //                     else obj_ativ['section'] = '';
                        // let progressos = ativ.get('progressos').get('firstObject');
                        // total = total + 500;
                        // // total = total + 600;
                        // let total_local = progressos.get('ts1') + progressos.get('ts2') + progressos.get('ts3') + progressos.get('ts4') + progressos.get('ts5'); //+ progressos.get('ts6');
                        // parcial = parcial + total_local;
                        // // if (total_local === 600) {
                        // if (total_local === 500) {
                        //     ativ_completas = ativ_completas + 1;
                        // }
                        // if (progressos.get('ultimasecao') === 0) {
                        //     // obj_ativ['section'] = 'abertura';
                        // }
                        // else if (progressos.get('ultimasecao') === 1) {
                        //     obj_ativ['section'] = 'video';
                        //     obj['atividade_id'] = ativ.get('id');
                        //     // obj['section'] = 'video';
                        // }
                        // else if (progressos.get('ultimasecao') === 2) {
                        //     obj_ativ['section'] = 'quiz';
                        //     obj['atividade_id'] = ativ.get('id');
                        //     // obj['section'] = 'quiz';
                        // }
                        // else if (progressos.get('ultimasecao') === 3) {
                        //     obj_ativ['section'] = 'teoria';
                        //     obj['atividade_id'] = ativ.get('id');
                        //     // obj['section'] = 'teoria';
                        // }
                        // else {
                        //     obj_ativ['section'] = 'atividade';
                        //     obj['atividade_id'] = ativ.get('id');
                        //     // obj['section'] = 'atividade';
                        // }
    //                 });
    //                 obj['ativ_concluidas'] = ativ_completas;
    //                 if (total > 0) obj['completo'] = Math.round(100*parcial/total);
    //                 else obj['completo'] = 0;
    //                 result.pushObject(obj);
    //             }
    //             else result.pushObject({'modulo_id': element.get('id'), 'modulo_name': element.get('name'), 'modulo_class': element.get('class'), 'atividade_id': '', 'section': '', 'completo': 0, 'ativ_concluidas': 0});
    //         });
    //     }
    //     result.sort((a, b) => a.modulo_id.localeCompare(b.modulo_id));
    //     return result;
    // }),
    logOut() {
        localStorage.clear();
        this.get('session').invalidate();
    },
    actions: {
        toggleRole(selectedRole) {
          this.get('parentController').send('toggleRole', selectedRole)
        },
        refreshSelectedSegmento(selectedSegmento) {
          // let segmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
          this.set('segmento_id', selectedSegmento.get('id'));
          this.set('selectedSegmentoLocal', selectedSegmento);
        },
      }
});
