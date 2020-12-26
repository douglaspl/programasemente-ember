import DS from 'ember-data';

export default DS.Model.extend({
    arquivo: DS.attr(),
    name: DS.attr(),
    url: DS.attr(),
    tipo: DS.attr(),
    marketing: DS.belongsTo('marketing', { async: true }),
});