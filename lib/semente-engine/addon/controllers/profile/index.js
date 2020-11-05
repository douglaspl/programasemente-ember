import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  //       // setup our query params
  store: Ember.inject.service(),
  shouldReview: Ember.computed('model', function(){
    let pessoa = this.get('model');
    if (pessoa.get('shouldReviewProfile')){
        this.transitionToRoute('profile.review', pessoa.get('id'));
    }
  }),
  actions: {

  }
});
