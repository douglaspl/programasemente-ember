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
  // Seleciona o primeiro dependente caso tenha mais de um
  selectedDependente: Ember.computed('model', function(){
    let role = this.get('model').get('role');
    let id = "0";
    if(role == 'responsavel') {
      id = this.get('model').get('dependentes').get('firstObject').get('id');
    }
    if(role == 'aluno') {
      id = this.get('model').get('id');
    }
    return this.get('store').peekRecord('pessoa', id);
  }),
  selectedSegmento: Ember.computed('model', function(){
    if (this.get('selectedDependente')){
      return this.get('selectedDependente').get('plataformaAnos').get('firstObject').get('segmento').get('titulo');
    } else{
      return this.get('model').get('plataformaAnos').get('firstObject').get('segmento').get('titulo');
    }
  }),
  selectedAno: Ember.computed('model', function(){
    if (this.get('selectedDependente')){
      return this.get('selectedDependente').get('plataformaAnos').filterBy('segmento.titulo', this.get('selectedSegmento')).get('firstObject').get('name');
    } else{
      return this.get('model').get('plataformaAnos').filterBy('segmento.titulo', this.get('selectedSegmento')).get('firstObject').get('name');
    }
  }),
  Ano: Ember.computed('model', function(){
    return this.get('model').get('plataformaAnos').get('firstObject')
  }),
  // Checa o Role da pessoa e direciona para a visualização de Instrutor ou Reponsável
  toggleRole: Ember.computed('model', function(){
    if (localStorage.getItem('toggleRole')){
      return localStorage.getItem('toggleRole')
    }
    let role = this.get('model').get('role');
    localStorage.setItem('toggleRole', role);
    if (role == 'coordenador' || role == 'gestor' || role == 'diretor' || role == 'admin'){
      return 'instrutor';
    }
    return role;
  }),
  
  dependentes: Ember.computed('model', function(){
    let dependentes = [];
    let deps = this.get('model').get('dependentes').get('firstObject');
    deps.forEach(p => {
      dependentes.pushObject(p)
    });
    return dependentes;
  }),
  segmentos: Ember.computed('model', function(){
    var segmentos = this.get('model').get('plataformaAnos').mapBy('segmento.titulo'); 
    let segmentosFilter = segmentos.filter((value, index) => segmentos.indexOf(value) === index);
    return segmentosFilter;
  }),
  faltaAlguem: Ember.computed('model', function(){
    let dependentes = this.get('pessoa.dependentes');
    if (dependentes){
      let anosIdx = [];
      dependentes.forEach(dep => { anosIdx.push(dep.get('plataformaAnos').get('firstObject').get('idx')) });
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
      aulasFiltradas = selectedDependente.get('plataformaAnos').get('firstObject').get('aulas');
    } else{
      this.set('leitor', this.get('model'));
      aulasFiltradas = this.get('model').get('plataformaAnos').filterBy('name', this.get('selectedAno')).get('firstObject').get('aulas');
    }
    return aulasFiltradas
  }),

  selectedSituacao: '',
  search: '',
  actions: {
    goToAula(id) {
      this.transitionToRoute('aulas.content',id);
    },
    refreshSelectedDependente(selectedIdDependente) {
      this.send('animateCardList');
      var selectedDependente = this.get('store').peekRecord('pessoa', selectedIdDependente);
      this.set('leitor', selectedDependente);
      this.set('selectedDependente', selectedDependente);
      let selectedSegmento = selectedDependente.get('plataformaAnos').get('firstObject').get('segmento.titulo');
      this.set('selectedSegmento', selectedSegmento);
      this.set('Ano', selectedDependente.get('plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject'));
      let selectedAno = selectedDependente.get('plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject').get('name');
      this.set('selectedAno', selectedAno);
      this.set('search', "");
      this.send('atualizaAulas');
    },
    refreshSelectedSegmento(selectedSegmento) {
      this.set('selectedSegmento', selectedSegmento);
      this.set('Ano', this.get('model').get('plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject'));
      let selectedAno = this.get('model').get('plataformaAnos').filterBy('segmento.titulo', selectedSegmento).get('firstObject').get('name');
      this.set('selectedAno', selectedAno);
      let aulasFiltradas = this.get('model').get('plataformaAnos').filterBy('name', selectedAno).get('firstObject').get('aulas');
      this.set('aulasFiltradas', aulasFiltradas);
    },
    refreshSelectedSituacao(selectedSituacao) {
      this.send('animateCardList');
      this.set('selectedSituacao', selectedSituacao);
    },
    refreshSelectedAno(selectedAno) {
      this.set('Ano', selectedAno);
      this.set('selectedAno', selectedAno.get('name'));
      let aulasFiltradas = this.get('model').get('plataformaAnos').filterBy('name', selectedAno.get('name')).get('firstObject').get('aulas');
      this.set('aulasFiltradas', aulasFiltradas);
    },
    toggleRole(selectedRole) {
      this.set('toggleRole', selectedRole);
      localStorage.setItem('toggleRole', selectedRole);
      
      let selectedDependenteId;
      if (selectedRole == "responsavel"){
        let dependentes = this.get('model').get('dependentes');
        selectedDependenteId = dependentes.get('firstObject').get('id');
      } else if (selectedRole == 'aluno' || selectedRole == 'instrutor'){
        selectedDependenteId = this.get('model').get('id');
      }
      this.send('refreshSelectedDependente', selectedDependenteId);
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

    atualizaAulas() {
      this.send('animateCardList');
      this.set('search', document.getElementById('aulapesquisa').value)
      let ordem = document.getElementById('order').value;
      let selectedDependente = this.get('selectedDependente');
      let aulasFiltradas;
      if (selectedDependente){
        this.set('leitor', selectedDependente);
        aulasFiltradas = selectedDependente.get('plataformaAnos').get('firstObject').get('aulas');
      } else{
        this.set('leitor', this.get('model'));
        aulasFiltradas = this.get('model').get('plataformaAnos').filterBy('name', this.get('selectedAno')).get('firstObject').get('aulas');
      }

      if(ordem == "0"){
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

    eraseText() {
     let btnTarget = document.getElementById("aulapesquisa");
     btnTarget.value = '';
     this.send('atualizaAulas');
    },

    

   }
});