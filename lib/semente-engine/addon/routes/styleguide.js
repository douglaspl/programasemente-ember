import Route from '@ember/routing/route';
import Ember from 'ember';
//import RSVP from 'rsvp';


export default Route.extend( {
    store: Ember.inject.service(),
    beforeModel() {
        if (!localStorage.getItem('person_logged')) { // if the user had not selected an institution, then do not load
            this.transitionTo('index');
        }
    },
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let role = person.role;
        let inst_id = person.instituicao_id;
        if (role === 'admin') {
            return  this.get('store').findAll('instituicao', {include: 'modulos, modulos.atividades, modulos.atividades.progressos'});
        }
        else {
            return this.get('store').findRecord('instituicao', inst_id, {include: 'modulos, modulos.atividades, modulos.atividades.progressos'});
        } 
    }
});