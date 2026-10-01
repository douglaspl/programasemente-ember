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
    sistema: DS.belongsTo('sistema', {async: true}),
    acompanhamentosCursoInstituicao: DS.hasMany('acompanhamento-curso-instituicao',{async: true}),
    // Campos da criação de módulo em Conteúdos > Agrupar
    codigo: DS.attr(),
    inicio: DS.attr(), // 'YYYY-MM-DD'
    fim: DS.attr(), // 'YYYY-MM-DD'
    perfis: DS.attr(), // roles: 'aluno' | 'instrutor' | 'coordenador'
    competencias: DS.attr(), // [{ competencia: id, nome, peso (1 a 3) }]
    // inverse: null para não virar o inverso de instituicao.modulos
    instituicoes: DS.hasMany('instituicao', {async: true, inverse: null}),
    plataformaAnos: DS.hasMany('plataforma-ano', {async: true, inverse: null}),
    backgroundImage: Ember.computed('coverImage', function() {
        return new Ember.String.htmlSafe("background-image: url('" + this.get('coverImage') + "');");
    }),
});