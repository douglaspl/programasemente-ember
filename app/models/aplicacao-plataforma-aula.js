import DS from 'ember-data';

moment.updateLocale('en', {
  monthsShort : [
    "jan", "fev", "mar", "abr", "maio", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
  ]
});

export default DS.Model.extend({
  dataAplicacao: DS.attr(),
  aplicado: DS.attr('boolean'),
  dataAplicacaoFormat: Ember.computed('dataAplicacao', function() {
    let dataformatada = moment(this.get('dataAplicacao'), 'DD/MM/YYYY hh:mm:ss').format('DD MMM');
    return dataformatada;
  }),
  pessoa: DS.belongsTo('pessoa', { async: true }),
  turma: DS.belongsTo('plataforma-turma', { async: true }),
  aula: DS.belongsTo('aula', { async: true }),
});