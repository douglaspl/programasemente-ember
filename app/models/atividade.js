import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    name: DS.attr(),
    idx: DS.attr(),
    description: DS.attr(),
    timesection: DS.attr(),
    dia: DS.attr(),
    abertura: DS.attr(),
    atividade: DS.attr(),
    video: DS.attr(),
    quiz: DS.attr(),
    quizdata: DS.attr(),
    teoria: DS.attr(),
    coverImage: DS.attr(), 
    instrutor: DS.hasMany('pessoa', {async: true}),
    secoes: DS.hasMany('secao', {async: true}),
    modulo: DS.belongsTo('modulo', {async: true}),
    acompanhamentosAtividadeInstituicao: DS.hasMany('acompanhamento-atividade-instituicao',{async: true}),
    backgroundImage: Ember.computed('coverImage', function() {
        return new Ember.String.htmlSafe("background-image: url('" + this.get('coverImage') + "');");
    }),
});