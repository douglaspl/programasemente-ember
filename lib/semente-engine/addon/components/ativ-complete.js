import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    tagName: 'div',
    classNames: ['progress-ativ'],
    store: Ember.inject.service(),
    status: Ember.computed('data', 'role', function() {
        let mode = this.get('mode');
        let result;
        let res_class;
        let res_status;
        if (mode === 'atividade') {
            let result = this.get('data').get('firstObject');
            if (result) {
                // if (parseInt(result.get('ts1')) === 0 && parseInt(result.get('ts2')) === 0 && parseInt(result.get('ts3')) === 0 && parseInt(result.get('ts4')) === 0 && parseInt(result.get('ts5')) === 0 && parseInt(result.get('ts6')) === 0) {
                if (parseInt(result.get('ts1')) === 0 && parseInt(result.get('ts2')) === 0 && parseInt(result.get('ts3')) === 0 && parseInt(result.get('ts4')) === 0 && parseInt(result.get('ts5')) === 0) {
                    res_class = 'ativ-box-iniciar';
                    res_status = 'Iniciar (0%)';                
                }
                // else if (parseInt(result.get('ts1')) === 100 && parseInt(result.get('ts2')) === 100 && parseInt(result.get('ts3')) === 100 && parseInt(result.get('ts4')) === 100 && parseInt(result.get('ts5')) === 100 && parseInt(result.get('ts6')) === 100) {
                else if (parseInt(result.get('ts1')) === 100 && parseInt(result.get('ts2')) === 100 && parseInt(result.get('ts3')) === 100 && parseInt(result.get('ts4')) === 100 && parseInt(result.get('ts5')) === 100) {
                    res_class = 'ativ-box-completa';
                    res_status = 'Completa (100%)';
                }
                else {
                    res_class = 'ativ-box-continuar';
                    // let mean = (parseInt(result.get('ts1')) + parseInt(result.get('ts2')) + parseInt(result.get('ts3')) + parseInt(result.get('ts4')) + parseInt(result.get('ts5')) + parseInt(result.get('ts6')))/6;
                    let mean = (parseInt(result.get('ts1')) + parseInt(result.get('ts2')) + parseInt(result.get('ts3')) + parseInt(result.get('ts4')) + parseInt(result.get('ts5')))/5;
                    res_status = 'Continuar (' + mean + '%)';
                }
            }
            else {
                res_class = 'ativ-box-continuar';
                res_status = 'Continuar';
            }
        }
        else if (mode === 'modulo') {
            let ativ = this.get('data');
            let total = 0;
            let partial = 0;
            if (ativ) {
                ativ.forEach(prog => {
                    // total = total + 600;
                    total = total + 500;
                    if (this.get('role') === 'aluno') {
                        let data = prog.get('progressos').get('firstObject');
                        partial = partial + data.get('ts1') + data.get('ts2') + data.get('ts3') + data.get('ts4') + data.get('ts5'); // + data.get('ts6');
                    }
                    else {
                        partial = partial + prog.get('ts1instituicao') + prog.get('ts2instituicao') + prog.get('ts3instituicao') + prog.get('ts4instituicao') + prog.get('ts5instituicao'); // + prog.get('ts6instituicao');
                    }
                });
                if (partial === 0 || total === 0) {
                    res_class = 'ativ-box-iniciar';
                    res_status = 'Iniciar (0%)';
                }
                else if (partial === total) {
                    res_class = 'ativ-box-completa';
                    res_status = 'Completa (100%)';
                }
                else {
                    res_class = 'ativ-box-continuar';
                    res_status = 'Continuar (' + Math.round(100*partial/total) + '%)';
                }
            }
            else {
                res_class = 'ativ-box-iniciar';
                res_status = 'Iniciar';
            }
        }
        let that = this;
        Ember.run.once('afterRender', function(){
            that.set('class_div', res_class);
        });
        return res_status;     
    }),
});