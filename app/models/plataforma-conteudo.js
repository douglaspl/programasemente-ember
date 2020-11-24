import DS from 'ember-data';

export default DS.Model.extend({
    titulo: DS.attr(),
    descricao: DS.attr(),
    idx: DS.attr(),
    tipo: DS.attr(),
    videoUrl: DS.attr(),
    path: DS.attr(),
    coverImage: DS.attr(),
    aulas: DS.hasMany('aula', { async: true }),
    agrupamento: DS.belongsTo('agrupamento', { async: true }),
    tema: DS.belongsTo('tema', { async: true }),
    publicos: DS.hasMany('publico', { async: true }),
    situacao: DS.attr('boolean'),
    dataCriacao: DS.attr("date"),
});