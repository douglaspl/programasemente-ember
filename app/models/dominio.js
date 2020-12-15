import DS from 'ember-data';

let dominioFormat = ['management', 'engagement', 'kindness', 'resilience', 'openness']

export default DS.Model.extend({
    idx: DS.attr(),
    dominioFormatIdx: Ember.computed('idx', function() {
        return dominioFormat[this.get('idx') - 1];
    }),
    name: DS.attr(),
    competencias: DS.hasMany('comp', { async: true }),
});