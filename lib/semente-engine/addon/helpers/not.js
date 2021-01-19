import Ember from 'ember';

export function not(params) {
  debugger;
  return !params[0]
}

export default Ember.Helper.helper(not);
