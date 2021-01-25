import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  actions:{
    transitToMarketing(areaid){
      this.transitionToRoute('marketing.filter', {
        queryParams: {
          area_id: areaid
        }
      });
    }
  }
});
