import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
  store: Ember.inject.service(),
  escopoGestor: Ember.inject.service('escopo-gestor'),
  // Admin: sem mudança. Gestor: só entra se a instituição dele tiver filhas (ou for a instituição 9,
  // que já tinha o "voltar" para esta tela no gerdata-header). Demais perfis: tela de usuários da própria instituição
  beforeModel() {
    let person = JSON.parse(localStorage.getItem('person_logged'));
    if (person.role == 'admin') return;
    if (person.role != 'gestor') return this.transitionTo('gerdata.users', person.instituicao_id);
    return this.get('escopoGestor').carregarArvoreInstituicoes().then(nos => {
      if (nos.length > 1 || String(person.instituicao_id) == '9') return;
      this.transitionTo('gerdata.users', person.instituicao_id);
    });
  },
  model() {
    let person = JSON.parse(localStorage.getItem('person_logged'));
    if (person.role != 'admin') {
      // Gestor: árvore da própria instituição (raiz no topo, nivel 0), sem buscar todas as instituições
      return RSVP.hash({
        pessoa: this.get('store').findRecord('pessoa', person.id),
        instituicoes: [],
        arvore: this.get('escopoGestor').carregarArvoreInstituicoes()
      });
    }
    return RSVP.hash({
      pessoa: this.get('store').findRecord('pessoa', person.id),
      instituicoes: this.get('store').findAll('instituicao', { include: 'calendario', reload: false }),
      sistemas: this.get('store').findAll('sistema'),
      anos: this.get('store').findAll('plataforma-ano')
    });
  },
});
