import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  session: Ember.inject.service('session'),
  showHeader: Ember.run.schedule('afterRender', function () {
    $('body').removeClass('no-header');
  }),
  thisRoute: Ember.run('render', function(){
    if(window.location.pathname.includes('aulas')) {
      return 'aulas';
    }
    if(window.location.pathname.includes('plataformabiblioteca')) {
      return 'plataformabiblioteca';
    }
  }),
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    this.set('leitor', this.get('model'));
    return this.get('model');
  }),
  toggleRole: Ember.computed('model', function(){
    if (localStorage.getItem('toggleRole')){
      return localStorage.getItem('toggleRole')
    }
    let role = this.get('model.role');
    localStorage.setItem('toggleRole', role);
    // para a visualização
    if (role == 'coordenador' || role == 'gestor' || role == 'diretor' || role == 'admin'){
      return 'instrutor';
    }
    return role;
  }),
  selectedDependente: Ember.computed('model', function(){
    let id;
    let toggleRole = localStorage.getItem('toggleRole');
    if (toggleRole == 'responsavel') {
      id = this.get('model.dependentes.firstObject.id');
    } else {
      id = this.get('model.id');
    }
    return this.get('store').peekRecord('pessoa', id);
  }),
  selectedSegmento: Ember.computed('model', function(){
    if (this.get('selectedDependente')){
      return this.get('selectedDependente.plataformaAnos.firstObject.segmento.titulo');
    } else{
      return this.get('model.plataformaAnos.firstObject.segmento.titulo');
    }
  }),
  selectedAno: Ember.computed('model', function(){
    if (this.get('selectedDependente')){
      return this.get('selectedDependente.plataformaAnos').filterBy('segmento.titulo', this.get('selectedSegmento')).get('firstObject.name');
    } else{
      return this.get('model.plataformaAnos').filterBy('segmento.titulo', this.get('selectedSegmento')).get('firstObject.name');
    }
  }),
  Ano: Ember.computed('model', function(){
    return this.get('model.plataformaAnos.firstObject')
  }),

  dependentes: Ember.computed('model', function(){
    let dependentes = [];
    let deps = this.get('model.dependentes.firstObject');
    deps.forEach(p => {
      dependentes.pushObject(p)
    });
    return dependentes;
  }),
  segmentos: Ember.computed('model', function(){
    var segmentos = this.get('model.plataformaAnos').mapBy('segmento.titulo');
    let segmentosFilter = segmentos.filter((value, index) => segmentos.indexOf(value) === index);
    return segmentosFilter;
  }),
  faltaAlguem: Ember.computed('model', function(){
    let dependentes = this.get('pessoa.dependentes');
    if (dependentes){
      let anosIdx = [];
      dependentes.forEach(dep => { anosIdx.push(dep.get('plataformaAnos.firstObject.idx')) });
      if (anosIdx.some(idx => idx < 6)){ // se tem filho no Infantil ou Fund I
        if (anosIdx.some(idx => idx >= 6)){ // se tem filho no Fund II ou Médio
          return true
        } else return false;
      } else return false;
    } else return false;
  }),
  aulasFiltradas: Ember.computed('model', function(){
    this.set('search', document.getElementById('aulapesquisa').value)
    let selectedDependente = this.get('selectedDependente');
    let aulasFiltradas;
    if (selectedDependente){
      this.set('leitor', selectedDependente);
      aulasFiltradas = selectedDependente.get('plataformaAnos.firstObject.aulas');
    } else{
      this.set('leitor', this.get('model'));
      aulasFiltradas = this.get('model.plataformaAnos').filterBy('name', this.get('selectedAno')).get('firstObject.aulas');
    }
    return aulasFiltradas
  }),
  search: '',
  actions: {
    goToAula(id) {
      this.transitionToRoute('aulas.content',id);
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
    refreshSelectedDependente(selectedIdDependente) {
      this.send('animateCardList');
      var selectedDependente = this.get('store').peekRecord('pessoa', selectedIdDependente);
      this.set('leitor', selectedDependente);
      this.set('selectedDependente', selectedDependente);
      let selectedSegmento = selectedDependente.get('plataformaAnos.firstObject.segmento.titulo');
      this.set('selectedSegmento', selectedSegmento);
      this.set('Ano', selectedDependente.get('plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject'));
      let selectedAno = selectedDependente.get('plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject.name');
      this.set('selectedAno', selectedAno);
      this.set('search', "");
      this.send('atualizaAulas');
    },
    refreshSelectedSegmento(selectedSegmento) {
      this.set('selectedSegmento', selectedSegmento);
      this.set('Ano', this.get('model.plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject'));
      let selectedAno = this.get('model.plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject.name');
      this.set('selectedAno', selectedAno);
      let aulasFiltradas = this.get('model.plataformaAnos').filterBy('name', selectedAno).get('firstObject.aulas');
      this.set('aulasFiltradas', aulasFiltradas);
    },
    refreshSelectedSituacao(selectedSituacao) {
      this.set('selectedSituacao',selectedSituacao);
      // localStorage.setItem('selectedSituacao', selectedSituacao);
      this.send('animateCardList');
    },
    refreshSelectedAno(selectedAno) {
      this.set('Ano', selectedAno);
      this.set('selectedAno', selectedAno.get('name'));
      let aulasFiltradas = this.get('model.plataformaAnos').filterBy('name', selectedAno.get('name')).get('firstObject.aulas');
      this.set('aulasFiltradas', aulasFiltradas);
    },
    toggleRole(selectedRole) {
      this.set('toggleRole', selectedRole);
      localStorage.setItem('toggleRole', selectedRole);

      let selectedDependenteId;
      if (selectedRole == "responsavel"){
        let dependentes = this.get('model.dependentes');
        selectedDependenteId = dependentes.get('firstObject.id');
      } else if (selectedRole == 'aluno' || selectedRole == 'instrutor'){
        selectedDependenteId = this.get('model.id');
      }
      this.send('refreshSelectedDependente', selectedDependenteId);
    },

    atualizaAulas() {
      this.send('animateCardList');
      this.set('search', document.getElementById('aulapesquisa').value)
      let ordem = document.getElementById('order').value;
      let selectedDependente = this.get('selectedDependente');
      let aulasFiltradas;
      if (selectedDependente){
        this.set('leitor', selectedDependente);
        aulasFiltradas = selectedDependente.get('plataformaAnos.firstObject.aulas');
      } else{
        this.set('leitor', this.get('model'));
        aulasFiltradas = this.get('model.plataformaAnos').filterBy('name', this.get('selectedAno')).get('firstObject.aulas');
      }
      if(ordem == "0"){
        this.set('aulasFiltradas', aulasFiltradas);
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

    eraseText() {
     this.set('search', '');
     this.send('atualizaAulas');
    },
  },
  init: function () {
    this._super();
    this.set('selectedSituacao','');
    // localStorage.setItem('selectedSituacao','');
  },
});