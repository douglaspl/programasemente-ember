import DS from 'ember-data';

export default DS.Model.extend({
    genero: DS.attr(),
    competencia: DS.belongsTo('comp', { async: true }),
    //ano: DS.belongsTo('ano', { async: true }),
});