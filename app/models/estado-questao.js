import DS from 'ember-data';

export default DS.Model.extend({
    tempoQuestao: DS.attr(),
    questao: DS.belongsTo('questao', {async: true}),
    pessoa: DS.belongsTo('pessoa', {async: true})
});