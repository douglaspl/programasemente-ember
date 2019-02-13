import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ENV from '../config/environment';

export default Route.extend(AuthenticatedRouteMixin, {
  env: ENV.APP,
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  goToStepTwo: false,
  userName: null,
  afterModel() {
    if (this.get('session.isAuthenticated')) {
      this.firstAccessVerify();
      //this.transitionTo('/webapp');
    }
  },
  firstAccessVerify() {
    console.log('index.js');
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
              console.log(log.role);
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
                else window.location = '/firstaccess';
              else window.location = '/webapp';
            } else {
              console.log('n role');
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
                if (hasTo === true) window.location = '/firstaccess';
                else window.location = '/webapp';
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
});
