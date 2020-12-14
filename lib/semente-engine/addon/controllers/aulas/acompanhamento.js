import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  parentController: Ember.inject.controller('aulas'),
  store: Ember.inject.service(),

  alunos: Ember.computed('model', function () {
    return this.get('model.pessoa').get('instituicao').get('pessoas').filterBy('role', 'aluno')
  }),

  professores: Ember.computed('model', function () {
    return this.get('model.pessoa').get('instituicao').get('pessoas').filterBy('role', 'instrutor')
  }),

  isAdmin: Ember.computed('model', function () {
    // if (this.get('model.pessoa').get('role') != 'aluno' || this.get('model.pessoa').get('role') != 'instrutor'){
    //   return true;
    // } else {
    //   return false;
    // }


    //para desenvolvimento
    return true;
  }),

  filteredAlunos: Ember.computed('model', function () {
    return this.get('alunos')
  }),

  filteredProfessores: Ember.computed('model', function () {
    return this.get('professores')
  }),

  selectedFilteredRole: Ember.computed('model', function () {
    if (this.get('isAdmin')) {
      return 'professores'
    } else {
      return 'alunos'
    }
  }),

  search: Ember.computed('model', function () {
    return "";
  }),

  actions: {
    toggleRole(selectedRole) {
      this.get('parentController').send('toggleRole', selectedRole)
    },

    refreshSelectedFilteredRole(selectedRole) {
      this.set('selectedFilteredRole', selectedRole);
    },

    refreshSelectedSegmento() {
      this.get('parentController').send('refreshSelectedSegmento');
    },

    eraseText() {
      let btnTarget = document.getElementById("pesquisaperfil");
      btnTarget.value = '';
      //  this.set('search', '');
      this.send('filter');
    },
  }

});