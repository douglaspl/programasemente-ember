import DS from 'ember-data';

export default DS.Model.extend({
  dataAplicacao: DS.attr(),
  aplicado: DS.attr('boolean'),
  dataAplicacaoFormat: Ember.computed('dataAplicacao', function() {
    return moment(this.get('dataAplicacao'), 'X').format('DD/MM/YYYY');
  }),
  pessoa: DS.belongsTo('pessoa', { async: true }),
  turma: DS.belongsTo('plataforma-turma', { async: true }),
  aula: DS.belongsTo('aula', { async: true }),
});