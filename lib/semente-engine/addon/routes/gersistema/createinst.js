import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
  store: Ember.inject.service(),
  // Só admin cria instituição (o gestor de rede usa a lista de gersistema apenas para navegar)
  beforeModel() {
    let person = JSON.parse(localStorage.getItem('person_logged'));
    if (!person || person.role != 'admin') this.transitionTo('gersistema');
  },
  model() {
    var newInst =  this.get('store').createRecord('instituicao');
    newInst.set('enabled', true);
    newInst.set('sEnabled', true);
    var segmentos = this.get('store').findAll('segmento', {include: 'plataforma-anos', reload: true});
    var calendarios = this.get('store').findAll('calendario');
    var instituicoes = this.get('store').findAll('instituicao');
    return RSVP.hash({
      newInst: newInst,
      segmentos: segmentos,
      calendarios: calendarios,
      instituicoes: instituicoes
    });
  },
});