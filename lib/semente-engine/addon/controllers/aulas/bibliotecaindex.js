import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  parentController: Ember.inject.controller('aulas'),
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function () {
    return this.get('model.pessoa');
  }),
  selectedTema: 'Todos',
  selectedPublicos: Ember.computed('parentController.toggleRole', function () {
    if (['instrutor', 'gestor', 'coordenador', 'admin'].includes(localStorage.getItem('toggleRole'))) return [];
    else return [{ name: localStorage.getItem('toggleRole') }];
  }),
  temas: Ember.computed('model', function () {
    return this.get('store').peekAll('tema').mapBy('name');
  }),
  publicos: Ember.computed('model', function () {
    return this.get('store').peekAll('publico');
  }),
  tipos: Ember.computed('model', function () {
    let tipos = this.get('model.platconteudos').mapBy('tipo');
    let tiposFilter = tipos.filter((value, index) => tipos.indexOf(value) === index);
    this.set('selectedTipo', tipos[0]);
    return tiposFilter
  }),
  conteudos: Ember.computed('model', function () {
    let conts = this.get('model.platconteudos');
    if (this.get('selectedPublicos') != []) conts = conts.filter(c => this.get('selectedPublicos').mapBy('name').every(sp => c.get('publicos').mapBy('name').includes(sp)));
    conts = conts.filterBy('situacao', true).filterBy('agrupamento.name', "Biblioteca").filterBy('tipo', this.get('selectedTipo'));
    if (this.get('selectedTema') != 'Todos') conts = conts.filterBy('tema.name', this.get('selectedTema'));
    return conts
  }).property('selectedTipo', 'selectedTema', 'selectedPublicos.[]'),
  stopVideo: false,

  toggleConteudoModal(target) {
    var el = document.getElementById('content-modal');
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
  },

  selectedDependente: Ember.computed('model', function(){ return this.get('parentController').get('selectedDependente') }),
  
  selectedSegmento: Ember.computed('model', function(){ return this.get('parentController').get('selectedSegmento') }),
  
  selectedAno: Ember.computed('model', function(){ return this.get('parentController').get('selectedAno') }),

  Ano: Ember.computed('model', function(){
    return this.get('model.plataformaAnos.firstObject')
  }),
  
  livros: Ember.computed('selectedDependente', function(){
    return this.get('selectedDependente.plataformaAnos').filterBy('name', this.get('selectedAno')).mapBy('livros').get('firstObject')
  }).property('selectedDependente', 'selectedAno'),

  noCards: false,
  qC() {
    setTimeout(() => {
      let qtde = document.querySelectorAll("[class*='media']").length;
      if (qtde === 0) {
        this.set('noCards', true);
      } else {
        this.set('noCards', false);
      }
    }, 1);
  },
  changedAulasFiltradas: Ember.observer('search', 'selectedTipo', 'selectedTema', function () {
    this.qC();
  }),
  toggleConteudoModal(target) {
    var el = document.getElementById('content-modal');
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden no-header');
  },

  actions: {
    refreshSelectedPublicos(selectedPublicoId) {
      this.send('animateCardList');
      let selectedPublico = this.get('store').peekRecord('publico', selectedPublicoId);
      let sp = this.get('selectedPublicos');
      if (sp.includes(selectedPublico)) sp.removeObject(selectedPublico)
      else sp.pushObject(selectedPublico)
      this.set('selectedPublicos', sp)
    },
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
    
    toggleModal(conteudoId){
      this.set('stopVideo', false);
      var conteudo = this.get('conteudos').filterBy('id', conteudoId).get('firstObject');
      this.set('selectedConteudo', conteudo);
      this.toggleConteudoModal();
    },
    closeConteudoModal() {
      this.set('stopVideo', true);
      this.set('selectedConteudo', null);
      this.toggleConteudoModal();
    },

    animateCardList() {
      let currentList = document.querySelector('ul[id*="card-list"]');
      currentList.classList.remove('fadeIn');
      setTimeout(() => {
        currentList.classList.add('fadeIn')
      }, 1);
    },
  },
});