import Ember from 'ember';

export function detectIE11() {
  let ua = window.navigator.userAgent;

  if (ua.indexOf('Trident/') > 0) {
    let rv = ua.indexOf('rv:');

    if (parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10) == 11) return true;
    else return false;
  }
}

export default Ember.Helper.helper(detectIE11);
