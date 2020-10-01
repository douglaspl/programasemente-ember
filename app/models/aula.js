import DS from 'ember-data';

export default DS.Model.extend({
    titulo: DS.attr(),
    descricao: DS.attr(),
    idx: DS.attr(),
    dataInicioPrevista: DS.attr(),
    dataFimPrevista: DS.attr(),
    plataformaConteudos: DS.hasMany('plataforma-conteudo', { async: true }),
    plataformaAno: DS.belongsTo('plataforma-ano', { async: true }),
    unidade: DS.belongsTo('unidade', { async: true }),
});