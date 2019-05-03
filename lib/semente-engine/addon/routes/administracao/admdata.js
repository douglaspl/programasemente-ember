import Route from '@ember/routing/route';
import Ember from 'ember';
import RouteMixin from 'ember-cli-pagination/remote/route-mixin';

export default Route.extend(RouteMixin, {
  // optional. default is 10  
  queryParams: {
    instituicao_id: {
      refreshModel: true,
    },
    perPage: {
      refreshModel: true,
    },
    page: {
      refreshModel: true,
    },
    ordem: {
      refreshModel: true,
    },
    str_search: {
      refreshModel: true,
    },
    ano1: {
      refreshModel: true,
    },
    ano2: {
      refreshModel: true,
    },
    ano3: {
      refreshModel: true,
    },
  },
  store: Ember.inject.service(),
  beforeModel: function () {
    if (this.controller) this.controller.set('load_state', true);
  },
  model: function (params) {
    // todo is your model name
    // returns a PagedRemoteArray
    return this.findPaged('pessoa', params);
  }
});
