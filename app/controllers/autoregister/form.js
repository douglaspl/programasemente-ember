import Controller from '@ember/controller';
import Ember from 'ember';

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  escola: Ember.computed('model', function () {
    let escola = this.get('model').get('instituicao');
    return escola;
  }),

// formFocus: Ember.run.schedule('afterRender', function(){
   
//     let input = document.getElementById("login");
//     input.focus();

// }),

  actions: {

    liveCheckEmail: function() {
      var field = document.getElementById("login");
      var fieldErrorAlert =  document.getElementById('login-error');

      field.addEventListener('keypress', function (event) {
        var key = event.key;
        if (key === 32) {
          event.preventDefault();
          fieldErrorAlert.innerHTML = 'Espaços não são permitidos';
        } else {
          fieldErrorAlert.innerHTML = '';
        }
      });
    },

    verifyEmail: function () {
      $('form').removeData('validator');
      $('form').removeData('unobtrusiveValidation');
      let email = document.getElementById('login').value;
      let pessoa = this.get('store').createRecord('pessoa', {
        email: email
      });
      let form = document.getElementById('form-login');
      let input = document.getElementById('login');
      // Pega alerta
      const errorCompartiment = document.getElementById('form-error');
      // Pega animação do alerta
      const alertAnimation = errorCompartiment.dataset.animation;
      // Pega container da mensagem a ser escrita
      const msg = errorCompartiment.querySelector('[class*="__msg"]');


      pessoa.verifyEmail({
        login: pessoa.get('email'),
        instituicaoId: this.get('escola').get('id')
      }).then(function (response) {
        errorCompartiment.classList.remove('alert--is-show', alertAnimation);
        form.classList.add('form-group--is-validated');
      }).catch(function (error) {
        if (error.errors) {

          form.classList.remove('form-group--is-validated');
          if (input) {
            input.focus();
          }

          // Antiga mensagem de erro
          // document.getElementById('login-error').innerHTML = error.errors[0].title;

          // Pega a identificação do erro
          const errorStatus = error.errors[0].status;

          // Define mensagem de erro, caso seja o erro XYZ
          let errorMsg;
          if (errorStatus === "400") {
            switch (true) {
              case email.length == 0:
                errorMsg = 'Por favor, insira um nome de usuário';
                break;
              case email.length > 0:
                errorMsg = 'O nome de usuário informado já existe, por favor, escolha outro.'
                break;

            }
          } else if (errorStatus === "500") {
            errorMsg = 'Ocorreu um erro no sistema, mas não se preocupe, nossos desenvolvedores já foram alertados.'
          }

          // Injeta mensagem de erro.
          msg.innerHTML = '<strong>' + errorMsg + '</strong>';

          // Confere se o elemento já está aparecendo
          if (!errorCompartiment.classList.contains('alert--is-show')) {
            // Adiciona duas classes: uma para o alerta aparecer e outra com a animação definida no html, por meio de data-SBRUBLES
            errorCompartiment.classList.add('alert--is-show', alertAnimation);
          }

        } else {
          // Situação não tratada ainda
          document.getElementById('login-error').innerHTML = '';
        }

      })

    },

    verifyPassword: function () {
      let p1 = document.getElementById('senha').value;
      let p2 = document.getElementById('senha2').value;

      const passAlert = document.getElementById('password-error');
      const alertAnimation = passAlert.dataset.animation;
      const msg = passAlert.querySelector('[class*="__msg"]');
      const errorMsg = 'As senhas digitadas não são iguais.';

      if (p1 === p2) {
        document.getElementById('submit').disabled = false;
        passAlert.classList.remove('alert--is-show');
      } else {
        passAlert.classList.add('alert--is-show', alertAnimation);
        msg.innerHTML = '<strong>' + errorMsg + '</strong>';
      }
    },

    createUser: function () {
      let password = document.getElementById('senha').value;
      let login = document.getElementById('login').value;
      let sistemas = this.get('store').peekAll('sistema');
      let sistema;
      sistemas.forEach(function (s) {
        if (s.get('idx') == 1) {
          sistema = s;
        }
      });
      let pessoa = this.get('store').createRecord('pessoa');
      let that = this;
      pessoa.autoRegister({
        login: login,
        password: password,
        instituicaoId: this.get('escola').get('id'),
        sistemaId: sistema.get('id'),
        role: this.get('model').get('typeCadastro'),
        shouldReviewProfile: true,
        name: login
      }).catch(function (error) {
        that.get('session').authenticate('authenticator:authold', login, password, 1).then(() => {}).catch((reason) => {});
      })
    }
  },
});
