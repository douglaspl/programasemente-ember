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
      //host: 'http://localhost:64567',
      host:  'https://www.sementeapimedio.minimo.com.br',
      namespace: 'api/v0',
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  }

  if (environment === 'development') {
    // ENV.APP.host = 'http://localhost:64567';
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.rootURL = '/';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  ENV['ember-simple-auth'] = {
    authorizer: 'authorizer:author',
    crossOriginWhitelist: ['*'],    
  }

  ENV['ember-simple-auth-token'] = {
    serverTokenEndpoint: 'https://www.sementeapimedio.minimo.com.br/api/v0/auth/login',
    serverTokenRefreshEndpoint: 'https://www.sementeapimedio.minimo.com.br/api/v0/RefreshTokens',
    // serverTokenEndpoint: 'http://www.sdsorocaba.esy.es/api/v0/auth/login',
    identificationField: 'username',
    passwordField: 'password',
    tokenPropertyName: 'token',
    // refreshAccessTokens: true,
    refreshAccessTokens: false,
    // refreshLeeway: 300, // Refresh the token 5 minutes (300s) before it expires.
    // tokenExpireName: 'exp',
    authorizationPrefix: 'Bearer ',
    authorizationHeaderName: 'Authorization',
    headers: {}, 
  }

  return ENV;
};
