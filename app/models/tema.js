import DS from 'ember-data';
import Ember from 'ember';


export default DS.Model.extend({
    idx: DS.attr(),
    name: DS.attr(),
    agrupamento: DS.belongsTo('agrupamento', {async: true}),
});