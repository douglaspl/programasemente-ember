import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    idx: DS.attr(),
    nome: DS.attr(),
    coverImage: DS.attr(), 
    ultimaObrigatoria: DS.attr(),
    comTransicao: DS.attr(),
    naoContaProgressoAtividade: DS.attr(),
    conteudos: DS.hasMany('conteudo', {async: true}),
    atividade: DS.belongsTo('atividade', {async: true}),
    // Campos da criação de módulo em Conteúdos > Agrupar
    tipo: DS.attr(), // 'arquivo' | 'texto' | 'video' | 'questoes'
    descricao: DS.attr(),
    videoId: DS.attr(),
    botoes: DS.attr(), // [{ titulo, link }] das seções de arquivo
    backgroundImage: Ember.computed('coverImage', function() {
        return new Ember.String.htmlSafe("background-image: url('" + this.get('coverImage') + "');");
    })
});