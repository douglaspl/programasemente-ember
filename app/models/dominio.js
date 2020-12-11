import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    name: DS.attr(),
    competencias: DS.hasMany('comp', { async: true }),
});