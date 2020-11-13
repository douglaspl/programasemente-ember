import Controller from '@ember/controller';
import Ember from 'ember';

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  escola: Ember.computed('model', function(){
    let escola = this.get('model').get('instituicao');
    return escola;
  }),
  actions: {
    verifyEmail() {
      let email = document.getElementById('login').value;
      let pessoa = this.get('store').createRecord('pessoa',{ email: email });

      pessoa.verifyEmail({
        login: pessoa.get('email'),
        instituicaoId: this.get('escola').get('id')
      }).then(function(response){
        debugger;
      }).catch(function(error) {
        if (error.errors) {

          // ############ JSON voltando com erro da api

          document.getElementById('login-error').innerHTML = error.errors[0].title;
          // Pega alerta
          const errorCompartiment = document.getElementById('codigo-error');
          // Pega animação do alerta
          const alertAnimation = errorCompartiment.dataset.animation;
          // Pega container da mensagem a ser escrita
          const msg = errorCompartiment.querySelector('[class*="__msg"]');
          // Pega a identificação do erro
          const errorStatus =  error.errors[0].status;
          // Define mensagem de erro, caso seja o erro XYZ
          let errorMsg = errorStatus === "400" ? 'Por favor verifique código inserido.' : 'Ocorreu um erro geral, mas nossos desenvolvedores já foram alertados e iremos corrigir em breve.';

          // Injeta mensagem de erro.
          msg.innerHTML = '<strong>' + errorMsg + '</strong>';

          // Confere se o elemento já está aparecendo
          if(!errorCompartiment.classList.contains('alert--is-show')) {
            // Adiciona duas classes: uma para o alerta aparecer e outra com a animação definida no html, por meio de data-SBRUBLES
            errorCompartiment.classList.add('alert--is-show', alertAnimation);
          }

        } else {
          document.getElementById('login-error').innerHTML = '';
        }

      })

    },
    verifyPassword(){
      let p1 = document.getElementById('senha').value;
      let p2 = document.getElementById('senha2').value;
      if (p1 === p2) {
        document.getElementById('submit').disabled = false;
        document.getElementById('password-error').innerHTML = '';
      } else {
        document.getElementById('password-error').innerHTML = 'Senhas não batem';
      }
    },
    createUser(){
      let password = document.getElementById('senha').value;
      let login = document.getElementById('login').value;
      let sistemas = this.get('store').peekAll('sistema');
      let sistema;
      sistemas.forEach(function(s){
        if (s.get('idx') == 1){
          sistema = s;
        }
      })
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
      }).catch(function(error){
        that.get('session').authenticate('authenticator:authold', login, password, 1).then(() => {}).catch((reason) => {
        });
      })
    }
  }
});
