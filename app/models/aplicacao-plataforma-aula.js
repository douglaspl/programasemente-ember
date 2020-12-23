import DS from 'ember-data';

moment.updateLocale('en', {
  monthsShort : [
    "jan", "fev", "mar", "abr", "maio", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
  ]
});

export default DS.Model.extend({
  dataAplicacao: DS.attr(),
  aplicado: DS.attr(),
  dataAplicacaoFormat: Ember.computed('dataAplicacao', function() {

    let dia = moment(this.get('dataAplicacao'), 'DD/MM/YYYY hh:mm:ss').format('DD');
    let mes = moment(this.get('dataAplicacao'), 'DD/MM/YYYY hh:mm:ss').format('MMMM');

    let dataformatada = dia + ' de ' + mes;

    return dataformatada;
  }),
  dataAplicacaoFormatShort: Ember.computed('dataAplicacao', function() {
    let dia = moment(this.get('dataAplicacao'), 'DD/MM/YYYY hh:mm:ss').format('DD');
    let mes = moment(this.get('dataAplicacao'), 'DD/MM/YYYY hh:mm:ss').format('MMM');

    let dataformatada = dia + '/' + mes;

    return dataformatada;
  }),
  pessoa: DS.belongsTo('pessoa', { async: true }),
  turma: DS.belongsTo('plataforma-turma', { async: true }),
  aula: DS.belongsTo('aula', { async: true }),
});