import Ember from 'ember';
import Route from '@ember/routing/route';
import ENV from '../config/environment';

export default Route.extend({
  env: ENV.APP,
  session: Ember.inject.service('session'),
  store: Ember.inject.service(),
  makeRequest(type_request) { //always requesting without header 'pessoaid' will retrieve the data from the user which bears the stored token
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let tgt_url = this.get('env.host') + '/' + this.get('env.namespace') + '/' + type_request + '?include=instituicao,modulos,matriculas,plataforma-anos';
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
            let resolver = this.response;
            let data = this.response.data;
            let included = this.response.included;
            if (!data) {
              let temp = JSON.parse(this.response);
              data = temp.data;
              included = temp.included;
            }
            data.forEach(obj => {
              let inst_id = obj.relationships.instituicao.data.id;
              let inst_obj = included.find(obj => {
                return obj.id === inst_id && obj.type === "Instituicao";
              });
              obj['instituicao_name'] = inst_obj.attributes.name;
              obj['instituicao_id'] = inst_id;
            });
            resolve(resolver);
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
  model() { // the model, for the application level, will retrieve the user role, which will configure the app links
    return this.makeRequest('pessoas');
  },
  actions: {
    didTransition() {
      let transited = this.controller.get('transited');
      if (transited) {
        this.controller.set('transited', false);
      } else {
        this.controller.set('transited', true);
      }
    },
  }
});
