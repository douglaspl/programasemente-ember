import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    name: DS.attr(),
    descricao: DS.attr(),
    temas: DS.hasMany('tema', { async: true }),
});