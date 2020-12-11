import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    name: DS.attr(),
    dominio: DS.belongsTo('dominio', { async: true }),
    quizesComp: DS.hasMany('quiz-comp', { async: true }),
    aulas: DS.hasMany('aula', { async: true }),
    //normativas: DS.hasMany('normativa', { async: true }),
});