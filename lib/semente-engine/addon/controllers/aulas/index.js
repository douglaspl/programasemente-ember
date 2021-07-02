import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  parentController: Ember.inject.controller('aulas'),
  session: Ember.inject.service('session'),
  showHeader: Ember.run.schedule('afterRender', function () {
    $('body').removeClass('no-header');
  }),
  thisRoute: Ember.run('render', function () {
    if (window.location.pathname.includes('aulas')) {
      return 'aulas';
    }
  }),
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function () {
    return this.get('model');
  }),
  termoAceito: Ember.computed('model', function(){
    debugger;
    let termoInst = this.get('model').get('instituicao').get('statusTermoAceite');
    let termoPessoa = this.get('model').get('termoAceite');
    if(termoInst == true && termoPessoa == false){
      this.send('termoAceite');
    }
  }),
  
  parentController: Ember.inject.controller('aulas'),
  selectedDependente: Ember.computed('model', function () { return this.get('parentController').get('selectedDependente') }),

  selectedSegmento: Ember.computed('model', function () { return this.get('parentController').get('selectedSegmento') }),


  isBloco: Ember.computed('', function() {
    let that = this;
    Ember.run.schedule('afterRender', function() {
      that.send('isBloco');
    })
  }),


  selectedAno: Ember.computed('model', function () { return this.get('parentController').get('selectedAno') }),

  Ano: Ember.computed('model', function () {
    return this.get('model.plataformaAnos.firstObject')
  }),
  livros: Ember.computed('selectedDependente', function () {
    return this.get('selectedDependente.plataformaAnos').filterBy('name', this.get('selectedAno')).mapBy('livros').get('firstObject')
  }).property('selectedDependente', 'selectedAno'),
  dependentes: Ember.computed('model', function () {
    let dependentes = [];
    let deps = this.get('model.dependentes.firstObject');
    deps.forEach(p => {
      dependentes.pushObject(p)
    });
    return dependentes;
  }),
  faltaAlguem: Ember.computed('model', function () {
    let dependentes = this.get('pessoa.dependentes');
    if (dependentes) {
      let anosIdx = [];
      dependentes.forEach(dep => { anosIdx.push(dep.get('plataformaAnos.firstObject.idx')) });
      if (anosIdx.some(idx => idx < 6)) { // se tem filho no Infantil ou Fund I
        if (anosIdx.some(idx => idx >= 6)) { // se tem filho no Fund II ou Médio
          return true
        } else return false;
      } else return false;
    } else return false;
  }),
  aulasFiltradas: Ember.computed('model', function () {
    this.set('search', document.getElementById('aulapesquisa').value);
    let aulasFiltradas = this.get('selectedDependente.plataformaAnos').filterBy('name', this.get('selectedAno')).get('firstObject.aulas').sortBy('idx');
    return aulasFiltradas
  }),


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


  changedAulasFiltradas: Ember.observer('aulasFiltradas', function () {
    this.qC();
  }),





  search: '',
  actions: {
    goToAula(id) {
      this.transitionToRoute('aulas.content', id);
    },
    refreshSelectedDependente(selectedIdDependente) {
      this.send('animateCardList');
      var selectedDependente = this.get('store').peekRecord('pessoa', selectedIdDependente);
      this.get('parentController').set('selectedDependente', selectedDependente);
      this.set('selectedDependente', selectedDependente);
      let selectedSegmento = selectedDependente.get('plataformaAnos.firstObject.segmento.titulo');
      this.set('selectedSegmento', selectedSegmento);
      this.set('Ano', selectedDependente.get('plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject'));
      let selectedAno = selectedDependente.get('plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject.name');
      this.set('selectedAno', selectedAno);
      this.set('search', "");
      this.send('atualizaAulas');
    },
    toggleRole(selectedRole) {
      let selectedDependenteId;
      if (selectedRole == "responsavel") {
        selectedDependenteId = this.get('model.dependentes.firstObject.id');
      } else if (selectedRole == 'aluno' || selectedRole == 'instrutor') {
        selectedDependenteId = this.get('model.id');
      }
      this.send('refreshSelectedDependente', selectedDependenteId);
      this.get('parentController').send('toggleRole', selectedRole);
    },

    refreshSelectedSegmento(selectedSegmento) {
      this.send('animateCardList');
      this.set('selectedSegmento', selectedSegmento);
      this.send('isBloco');
      this.set('Ano', this.get('model.plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject'));
      let selectedAno = this.get('model.plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject.name');
      this.set('selectedAno', selectedAno);
      let aulasFiltradas = this.get('model.plataformaAnos').filterBy('name', selectedAno).get('firstObject.aulas');
      this.set('aulasFiltradas', aulasFiltradas);
    },
    refreshSelectedSituacao(selectedSituacao) {
      this.set('selectedSituacao', selectedSituacao);
      localStorage.setItem('selectedSituacao', selectedSituacao);
      this.qC();
      this.send('animateCardList');
    },
    refreshSelectedAno(selectedAno) {
      this.set('Ano', selectedAno);
      this.set('selectedAno', selectedAno.get('name'));
      this.send('atualizaAulas');
    },

    eraseText() {
      let btnTarget = document.getElementById("aulapesquisa");
      btnTarget.value = '';
      //  this.set('search', '');
      this.send('atualizaAulas');
    },
    atualizaAulas() {
      this.send('animateCardList');
      this.set('search', document.getElementById('aulapesquisa').value);
      let ordem = document.getElementById('order').value;
      let aulasFiltradas = this.get('selectedDependente.plataformaAnos').filterBy('name', this.get('selectedAno')).get('firstObject.aulas');
      if (ordem == "0") {
        this.set('aulasFiltradas', aulasFiltradas.toArray());
      } else {
        this.set('aulasFiltradas', aulasFiltradas.toArray().reverse());
      }
    },

    animateCardList() {
      let currentList = document.querySelector('ul[class*="card-list"]');
      currentList.classList.remove('fadeIn');
      setTimeout(() => {
        currentList.classList.add('fadeIn')
      }, 1);
    },


    isBloco() {
      let segmento = this.get('selectedSegmento');
      if (segmento === 'Ensino Infantil' || segmento === 'Fundamental I') {
        this.set('isBloco', true);
      } else {
        this.set('isBloco', false);
      }
    },

    termoAceite() {
      //debugger;
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      document.getElementById('termo_modal').classList.add('modal--is-show');
      document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
    },
    aceitarTermo(){
      //debugger;
      let pessoa = this.get('model');
      pessoa.set('termoAceite', true);
      pessoa.save().then(() => {
        document.getElementsByTagName('body')[0].style.overflow = 'auto';
        document.getElementById('termo_modal').classList.remove('modal--is-show');
        document.getElementsByTagName('body')[0].classList.remove('overflow-hidden');
      })
    },
    cancelTermo() {
      this.get('session').invalidate();
    },

  },
  init: function () {
    this._super();
    this.set('selectedSituacao', '');
  },

  
});