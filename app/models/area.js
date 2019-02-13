import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),
    instituicao: DS.belongsTo('instituicao', {async: true}),
    pessoas: DS.hasMany('pessoa', {async: true})
});