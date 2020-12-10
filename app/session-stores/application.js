import Cookie from 'ember-simple-auth/session-stores/cookie';
import config from '../config/environment';

const oneYear = 365 * 24 * 60 * 60;

export default Cookie.extend({
  // set an explicit expiration time so session does not expire when window is closed
  cookieExpirationTime: oneYear,
  cookieDomain: `.${config.APP.DOMAIN}`
});
