import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    nome: DS.attr(),
    perfil: DS.attr(),
    url: DS.attr(),
    plataformaAno: DS.belongsTo('plataforma-ano', {async: true}),
});