import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

function pessoaLogada() {
  return JSON.parse(localStorage.getItem('person_logged') || 'null') || {};
}

export default Route.extend({
  store: Ember.inject.service(),
  escopoGestor: Ember.inject.service('escopo-gestor'),
  // Não admin só entra se a API liberar a criação de conteúdos próprios (gestor com a flag);
  // senão volta para a tela de usuários da própria instituição
  beforeModel() {
    let pessoa = pessoaLogada();
    if (pessoa.role == 'admin') return;
    return this.get('escopoGestor').carregarEscopoConteudos().then(escopo => {
      if (!escopo.podeCriar) this.transitionTo('gerdata.users', pessoa.instituicao_id);
    });
  },
  model() {
    if (pessoaLogada().role != 'admin') {
      // Não admin só vê a aba "Conteúdos próprios": sem os dados da aba Geral.
      // Os anos do modal vêm do escopo (services/escopo-gestor), não do GET plataforma-anos
      return RSVP.hash({
        calendarios: this.get('store').findAll('calendario', { reload: true }),
        modulosCriados: this.get('store').query('modulo', { criados: true }).catch(() => []),
      });
    }
    return RSVP.hash({
      plataformaConteudos: this.get('store').findAll('plataforma-conteudo', { include: 'publicos, calendarios', reload: true}),
      plataformaAnos: this.get('store').findAll('plataforma-ano',{include:'segmento, aulas'}),
      agrupamentos: this.get('store').findAll('agrupamento', { include: 'temas'}),
      calendarios: this.get('store').findAll('calendario',{ reload: true}),
      // Módulos que a pessoa logada criou (aba Agrupar); se falhar, não derruba a aba Geral
      modulosCriados: this.get('store').query('modulo', { criados: true }).catch(() => []),
    });
  },
  setupController(controller) {
    this._super(...arguments);
    if (!controller.get('calendarioAtual')) controller.definirCalendarioAtual();
    if (pessoaLogada().role != 'admin') controller.set('selectedTab', 'agrupar');
  },
});
