import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    tagName: 'li',
    appstate: Ember.inject.service(),
    classNames: ['course-nav__node'],
    classNameBindings: ['isQuestion:course-nav__node--question', 'isDone:course-nav__node--is-done'],
    isQuestion: Ember.computed('questao', function() {
        if (this.get('questao')) return true;
        else return false;
    }),
    isDone: Ember.computed('appstate.upState', 'secao', 'questao', function() {
        if (this.get('questao')) return false;
        else {
            let state = this.get('appstate.upState');
            if (state > 1) {
                let result = this.get('appstate').getItem('secoes', this.get('secao.id'));
                if (result.conteudo.percent >= 100) return true;
                else return false;
            }
            else {
                return false;
            }
        }
    })
})