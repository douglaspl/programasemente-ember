import DS from 'ember-data';

export default DS.Model.extend({
    titulo: DS.attr(),
    descricao: DS.attr(),
    idx: DS.attr(),
    tipo: DS.attr(),
    videoUrl: DS.attr(),
    path: DS.attr(),
    coverImage: DS.attr(),
    aula: DS.belongsTo('aula', { async: true }),
    situacao: DS.attr(),
});