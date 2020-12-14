import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  parentController: Ember.inject.controller('aulas'),
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model.pessoa');
  }),
  toggleRole: localStorage.getItem('toggleRole'),
  temas: Ember.computed('model', function(){
    let temas = this.get('model.platconteudos').filterBy('agrupamento.name', "Biblioteca").get('firstObject.agrupamento.temas').mapBy('name');
    let temasFilter = temas.filter((value, index) => temas.indexOf(value) === index);
    this.set('selectedTema', temas[0]);
    return temasFilter
  }),
  tipos: Ember.computed('model', function(){
    let tipos = this.get('model.platconteudos').mapBy('tipo');
    let tiposFilter = tipos.filter((value, index) => tipos.indexOf(value) === index);
    this.set('selectedTipo', tipos[0]);
    return tiposFilter
  }),
  conteudos: Ember.computed('model', function(){
    return this.get('model.platconteudos').filter(c => c.get('publicos').mapBy('name').includes(this.get('toggleRole'))).filterBy('situacao', true).filterBy('agrupamento.name', "Biblioteca")
      .filterBy('tema.name', this.get('selectedTema')).filterBy('tipo', this.get('selectedTipo'))
  }).property('selectedTipo','selectedTema'),
  actions: {
    refreshSelectedTipo(selectedTipoStr) {
      this.set('selectedTipo', selectedTipoStr);
    },
    refreshSelectedTema(selectedTemaStr) {
      this.set('selectedTema', selectedTemaStr);
    },
    toggleRole(selectedRole) {
      this.get('parentController').send('toggleRole', selectedRole)
    },
  }

});