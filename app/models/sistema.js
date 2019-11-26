import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),
    idx: DS.attr(),

    instituicao: DS.hasMany('instituicao', {async: true}),
    pessoas: DS.hasMany('pessoa', {async: true})
});