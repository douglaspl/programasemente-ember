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
  fromRight: false,

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

  stepsFound: function () {
    return Array.prototype.slice.call(document.querySelector('.j-steps').querySelectorAll('.steps__step'));
  },

  stepsStripActiveClass: function () {

    this.stepsFound().forEach(function (el) {
      el.classList.remove('steps__step--is-active');
    });
  },

  findDirection: function () {
    this.set('fromRight', this.get('step') === 3);
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

    carouselFoward: function () {
      let next = this.get('step') + 1;
      this.stepsStripActiveClass();
      this.stepsFound()[next - 1].classList.add('steps__step--is-active');
      this.findDirection();
      this.set('step', next);
    },


    carouselBackward: function () {
      let before = this.get('step') - 1;
      this.stepsStripActiveClass();
      this.stepsFound()[before - 1].classList.add('steps__step--is-active');
      this.findDirection();
      this.set('step', before);
    },


    validateForm: function () {
      let currentStep = this.get('step');
      let formInputs = document.querySelectorAll(".carousel--" + currentStep + " .j-step"+ currentStep + " .j-validate");
      let formSubmit = document.querySelectorAll(".carousel--" + currentStep + " .j-step"+ currentStep + " .j-submit");
      let error_form = document.getElementById('error_form');
      let alertAnimation = error_form.dataset.animation;
      let naoValidados = [];
      formInputs.forEach(input => {
        if (input.value === "") {
          naoValidados.push(input);
        }
      });
      formInputs.forEach(i => {
        i.classList.remove("border-bottom-4--error");
      });
      if (naoValidados.length > 0) {
        naoValidados.forEach(i => {
          i.classList.add("border-bottom-4--error");
        });
        if (naoValidados.length === 1) {
          var errorMsg = 'Por favor, informe o valor do campo destacado';
        } else {
          var errorMsg = 'Por favor, informe o valor dos campos destacados';
        };
                
        let error_clone = document.getElementById("error_clone");
        if (error_clone) {
          error_clone.remove();
        }
              
        let ec2 = error_form.cloneNode(true);
        ec2.id = "error_clone";
        formSubmit[0].parentNode.insertBefore(ec2, formSubmit.nextSibling);
        ec2.innerHTML = errorMsg;
        ec2.classList.add("alert--is-show", alertAnimation);
        return false;
      } else {
        let error_clone = document.getElementById("error_clone");
        if (error_clone) {
          error_clone.classList.remove("alert--is-show");
        }
        return true;
      }
    },


    validateName() {
      let target = event.target;
      
      target.addEventListener('keypress', function (evt) {       
      // debugger;
        var regex = new RegExp(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ'\s._\b]+$/);
        var key = String.fromCharCode(!evt.charCode ? evt.which : evt.charCode);
        let errorMsg = 'Somente letras são permitidas';
        let error_name = target.parentElement.nextElementSibling;
        let alertAnimation = error_name.dataset.animation;
        if (!regex.test(key)) {

          error_name.innerHTML = errorMsg;
          error_name.classList.add("alert--is-show", alertAnimation);

          event.preventDefault();
          return false;

        } else {
          error_name.classList.remove("alert--is-show", alertAnimation);
          error_name.innerHTML = '';
        }

      });

    },
    

  }
});
