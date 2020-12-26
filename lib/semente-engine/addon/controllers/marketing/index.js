import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  actions: {
    goToCreateItem() {
      this.transitionToRoute('marketing.create'); 
    },
    goToMarketings(areaid) {
      this.transitionToRoute('marketing.filter', {
        queryParams: {
          area_id: areaid
        }
      });
    },
  }
});
