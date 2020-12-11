import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../../config/environment';


export default Controller.extend({
  //       // setup our query params
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
  uri_avatar: Ember.computed('model', function(){
    let pessoa = this.get('model');
    if (pessoa.get('uriAvatar')){
      return pessoa.get('uriAvatar');
    }
    return new Ember.String.htmlSafe("/assets/img/avatar-default.svg");
  }),
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
  toogleModal(target) {
    var el = document.getElementById(target);
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
  },
  change_uri_avatar() {
    let obj = localStorage.getItem('person_logged');
     if (obj) {
       let that = this;
       this.get('store').findRecord('pessoa', JSON.parse(obj).id, {
         reload: true
       }).then(function (pessoa) {
         debugger;
         let av = pessoa.get('uriAvatar');
         if (av) {
           that.set('uri_avatar', new Ember.String.htmlSafe(av));
          //  that.get('applicationController').set('uri_avatar', new Ember.String.htmlSafe(av))
         } else {
           that.set('uri_avatar', new Ember.String.htmlSafe("/assets/img/avatar-default.svg"));
         }
       });
       debugger;
     }
   },
  // buscarArquivoAvatar() {
  //   debugger; 
  //   var input = document.getElementById('arquivoAvatar');
  //   let file_name = input.files[0].name;
  //   this.set('selected_file_avatar', file_name);
  //   var reader = new FileReader();
  //   reader.onload = function (e) {
  //     document.getElementById("avatar-modale").style.backgroundImage = "url(" + e.target.result + ")";
  //   }
  //   reader.readAsDataURL(input.files[0]);
  // },
  sendAvatarToServer() {
    let file = document.getElementById('arquivoAvatar').files[0];
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
        xhr.setRequestHeader('filename', document.getElementById('arquivoAvatar').files[0].name);
        xhr.send(file);

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
    }
  },
  //  sendAvatarToServer(file) {
  //   let header = localStorage.getItem('person_logged');
  //   let header_inst;
  //   if (header) {
  //     header = JSON.parse(header);
  //     header_inst = header.id;
  //   } else header_inst = "";
  //   let sessionData = this.get('session.data');
  //   let tok = sessionData.authenticated.access_token;
  //   let temp = 'Bearer ';
  //   let userToken = temp.concat(tok);
  //   let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/avatar';
  //   return new Ember.RSVP.Promise(function (resolve, reject) {
  //     let xhr = new XMLHttpRequest();
  //     xhr.open('POST', final_url);
  //     xhr.responseType = 'json';
  //     xhr.onreadystatechange = handler;
  //     xhr.setRequestHeader('Accept', 'application/json');
  //     xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
  //     xhr.setRequestHeader('pessoaid', header_inst);
  //     xhr.setRequestHeader('Authorization', userToken);
  //     xhr.setRequestHeader('filename', document.getElementById('arquivoAvatar').files[0].name);
  //     xhr.send(file);

  //     function handler() {
  //       if (this.readyState === this.DONE) {
  //         if (this.status === 200 || this.status === 204) {
  //           resolve(this.response);
  //         } else if (this.status === 404) {
  //           reject('Server not found');
  //         } else if (this.status >= 400) {
  //           reject(new Error(this.response.error));
  //         } else {
  //           reject(new Error('Failure from server call: [' + this.status + ']'));
  //         }
  //       }
  //     }
  //   });
  // },
  changePassSetup() {
      $('#pass_new').val('');
      $('#pass_new_copy').val('');
      $('#msg-new-pass-success').removeClass('form__msg--on');
      $('#msg-new-pass-warning').removeClass('form__msg--on');
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
    toggleAvatarModal(){
      this.toogleModal('change_image_modal');
    },
    buscarArquivoAvatar() {
      var input = document.getElementById('arquivoAvatar');
      let file_name = input.files[0].name;
      this.set('selected_file_avatar', file_name);
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("avatar-modale").style.backgroundImage = "url(" + e.target.result + ")";
      }
      reader.readAsDataURL(input.files[0]);

      if (input.files[0]){
        this.send('sendAvatar');
      }
    },
    sendAvatar() {
      let file_avatar = document.getElementById('arquivoAvatar').files[0];
      this.set('avatar_loading', true);
      if (file_avatar) {
        let that = this;
        this.sendAvatarToServer(file_avatar).then(() => {
          // this.toogleModal('change_image_modal');
          that.change_uri_avatar();
          that.set('avatar_loading', false);
        }).catch((erro) => {
          that.set('error_avatar', erro);
          that.set('avatar_loading', false);
        });
      } else {
        this.set('selected_file_avatar', '');
        this.set('avatar_loading', false);
      }
    },
    togglePassModal(){
      this.toogleModal('change_pass_modal');
      changePassSetup();
    },
    changePw() {
      debugger;
      let pwd_old = document.getElementById('pass').value;
      let pwd_new = document.getElementById('pass_new').value;
      let pwd_conf = document.getElementById('pass_new_copy').value;
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
          that.set('error_pwd', '');
          document.getElementById("change_pass_modal").classList.remove('modal--is-show');
          document.getElementsByTagName('body')[0].style.overflow = 'auto';
        }).catch(() => {
          that.set('success_pwd', '');
          that.set('error_pwd', 'A senha atual informada não está correta.');
        });
      }
    },
    updatePasswordChanged() {
      this.set('passwordChanged', true);
    }

  }
});
