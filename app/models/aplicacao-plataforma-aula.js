import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),
    dataAplicacao: DS.attr(),
    pessoa: DS.belongsTo('pessoa', { async: true }),
    turma: DS.belongsTo('plataforma-turma', { async: true }),
    aula: DS.belongsTo('aula', { async: true })
});