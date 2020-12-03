import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  tagName: '',

  situacao: Ember.computed('aula', function(){
    let TurmasTodas = this.get('pessoa').get('plataformaTurmas').filterBy('plataformaAno.id', this.get('aula').get('plataformaAno.id'));
    let Aplicacoes = this.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('pessoa.instituicao.id'));
    let ultimaAplicacao = Aplicacoes.sortBy('dataAplicacao').reverse()[0];
    this.set('UltimaAplicacao', ultimaAplicacao)
    let TurmasAplicadas = Aplicacoes.mapBy('turma');
    if (TurmasAplicadas.length == 0) return "Não aplicada"
    else if (TurmasAplicadas.length == TurmasTodas.length) return "Aplicada"
    else if (TurmasAplicadas.length < TurmasTodas.length) return "Parcialmente aplicada"
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
