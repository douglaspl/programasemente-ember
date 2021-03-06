import DS from 'ember-data';

export default DS.Model.extend({
    timestamp: DS.attr(),
    alternativa: DS.belongsTo('alternativa', {async: true}),
    pessoa: DS.belongsTo('pessoa', {async: true})
});