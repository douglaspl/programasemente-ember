import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    enunciado: DS.attr(),
    informativo: DS.attr(),
    quizComp: DS.belongsTo('quiz-comp', { async: true }),
    //escala: DS.belongsTo('escala', { async: true }),
    alternativasComp: DS.hasMany('alternativa-comp', { async: true }),
});