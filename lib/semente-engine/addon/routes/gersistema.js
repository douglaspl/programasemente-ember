import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';
import ENV from '../config/environment';

export default Route.extend({
  store: Ember.inject.service(),
  env: ENV.APP,
  session: Ember.inject.service('session'),
  beforeModel() {
    if (!localStorage.getItem('person_logged')) { // if the user had not selected an institution, then do not load
      this.transitionTo('index');
    }
  },
  makeRequest(type_request) { //always requesting without header 'pessoaid' will retrieve the data from the user which bears the stored token
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let tgt_url = this.get('env.host') + '/' + this.get('env.namespace') + '/' + type_request + '?include=modulos.atividades';
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
            resolve(this.response);
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
  model() {
    let person = JSON.parse(localStorage.getItem('person_logged'));
    let role = person.role;
    let inst_id = person.instituicao_id;
    if (role === 'admin') {
      return this.makeRequest('instituicoes');
      // return RSVP.hash({
      //   instituicoes: this.get('store').findAll('instituicao', {
      //     include: 'areas, modulos'
      //   }),
      //   modulos: this.get('store').findAll('modulo'),
      // });
    } else {
      let request = 'instituicoes/' + inst_id;
      return this.makeRequest(request);
      // return RSVP.hash({
      //   instituicoes: this.get('store').findRecord('instituicao', inst_id, {
      //     include: 'areas, modulos'
      //   }),
      //   modulos: this.get('store').findAll('modulo'),
      // });
    }
  },
  actions: {
    willTransition(transition) {
      if (transition.targetName != 'webapp.semente-engine.gersistema.gerdata.index') {
        if (this.controller.get('instView') == true) {
          this.controller.set('instView', false);
        }
      }
    },
    refreshAll() {
      this.refresh();
    }
  }
});
