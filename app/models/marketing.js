import DS from 'ember-data';

export default DS.Model.extend({
    titulo: DS.attr(),
    descricao: DS.attr(),
    capa: DS.attr(),
    capaName: DS.attr(),
    area: DS.belongsTo('area-marketing', { async: true }),
    arquivos: DS.hasMany('arquivo', { async: true }),
    dataAtualizacao: DS.attr("date"),
    dataAtualizacaoFormat: Ember.computed('dataAtualizacao', function() {
        let dataformatada = moment(this.get('dataAtualizacao'), 'DD/MM/YYYY hh:mm:ss').format('DD/MM/YYYY');
        return dataformatada;
    }),
});