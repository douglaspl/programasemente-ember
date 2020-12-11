import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    description: DS.attr(),
    label: DS.attr(),
    valor: DS.attr(),
    respostasComp: DS.hasMany('resposta-comp', {async: true}),
    questao: DS.belongsTo('questao', {async: true}),
    questoesComp: DS.hasMany('questao-comp', {async: true})
});