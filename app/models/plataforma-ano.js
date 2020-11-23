import DS from 'ember-data';
import Ember from 'ember';
import segmento from './segmento';
import plataformaTurma from './plataforma-turma';

export default DS.Model.extend({
    name: DS.attr(),
    descricao: DS.attr(),
    idx: DS.attr(),
    urlLivro: DS.attr(),
    instituicoes: DS.hasMany('instituicao', { async: true }),
    segmento: DS.belongsTo('segmento', { async: true }),
    aulas: DS.hasMany('aula', { async: true })
});
