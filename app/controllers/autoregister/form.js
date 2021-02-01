import Controller from '@ember/controller';
import Ember from 'ember';

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  escola: Ember.computed('model', function () {
    let escola = this.get('model').get('instituicao');
    return escola;
  }),

preventLoginPaste: Ember.run.later('afterRender', function() {
  setTimeout(() => {
    document.getElementById('login').onpaste = function(){
    // Pega alerta
    const errorCompartiment = document.getElementById('login-error');
    // Pega animação do alerta
    const alertAnimation = errorCompartiment.dataset.animation;
    // Pega container da mensagem a ser escrita
    const msg = errorCompartiment.querySelector('[class*="__msg"]');
    // Mensagem
    let errorMsg = 'Por favor, digite'
    // Injeta mensagem de erro.
    msg.innerHTML = '<strong>' + errorMsg + '</strong>';
    // Confere se o elemento já está aparecendo
    if (!errorCompartiment.classList.contains('alert--is-show')) {
    // Adiciona duas classes: uma para o alerta aparecer e outra com a animação definida no html, por meio de data-SBRUBLES
      errorCompartiment.classList.add('alert--is-show', alertAnimation);
    }
      return false;
  }
  }, 600);
}),


  pessoa: Ember.computed('model', function() {
    return this.get('store').createRecord('pessoa');
  }),


  emailFocus: Ember.computed(function () {
    let input = document.getElementById("login");
    if (input) {
      input.focus();
    }
  }),

  verifyPasswordLength() {
    
    let p1 = document.getElementById('senha').value;
    let p2 = document.getElementById('senha2').value;
    const passAlert = document.getElementById('pass-error');
    const msg = passAlert.querySelector('[class*="__msg"]');
    
    if (p1.length < 6 || p2.length < 6) {
     let errorMsg = 'A senha precisa ter pelo menos 6 caracteres.';
      passAlert.classList.add('alert--is-show', 'fadeIn');
      msg.innerHTML = '<strong>' + errorMsg + '</strong>';
      return false
    } else {
      passAlert.classList.remove('alert--is-show', 'fadeIn');
      return true;
    }
    
  },

  actions: {

    liveCheckEmail: function () {

      $('#login').on('keypress', function (event) {
          var regex = new RegExp("^[a-zA-Z0-9@.-_]+$");
          var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
          let errorMsg = 'Espaço e caracteres especiais não são permitidos';

          if (!regex.test(key)) {
            // Pega form container e tira classe de validado
            let inputContainer = document.getElementById('login').closest('.form-group__input-container');
            inputContainer.classList.remove('form-group__input-container--is-validated');

            // Pega alerta
            let errorCompartiment = document.getElementById('login-error');

            // Pega animação do alerta
            let alertAnimation = errorCompartiment.dataset.animation;

            // Pega container da mensagem a ser escrita
            let msg = errorCompartiment.querySelector('[class*="__msg"]');
            errorCompartiment.classList.remove('alert--is-show', alertAnimation);

            // Injeta mensagem de erro.
            msg.innerHTML = '<strong>' + errorMsg + '</strong>';

            // Confere se o elemento já está aparecendo
            if (!errorCompartiment.classList.contains('alert--is-show')) {
              // Adiciona duas classes: uma para o alerta aparecer e outra com a animação definida no html, por meio de data-SBRUBLES
              errorCompartiment.classList.add('alert--is-show', alertAnimation);
            }

           event.preventDefault();
           return false;

          } else {
            let errorCompartiment = document.getElementById('login-error');
            let alertAnimation = errorCompartiment.dataset.animation;
            errorCompartiment.classList.remove('alert--is-show', alertAnimation);
            return true;
          }

      });

  },

  verifyEmail: function () {
    $('form').removeData('validator');
    $('form').removeData('unobtrusiveValidation');
    let email = document.getElementById('login').value;
    let pessoa = this.get('pessoa');
    pessoa.set('email', email);
    let inputContainer = document.getElementById('login').closest('.form-group__input-container');
    let input = document.getElementById('login');
    // Pega alerta
    const errorCompartiment = document.getElementById('login-error');
    // Pega animação do alerta
    const alertAnimation = errorCompartiment.dataset.animation;
    // Pega container da mensagem a ser escrita
    const msg = errorCompartiment.querySelector('[class*="__msg"]');


    pessoa.verifyEmail({
      login: pessoa.get('email'),
      instituicaoId: this.get('escola').get('id')
    }).then(function (response) {
      errorCompartiment.classList.remove('alert--is-show', alertAnimation);
      inputContainer.classList.add('form-group__input-container--is-validated');
    }).catch(function (error) {
      if (error.errors) {

        inputContainer.classList.remove('form-group__input-container--is-validated');
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
          errorMsg = 'Ocorreu um erro no sistema, mas não se preocupe! Nossos desenvolvedores já foram alertados.'
        } else {
          errorMsg = 'Ops! Parece que não conseguimos conexão com nossos servidores. Por favor, tente novamente em instantes.'
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

    const passAlert = document.getElementById('pass-error');
    const alertAnimation = passAlert.dataset.animation;
    const msg = passAlert.querySelector('[class*="__msg"]');
    const errorMsg =  'As senhas digitadas ainda não são iguais.';
    const inputsPass = document.querySelectorAll(".j-password");

   
    if ((p1.length > 0 && p2.length > 0) && (p1 === p2)) {
      document.getElementById('submit').setAttribute('dataDisabled', 'false');
      passAlert.classList.remove('alert--is-show');
      inputsPass.forEach(input => {
        input.classList.add('form-group__input-container--is-validated');
      });
     
    } else if (p1.length > 0 || p2.length > 0) {
      document.getElementById('submit').setAttribute('dataDisabled', 'true');
      //document.getElementById('submit').classList.add("btn--disabled");
      inputsPass.forEach(input => {
        input.classList.remove('form-group__input-container--is-validated');
      });
      passAlert.classList.add('alert--is-show', alertAnimation);
      msg.innerHTML = '<strong>' + errorMsg + '</strong>';
    }
  },

 

  createUser: function () {
    this.verifyPasswordLength();
    if (this.verifyPasswordLength()) {
      let button = document.getElementById('submit');
      button.innerHTML = "Aguarde..."
      let password = document.getElementById('senha').value;
      let login = document.getElementById('login').value;
      let sistemas = this.get('store').peekAll('sistema');
      let sistema;
      sistemas.forEach(function (s) {
        if (s.get('idx') == 1) {
          sistema = s;
        }
      });
      let pessoa = this.get('pessoa');
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
         // Se existe um erro qualificado
        if (error.errors) {
             
          button.innerHTML = 'Avançar';
          // Pega alerta
          const errorCompartiment = document.getElementById('codigo-error');
          // Pega animação do alerta
          const alertAnimation = errorCompartiment.dataset.animation;
          // Pega container da mensagem a ser escrita
          const msg = errorCompartiment.querySelector('[class*="__msg"]');
          // Pega a identificação do erro
          const errorStatus =  error.errors[0].status;
         
          // Define mensagem de erro, caso seja o erro XYZ
          let errorMsg = "Ops! Tivemos um problema para registrar seu usuário. Tente novamente em instantes."
         
          // Injeta mensagem de erro.
          msg.innerHTML = '<strong>' + errorMsg + '</strong>';
  
          // Confere se o elemento já está aparecendo
          if(!errorCompartiment.classList.contains('alert--is-show')) {
            // Adiciona duas classes: uma para o alerta aparecer e outra com a animação definida no html, por meio de data-SBRUBLES
            errorCompartiment.classList.add('alert--is-show', alertAnimation);
          }
  
  
          } 
        else {
          that.get('session').authenticate('authenticator:authold', login, password, 1).then(() => {}).catch((reason) => {});
        }
      })

    };
  }
},
});
