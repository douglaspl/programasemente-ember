import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
  store: Ember.inject.service(),
  model(id) {
    return this.get('store').findRecord('pessoa', id.pessoa_id, {
      include: 'plataforma-anos', reload: true
    });
  }
});
