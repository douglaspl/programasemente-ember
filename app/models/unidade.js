import DS from 'ember-data';

export default DS.Model.extend({
    titulo: DS.attr(),
    descricao: DS.attr(),
    plataformaAno: DS.belongsTo('plataforma-ano', { async: true }),
    aulas: DS.hasMany('aulas', { async: true }),
});