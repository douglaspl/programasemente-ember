import Ember from 'ember';

export function equalstrmenosum(params) {
    let arg1 = params[0];
    let arg2 = params[1] - 1;
    var resp = 0;
    if (arg1 == arg2) resp = 1;
    return resp;
}

export default Ember.Helper.helper(equalstrmenosum);
