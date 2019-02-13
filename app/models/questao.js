import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    tipo: DS.attr(),
    texto: DS.attr(),
    quiz: DS.belongsTo('quiz', {async: true}),
    alternativas: DS.hasMany('alternativa', {async: true}),
});