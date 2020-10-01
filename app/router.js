import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('firstaccess'),
  this.route('webapp', function() {
    this.mount('semente-engine', {path: '/'});
  });
  // this.route('modulos', function() {
  //   this.route('modetails');
  // });
  this.route('firstaccess');
});

export default Router;