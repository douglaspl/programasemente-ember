import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model.pessoa');
  }),
  selectedTema: '',
  selectedTipo: '',
  conteudos: Ember.computed('model', function(){
    let toggleRole = localStorage.getItem('toggleRole');
    let conteudos = this.get('model.platconteudos').filterBy('situacao', true)
      .filterBy('agrupamento.name', "Biblioteca").filterBy('tema', this.get('selectedTema'))
      .filter(c => c.get('publicos').mapBy('name').includes(toggleRole)).filterBy('tipo', this.get('selectedTipo'));
    return conteudos
  }).property('selectedTipo', 'selectedTema', 'toggleRole'),
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
    goToAulas() {
      this.transitionToRoute('aulas.index');
    },
    goToAula(id) {
      this.transitionToRoute('aulas.content', id);
    },
    invalidateSession: function () {
      localStorage.clear();
      this.get('session').invalidate();
    },
    // goToAddDependente(){
    //   let header = localStorage.getItem('person_logged');
    //   let pessoa = JSON.parse(header);
    //   this.transitionToRoute('profile.index', pessoa.id);
    // },
    goToBiblioteca(){
      this.transitionToRoute('plataformabiblioteca.index');
    },
    refreshSelectedTipo(selectedTipoStr) {
      this.set('selectedTipo', selectedTipoStr);
    },
    refreshSelectedTema(selectedTemaStr) {
      this.set('selectedTema', selectedTemaStr);
    },

    goToAulas(){
      this.transitionToRoute('aulas');
    },
  }

});
