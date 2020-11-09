import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model');
  }),
  publico: Ember.computed('model', function(){
    return this.get('model.publico')
  }),
  agrupamento: Ember.computed('model', function(){
    return this.get('model.agrupamento')
  }),

  conteudo: Ember.computed('model', function(){
    var conteudo = this.get('store').createRecord('plataforma-conteudo')
    return conteudo
  }),
  // segmentos: Ember.computed('model', function(){
  //   var segmentos = this.get('store').findAll('plataforma-conteudo');
  //   var anos = this.get('store').findAll('plataforma-conteudo');
  //   var aulas = this.get('store').findAll('aula');
  //   return conteudos
  // }),

  actions: {
    
  }
});
