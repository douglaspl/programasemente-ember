import DS from 'ember-data';
import Ember from 'ember';


export default DS.Model.extend({
    nota: DS.attr(),
    dataavaliacao: DS.attr(),
    pessoa: DS.belongsTo('pessoa', {async: true}),
    aula: DS.belongsTo('aula', { async: true }),
});