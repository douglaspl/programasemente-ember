import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  conteudo: Ember.computed('model', function(){
    return this.get('model');
  }),
  agrupamentos: Ember.computed('model', function(){
    return this.get('store').peekAll('agrupamento');
  }),
  segmentos: Ember.computed('model', function(){
    return this.get('store').peekAll('segmento');
  }),
  publicos: Ember.computed('model', function(){
    return this.get('store').peekAll('publico');
  }),
  
  actions: {
    saveConteudo(conteudo) {
      let that = this;
      conteudo.save().then(function(conteudo){
        debugger;
        that.transitionToRoute('conteudos.index');
      }).catch(function(error) {
      });
    },
  }
});
