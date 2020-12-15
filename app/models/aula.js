import DS from 'ember-data';

moment.updateLocale('en', {
    monthsShort : [
        "jan", "fev", "mar", "abr", "maio", "jun",
        "jul", "ago", "set", "out", "nov", "dez"
    ]
});

export default DS.Model.extend({
    titulo: DS.attr(),
    descricao: DS.attr(),
    idx: DS.attr(),
    dataInicioPrevista: DS.attr(),
    dataInicioPrevistaFormat: Ember.computed('dataInicioPrevista', function() {
        let dataformatada = moment(this.get('dataInicioPrevista'), 'DD/MM/YYYY hh:mm:ss').format('DD MMM');
        return dataformatada;
    }),
    dataFimPrevista: DS.attr(),
    dataFimPrevistaFormat: Ember.computed('dataFimPrevista', function() {
        let dataformatada = moment(this.get('dataFimPrevista'), 'DD/MM/YYYY hh:mm:ss').format('DD MMM');
        return dataformatada;
    }),
    thumbnail: DS.attr(),
    plataformaConteudos: DS.hasMany('plataforma-conteudo', { async: true }),
    plataformaAno: DS.belongsTo('plataforma-ano', { async: true }),
    aplicacoes: DS.hasMany('aplicacao-plataforma-aula', { async: true }),
    unidade: DS.belongsTo('unidade', { async: true }),
    competencias: DS.hasMany('comp', { async: true }),
    atividade: DS.belongsTo('atividade', { async: true }),
    tarefas: DS.hasMany('tarefa', { async: true }),
});