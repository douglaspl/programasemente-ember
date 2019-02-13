import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    nome: DS.attr(),
    coverImage: DS.attr(), 
    ultimaObrigatoria: DS.attr(),
    comTransicao: DS.attr(),
    naoContaProgressoAtividade: DS.attr(),
    conteudos: DS.hasMany('conteudo', {async: true}),
    atividade: DS.belongsTo('atividade', {async: true}),
    backgroundImage: Ember.computed('coverImage', function() {
        return new Ember.String.htmlSafe("background-image: url('" + this.get('coverImage') + "');");
    })
});