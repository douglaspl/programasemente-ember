import Ember from 'ember';

export function not(params) {
  return !params[0]
}

export default Ember.Helper.helper(not);
