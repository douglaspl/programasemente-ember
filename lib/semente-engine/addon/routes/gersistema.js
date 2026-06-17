import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
  store: Ember.inject.service(),
  model() {
    let person = JSON.parse(localStorage.getItem('person_logged'));
    return RSVP.hash({
      pessoa: this.get('store').findRecord('pessoa', person.id),
      instituicoes: this.get('store').findAll('instituicao', { include: 'calendario', reload: false }),
      sistemas: this.get('store').findAll('sistema'),
      anos: this.get('store').findAll('plataforma-ano')
    });
  },
});
