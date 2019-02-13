import Ember from 'ember';
import Base from 'ember-simple-auth/authorizers/base';

export default Base.extend({
  session: Ember.inject.service('session'),
  authorize(data, block) {
    const sessionData = this.get('session.data');
    const tok = sessionData.authenticated.access_token;
    var temp = 'Bearer ';
    const userToken = temp.concat(tok);
    block('Authorization', userToken);
  }
});