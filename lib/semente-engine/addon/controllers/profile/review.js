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
   let pessoa = this.model;
   if (pessoa == null) pessoa = this.get('model');
   let maxRespAllowed = 2;
   let totalResp = pessoa.get('responsaveis').get('length');
   // Douglas:  Adicionei esse afterRender para que o primeiro responsável já venha aberto
   let that = this;
   Ember.run.schedule('afterRender', function() {
    if (totalResp == 0) {
      that.send('addResponsible');
    }
   });
   return totalResp < maxRespAllowed;
  }),

  canAddDependents: Ember.computed('model', function () {
    return true;
  }),

  canAddPartner: Ember.computed('model', function () {
    var retorno;
    try{
      retorno = this.get('model').get('dependentes').get('firstObject').get('responsaveis').get('length') < 2;
    } catch {
      retorno = true;
    }
    return retorno;
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

  refreshCanAddPartner: function() {
    this.set('canAddPartner', this.get('model').get('dependentes').get('firstObject').get('responsaveis').get('length') < 2);
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
      var partner = this.get('store').createRecord('pessoa', {
        role: "responsavel",
        instituicao: this.get('model').get('instituicao'),
        shouldReviewProfile: true
      })

      var dependentes = this.get('model').get('dependentes');
      dependentes.forEach(dep => {
        partner.get('dependentes').pushObject(dep);
        dep.get('responsaveis').pushObject(partner);
      });

      this.refreshCanAddPartner();
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
      // Identifica elementos do form que serão os alvos e prepara variáveis para controle
      let currentStep = this.get('step');
      let formInputs = document.querySelectorAll(".carousel--" + currentStep + " .j-step" + currentStep + " .j-validate");
      let formSubmit = document.querySelectorAll(".carousel--" + currentStep + " .j-step" + currentStep + " .j-submit");
      let error_form = document.getElementById('error_form');
      let alertAnimation = error_form.dataset.animation;
      let naoValidados = [];
      // Identifica os elementos vazios ou inválidos e os inclui no array naoValidados
      formInputs.forEach(input => {

        if (input.value === "" && input.dataset.required == "true") {
          naoValidados.push(input);
        };
      });
      // Reseta classe de is--show em todos os inputs do form caso não exista campos inválidos
      formInputs.forEach(i => {
        i.classList.remove("border-bottom-4--error");
      });
      // Se existem campos inválidos
      if (naoValidados.length > 0) {
        // Em cada campo inválido, adiciona a barrinha vermelha abaixo
        naoValidados.forEach(i => {
          i.classList.add("border-bottom-4--error");
        });
        // Muda a sintaxe da mensagem de erro entre singular e plural
        if (naoValidados.length === 1) {
          var errorMsg = 'Por favor, informe o valor do campo destacado';
        } else {
          var errorMsg = 'Por favor, informe o valor dos campos destacados';
        };
        // Clona mensagem de erro e a posiciona ao lado do botão "Avançar"
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
      }
      // Se não existem campos inválidos
      else {
        // Retira mensagem de erro da tela
        let error_clone = document.getElementById("error_clone");
        if (error_clone) {
          error_clone.classList.remove("alert--is-show");
        }
        return true;
      }
    },


    validateName() {
      this.send('removeErrorTag');
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

    validateEmail() {
      this.send('removeErrorTag');
      let target = event.target;
      let errorMsg;
      target.addEventListener('keypress', function (evt) {
        var regex = new RegExp(/^[A-Za-z0-9@._\b]+$/);
        var key = String.fromCharCode(!evt.charCode ? evt.which : evt.charCode);
        
        if (evt.code == "Space") {
          errorMsg = 'Espaços não são permitidos';
        } else {
          errorMsg = 'Caractere não permitido';
        }
        let error_mail = target.parentElement.nextElementSibling;
        let alertAnimation = error_mail.dataset.animation;
        if (!regex.test(key)) {

          error_mail.innerHTML = errorMsg;
          error_mail.classList.add("alert--is-show", alertAnimation);

          event.preventDefault();
          return false;

        } else {
          error_mail.classList.remove("alert--is-show", alertAnimation);
          error_mail.innerHTML = '';
        }

      });

    },


    validateCel() {
      let target = event.target;
      let errorMsg;
      let error_cel = target.parentElement.nextElementSibling;
      let alertAnimation = error_cel.dataset.animation;
      if (target.value.length > 0 && target.value.length < 15) {
        target.focus();
        errorMsg = 'Número de telefone inválido';
        error_cel.innerHTML = errorMsg;
        error_cel.classList.add("alert--is-show", alertAnimation);
      } else {
        error_cel.classList.remove("alert--is-show", alertAnimation);
      };
    },


    toggleInput() {
      let target = event.target;
      let input = target.previousElementSibling;
      console.log(input);
      if (input.disabled == false) {
        input.disabled = true;
        input.value = '';
        input.dataset.required = 'false';
        input.classList.add("form-group__input--is-disabled");
        input.classList.remove("border-bottom-4--error");
        target.innerHTML = 'Possuo ' + input.dataset.type;
      } else {
        input.disabled = false;
        input.dataset.required = 'true';
        input.classList.remove("form-group__input--is-disabled");
        target.innerHTML = 'Não possuo ' + input.dataset.type;
      }


    },


    removeErrorTag() {
      console.log('removeErrorTag');
      let currentStep = this.get('step');
      let formInputs = document.querySelectorAll(".carousel--" + currentStep + " .j-step" + currentStep + " .j-validate");
      let inputsWithError = [];
      formInputs.forEach(input => {
        if (input.classList.contains("border-bottom-4--error")) {
          inputsWithError.push(input);
        }
      });

      if (inputsWithError.length > 0) {
        inputsWithError.forEach(input => {
          if (!input.value == "") {
            input.classList.remove("border-bottom-4--error")
          }
        });

      }

      if (inputsWithError.length == 1) {
        let error_form = document.getElementById("error_clone");
        error_form.classList.remove("alert--is-show");
      }

    },
  }
});
