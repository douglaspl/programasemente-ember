import Controller from '@ember/controller';
import ENV from '../config/environment';
import Ember from 'ember';

export default Controller.extend({
  env: ENV.APP,
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  goToStepTwo: false,
  userName: null,
  firstAccessVerify() {
    //always requesting without header 'pessoaid' will retrieve the data from the user which bears the stored token
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let tgt_url = this.get('env.host') + '/' + this.get('env.namespace') + '/pessoas?include=instituicao';
    let that = this;
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', tgt_url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      // xhr.withCredentials = true; // does not permit request answer due to cross-origin. Can be activated when in production
      xhr.setRequestHeader('Authorization', userToken);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.setRequestHeader('data-type', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200 || this.status === 204) {
            let data = this.response.data;
            let included = this.response.included;
            if (!data) {
              let temp = JSON.parse(this.response);
              data = temp.data;
              included = temp.included;
            }
            // --------------------------------------------------------
            // ------------------- FIRST ACCESS -----------------------
            // --------------------------------------------------------
            let logStorage = localStorage.getItem('person_logged');
            let log = JSON.parse(logStorage);
            if (logStorage) {
              // ------------------------------------ institution param 
              let institutions = included.filter(function (i) {
                return i.id === log.instituicao_id;
              });
              let institutionChangePasswordParam = institutions[0].attributes.trocasenhaobrigatoria;
              // ---------------------------------------- account param
              let accounts = data.filter(function (i) {
                return i.id === log.id;
              });
              let accountChangePasswordParam = accounts[0].attributes.trocousenha;
              // ----------------------------------------- verification
              if (institutionChangePasswordParam === true)
                if (accountChangePasswordParam === 1) window.location = '/webapp';
                else window.location = '/webapp';
            } else {
              let logData, name, trocousenha, hasTo;

              name = data[0].attributes.name;
              trocousenha = data[0].attributes.trocousenha;
              let hasToVerify = included.filter(function (i) {
                return i.attributes.trocasenhaobrigatoria === true;
              });

              if (hasToVerify[0]) hasTo = true;
              else hasTo = false;

              if (trocousenha === 0) {
                logData = '{"name":"' + name + '","trocousenha":"' + trocousenha + '","hasTo":"' + hasTo + '"}';
                localStorage.setItem('log_data', logData);
                if (hasTo !== true) window.location = '/webapp';
              } else {
                localStorage.removeItem('log_data');
                window.location = '/webapp';
              }
            }
            // --------------------------------------------------------
            // --------------------------------------------------------
            // --------------------------------------------------------
            resolve(data);
          } else if (this.status === 400 || this.status === 500) {
            reject(new Error(this.response.error));
          } else if (this.status === 401) {
            localStorage.clear();
            that.get('session').invalidate();
          } else {
            reject(new Error('Failure from server call: [' + this.status + ']'));
          }
        }
      }
    });
  },
  async getUserName() {
    await this.firstAccessVerify();
    document.getElementById('firstAccess').style.display = 'inherit';
    document.getElementById('firstAccessLoader').style.display = 'none';
    var data = localStorage.getItem('person_logged');
    if (data) {
      data = "[" + data + "]";
      var dataLoged = JSON.parse(data);
      var dataName = dataLoged[0].name;
      this.set('userName', dataName);
    } else {
      var temp = localStorage.getItem('log_data');
      if (temp) {
        temp = "[" + temp + "]";
        var tempLoged = JSON.parse(temp);
        var tempName = tempLoged[0].name;
        this.set('userName', tempName);
      } else {
        this.set('userName', 'Usuário');
      }
    }
  },
  model() {
    return this.getUserName();
  },
  init: function () {
    this._super();
    this.getUserName();
  },
  makeCustomCall(verb, url, json) {
    let header = localStorage.getItem('person_logged');
    let header_inst;
    if (header) {
      header = JSON.parse(header);
      header_inst = header.id;
    } else {
      header_inst = "";
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
      xhr.setRequestHeader('pessoaid', header_inst);
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
  passwordsVerify: document.getElementsByTagName("body")[0].addEventListener("keyup", function (e) {
    let actionTxt = document.getElementById('actionTxt');
    let targetElement = e.target;
    let oldPass = document.getElementById('pwd_old');
    let newPass = document.getElementById('pwd_new');
    let confirmPass = document.getElementById('pwd_conf');

    if (targetElement == oldPass ||
      targetElement == newPass ||
      targetElement == confirmPass ||
      targetElement == document.getElementsByClassName('global-nav__thumb')[0]
    ) {
      actionTxt.innerHTML = '';

      // confirm pass
      if (confirmPass.value.length != 0) {
        if (confirmPass.value.length >= 6) {
          if (newPass.value != confirmPass.value) {
            actionTxt.innerHTML = 'Nova senha e de confirmação não conferem.';
          } else {
            actionTxt.innerHTML = 'As senhas conferem.'
          }
        } else {
          actionTxt.innerHTML = 'Confirme a Senha: Mínimo de 6 caracteres.';
        }
      } else {
        actionTxt.innerHTML = 'Confirme a senha.';
      }

      // new pass
      if (newPass.value.length != 0) {
        if (newPass.value.length <= 5) {
          actionTxt.innerHTML = ' Nova Senha: Mínimo de 6 caracteres.';
        } else {
          if (newPass.value == oldPass.value) {
            actionTxt.innerHTML = 'Nova senha deve ser diferente da senha atual.';
          }
        }
      } else {
        actionTxt.innerHTML = 'Informe a nova senha.';
      }

      // old pass
      if (oldPass.value.length != 0) {
        if (oldPass.value.length <= 5) {
          actionTxt.innerHTML = 'Senha Atual: Mínimo de 6 caracteres.';
        }
      } else {
        actionTxt.innerHTML = 'Informe a senha atual.';
      }
    }
  }),
  actions: {
    changePw() {
      let pwd_old = document.getElementById('pwd_old').value;
      let pwd_new = document.getElementById('pwd_new').value;
      let pwd_conf = document.getElementById('pwd_conf').value;
      this.set('success_pwd', '');
      this.set('error_pwd', '');
      if (pwd_new.length < 6) {
        this.set('error_pwd', 'Mínimo de 6 caracteres.');
      } else if (pwd_old === pwd_new) {
        this.set('error_pwd', 'Nova senha deve ser diferente da senha atual.');
      } else if (pwd_new !== pwd_conf) {
        this.set('error_pwd', 'Nova senha e confirmação devem ser iguais.');
      } else {
        let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/accounts/changePassword';
        //   let final_url =  'http://www.sementeapi.minimo.com.br' + '/' + 'api/v0' + '/' + 'accounts/changePassword';
        let string = JSON.stringify({
          'data': {
            'id': '1',
            'type': 'change-password',
            'attributes': {
              'oldpassword': pwd_old,
              'newpassword': pwd_new,
              'confirmpassword': pwd_conf
            }
          }
        });
        let that = this;
        this.makeCustomCall('POST', final_url, string).then(() => {
          that.set('success_pwd', 'Sucesso! Senha alterada');
          that.set('error_pwd', '');
          this.set('goToStepTwo', true);
          localStorage.removeItem('log_data');
        }).catch(() => {
          that.set('success_pwd', '');
          that.set('error_pwd', 'A senha atual informada não está correta.');
        });
      }
    },
  }
});
