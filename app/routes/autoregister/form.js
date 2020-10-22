import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    model(id) {
        return this.get('store').peekRecord('instituicao', id.id);
    },
});