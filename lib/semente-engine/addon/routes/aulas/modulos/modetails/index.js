import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
           return this.modelFor('modulos.modetails');
    }
});