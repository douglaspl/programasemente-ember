import DS from 'ember-data';
import moment from 'moment';
import Ember from 'ember';

export default DS.Model.extend({
  name: DS.attr(),
  role: DS.attr(),
  email: DS.attr(),
  matricula : DS.attr(),
  genero: DS.attr(),
  nascimento: DS.attr(),
  dataNascimento:  Ember.computed('nascimento', function() {
    return moment(this.get('nascimento')).format('DD/MM/YYYY');
  }),
  ano: DS.attr(),
  password: DS.attr(),
  confirmpassword: DS.attr(),
  enabled: DS.attr(),
  ultimoacesso: DS.attr(),
  lastAccess: Ember.computed('ultimoacesso', function() {
    return moment(this.get('ultimoacesso'), 'X').format('DD/MM/YYYY');
  }),
  nracessos: DS.attr(),
  emailsent: DS.attr(),
  progressototal: DS.attr(),
  uriAvatar: DS.attr(),
  numeroCursos: DS.attr(),
  cursosConcluidos: DS.attr(),
  area: DS.belongsTo('area', {
    async: true
  }),
  turmas: DS.hasMany('turma', {async: true}),
  sistema: DS.belongsTo('sistema', {async: true}),
  modulos: DS.hasMany('modulo', {
    async: true
  }),
  matriculas: DS.hasMany('matricula', {
    async: true
  }),
  instituicao: DS.belongsTo('instituicao', {
    async: true
  }),
  alternativas: DS.hasMany('alternativa', {
    async: true
  }),
  respostas: DS.hasMany('resposta', {
    async: true
  }),
  estadoVideos: DS.hasMany('estado-video', {
    async: true
  }),
  estadoQuestoes: DS.hasMany('estado-questao', {
    async: true
  }),
  estadoVideosAlternativas: DS.hasMany('estado-video-alternativa', {
    async: true
  }),
  leituras: DS.hasMany('leitura', {
    async: true
  }),
  // matriculas: DS.hasMany('matricula', {async: true}),
  dataVisualizacaoBiblioteca: DS.attr(),
});
