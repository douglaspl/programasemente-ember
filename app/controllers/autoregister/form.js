import Controller from '@ember/controller';
import Ember from 'ember';

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  teste: Ember.computed('model', function(){
      debugger;
      return 'ok'
  }),
  actions: {
  }
});
