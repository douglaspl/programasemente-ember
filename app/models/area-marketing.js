import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    name: DS.attr(),
    image: DS.attr(),
    marketings: DS.hasMany('marketing', { async: true }),
});