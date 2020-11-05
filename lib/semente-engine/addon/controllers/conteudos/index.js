import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model');
  }),
  conteudos: Ember.computed('model', function(){
    var conteudos = this.get('store').findAll('plataforma-conteudo');
    return conteudos
  }),
  
  actions: {
    goToCreateConteudo() {
      this.transitionToRoute('conteudos.create'); 
    }
  }

});
