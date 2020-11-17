import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
  store: Ember.inject.service(),
  afterModel(model) {
    // let pessoa = this.get('model');
    if (model.get('shouldReviewProfile')){
        this.transitionTo('profile.review', model.get('id'));
    }
  },
  model(id) {
    return this.get('store').findRecord('pessoa', id.pessoa_id, {
      include: 'responsaveis, plataforma-anos, instituicao.plataforma-anos, instituicao.plataforma-turmas, plataforma-turmas', reload: true
    });
  }
});
