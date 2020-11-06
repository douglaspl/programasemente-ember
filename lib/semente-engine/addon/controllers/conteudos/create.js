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
  conteudos: Ember.computed('model', function(){
    var conteudos = this.get('store').peekAll('plataforma-conteudo');
    return conteudos
  }),
  // segmentos: Ember.computed('model', function(){
  //   var segmentos = this.get('store').findAll('plataforma-conteudo');
  //   var anos = this.get('store').findAll('plataforma-conteudo');
  //   var aulas = this.get('store').findAll('aula');
  //   return conteudos
  // }),

  actions: {
    saveConteudo(conteudo) {
      conteudo.get('dependentes').forEach(dep => {
          conteudo.get('dependentes').removeObject(dep);
      });
      conteudo.get('dependentes').pushObject(this.get('model'));
      
      conteudo.save().then(function(conteudo){
          debugger;
      }).catch(function(error) {
          debugger;
      });
  }
  }

});
