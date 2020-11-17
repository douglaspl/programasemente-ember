import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  show: "Aulas",
  pessoa: Ember.computed('model', function(){
    return this.get('model.pessoa');
  }),
  conteudos: Ember.computed('model', function(){
    return this.get('model.platconteudos');
  }),
  agrupamentos: Ember.computed('model', function(){
    return this.get('model.agrupamentos')
  }),
  segmentos: Ember.computed('model', function(){
    return this.get('model.segmentos')
  }),
  
  actions: {
    goToCreateConteudo() {
      debugger;
      this.transitionToRoute('conteudos.create'); 
    },
    filtroAgrupa(filtro){
      this.set('show', filtro);
    },


  }

});
