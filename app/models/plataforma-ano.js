import DS from 'ember-data';
import Ember from 'ember';
import segmento from './segmento';

export default DS.Model.extend({
    name: DS.attr(),
    descricao: DS.attr(),
    instituicoes: DS.hasMany('instituicao', { async: true }),
    segmento: DS.belongsTo('segmento', { async: true })
});