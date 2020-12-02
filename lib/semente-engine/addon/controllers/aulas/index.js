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
    this.set('busca','');
    return this.get('model');
  }),
  selectedSegmento: Ember.computed('model', function(){
    return this.get('model').get('plataformaAnos').get('firstObject').get('segmento').get('titulo');
  }),
  selectedAno: Ember.computed('model', function(){
    return this.get('model').get('plataformaAnos').get('firstObject').get('name');
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
  // Inicializa a lista de aulas filtradas para os roles Responsável e Aluno
  // A lista pega os dados do primeiro dependente caso tenha mais que um
  aulasFiltradas: Ember.computed('model', function(){
    let aulasFiltradas = [];
    let aulas = [];
    let role = this.get('model').get('role');
    if(role == 'responsavel'){
      aulas.pushObject(this.get('model').get('dependentes').get('firstObject').get('plataformaAnos').get('firstObject').get('aulas'));
    }
    if(role == 'aluno'){
      aulas.pushObject(this.get('model').get('plataformaAnos').get('firstObject').get('aulas'));
    }
    aulas.forEach(a => {
      a.forEach(b =>{
            aulasFiltradas.pushObject(b);
      });
    });
    return aulasFiltradas;
  }),
  // Seleciona o primmeiro dependente caso tenha mais de um
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
  plataformaAno: Ember.computed('model', function(){
    let ano = this.get('model').get('plataformaAnos').get('firstObject');
    return ano;
  }),
  segmentos: Ember.computed('model', function(){
    var platAnos = this.get('model').get('instituicao').get('plataformaAnos');
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

  // Filtra a aulas quando o Instrutor Responsável troca a visualização de Instrutor -> Responsável
  aulasFiltradasF: function () {
    let aulasFiltradas = [];
    let aulas = [];
    let role = this.get('model').get('role');
    let id = "0"
    if(role == 'responsavel' || role == 'instrutor'){
      aulas.pushObject(this.get('model').get('dependentes').get('firstObject').get('plataformaAnos').get('firstObject').get('aulas'));
      id = this.get('model').get('dependentes').get('firstObject').get('id');
    }
    if(role == 'aluno'){
      aulas.pushObject(this.get('model').get('plataformaAnos').get('firstObject').get('aulas'));
      id = this.get('model').get('id');
    }
    aulas.forEach(a => {
      a.forEach(b =>{
            aulasFiltradas.pushObject(b);
      });
    });
    this.set('selectedDependente', this.get('store').peekRecord('pessoa', id));
    this.set('aulasFiltradas', aulasFiltradas);
  },


  actions: {
    goToAula(id) {
      this.transitionToRoute('aulas.content',id);
    },
    refreshSelectedDependente(selectedIdDependente) {
      var selectedDependente = this.get('store').peekRecord('pessoa', selectedIdDependente);
      this.set('selectedDependente', selectedDependente);
      this.set('busca', "");
      this.send('atualizaAulas');
    },
    refreshSelectedSegmento(selectedSegmento) {
      // debugger;
      this.set('selectedSegmento', selectedSegmento);
      let selectedAno = this.get('model').get('plataformaAnos');
      selectedAno.forEach(a => {
        if(a.get('segmento').get('titulo') == selectedSegmento){
          this.set('selectedAno', a.get('name'));
        }
      })
    },
    refreshSelectedAno(selectedAno) {
      this.set('selectedAno', selectedAno);
    },
    refreshBusca() {
      this.set('busca',this.get('search'));
    },
    toggleRole(selectedRole) {
      // debugger;
      this.set('toggleRole',selectedRole);
      this.aulasFiltradasF();
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
      let header = localStorage.getItem('person_logged');
      let pessoa = JSON.parse(header);
      this.transitionToRoute('plataformabiblioteca.index');
    },
    // Filtra aulas que serão mostradas nas telas para Responável e Aluno apenas.
    // Três filtros são aplicados: Pesquisa - Situação - Ordem
    atualizaAulas() {
      let busca = this.get('search');
      let situation = document.getElementById('situation').value;
      let ordem = document.getElementById('order').value;
      let selectedDependente = this.get('selectedDependente');
      let role = this.get('model').get('role');
      var aulas = [];
      var aulasFiltradas = [];

      if(selectedDependente){
        aulas.pushObject(selectedDependente.get('plataformaAnos').get('firstObject').get('aulas'));
        //Filtra as aulas apenas para as aulas do dependente selecionado
         if(situation == 0){
            // Todos
         } else if (situation == 1){
            //Não Aplicada
         } else if (situation == 2){
            //Parcialmente Aplicada
         } else {
           //Aplicada
         }
          aulas.forEach(a => {
            a.forEach(b =>{
                  aulasFiltradas.pushObject(b);
            });
          });

        if(ordem == "0"){
        this.set('aulasFiltradas', aulasFiltradas);
        } else {
        this.set('aulasFiltradas', aulasFiltradas.reverse());
        }
      }
    }
  }
});