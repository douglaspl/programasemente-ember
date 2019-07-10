import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    name: DS.attr(),
    description: DS.attr(),
    completion: DS.attr(),
    habilitado: DS.attr(),
    coverImage: DS.attr(), 
    dataInscricao: DS.attr(),
    idx: DS.attr(),
    autor: DS.attr(),
    videoId: DS.attr(),
    duracao: DS.attr(),
    atividades: DS.hasMany('atividade', {async: true}),
    turmas: DS.hasMany('turma', {async: true}),
    pessoas: DS.hasMany('pessoa', {async: true}),
    acompanhamentosCursoInstituicao: DS.hasMany('acompanhamento-curso-instituicao',{async: true}),
    backgroundImage: Ember.computed('coverImage', function() {
        return new Ember.String.htmlSafe("background-image: url('" + this.get('coverImage') + "');");
    }),
});