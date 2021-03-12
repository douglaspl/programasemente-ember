import DS from 'ember-data';
import moment from 'moment';
import Ember from 'ember';
import { memberAction } from 'ember-api-actions';

export default DS.Model.extend({
  name: DS.attr(),
  role: DS.attr(),
  email: DS.attr(),
  userName: DS.attr(),
  emailCadastrado: DS.attr(),
  matricula : DS.attr(),
  genero: DS.attr(),
  nascimento: DS.attr(),
  nascimentoPlataforma: DS.attr(),
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
  nrVideosPreparacao: DS.attr(),
  nrVideosAlunos: DS.attr(),
  nrAplicacaoPlataformaAulas: DS.attr(),
  emailsent: DS.attr(),
  progressototal: DS.attr(),
  uriAvatar: DS.attr(),
  numeroCursos: DS.attr(),
  cursosConcluidos: DS.attr(),
  shouldReviewProfile: DS.attr(),
  isAplicador: DS.attr(),
  isAlsoResponsible: DS.attr(),
  telefone: DS.attr(),
  loggedWithDependenteUsername: DS.attr(),
  acessoS: DS.attr(),
  acessoMedio: DS.attr(),
  acessoFp: DS.attr(),
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
  conteudoPessoas: DS.hasMany('conteudo-pessoa', {
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
  aplicacaoPlataformaAulas: DS.hasMany('aplicacao-plataforma-aula', {
    async: true
  }),
  plataformaAnos: DS.hasMany('plataforma-ano', {
    async: true
  }),
  plataformaTurmas: DS.hasMany('plataforma-turma', {
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
  progressoAtividades: DS.hasMany('acompanhamento-atividade', {
    async: true
  }),
  responsaveis: DS.hasMany('pessoa', {
    async: true,inverse: null
  }),
  dependentes: DS.hasMany('pessoa', {
    async: true, inverse: null
  }),
  // matriculas: DS.hasMany('matricula', {async: true}),
  dataVisualizacaoBiblioteca: DS.attr(),
  tarefas: DS.hasMany('tarefa', { async:true }),
  avaliacoes: DS.hasMany('avaliacao', { async:true }),
  anotacoes: DS.hasMany('anotacao', { async: true }),
  // codigoCadastro: DS.belongsTo('codigo-cadastro', { async: true }),
  codigoCadastro: DS.attr(),
  maxDependentes: DS.attr(),

  verifyEmail: memberAction({ path: 'verifyEmail', type: 'get' }),
  autoRegister: memberAction({ path: 'autoRegisterPlataforma', type: 'post' }),
});
