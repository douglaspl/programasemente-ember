import Ember from 'ember';

export function equalstr(params) {
  let [arg1, arg2] = params;
  var resp = 0;
  if (arg1 == arg2) resp = 1;
  return resp;
}

export default Ember.Helper.helper(equalstr);
