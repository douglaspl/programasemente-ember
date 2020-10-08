import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  tagName: 'li',

  aplicacao: Ember.computed(function(){
    let aula = this.get('aula');
    let person = JSON.parse(localStorage.getItem('person_logged'));
    let person_id = person.id;
    let pessoa = this.get('store').peekRecord('pessoa', person_id);
    pessoa.get('turmas').forEach(function(t){
      t.get('aplicacoes').forEach(function(a){
        if (a.get('aula').get('id') == aula.get('id')){
          return a;
        }
      })
    })
    return false;
  }),
  actions: {
    transitToAula(id) {
      this.transit(id);
    }
  },
  init: function () {
    this._super();
    //this.get('value');
  }
});
