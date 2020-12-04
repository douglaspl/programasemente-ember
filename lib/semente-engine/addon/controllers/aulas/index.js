import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  showHeader: Ember.run.schedule('afterRender', function () {
    $('body').removeClass('no-header');
  }),
  thisRoute: Ember.run('render', function(){
    if(window.location.pathname.includes('aulas')) {
      return 'aulas';
    }
  }),
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    this.set('leitor', this.get('model'));
    return this.get('model');
  }),
  selectedSegmento: Ember.computed('model', function(){
    return this.get('model').get('plataformaAnos').get('firstObject').get('segmento').get('titulo');
  }),
  selectedAno: Ember.computed('model', function(){
    return this.get('model').get('plataformaAnos').get('firstObject').get('name');
  }),
  Ano: Ember.computed('model', function(){
    return this.get('model').get('plataformaAnos').get('firstObject')
  }),
  // Checa o Role da pessoa e direciona para a visualização de Instrutor ou Reponsável
  toggleRole: Ember.computed('model', function(){
    let role = this.get('model').get('role');
    if(role == 'responsavel'){
      return 'responsavel';
    }
    if(role == 'instrutor' || role == 'coordenador' || role == 'gestor' || role == 'diretor' || role == 'admin'){
      return 'instrutor';
    }
  }),
  // Seleciona o primeiro dependente caso tenha mais de um
  selectedDependente: Ember.computed('model', function(){
    let role = this.get('model').get('role');
    let id = "0"
    if(role == 'responsavel') {
      id = this.get('model').get('dependentes').get('firstObject').get('id');
    }
    if(role == 'aluno') {
      id = this.get('model').get('id');
    }
    return this.get('store').peekRecord('pessoa', id);
  }),
  dependentes: Ember.computed('model', function(){
    let dependentes = []
    let deps = this.get('model').get('dependentes').get('firstObject');
    deps.forEach(p => {
      dependentes.pushObject(p)
    });
    return dependentes;
  }),
  segmentos: Ember.computed('model', function(){
    var platAnos = this.get('model').get('plataformaAnos');
    var segmentoslist = [];
    platAnos.forEach(pa => {
      if (!segmentoslist.some(seg => seg.get('id') === pa.get('segmento').get('id'))){
        segmentoslist.push(pa.get('segmento'))
      }
    });
    return segmentoslist;
  }),
  aulaDestaque: Ember.computed('model', function(){
    var aulas = this.get('model').get('plataformaAnos').get('firstObject').get('aulas');
    var turmas = this.get('model').get('plataformaTurmas');
    var aplicacoesAulas = [];
    turmas.forEach(function(t){
      aulas.forEach(function(a) {
        t.get('aplicacoes').forEach(function(aa){
          if (aa.get('aula').get('id') == a.get('id')) {
            aplicacoesAulas.push(aa);
          }
        })
      })
    })
    let aulaDestaque = aulas.get('firstObject');
    var dataMax = 0;
    aulas.forEach(function(a) {
      if (a.get('dataInicioPrevista')) {
        if (dataMax < a.get('dataInicioPrevista')){
          aulaDestaque = a;
          dataMax = a.get('dataInicioPrevista');
        }
      }
    })
    dataMax = 0;
    aulas.forEach(function(a){
      aplicacoesAulas.forEach(function(aa){
        if (a.get('id') == aa.get('aula').get('id')){
          if (aa.get('dataAplicacao') > dataMax){
            aulaDestaque = a;
            dataMax = aa.get('dataAplicacao');
          }
        }
      })
    })
    return aulaDestaque;
  }),
  aulasFiltradas: Ember.computed('model', function(){
    this.set('search', document.getElementById('aulapesquisa').value)
    let selectedDependente = this.get('selectedDependente');
    let aulasFiltradas;
    debugger;
    if (selectedDependente){
      this.set('leitor', selectedDependente);
      aulasFiltradas = selectedDependente.get('plataformaAnos').get('firstObject').get('aulas');
    } else{
      this.set('leitor', this.get('model'));
      aulasFiltradas = this.get('model').get('plataformaAnos').filterBy('name', this.get('selectedAno')).get('firstObject').get('aulas');
    }
    return aulasFiltradas
  }),
  // Filtra a aulas quando o Instrutor Responsável troca a visualização de Instrutor -> Responsável
  // aulasFiltradasF: function () {
  //   let aulasFiltradas = [];
  //   let aulas = [];
  //   let role = this.get('model').get('role');
  //   let id = "0"
  //   if(role == 'responsavel' || role == 'instrutor'){
  //     debugger;
  //     aulas.pushObject(this.get('model').get('dependentes').get('firstObject').get('plataformaAnos').get('firstObject').get('aulas'));
  //     id = this.get('model').get('dependentes').get('firstObject').get('id');
  //   }
  //   if(role == 'aluno'){
  //     aulas.pushObject(this.get('model').get('plataformaAnos').get('firstObject').get('aulas'));
  //     id = this.get('model').get('id');
  //   }
  //   aulas.forEach(a => {
  //     a.forEach(b =>{
  //           aulasFiltradas.pushObject(b);
  //     });
  //   });
  //   this.set('selectedDependente', this.get('store').peekRecord('pessoa', id));
  //   this.set('aulasFiltradas', aulasFiltradas);
  // },

  selectedSituacao: '',
  search: '',
  actions: {
    goToAula(id) {
      this.transitionToRoute('aulas.content',id);
    },
    refreshSelectedDependente(selectedIdDependente) {
      debugger;
      var selectedDependente = this.get('store').peekRecord('pessoa', selectedIdDependente);
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
      this.set('selectedSituacao', selectedSituacao);
    },
    refreshSelectedAno(selectedAno) {
      debugger;
      this.set('Ano', selectedAno);
      this.set('selectedAno', selectedAno.get('name'));
      let aulasFiltradas = this.get('model').get('plataformaAnos').filterBy('name', selectedAno.get('name')).get('firstObject').get('aulas');
      this.set('aulasFiltradas', aulasFiltradas);
    },
    toggleRole(selectedRole) {
      this.set('toggleRole', selectedRole);
      let selectedDependenteId;
      let dependentes = this.get('model').get('dependentes');
      debugger;

      if (selectedRole == "responsavel"){
        selectedDependenteId = dependentes.get('firstObject').get('id');
      } else if (selectedRole == 'aluno' || selectedRole == 'instrutor'){
        selectedDependenteId = this.get('model').get('id');
      }
      this.send('refreshSelectedDependente', selectedDependenteId);
        //this.aulasFiltradasF();
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
      this.set('search', document.getElementById('aulapesquisa').value)
      let ordem = document.getElementById('order').value;
      let selectedDependente = this.get('selectedDependente');
      let aulasFiltradas;
      debugger;
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
    }
  }
});