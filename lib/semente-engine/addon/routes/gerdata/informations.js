import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
  store: Ember.inject.service(),
  model: function(params) {
    var inst = this.get('store').findRecord('instituicao', params.instituicao_id, { include: 'codigos-cadastro, count-pessoas', reload: true });
    var instituicoes = this.get('store').findAll('instituicao');
    // var s = inst.get('sistemas').find((x) => { return x.get('idx') === 2 });
    // var cs = inst.get('sistemas').find((x) => { return x.get('idx') === 3 });
    // if (s) {
    //   inst.set('sEnabled', true);
    // }
    // if (cs) {
    //   inst.set('csEnabled', true);
    // }
    return RSVP.hash({
      instituicao: inst,
      instituicoes: instituicoes,
    });
  },
});