/*jshint node:true*/
'use strict';

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'semente-engine',
    environment: environment,
    rootURL: '/',
    APP: {
      // host: 'https://sementeapi.minimo.com.br',
      // host: 'http://sementeapidev.minimo.com.br',
      host: 'http://localhost:64568',
      namespace: 'api/v0',
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  }

  ENV['ember-simple-auth'] = {
    authorizer: 'authorizer:author',
    crossOriginWhitelist: ['*'],
  }

  if (environment === 'development') {
    ENV.rootURL = '/';
    // ENV.APP.host = 'http://localhost:64567';
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  return ENV;
};
