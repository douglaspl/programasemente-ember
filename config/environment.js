/* eslint-env node */
// 'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'semente-web-app',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
        'ds-improved-ajax': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      host: 'http://localhost:64568',
      // host:  'http://sementeapidev.minimo.com.br',
      // host:  'https://sementeapi.minimo.com.br',
      // host:  'https://p21.minimo.com.br',
      namespace: 'api/v0',
      // when it is created
    }
  }

  if (environment === 'development') {
    ENV.rootURL = '/';
    ENV.APP.DOMAIN = "porto.com";
    // ENV.APP.host = 'http://localhost:64568';
    // ENV.APP.host = 'https://p21.minimo.com.br';
    ENV.APP.host = 'http://sementeapidev.minimo.com.br';
  }

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.APP.DOMAIN = "programasemente.com.br";
    ENV.APP.host = 'https://p21.minimo.com.br';
  }

  ENV['ember-simple-auth'] = {
    authorizer: 'authorizer:author',
    crossOriginWhitelist: ['*'],
  }

  ENV['ember-simple-auth-token'] = {
    serverTokenEndpoint: 'https://sementeapi.minimo.com.br/api/v0/auth/login',
    serverTokenRefreshEndpoint: 'https://sementeapi.minimo.com.br/api/v0/RefreshTokens',
    identificationField: 'username',
    passwordField: 'password',
    tokenPropertyName: 'token',
    refreshAccessTokens: false,
    authorizationPrefix: 'Bearer ',
    authorizationHeaderName: 'Authorization',
    headers: {},
  }

  return ENV;
};
