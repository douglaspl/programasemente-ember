import DS from 'ember-data';

export default DS.Model.extend({
    questoes: DS.hasMany('questao', {async: true}),
});