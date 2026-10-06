/* eslint-env node */
// 'use strict';

module.exports = function (environment) {
  let ENV = {
    adobeApiKey: "7394093839fe4f61a2a765cf77c2a8e8",
    //adobeApiKey: "ae3ff8c6c8214657b328029d60e02a44",
    // adobeApiKey: "03bbcac81d1a42679a353e4db5029d84",

    modulePrefix: 'semente-web-app',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        'ds-improved-ajax': true
      },
      EXTEND_PROTOTYPES: {
        Date: false
      }
    },

    APP: {
      host: 'https://semente-api.azurewebsites.net',
      // host: 'https://sementeapi.minimo.com.br',
      namespace: 'api/v0',
    }
  }

  ENV['ember-simple-auth'] = {
    authorizer: 'authorizer:author',
    crossOriginWhitelist: ['*'],
  }

  if (environment === 'production') {
    ENV.APP.DOMAIN = "sementeeducacao.com.br";
    ENV.APP.host = 'https://semente-api.azurewebsites.net';
    // ENV.APP.host = 'https://sementeapi.minimo.com.br';
  }

  if (environment === 'homolog') {
    ENV.APP.DOMAIN = "sementeeducacao.com.br";
    ENV.APP.host = 'https://semente-api-staging.azurewebsites.net';
  }

  if (environment === 'development') {
    ENV.adobeApiKey = "f04da9781afa4ebf871f5e4566d9bbe9",
    ENV.rootURL = '/';
    ENV.APP.DOMAIN = "porto.com";
    ENV.APP.host = 'https://localhost:44300';
    // ENV.APP.host = 'https://semente-api.azurewebsites.net';
  }

  ENV['ember-simple-auth-token'] = {
    serverTokenEndpoint: 'https://semente-api.azurewebsites.net/api/v0/auth/login',
    serverTokenRefreshEndpoint: 'https://semente-api.azurewebsites.net/api/v0/RefreshTokens',
    // serverTokenEndpoint: 'https://sementeapi.minimo.com.br/api/v0/auth/login',
    // serverTokenRefreshEndpoint: 'https://sementeapi.minimo.com.br/api/v0/RefreshTokens',
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
