import Ember from 'ember';
import TokenAuthenticator from 'ember-simple-auth-token/authenticators/jwt';
import fetch from 'fetch';
import ENV from '../config/environment';

const assign = Ember.assign || Ember.merge;

export default  TokenAuthenticator.extend({
  makeRequest(url, credentials, headers) {
    let content_data = 'UserName=' + credentials.username + '&password='+ credentials.password + '&grant_type=password&KeepLogged=' + credentials.remember;
    return Ember.$.ajax({
      url: url,
      method: 'POST',
      // data: JSON.stringify(data),
      data: content_data,
      dataType: 'json',
      contentType: 'application/json',
      headers: this.headers,
      beforeSend: (xhr, settings) => {
        if(this.headers['Accept'] === null || this.headers['Accept'] === undefined) {
          xhr.setRequestHeader('Accept', settings.accepts.json);
        }

        if (headers) {
          Object.keys(headers).forEach((key) => {
            xhr.setRequestHeader(key, headers[key]);
          });
        }
      }
    });
  },
  handleAuthResponse(response) {
    const token = Ember.get(response, 'access_token');

    if (Ember.isEmpty(token)) {
      throw new Error('Token is empty. Please check your backend response.');
    }

    const tokenData = this.getTokenData(token);
    // const user_role = tokenData.role.toLowerCase();
    // localStorage.setItem('user_role', user_role);
    const expiresAt = Ember.get(tokenData, this.tokenExpireName);
    const tokenExpireData = {};

    tokenExpireData[this.tokenExpireName] = expiresAt;

    this.scheduleAccessTokenRefresh(expiresAt, token);

    return assign(this.getResponseData(response), tokenExpireData);
  },

  authenticate(credentials, headers) {
    return new Ember.RSVP.Promise((resolve, reject) => {      
      this.makeRequest(this.serverTokenEndpoint, credentials, headers)
        .then((response) => {
          Ember.run(() => {
            try {
              const sessionData = this.handleAuthResponse(response);

              resolve(sessionData);
            } catch (error) {
              reject(error);
            }
          });
        }, (xhr) => {
          Ember.run(() => { reject(xhr.responseJSON || xhr.responseText); });
        });
    });
  },
});