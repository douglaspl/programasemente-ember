import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../../config/environment';


export default Controller.extend({
  store: Ember.inject.service(),
  applicationController: Ember.inject.controller('application'),
  session: Ember.inject.service('session'),
  envnmt: ENV.APP,
  env: ENV.APP,
  shouldReview: Ember.computed('model', function(){
    let pessoa = this.get('model');
    if (pessoa.get('shouldReviewProfile')){
        this.transitionToRoute('profile.review', pessoa.get('id'));
    }
  }),
  uri_avatar: Ember.computed('model', function(){ //change avatar image
    let pessoa = this.get('model');
    if (pessoa.get('uriAvatar')){
      return pessoa.get('uriAvatar');
    }
    return new Ember.String.htmlSafe("/assets/img/avatar-default.svg");
  }),
  sendAvatarToServer() { //change avatar image
    let file = this.get('selected_file_avatar');
    let pessoalogged = JSON.parse(localStorage.getItem('person_logged'));
    if (file) {
      let header = localStorage.getItem('person_logged');
      let header_inst;
      if (header) {
        header = JSON.parse(header);
        header_inst = header.id;
      } else header_inst = "";
      let sessionData = this.get('session.data');
      let tok = sessionData.authenticated.access_token;
      let temp = 'Bearer ';
      let userToken = temp.concat(tok);
      let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/avatar';
      return new Ember.RSVP.Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', final_url);
        xhr.responseType = 'json';
        xhr.onreadystatechange = handler;
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
        xhr.setRequestHeader('pessoaid', header_inst);
        xhr.setRequestHeader('Authorization', userToken);
        xhr.setRequestHeader('filename', file.name);
        xhr.send(file);

        function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200 || this.status === 204) {
              let avatarBack = this.response.included[0].attributes['uri-avatar'];
              pessoalogged.uri_avatar = avatarBack;
              localStorage.setItem("person_logged", JSON.stringify(pessoalogged));
              resolve(this.response);
            } else if (this.status === 404) {
              reject('Server not found');
            } else if (this.status >= 400) {
              reject(new Error(this.response.error));
            } else {
              reject(new Error('Failure from server call: [' + this.status + ']'));
            }
          }
        }
      });
    }
  },
  instituicao: Ember.computed('model', function(){
    return this.get('model').get('instituicao');
  }),
  dataNascimento: Ember.computed('model', function(){
    let pessoa = this.get('model');
    if (pessoa.get('nascimento')){
      return pessoa.get('dataNascimento');
    }
    return 'sem data';
  }),
  pessoa: Ember.computed('model', function(){
    return this.get('model');
  }),
  passwordChanged: Ember.computed('', function() {
    return false;
  }),
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
          } else if (this.status === 404) {
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
    buscarArquivoAvatar: function(event) { //change avatar image
      const file = event.target.files[0];
      this.set('selected_file_avatar', file);
      let bloburl = URL.createObjectURL(file);
      this.set('uri_avatar', bloburl);
      this.get('model').set('uriAvatar', bloburl);
    },
    changePw() {
      let pwd_old = document.getElementById('pass_profile').value;
      let pwd_new = document.getElementById('pass_new_profile').value;
      let pwd_conf = document.getElementById('pass_new_profile_copy').value;
      this.set('success_pwd', '');
      this.set('error_pwd', '');
      if (pwd_new.length < 6) {
        this.set('error_pwd', 'Mínimo de 6 caracteres');
      } else if (pwd_new !== pwd_conf) {
        this.set('error_pwd', 'Nova senha e confirmação devem ser iguais');
      } else {
        let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/accounts/changePassword';
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
          setTimeout(() => {
            that.set('success_pwd', '');
          }, 5000);
          that.set('error_pwd', '');
          document.getElementsByTagName('body')[0].style.overflow = 'auto';
        }).catch(() => {
          that.set('success_pwd', '');
          that.set('error_pwd', 'A senha atual informada não está correta.');
        });
      }
    },
    updatePasswordChanged() {
      this.set('passwordChanged', true);
    },

    saveChanges() {
      let that = this;
      this.sendAvatarToServer().then(function(){
        that.get('pessoa').save().then(function(){
          window.location.reload(true);

        });
      });
    },

    refreshGenero(event) {
      this.get('pessoa').set('genero', event.target.value);
    },
    goToAulas(){
      window.history.back();
      // this.transitionToRoute('aulas');
    },
  }
});
