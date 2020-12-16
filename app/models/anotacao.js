import DS from 'ember-data';
import Ember from 'ember';


export default DS.Model.extend({
    texto: DS.attr(),
    date: DS.attr(),
    pessoa: DS.belongsTo('pessoa', {async: true}),
    aula: DS.belongsTo('aula', { async: true }),
    turmaPlataforma: DS.belongsTo('plataforma-turma', { async: true }),
});