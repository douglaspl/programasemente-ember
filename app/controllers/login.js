import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Controller.extend({
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  session: Ember.inject.service('session'),
  mostraAviso: false,

  detectIE() {
   
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      var rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge');
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
  },


  init: function () {
    this._super();
    var version = this.detectIE();
      if (version === false) {
     this.set('mostraAviso', false)
    } else {
      this.set('mostraAviso', true)
    } 
    
    // Caps lock detection
    let that = this;
    window.addEventListener("keydown", function (e) {
    
      if (that.get('mostraAviso') == false) {
       if (navigator.vendor != 'Apple Computer, Inc.') {
         const caps = e.getModifierState && e.getModifierState('CapsLock');
         const msg = document.getElementById('msg-caps-on');
   
         if (caps) msg.classList.add('form__msg--on');
         else msg.classList.remove('form__msg--on');
       }
      }
    })

  },
















  makeCustomCall(verb, url, json) {
    let header = localStorage.getItem('person_logged');
    let header_person;
    if (header) {
      header = JSON.parse(header);
      header_person = header.id;
    } else {
      header_person = "";
    }
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open(verb, url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      // xhr.withCredentials = true; // does not permit request answer due to cross-origin. Can be activated when in production
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.setRequestHeader('data-type', 'application/json');
      xhr.setRequestHeader('pessoaid', header_person);
      xhr.setRequestHeader('Authorization', userToken);
      xhr.send(json);

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200 || this.status === 204) {
            resolve(this.response);
          } else if (this.status === 404) { //server unable to answer
            reject('Server not found');
          } else if (this.status >= 400) {
            reject(new Error(this.response.error));
          } else {
            reject(new Error('Failure from server call: [' + this.status + ']'));
          }
        }
      }
    });
  },
 
  actions: {
    passwordVisibility() {
      document.querySelector('.login__show-pass').classList.toggle('login__show-pass--is-show');

      const password = document.getElementById('password');
      if (password.type == 'password') password.type = 'text';
      else password.type = 'password';
    },
    authenticate() {
     
      document.getElementById('login_button').disabled = true;
      document.getElementById('login_button').innerHTML = 'Aguarde...'

      function trim(stringToTrim) {
        return stringToTrim.replace(/^\s+|\s+$/g, "");
      }
      let life = 1;
      //if (document.getElementById('remember').checked) life = 1;
      let username = document.getElementById('identification').value;
      let password = trim(document.getElementById('password').value);
      if (this.get('session.isAuthenticated')) {
        localStorage.clear();
        this.get('session').invalidate();
        return;
      }


      this.get('session').authenticate('authenticator:authold', username, password, life).then(() => {}).catch((reason) => {
        let that = this;
        if (reason.error_description) {
          that.set('errorMessage', reason.error_description);
          that.set('success_mail', '');
          document.getElementById('login_button').innerHTML = 'Entrar'
        } else if (reason) {
          that.set('errorMessage', reason.error || reason);
          that.set('success_mail', '');
        } else {
          that.set('errorMessage', 'Erro desconhecido');
          that.set('success_mail', '');
        }
        document.getElementById('login_button').disabled = false;
      });
    },
    forgotPass() {
      document.getElementById('forgot_modal').classList.remove('fadeOutDown');
      let email = document.getElementById('identification').value;
      this.set('user_email', '');
      if (email) {
        if (email.length > 4 && email.search('@') > 3) {
          this.set('user_email', email);

        }
      }
      this.set('error_forgot', '');
      this.set('success_mail', '');
      this.set('errorMessage', '');
      document.getElementById('forgot_modal').classList.add('modal--is-show');
      let usernameInput = document.getElementById('user_name');
      usernameInput.value = email;
      usernameInput.focus();
    },
    autoRegister() {
      this.transitionToRoute('autoregister');
    },
    cancelForgot() {

      document.getElementById('checkboxes_container').classList.remove('fadeInLeftShort');
      document.getElementById('success-forgot').style.display = 'none';
      document.getElementById('error-forgot').style.display = 'none';
      document.getElementById('forgot_modal').classList.add('fadeOutDown');
      document.getElementById('forgot_modal').classList.remove('modal--is-show');
      document.getElementById('user_name').value = '';
      document.getElementById('user_name').disabled = false;
      document.getElementById('group-email').style.display = 'none';
      document.getElementById('group-sms').style.display = 'none';
      document.getElementById('btn-verify-user-name').style.display = 'block';
      document.getElementById('btn-send-password').style.display = 'none';
      this.set('user_name', '');
      this.set('success_mail', '');
      this.set('error_forgot', '');
    },
    sendMail() {
      let mail = document.getElementById('user_email').value;
      if (mail.length < 5 || mail.search('@') < 2) {
        this.set('error_forgot', 'Favor inserir endereço de e-mail válido');
      } else {
        let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/' + 'accounts/resetPassword';
        let string = JSON.stringify({
          'data': {
            'id': '1',
            'type': 'email',
            'attributes': {
              'email': mail
            }
          }
        });

        let that = this;
        this.makeCustomCall('POST', final_url, string).then(() => {
          that.set('user_email', '');
          that.set('error_forgot', '');
          that.set('success_mail', 'Sucesso! Um e-mail com a nova senha foi enviado');
          this.set('errorMessage', '');
          document.getElementById('forgot_modal').style.display = 'none';
        }).catch((error) => {
          that.set('success_mail', '');
          that.set('error_forgot', 'Erro do servidor: ' + error);
          this.set('errorMessage', '');
        });
      }
    },
    sendPassword(type) {
      let checkEmail = document.getElementById('forgot-email');
      let checkSms = document.getElementById('forgot-sms');
      let btnSend = document.getElementById('btn-send-password');
      let checkboxesContainer = document.getElementById('checkboxes_container');
      let feedbackMsg;

      let email = false;
      let phone = false;



      if (!type) {
        if (!checkEmail.checked && !checkSms.checked) {
          this.set('error_forgot', 'Por favor, escolha pelo menos uma das opções acima');
          document.getElementById('error-forgot').style.display = 'block';
          document.getElementById('success-forgot').style.display = 'none';
          return false
        }

        if (checkSms.checked) {
          phone = true;
        }
        if (checkEmail.checked) {
          email = true;
        }
      } else {
        if (type === "phone") {
          phone = true;
        }
        if (type === "email") {
          email = true;
        }
      }
      let userName = document.getElementById('user_name').value;
      let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/' + 'accounts/sendPassword';
      let string = JSON.stringify({
        'data': {
          'id': '1',
          'type': 'send-password',
          'attributes': {
            'user-name': userName,
            "phone": phone,
            "email": email
          }
        }
      });

      if (email && phone) {
        feedbackMsg = 'Nova senha enviada com sucesso'
      } else if (email && !phone) {
        feedbackMsg = 'Nova senha enviada com sucesso para o seu e-mail'
      } else if (!email && phone) {
        feedbackMsg = 'Nova senha enviada com sucesso para o seu celular'
      }


      let that = this;
      btnSend.innerHTML = 'Enviando...';
      this.makeCustomCall('POST', final_url, string).then(() => {
        document.getElementById('error-forgot').style.display = 'none';
        document.getElementById('success-forgot').style.display = 'block';
        that.set('success_forgot', feedbackMsg);
        that.set('error_forgot', '');
        document.getElementById('btn-send-password').style.display = 'none';
        btnSend.innerHTML = 'Enviar senha';
        checkboxesContainer.style.display = 'none';
      }).catch((error) => {
        document.getElementById('error-forgot').style.display = 'block';
        document.getElementById('success-forgot').style.display = 'none';
        that.set('error_forgot', 'Erro do servidor: ' + error);
        that.set('success_forgot', '');
        btnSend.innerHTML = 'Enviar Senha';
      });
    },
    verifyUserName() {
      let userName = document.getElementById('user_name').value;
      let checkboxesContainer = document.getElementById('checkboxes_container');
      let groupEmail = document.getElementById('group-email');
      let groupSMS = document.getElementById('group-sms');
      let errorContainer = document.getElementById('error-forgot');

      checkboxesContainer.style.display = 'block';

      let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/' + 'accounts/verifyUserName';
      let string = JSON.stringify({
        'data': {
          'id': '1',
          'type': 'user-name',
          'attributes': {
            'user-name': userName
          }
        }
      });

      let that = this;
      this.makeCustomCall('POST', final_url, string).then((data) => {
        var result = data.data.attributes;
        if (!result.exists) {
          groupEmail.style.display = 'none';
          groupSMS.style.display = 'none';
          errorContainer.style.display = 'block';
          that.set('error_forgot', 'Usuário não cadastrado!');
          return;
        }
        if (result.hasEmail && result.hasPhone) {
          checkboxesContainer.classList.add('fadeInLeftShort');
          document.getElementById('user_name').disabled = true;
          document.getElementById('btn-verify-user-name').style.display = 'none';
          document.getElementById('btn-send-password').style.display = 'block';
          groupEmail.style.display = 'block';
          groupSMS.style.display = 'block';
          errorContainer.style.display = 'none';
          that.set('error_forgot', 'Usuário não cadastrado!');
          return;

        }
        if (result.hasEmail && !result.hasPhone) {
          document.getElementById('btn-verify-user-name').style.display = 'none';
          this.send('sendPassword', 'email');
          return;
        }
        if (!result.hasEmail && result.hasPhone) {
          document.getElementById('btn-verify-user-name').style.display = 'none';
          this.send('sendPassword', 'phone');
          return;
        }
        if (!result.hasEmail && !result.hasPhone) {
          groupEmail.style.display = 'none';
          groupSMS.style.display = 'none';
          errorContainer.style.display = 'block';
          that.set('error_forgot', 'Não temos seu email e seu telefone. Por favor, entre em contato com a escola para receber sua senha');
          return;
        }

      }).catch((error) => {
        that.set('error_forgot', 'Erro do servidor: ' + error);
      });
    }
  },

});
