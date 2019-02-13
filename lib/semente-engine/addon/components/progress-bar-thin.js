import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    tagName: 'div',
    classNames: ['class_progressbar_thin'],
    appstate: Ember.inject.service(),
    prog_widthCalc: Ember.computed('data', 'appstate.upState', function() {
        let idx = this.get('data');
        let aula = this.get('appstate').getItem('atividades', idx);
        let value;
        if (aula) value = Math.round(aula.percent);
        else value = 0;
        let update = this.get('appstate.upState');
        let string = Ember.String.htmlSafe("width: " + value + "%; background-color:  #8cc798;");
        let that = this;
        Ember.run.once(function() {
            that.set('prog_style', string);
        });
        return value;
    })
});