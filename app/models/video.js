import DS from 'ember-data';

export default DS.Model.extend({
    videoId: DS.attr(),
    conteudo: DS.belongsTo('conteudo', {async: true}),
    estadosVideo: DS.hasMany('estado-video', {async: true}) 
});