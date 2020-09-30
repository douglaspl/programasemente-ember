import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  nomePessoa: Ember.computed('model', function(){
    debugger;
    let pessoa = this.get('model');
    return pessoa.get('name');
  }),
  actions: {
    
  }
  
});
