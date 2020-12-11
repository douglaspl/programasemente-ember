import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  selectedDependente: Ember.computed('model', function(){
    let toggleRole = localStorage.getItem('toggleRole');
    let person = JSON.parse(localStorage.getItem('person_logged'));
    let id = person.id;
    if (toggleRole == 'responsavel') {
      id = this.get('store').peekRecord('pessoa', id).get('dependentes.firstObject.id');
    }
    let pessoaDep = this.get('store').peekRecord('pessoa', id);
    return pessoaDep
  }),
});
