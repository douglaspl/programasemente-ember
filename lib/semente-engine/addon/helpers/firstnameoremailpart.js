import Ember from 'ember';

export function firstnameoremailpart(stringParam) {
  let stringify = stringParam.toString();

  if(stringify.search("@") > 0) {
    return stringify.split("@").shift();
  } else {
    return stringify.split(" ").shift();
  }
}

export default Ember.Helper.helper(firstnameoremailpart);