import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),
    numAlunos: DS.attr(),
    pessoas: DS.hasMany('pessoa', { async: true }),
    aplicacoes: DS.hasMany('aplicacao-plataforma-aula', { async: true }),
    plataformaAno: DS.belongsTo('plataforma-ano', { async: true }),
    instituicao: DS.belongsTo('instituicao', { async: true }),
});