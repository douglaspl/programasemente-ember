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
    uf: DS.attr(),
    cidade: DS.attr(),
    areas: DS.hasMany('area', {async: true}),
    turmas: DS.hasMany('turma', {async: true}),
    pessoas: DS.hasMany('pessoa', {async: true}),
    modulos: DS.hasMany('modulo', {async: true}),
    sistemas: DS.hasMany('sistema', {async: true}),
    acompanhamentosatividades: DS.hasMany('acompanhamento-atividade-instituicao',{async: true}),
    acompanhamentosCursoInstituicao: DS.hasMany('acompanhamento-curso-instituicao',{async: true}),
    instituicaoFilhas: DS.hasMany('instituicao', {async:true}),
    plataformaAnos: DS.hasMany('plataforma-ano', {
        async: true
    }),
    plataformaTurmas: DS.hasMany('plataforma-turma', {
        async: true
    }),
    ignoraCalendarioMedio: DS.attr(),
    statusTermoAceite: DS.attr(),
    codigoProfessores: DS.attr(),
    codigoAlunos: DS.attr(),
    codigoAlunosInfantil: DS.attr(),
});