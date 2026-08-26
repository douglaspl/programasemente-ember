import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let pessoa = this.get('store').findRecord('pessoa', person.id, {include: 'segmento, plataforma-ano, tarefas, conteudo-pessoas, pessoa-notifications.notification, instituicao', reload:true});
        let notifications = this.get('store').findAll('notification');
        return RSVP.hash({
            pessoa: pessoa,
            notifications: notifications,
        });
    },
});
