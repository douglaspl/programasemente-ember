import DS from 'ember-data';

export default DS.Model.extend({
    codigo: DS.attr(),
    typeCadastro: DS.attr(),
    pessoa: DS.belongsTo('pessoa', {async: true}),
    instituicao: DS.belongsTo('instituicao', {async: true}),
});