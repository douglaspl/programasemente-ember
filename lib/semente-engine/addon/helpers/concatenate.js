import Ember from 'ember';

export function concatenate(params) {
    let resp = '';
    params.forEach(param=>{
        if (param) resp = resp + param;
    });
    return resp;
}

export default Ember.Helper.helper(concatenate);