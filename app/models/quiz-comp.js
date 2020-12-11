import DS from 'ember-data';

export default DS.Model.extend({
    conteudo: DS.belongsTo('conteudo', { async: true }),
    competencia: DS.belongsTo('comp', { async: true }),
    questoesComp: DS.hasMany('questao-comp', { async: true }),
});