import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    correta: DS.attr(),
    texto: DS.attr(),
    videoId: DS.attr(),
    respostas: DS.hasMany('resposta', {async: true}),
    questao: DS.belongsTo('questao', {async: true}),
    estadosVideoAlternativa: DS.hasMany('estadoVideoAlternativa', {async: true})
});