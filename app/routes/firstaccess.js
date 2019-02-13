import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  store: Ember.inject.service(),
  beforeModel() {
    if (!this.get('session.isAuthenticated')) {
      this.transitionTo('/login');
    }
  },
});
