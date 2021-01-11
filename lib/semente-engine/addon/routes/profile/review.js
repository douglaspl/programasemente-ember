import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
  store: Ember.inject.service(),
  model(id) {
    return this.get('store').findRecord('pessoa', id.pessoa_id, {
      include: 'responsaveis, plataforma-anos, instituicao.plataforma-anos.segmentos, instituicao.plataforma-turmas, plataforma-turmas, modulos, dependentes.plataforma-turmas, dependentes.responsaveis',
      reload: true
    });
  },

  //Douglas: Função para carregar o nome da pessoa vazio se for igual ao e-mail
  afterModel(id) {
    let nome = this.get('store').peekRecord('pessoa', id.id).get('name')
    let login = this.get('store').peekRecord('pessoa', id.id).get('email')
    if (nome == login) {
      this.get('store').peekRecord('pessoa', id.id).set('name', '');
    }
  }
});
