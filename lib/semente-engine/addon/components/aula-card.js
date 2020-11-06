import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  tagName: 'li',

  aplicacao: Ember.computed('aula', function(){
    let aplicacao;
    let aula = this.get('aula');
    let person = JSON.parse(localStorage.getItem('person_logged'));
    let person_id = person.id;
    let pessoa = this.get('store').peekRecord('pessoa', person_id);
    pessoa.get('plataformaTurmas').forEach(function(t){
      t.get('aplicacoes').forEach(function(a){
        if (a.get('aula').get('id') == aula.get('id')){
          aplicacao = a;
        }
      })
    })
    return aplicacao;
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
