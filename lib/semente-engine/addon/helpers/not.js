import Ember from 'ember';

export function not(params) {
  return !params
}

export default Ember.Helper.helper(not);
