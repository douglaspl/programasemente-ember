import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  parentController: Ember.inject.controller('aulas'),
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function () {
    debugger;
    return this.get('model.pessoa');
  }),
  selectedTema: 'Todos',
  selectedPublicos: Ember.computed('parentController.toggleRole', function () {
    if (['intrutor', 'gestor', 'coordenador', 'admin'].includes(localStorage.getItem('toggleRole'))) return [];
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
    let conts = this.get('model.platconteudos').filter(c => this.get('selectedPublicos').mapBy('name').every(sp => c.get('publicos').mapBy('name').includes(sp))).filterBy('situacao', true).filterBy('agrupamento.name', "Biblioteca").filterBy('tipo', this.get('selectedTipo'));
    if (this.get('selectedTema') != 'Todos') conts = conts.filterBy('tema.name', this.get('selectedTema'));
    return conts
  }).property('selectedTipo', 'selectedTema', 'selectedPublicos.[]'),
  stopVideo: false,

  toggleConteudoModal(target) {
    var el = document.getElementById('content-modal');
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
  },

  noCards: false,
  qC() {
    setTimeout(() => {
      let qtde = document.querySelectorAll("[class*='media--card']").length;
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
    goToModulos(modIdx) {
      this.transitionToRoute('aulas.modulos.modlist', modIdx);
    },
    eraseText() {
      this.send('animateCardList');
      let btnTarget = document.getElementById("search");
      btnTarget.value = '';
      this.set('search', '');

    },
    
    toggleModal(conteudo) {
      this.set('stopVideo', false);
      this.set('selectedConteudo', conteudo);
      this.toggleConteudoModal();

      // let vimeoCode = conteudo.get('videoUrl');
      // $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + vimeoCode, { format: "json" }, function (data) {
      //   debugger;
      //   $('#vimeoVideo').html(data.html);
      // })
    },
    closeConteudoModal() {
      this.set('stopVideo', true);
      this.toggleConteudoModal();
    },

    animateCardList() {
      let currentList = document.querySelector('ul[class*="card-list"]');
      currentList.classList.remove('fadeIn');
      setTimeout(() => {
        currentList.classList.add('fadeIn')
      }, 1);
    },
  },
});