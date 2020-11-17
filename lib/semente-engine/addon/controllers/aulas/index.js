import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model');
  }),
  selectedDependente: Ember.computed('model', function(){
    let id = this.get('model').get('dependentes').get('firstObject').get('id');
    return this.get('store').peekRecord('pessoa', id);
  }),
  dependentes: Ember.computed('model', function(){
    let dependentes = []
    let deps = this.get('model').get('dependentes').get('firstObject');
    deps.forEach(p => {
      dependentes.pushObject(p) // adiciona dependentes
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

    if(0) {
      console.log('ola');
    }
    

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
  actions: {
    goToAula(id) {
      this.transitionToRoute('aulas.content',id);
    },

    refreshSelectedDependente(selectedIdDependente) {
      var selectedDependente = this.get('store').peekRecord('pessoa', selectedIdDependente);
      this.set('selectedDependente', selectedDependente);
      this.set('busca', "")
    },
    refreshBusca() {
      this.set('busca',this.get('search'));
    },
    atualizaAulas() {
      debugger;
      let busca = this.get('search');
      let situation = document.getElementById('situation').value;
      let ordem = document.getElementById('order').value;
      let selectedDependente = this.get('selectedDependente');
      var aulas = [];
      var aulasFiltradas = []

      if(selectedDependente){
        aulas.pushObject(selectedDependente.get('plataformaAnos').get('firstObject').get('aulas'))
        //Filtra as aulas apenas para as aulas do dependente selecionado
         if(situation == 0){
            // Todos
            // let aulas = selectedDependente.get('plataformaAnos').get('firstObject').get('aulas')
         } else if (situation == 1){
            //Não Aplicada

         } else if (situation == 2){
            //Parcialmente Aplicada

         } else {
           //Aplicada

         }

         // For each aula.titulo checa se a string da pesquisa está contida na string do titulo
         // Retorna uma lista com as aulas
         // Utilizar mesma lógica do containStr.js
         aulas.forEach(a => {
          if(a.get(titulo).includes(busca)){
            //mantem o item na lista
            aulasFiltradas.pushObject(a);
          } else {
            //remove o item da lista
          }

         });


         
        

         // Checa se é ordem crescente. Caso for, retorna a lista.
         // Caso contrário, inverte a lista com o .reverse();

      } else {

        // Retorna uma lista com as aulas do primeirto dependente

      }
    }
  }
});