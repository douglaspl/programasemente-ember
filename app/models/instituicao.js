import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr(),
    enabled: DS.attr(),
    timestamps: DS.attr(),
    acessos: DS.attr(),
    ativcompletas: DS.attr(),
    nrgestores: DS.attr(),
    nralunos: DS.attr(),
    trocasenhaobrigatoria: DS.attr(),
    temBiblioteca: DS.attr(),
    nrinstrutores: DS.attr(),
    nrcoordenadores: DS.attr(),
    areas: DS.hasMany('area', {async: true}),
    turmas: DS.hasMany('turma', {async: true}),
    pessoas: DS.hasMany('pessoa', {async: true}),
    modulos: DS.hasMany('modulo', {async: true}),
    acompanhamentosatividades: DS.hasMany('acompanhamento-atividade-instituicao',{async: true}),
    acompanhamentosCursoInstituicao: DS.hasMany('acompanhamento-curso-instituicao',{async: true}),
});