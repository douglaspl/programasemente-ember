import Ember from 'ember';

export function sub(params) {
  let [arg1, arg2] = params;
  return arg1 - arg2;
}

export default Ember.Helper.helper(sub);
