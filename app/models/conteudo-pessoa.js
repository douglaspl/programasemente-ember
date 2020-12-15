import DS from 'ember-data';

export default DS.Model.extend({
    pessoa: DS.belongsTo('pessoa', { async: true }),
    plataformaConteudo: DS.belongsTo('plataforma-conteudo', { async: true }),
    createdAt: DS.attr(),
    lastUpdate: DS.attr(),
    completou: DS.attr(),
});