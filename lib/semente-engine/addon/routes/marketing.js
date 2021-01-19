import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return this.get('store').peekRecord('pessoa', person_id);
    }
});
