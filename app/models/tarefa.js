import DS from 'ember-data';
import Ember from 'ember';


export default DS.Model.extend({
    realizado: DS.attr(),
    dataCriacao: DS.attr(),
    dataRealizado: DS.attr(),
    pessoa: DS.belongsTo('pessoa', {async: true}),
    aula: DS.belongsTo('aula', { async: true }),
});