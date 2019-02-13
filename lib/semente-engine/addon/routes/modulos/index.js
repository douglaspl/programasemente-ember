import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    model() {
        return this.modelFor('modulos');
    },
    // afterModel() {
    //     let cont = this.controllerFor('run_update');
    //     cont.send
    // }
});