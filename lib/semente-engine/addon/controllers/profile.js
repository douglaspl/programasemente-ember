import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  //       // setup our query params
  store: Ember.inject.service(),

  canAddResponsibles: Ember.computed('model', function() {
    return this.get('model').get('responsaveis').get('length') < 2;
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
    }
  }
});
