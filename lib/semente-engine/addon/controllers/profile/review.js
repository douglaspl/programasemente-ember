import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  //       // setup our query params
  store: Ember.inject.service(),

  canAddResponsibles: Ember.computed('model', function() {
    return this.get('model').get('responsaveis').get('length') < 2;
  }),
  
  canAddDependents: Ember.computed('model', function() {
    return true;
  }),

  canAddPartner: Ember.computed('model', function () {
    return this.get('model').get('dependentes').get('firstObject').get('responsaveis').get('length') < 2;
  }),

  refreshCanAddResponsibles: function() {
    this.set('canAddResponsibles', this.get('model').get('responsaveis').get('length') < 2);
  },
  
  actions: {
    addResponsible() {
      var currentPerson = this.get('model');
      var newResponsible = this.get('store').createRecord('pessoa', {
        role: "responsavel",
        instituicao: this.get('model').get('instituicao')
      })
      currentPerson.get('responsaveis').pushObject(newResponsible);
      newResponsible.get('dependentes').pushObject(currentPerson);

      this.refreshCanAddResponsibles();
    },

    addPartner() {
      this.get('store').createRecord('pessoa', {
        role: "responsavel",
        instituicao: this.get('model').get('instituicao')
      })
    },

    addDependent() {
      var currentPerson = this.get('model');
      var newDependente = this.get('store').createRecord('pessoa', {
        role: "aluno",
        instituicao: this.get('model').get('instituicao')
      })
      currentPerson.get('dependentes').pushObject(newDependente);
      newDependente.get('responsaveis').pushObject(currentPerson);
    },

    validateStudentProfile() {
      let pessoa = this.get('model');

      pessoa.set('shouldReviewProfile', false);
      pessoa.save();
      this.transitionToRoute('profile.index', pessoa.get('id'));
    }
  }
});
