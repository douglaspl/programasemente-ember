import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    name: DS.attr(),
    descricao: DS.attr(),
    conteudos: DS.hasMany('plataforma-conteudo', { async: true }),
    temas: DS.hasMany('tema', { async: true }),
});