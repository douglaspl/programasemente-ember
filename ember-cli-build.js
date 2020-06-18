/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
// const isProduction = EmberApp.env() === 'production';

// const purgeCSS = {
//   module: require('@fullhuman/postcss-purgecss'),
//   options: {
//     content: [
//       // add extra paths here for components/controllers which include tailwind classes
//       './app/index.html',
//       './app/templates/**/*.hbs'
//     ],
//     defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
//   }
// }

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    fingerprint: {
      exclude: ['jpg', 'png', 'ico', 'fontawesome']
    },

    'ember-bootstrap': {
      'bootstrapVersion': 3,
      'importBootstrapFont': false,
      'importBootstrapCSS': false
    },

    'ember-font-awesome': {
      removeUnusedIcons: false
    } // The addon will not remove unused icons, not even in production. }
    ,

    'ember-service-worker': {
      versionStrategy: 'every-build'
    },

    autoprefixer: {
      browsers: ['last 3 versions']
    },

    'ember-cli-babel': {
      includePolyfill: true
    },

    'sourcemaps': {
      enabled: true,
      extensions: ['js', 'css', 'scss'],
      mapCommentType: "block"

    },

    // postcssOptions: {
    //   compile: {
    //     plugins: [
    //       {
    //         module: require('postcss-import'),
    //         options: {
    //           path: ['node_modules']
    //         }
    //       },
    //       require('tailwindcss')('./app/tailwind/config.js'),
    //       ...isProduction ? [purgeCSS] : []
    //     ]
    //   }
    // }

  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
