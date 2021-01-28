import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    queryParams: {
      area_id: {
        refreshModel: true,
      },
    },

    activate: function() {
      this._super();
      console.log('scroll!');
      window.scrollTo(0,0);
    },

    model(param) {
      return this.get('store').query('marketing', {area_id: param.area_id,
          include: 'area, arquivos'});
    }
});
