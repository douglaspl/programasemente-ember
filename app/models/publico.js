import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),
    descricao: DS.attr(),
    conteudo: DS.hasMany('plataforma-conteudo', { async: true }),
});