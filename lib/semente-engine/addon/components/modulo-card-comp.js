import Component from '@ember/component';

export default Component.extend({
    tagName: 'div',
    classNames: ['card__footer module-card-ending'],
    appstate: Ember.inject.service(),
    value: Ember.computed('data', 'type', 'appstate.upState', function() {
        let idx = this.get('data');
        let update = this.get('appstate.upState');
        let percent, itens_completos, total;
        if (this.get('type') === 'modulo') {
            let modulo = this.get('appstate').getItem('modulos', idx);
            if (modulo) {
                percent = modulo.percent;
                itens_completos = modulo.atividades_completas;
                total = modulo.atividades.length;
            }
            else {
                percent = 0;
                itens_completos = 0;
                total = 0;
            } 
        }
        else if (this.get('type') === 'aula') {
            let aula = this.get('appstate').getItem('atividades', idx);
            if (aula) {
                percent = aula.percent;
                itens_completos = aula.secoes_completas;
                total = aula.secoes.length;
            }
            else {
                percent = 0;
                itens_completos = 0;
                total = 0;
            }
        }
        let string = Ember.String.htmlSafe('width: ' + percent + '%;');
        let that = this;
        Ember.run.once(function() {
            that.set('string', string);
            that.set('total', total);
            that.set('itens_completos', itens_completos);
        });
        return percent;
    }),
    init: function () {
        this._super();
        this.get('value');
    } 
});