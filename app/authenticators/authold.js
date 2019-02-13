import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import fetch from 'fetch';
import ENV from '../config/environment';

const { RSVP: { Promise }, isEmpty, run, assign: emberAssign, merge, computed } = Ember;
const assign = emberAssign || merge;

const JSON_CONTENT_TYPE = 'application/json';

export default BaseAuthenticator.extend({
  envnmt: ENV.APP,
  serverTokenEndpoint: Ember.computed('envnmt', function() { //this will define if the server endpoint for the API calls are relative or absolute. Dev - absolute API endpoint; Prod - relative
    return this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/auth/login';
  }),
  rejectWithXhr: computed.deprecatingAlias('rejectWithResponse', {
    id: `ember-simple-auth.authenticator.reject-with-xhr`,
    until: '2.0.0'
  }),
  rejectWithResponse: false,
  restore(data) {
    return this._validate(data) ? Promise.resolve(data) : Promise.reject();
  },

  authenticate(identification, password, life) {
    return new Promise((resolve, reject) => {
      const useResponse = this.get('rejectWithResponse');
      let data = 'UserName=' + identification + '&password='+ password + '&grant_type=password&KeepLogged=' + life;
    //    + remember;
      this.makeRequest(data).then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            if (this._validate(json)) {
              const _json = json;
              run(null, resolve, _json);
            } else {
              run(null, reject, `Check that server response includes a token`);
            }
          });
        } else {
          if (useResponse) {
            run(null, reject, response);
          } else {
            response.json().then((json) => run(null, reject, json));
          }
        }
      }).catch((error) => run(null, reject, error));
    });
  },

  invalidate() {
    return Promise.resolve();
  },

  makeRequest(data, options = {}) {
    let url = options.url || this.get('serverTokenEndpoint');
    let requestOptions = {};
    let body = data;
    assign(requestOptions, {
      body,
      method:   'POST',
      headers:  {
        'Accept': 'application/json, text/javascript',
        'Content-Type': JSON_CONTENT_TYPE,
        'Data-Type': 'json'
      }
    });
    assign(requestOptions, options || {});

    return fetch(url, requestOptions);
  },

  _validate(data) {
    return !isEmpty(data['access_token']);
  }
});