import DS from 'ember-data';

export default DS.Model.extend({
    iniciou: DS.attr(),
    ultimoInstante: DS.attr(),
    tempoAssistido: DS.attr(),
    completou: DS.attr(),
    timestamp: DS.attr(),
    video: DS.belongsTo('video', {async: true}),
    pessoa: DS.belongsTo('pessoa', {async: true})
});