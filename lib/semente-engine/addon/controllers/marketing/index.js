import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  parentController: Ember.inject.controller("marketing"),
  showHeader: Ember.run.schedule('afterRender', function () {
      $('body').removeClass('no-header');
  }),

  pessoaRole: Ember.computed('pessoa' , function() {
    return this.get('parentController').get('model').get("role");
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
