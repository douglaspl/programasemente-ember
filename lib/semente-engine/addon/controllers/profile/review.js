import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  //       // setup our query params
  store: Ember.inject.service(),
  escola: Ember.computed('model', function () {
    let escola = this.get('model').get('instituicao');
    return escola;
  }),
  preventDefault: Ember.computed(function () {
    let buttons = document.querySelectorAll("button");
    buttons.forEach(button => {
      button.addEventListener("click", function (event) {
        event.preventDefault()
      });
    })

  }),

  step: 1,
  pending: [],


  hideHeader: Ember.run.schedule('afterRender', function () {
    $('body').addClass('no-header');
  }),

  canAddResponsibles: Ember.computed('model', function () {
    return this.get('model').get('responsaveis').get('length') < 2;
  }),

  canAddDependents: Ember.computed('model', function () {
    return true;
  }),

  canAddPartner: Ember.computed('model', function () {
    return this.get('model').get('dependentes').get('firstObject').get('responsaveis').get('length') < 2;
  }),

  refreshCanAddResponsibles: function () {
    this.set('canAddResponsibles', this.get('model').get('responsaveis').get('length') < 2);
  },

  actions: {
    addResponsible: function () {
      var currentPerson = this.get('model');
      var newResponsible = this.get('store').createRecord('pessoa', {
        role: "responsavel",
        instituicao: this.get('model').get('instituicao')
      })
      currentPerson.get('responsaveis').pushObject(newResponsible);
      newResponsible.get('dependentes').pushObject(currentPerson);

      this.refreshCanAddResponsibles();
    },

    addPartner: function () {
      this.get('store').createRecord('pessoa', {
        role: "responsavel",
        instituicao: this.get('model').get('instituicao')
      })
    },

    addDependent: function () {
      var currentPerson = this.get('model');
      var newDependente = this.get('store').createRecord('pessoa', {
        role: "aluno",
        instituicao: this.get('model').get('instituicao')
      })
      currentPerson.get('dependentes').pushObject(newDependente);
      newDependente.get('responsaveis').pushObject(currentPerson);
    },

    validateStudentProfile: function () {
      let pessoa = this.get('model');

      pessoa.set('shouldReviewProfile', false);
      let that = this;
      pessoa.save().then(function (pessoa) {
        that.transitionToRoute('aulas.index');
      }).catch(function (error) {});
    },


    refreshInstructorResponsible: function () {

    },

    validateTeacherProfile: function () {
      let pessoa = this.get('model');

      pessoa.set('shouldReviewProfile', false);
      let that = this;
      pessoa.save().then(function (pessoa) {
        that.transitionToRoute('aulas.index');
      }).catch(function (error) {});

    },

    initTeacherResponsible: function () {
      let teacher = this.get('model');

      if (teacher.get('dependentes').get('length') <= 0) {
        let newDependente = this.get('store').createRecord('pessoa', {
          role: "aluno",
          instituicao: this.get('model').get('instituicao')
        });
        newDependente.get('responsaveis').pushObject(teacher);
        teacher.get('dependentes').pushObject(newDependente);
      }
    },

    carouselFoward() {
      let carousel = $('.j-carousel');
      let s1 = $('#s1');
      let s2 = $('#s2');
      let s3 = $('#s3');
      // Se está no step 1
      if (carousel.hasClass('carousel--1')) {
        carousel.removeClass('carousel--1');
        carousel.addClass('carousel--2');
        s1.removeClass('steps__step--is-active');
        s2.addClass('steps__step--is-active');
        this.set('step', 2);
      // Se está no step 2 
      } else if (carousel.hasClass('carousel--2')) {
        carousel.removeClass('carousel--2');
        carousel.addClass('carousel--3');
        s2.removeClass('steps__step--is-active');
        s3.addClass('steps__step--is-active');
        this.set('step', 3);
      }
    },


    carouselBackward() {
      let carousel = $('.j-carousel');
      let s1 = $('#s1');
      let s2 = $('#s2');
      let s3 = $('#s3');
      // Se está no step 2
      if (carousel.hasClass('carousel--2')) {
        carousel.removeClass('carousel--2');
        carousel.addClass('carousel--1');
        s2.removeClass('steps__step--is-active');
        s1.addClass('steps__step--is-active');
        this.set('step', 1);
      // Se está no step 3 
      } else if (carousel.hasClass('carousel--3')) {
        carousel.removeClass('carousel--3');
        carousel.addClass('carousel--2');
        s3.removeClass('steps__step--is-active');
        s2.addClass('steps__step--is-active');
        this.set('step', 2);
      }
    },


    liveCheckForm() {
  
      let inputs = document.querySelectorAll('[for="validation"]')
      
      
      inputs.forEach(input => {
        
        if (input.value == "") {
              input.classList.add("border-bottom-4--error");
              this.get('pending').pushObject(input.id);
            } else {
              input.classList.remove("border-bottom-4--error"); 
              this.get('pending').removeObject(input.id);
            } 
          
      });
      let pending = this.get('pending').uniq();
      if (pending == 0) {
        let errorContainer = document.getElementById("error_form");
        errorContainer.classList.remove("alert--is-show");
      }
  
      },
 
  }
});
