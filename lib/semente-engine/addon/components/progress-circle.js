import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    tagName: 'div',
    classNames: ['progress', 'green'],
    appstate: Ember.inject.service(),
    modulo_value: Ember.computed('value','appstate.upState', function() {
        let idx = this.get('value');
        let modulo = this.get('appstate').getItem('modulos', idx);
        let value;
        if (modulo) value = Math.round(modulo.percent);
        let update = this.get('appstate.upState');
        let string_r, string_l;
        if (value === 0) {
            string_r= Ember.String.htmlSafe("");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 5) {
            string_r= Ember.String.htmlSafe("animation: loading-1 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 10) {
            string_r= Ember.String.htmlSafe("animation: loading-2 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 15) {
            string_r= Ember.String.htmlSafe("animation: loading-3 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 20) {
            string_r= Ember.String.htmlSafe("animation: loading-4 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 25) {
            string_r= Ember.String.htmlSafe("animation: loading-5 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 30) {
            string_r= Ember.String.htmlSafe("animation: loading-6 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 35) {
            string_r= Ember.String.htmlSafe("animation: loading-7 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 40) {
            string_r= Ember.String.htmlSafe("animation: loading-8 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 45) {
            string_r= Ember.String.htmlSafe("animation: loading-9 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 50) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("");
        }
        else if (value <= 55) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-1 1.8s linear forwards 1.8s;");
        }
        else if (value <= 60) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-2 1.8s linear forwards 1.8s;");
        }
        else if (value <= 65) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-3 1.8s linear forwards 1.8s;");
        }
        else if (value <= 70) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-4 1.8s linear forwards 1.8s;");
        }
        else if (value <= 75) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-5 1.8s linear forwards 1.8s;");
        }
        else if (value <= 80) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-6 1.8s linear forwards 1.8s;");
        }
        else if (value <= 85) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-7 1.8s linear forwards 1.8s;");
        }
        else if (value <= 90) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-8 1.8s linear forwards 1.8s;");
        }
        else if (value <= 95) {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-9 1.8s linear forwards 1.8s;");
        }
        else {
            string_r= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards;");
            string_l= Ember.String.htmlSafe("animation: loading-10 1.8s linear forwards 1.8s;");
        }
        let that = this;
        Ember.run.once(function() {
            that.set('string_right', string_r);
            that.set('string_left', string_l);
        });
        return value;
    })
});