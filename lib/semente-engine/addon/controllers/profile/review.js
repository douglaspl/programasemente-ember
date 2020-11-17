import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  //       // setup our query params
  store: Ember.inject.service(),

  preventDefault: Ember.computed(function(){
   let buttons = document.querySelectorAll("button");
    buttons.forEach(button => {
      button.addEventListener("click", function(event){
        event.preventDefault()
      });
    })
    
  }),

  hideHeader: Ember.run.schedule('afterRender', function(){
    $('body').addClass('no-header');
  }),
 
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
    addResponsible: function() {
      var currentPerson = this.get('model');
      var newResponsible = this.get('store').createRecord('pessoa', {
        role: "responsavel",
        instituicao: this.get('model').get('instituicao')
      })
      currentPerson.get('responsaveis').pushObject(newResponsible);
      newResponsible.get('dependentes').pushObject(currentPerson);

      this.refreshCanAddResponsibles();
    },

    addPartner: function() {
      this.get('store').createRecord('pessoa', {
        role: "responsavel",
        instituicao: this.get('model').get('instituicao')
      })
    },

    addDependent: function() {
      var currentPerson = this.get('model');
      var newDependente = this.get('store').createRecord('pessoa', {
        role: "aluno",
        instituicao: this.get('model').get('instituicao')
      })
      currentPerson.get('dependentes').pushObject(newDependente);
      newDependente.get('responsaveis').pushObject(currentPerson);
    },

    validateStudentProfile: function() {
      let pessoa = this.get('model');

      pessoa.set('shouldReviewProfile', false);
      let that = this;
      pessoa.save().then(function(pessoa){
        that.transitionToRoute('aulas.index');
      }).catch(function(error) {
      });
    },


    refreshInstructorResponsible: function() {

    },

    validateTeacherProfile: function() {
      let pessoa = this.get('model');

      pessoa.set('shouldReviewProfile', false);
      let that = this;
      pessoa.save().then(function(pessoa){
        that.transitionToRoute('aulas.index');
      }).catch(function(error) {
      });

    },

    initTeacherResponsible: function() {
      let teacher = this.get('model');

      if (teacher.get('dependentes').get('length') <= 0) {
        let newDependente = this.get('store').createRecord('pessoa', {
          role: "aluno",
          instituicao: this.get('model').get('instituicao')
        });
        newDependente.get('responsaveis').pushObject(teacher);
        teacher.get('dependentes').pushObject(newDependente);
      }
    }
  }
});
