import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  aulaThumb: Ember.computed('aula', function(){
    return this.get('aula.thumbnail');
  }),
  situacao: Ember.computed('', function(){
    let aplicacoes = [];
    let aula = this.get('aula');
    let turmas = this.get('pessoa.plataformaTurmas').filterBy('plataformaAno.id', aula.get('plataformaAno.id'));
    this.get('pessoa.plataformaTurmas').forEach(t => { t.get('aplicacoes').forEach(ap => { 
      if ((ap.get('aula.id') == aula.get('id')) && ap.get('aplicado')){
        aplicacoes.pushObject(ap)
      } }) });
    this.set('UltimaAplicacao', aplicacoes.sortBy('dataAplicacao').reverse()[0]);
    if (aplicacoes.length == 0) return "Não aplicada"
    else if (aplicacoes.length == turmas.length) return "Aplicada"
    else if (aplicacoes.length < turmas.length) return "Parcialmente aplicada"
  }).property('selectedSituacao'),

  actions: {
    transitToAula(id) {
      this.transit(id);
    }
  },
  init: function () {
    this._super();
  },
});
