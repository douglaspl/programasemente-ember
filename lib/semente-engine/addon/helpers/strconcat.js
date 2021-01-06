import Ember from 'ember';

export function strconcat(params) {
  if (params[0] && params[1]){
    return (params[0] + params[1]).toString();
  } else return false
}

export default Ember.Helper.helper(strconcat);
