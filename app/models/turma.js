import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),

    modulo: DS.belongsTo('modulo', {async: true}),
    instituicao: DS.belongsTo('instituicao', {async: true}),
    pessoas: DS.hasMany('pessoa', {async: true}),
    acompanhamentosatividades: DS.hasMany('acompanhamento-atividade-turma',{async: true}),
});