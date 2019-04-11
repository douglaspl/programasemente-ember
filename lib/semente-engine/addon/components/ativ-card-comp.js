import Ember from 'ember';
import Component from '@ember/component';
//import service from 'ember-service/inject';

export default Component.extend({
    router: Ember.inject.service('-routing'),
    store: Ember.inject.service(),
    tagName: 'li',
    appstate: Ember.inject.service(),
    value: Ember.computed('data','appstate.upState', function() {
        debugger;
        let idx = this.get('data');
        let update = this.get('appstate.upState');
        let percent, itens_completos, total;
        let aula = this.get('appstate').getItem('atividades', idx);
        let resp = this.get('store').peekRecord('atividade', aula.id);
        let data = resp.get('dia');
        let mes = parseInt(data.substr(5,2));
        this.set('dia',parseInt(data.substr(8,2)));
        this.set('mensagem_mes','de Janeiro');
        if (mes == 2){
            this.set('mensagem_mes','de Fevereiro');
        }
        else if (mes == 3){
            this.set('mensagem_mes','de Março');
        }
        else if (mes == 4){
            this.set('mensagem_mes','de Abril');
        }
        else if (mes == 5){
            this.set('mensagem_mes','de Maio');
        }
        else if (mes == 6){
            this.set('mensagem_mes','de Junho');
        }
        else if (mes == 7){
            this.set('mensagem_mes','de Julho');
        }
        else if (mes == 8){
            this.set('mensagem_mes','de Agosto');
        }
        else if (mes == 9){
            this.set('mensagem_mes','de Setembro');
        }
        else if (mes == 10){
            this.set('mensagem_mes','de Outubro');
        }
        else if (mes == 11){
            this.set('mensagem_mes','de Novembro');
        }
        else if (mes == 12){
            this.set('mensagem_mes','de Dezembro');
        }
        this.set('aula_liberada',false);
        if (aula) {
            percent = aula.percent;
            itens_completos = aula.secoes_completas;
            total = aula.secoes.length;
            let modulo = resp.get('modulo');
            let atividade_anterior = modulo.get('atividades').filterBy('idx',resp.get('idx')-1).get('firstObject');
            if (atividade_anterior)
            {
                let state_anterior = this.get('appstate').getItem('atividades', atividade_anterior.get('id'));
                if (state_anterior.percent === 100)
                {
                    this.set('aula_liberada',true);
                }
            }
            if (resp.get('idx') === 1)
            {
                this.set('aula_liberada', true);
            }
        }
        else {
            percent = 0;
            itens_completos = 0;
            total = 0;
        }
        let string = Ember.String.htmlSafe('width: ' + percent + '%;');
        let that = this;
        Ember.run.once(function() {
            that.set('string', string);
            that.set('total', total);
            that.set('itens_completos', itens_completos);
            that.set('atividade',resp);
            if (aula.secoes[0])
            {
                that.set('temSecoes',true);
            }
            else
            {
                that.set('temSecoes',false);
            }

        });
        return percent;
    }),
    actions: {
        transitToAtividade() {
            this.transit(this.get('atividade.id'));
        }
    },
    init: function () {
        this._super();
        this.get('value');
    }
});