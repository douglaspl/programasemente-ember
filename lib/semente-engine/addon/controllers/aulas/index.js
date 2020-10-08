import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model');
  }),
  plataformaAno: Ember.computed('model', function(){
    let ano = this.get('model').get('plataformaAnos').get('firstObject');
    return ano;
  }),
  segmento: Ember.computed('model', function(){
    return this.get('model').get('plataformaAnos').get('firstObject').get('segmento');
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
    }
  }

});
