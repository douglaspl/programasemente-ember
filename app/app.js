import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import './analytics';

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
  engines: {
    sementeEngine: {
      dependencies: {
        services: [ 
         'session',
         'store'
        ] 
     }
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
