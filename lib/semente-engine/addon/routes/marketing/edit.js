import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
    store: Ember.inject.service(),
    model(param) {
        return this.get('store').findRecord('marketing', param.marketing_id);
    }
});
