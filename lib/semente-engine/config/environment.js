/*jshint node:true*/
'use strict';

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'semente-engine',
    environment: environment,
    rootURL: '/',
    APP: {
      host: 'https://sementeapi.minimo.com.br',
      namespace: 'api/v0',
    }
  }

  ENV['ember-simple-auth'] = {
    authorizer: 'authorizer:author',
    crossOriginWhitelist: ['*'],
  }

  if (environment === 'development') {
   ENV.APP.host = 'http://localhost:64568';
    // ENV.APP.host = 'https://p21.minimo.com.br';
    //  ENV.APP.host = 'http://sementeapidev.minimo.com.br';
  }

if (environment === 'production') {
    ENV.APP.host = 'https://sementeapi.minimo.com.br';
}

  return ENV;
};
