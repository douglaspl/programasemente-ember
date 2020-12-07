import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),

  situacao: Ember.computed('model', function(){
    // let Aplicacoes = this.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('pessoa.instituicao.id'));
    let turmas = this.get('pessoa').get('plataformaTurmas').filterBy('plataformaAno.id', this.get('aula').get('plataformaAno.id'));
    // debugger;

    let numAplicacoes = 0;
    let aplicacoes = [];
    let aula = this.get('aula');
    //let aplicacoes = turmas.filterBy('aplicacoes.aplicado', true).filterBy('aplicacoes.aula', aula);
    turmas.forEach(t => {
      t.get('aplicacoes').forEach(a => {
        if (a.get('aplicado') && a.get('aula.id') == aula.get('id')){
          numAplicacoes++;
          aplicacoes.pushObject(a);
        }
      })
    });
    // debugger;
    this.set('UltimaAplicacao', aplicacoes.sortBy('dataAplicacao').reverse()[0]);
    if (aplicacoes.length == 0) return "Não aplicada"
    else if (aplicacoes.length == turmas.length) return "Aplicada"
    else if (aplicacoes.length < turmas.length) return "Parcialmente aplicada"
    
  }),
  actions: {
    transitToAula(id) {
      this.transit(id);
    }
  },
  init: function () {
    this._super();
    //this.get('value');
  }
});
