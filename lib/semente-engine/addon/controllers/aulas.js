import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model');
  }),
  plataformaAno: Ember.computed('model', function(){
    let ano = this.get('model').get('plataformaAnos').get('firstObject');
    debugger;
    return ano;
  }),
  segmento: Ember.computed('model', function(){
    return this.get('model').get('plataformaAnos').get('firstObject').get('segmento');
  }),
  actions: {
    
  }
  
});
