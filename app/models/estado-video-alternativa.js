import DS from 'ember-data';

export default DS.Model.extend({
    iniciou: DS.attr(),
    ultimoInstante: DS.attr(),
    tempoAssistido: DS.attr(),
    completou: DS.attr(),
    timestamp: DS.attr(),
    tempoquestao: DS.attr(),
    visualizacoes: DS.attr(),
    alternativa: DS.belongsTo('alternativa', {async: true}),
    pessoa: DS.belongsTo('pessoa', {async: true})
});