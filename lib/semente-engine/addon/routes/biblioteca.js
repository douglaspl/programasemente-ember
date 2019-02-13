import Route from '@ember/routing/route';
import Ember from 'ember';
import ENV from '../config/environment';

export default Route.extend({
  store: Ember.inject.service(),
  env: ENV.APP,
  session: Ember.inject.service('session'),
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  beforeModel() {
    if (!localStorage.getItem('person_logged')) // if the user had not selected an institution, then do not load
      this.transitionTo('index');
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
  model() {
    let pessoaId = JSON.parse(localStorage.getItem('person_logged')).id;
    const url = this.get('env.host') + '/' + this.get('env.namespace') + '/data-visualizacao-biblioteca/' + pessoaId;
    let params = JSON.stringify({
      "data": {
        "type": "data-visualizacao-biblioteca",
        "id": pessoaId.toString(),
      }
    });

    this.makeCustomCall('PATCH', url, params).then(() => {
      const notificationNumber = document.getElementById('j-libraryNotificationNumber'); //counter__bubble--is-show
      
      notificationNumber.innerHTML = '';
      notificationNumber.classList.remove('counter__bubble--is-show');
    }).catch(() => {});
  },
  actions: {},
});
