import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  tagName: 'li',

  aplicacao: Ember.computed('aula', function(){
    let aplicacoes = this.get('aula.aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('pessoa.instituicao.id'));
    let ultimaAplicacao = aplicacoes.sortBy('dataAplicacaoFormat').reverse()[0];
    return ultimaAplicacao;
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
