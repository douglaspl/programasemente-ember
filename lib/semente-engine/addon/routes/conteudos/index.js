import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
  store: Ember.inject.service(),
  model() {
    return RSVP.hash({
      plataformaConteudos: this.get('store').findAll('plataforma-conteudo', { include: 'publicos, calendarios', reload: true}),
      plataformaAnos: this.get('store').findAll('plataforma-ano',{include:'segmento, aulas'}),
      agrupamentos: this.get('store').findAll('agrupamento', { include: 'temas'}),
      calendarios: this.get('store').findAll('calendario',{ reload: true}),
      // Módulos que a pessoa logada criou (aba Agrupar); se falhar, não derruba a aba Geral
      modulosCriados: this.get('store').query('modulo', { criados: true }).catch(() => []),
    });
  },
});
