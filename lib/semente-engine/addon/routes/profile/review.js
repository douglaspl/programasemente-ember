import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
  store: Ember.inject.service(),
  model(id) {
    return this.get('store').findRecord('pessoa', id.pessoa_id, {
      include: 'responsaveis, plataforma-anos, instituicao.plataforma-anos, instituicao.plataforma-turmas, plataforma-turmas, modulos, dependentes.plataforma-turmas', reload: true
    });
  }
});
