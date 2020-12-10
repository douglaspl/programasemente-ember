import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model.pessoa');
  }),
  conteudos: Ember.computed('model', function(){
    let conteudos = this.get('model.platconteudos').filterBy('situacao', true).filterBy('agrupamento.name', "Biblioteca");
    let contpub = [];
    let role = this.get('pessoa.role');
    // debugger;
    conteudos.forEach(c => {
      if (c.get('publicos').mapBy('name').includes(role)){
        contpub.pushObject(c)
      }
    });
    return contpub;
  }),
  temas: Ember.computed('model', function(){
    let temas = this.get('conteudos').get('firstObject').get('agrupamento').get('temas').mapBy('name');
    let temasFilter = temas.filter((value, index) => temas.indexOf(value) === index);
    this.set('selectedTema', temas[0]);
    return temasFilter
  }),
  tipos: Ember.computed('model', function(){
    let tipos = this.get('conteudos').mapBy('tipo');
    let tiposFilter = tipos.filter((value, index) => tipos.indexOf(value) === index);
    this.set('selectedTipo', tipos[0]);
    return tiposFilter
  }),
  actions: {
    refreshSelectedTipo(selectedTipoStr) {
      this.set('selectedTipo', selectedTipoStr);
    },
    refreshSelectedTema(selectedTemaStr) {
      this.set('selectedTema', selectedTemaStr);
    },
  }

});
