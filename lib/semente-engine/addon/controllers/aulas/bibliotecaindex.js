import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  parentController: Ember.inject.controller('aulas'),
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model.pessoa');
  }),
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
    return this.get('model.platconteudos').filter(c => c.get('publicos').mapBy('name').includes(localStorage.getItem('toggleRole'))).filterBy('situacao', true).filterBy('agrupamento.name', "Biblioteca")
      .filterBy('tema.name', this.get('selectedTema')).filterBy('tipo', this.get('selectedTipo'))
  }).property('selectedTipo','selectedTema', localStorage.getItem('toggleRole')),
  
  noCards: false,
  
  qC() { 
   setTimeout(() => {
    let qtde =  document.querySelectorAll("[class*='media--card']").length;
    if (qtde === 0) {
      this.set('noCards', true);
    } else {
      this.set('noCards', false);
    }
    }, 1);
  },
   

  changedAulasFiltradas: Ember.observer('search', function () {
   this.qC();
   }),
  
  actions: {
    refreshSelectedTipo(selectedTipoStr) {
      this.send('animateCardList');
      this.set('selectedTipo', selectedTipoStr);
    },
    refreshSelectedTema(selectedTemaStr) {
      this.send('animateCardList');
      this.set('selectedTema', selectedTemaStr);
    },
    toggleRole(selectedRole) {
      this.get('parentController').send('toggleRole', selectedRole)
    },
    eraseText() {
      this.send('animateCardList');
      let btnTarget = document.getElementById("search");
      btnTarget.value = '';
      this.set('search', '');
      
     },

     animateCardList() {
      let currentList = document.querySelector('ul[class*="card-list"]');
      currentList.classList.remove('fadeIn');
      setTimeout(() => {
        currentList.classList.add('fadeIn')
      }, 1);
    },
  }

});