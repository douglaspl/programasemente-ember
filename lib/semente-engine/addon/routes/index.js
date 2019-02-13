import Route from '@ember/routing/route';

export default Route.extend({
    afterModel() {
        if (localStorage.getItem('person_logged')) 
        { // if the user had already selected an institution, then go directly to modulos
            this.transitionTo('modulos');
        }
    }
});