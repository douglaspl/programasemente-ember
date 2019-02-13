import DS from 'ember-data';

export default DS.Model.extend({
    scroll: DS.attr(),
    timestamp: DS.attr(),
    html: DS.belongsTo('html', {async: true}),
    pessoa: DS.belongsTo('pessoa', {async: true})
});