import Ember from 'ember';

export function reducetitle(param) {
    let resp;
    if (param[0]) {
        if (param[0].length > 10) resp = param[0].substr(0, 7) + '...';
        else resp = param[0];
        return resp;
    }
    else {
        return '';
    }
}

export default Ember.Helper.helper(reducetitle);