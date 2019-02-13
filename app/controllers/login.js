import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Controller.extend({
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  session: Ember.inject.service('session'),
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
  capsLockDetection: window.addEventListener("keydown", function (e) {
    if (navigator.vendor != 'Apple Computer, Inc.') {
      const caps = e.getModifierState && e.getModifierState('CapsLock');
      const msg = document.getElementById('msg-caps-on');

      if (caps) msg.classList.add('form__msg--on');
      else msg.classList.remove('form__msg--on');
    }
  }),
  actions: {
    passwordVisibility() {
      document.querySelector('.login__show-pass').classList.toggle('login__show-pass--is-show');

      const password = document.getElementById('password');
      if (password.type == 'password') password.type = 'text';
      else password.type = 'password';
    },
    authenticate() {
      document.getElementById('login_button').disabled = true;
      let life = 0;
      if (document.getElementById('remember').checked) life = 1;
      let username = document.getElementById('identification').value;
      let password = document.getElementById('password').value;
      this.get('session').authenticate('authenticator:authold', username, password, life).then(() => {}).catch((reason) => {
        if (reason.error_description) {
          this.set('errorMessage', reason.error_description);
          this.set('success_mail', '');
        } else if (reason) {
          this.set('errorMessage', reason.error || reason);
          this.set('success_mail', '');
        } else {
          this.set('errorMessage', 'Erro desconhecido');
          this.set('success_mail', '');
        }
        document.getElementById('login_button').disabled = false;
      });
    },
    forgotPass() {
      let email = document.getElementById('identification').value;
      this.set('user_email', '');
      if (email) {
        if (email.length > 4 && email.search('@') > 3) {
          this.set('user_email', email);
          document.getElementById('user_email').value = email;
        }
      }
      this.set('error_forgot', '');
      this.set('success_mail', '');
      this.set('errorMessage', '');
      document.getElementById('forgot_modal').classList.add('modal--is-show');
    },
    cancelForgot() {
      document.getElementById('forgot_modal').classList.remove('modal--is-show');
      document.getElementById('user_email').value = '';
      this.set('user_email', '');
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
    }
  }
});
