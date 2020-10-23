import Controller from '@ember/controller';
import Ember from 'ember';

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  teste: Ember.computed('model', function(){
      return 'ok'
  }),
  escola: Ember.computed('model', function(){
    let escola = this.get('model').get('instituicao');
    return escola;
  }),
  plataformaAnos: Ember.computed('model', function(){
    let plataformaAnos = this.get('model').get('instituicao').get('plataformaAnos');
    return plataformaAnos;
  }),
  plataformaTurmas: Ember.computed('model', function(){
    let plataformaTurmas = this.get('model').get('instituicao').get('plataformaTurmas');
    return plataformaTurmas;
  }),
  actions: {
    reloadTurmas(){

    }
  }
});
