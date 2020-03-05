import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
  store: Ember.inject.service(),
  beforeModel() {
    if (!localStorage.getItem('person_logged')) { // if the user had not selected an institution, then do not load
      this.transitionTo('index');
    }
  },
  async model(id) {
    return await this.get('store').findRecord('pessoa', id.pessoa_id, {
      include: 'modulos.atividades.secoes.conteudos, modulos.atividades.secoes.conteudos.html, modulos.atividades.secoes.conteudos.video,' + 
      'modulos.atividades.secoes.conteudos.quiz.questoes.alternativas, leituras, respostas, estado-questoes, estado-videos, estado-videos-alternativas, matriculas', reload: true
    });
  }
});
