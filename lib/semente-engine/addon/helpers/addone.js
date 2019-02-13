import Ember from 'ember';

export function addone(param) {
  return parseInt(param) + 1;
}

export default Ember.Helper.helper(addone);