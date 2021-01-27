import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  showHeader: Ember.run.schedule('afterRender', function () {
      $('body').removeClass('no-header');
  }),
  actions: {
    goToCreateItem() {
       
      this.transitionToRoute('marketing.create');
      
      setTimeout(() => {
        let tabMkt = document.getElementById('tabMkt');
        tabMkt.classList.add('tabs__tab--is-active');
      }, 1);

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
