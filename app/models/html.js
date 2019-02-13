import DS from 'ember-data';

export default DS.Model.extend({
    texto: DS.attr(),
    leituras: DS.hasMany('leitura', {async: true})
});