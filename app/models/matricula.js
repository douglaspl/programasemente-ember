import DS from 'ember-data';
import Ember from 'ember';
import moment from 'moment';

export default DS.Model.extend({
  pessoa: DS.belongsTo('pessoa', {
    async: true
  }),
  modulo: DS.belongsTo('modulo', {
    async: true
  }),
  dataInscricao: DS.attr(),
  matriculado: DS.attr(),
  progresso: DS.attr(),
  formattedProgress: Ember.computed('progresso', function () {
    return Math.round(this.get('progresso'));
  }),
  stateProgress: Ember.computed('formattedProgress', function () {
    let sp = Math.round(this.get('formattedProgress'));

    if (sp == 0) return 0;
    else if (sp == 100) return 1;
    else return 2; 
  }),
  moduloId: DS.attr(),
});
