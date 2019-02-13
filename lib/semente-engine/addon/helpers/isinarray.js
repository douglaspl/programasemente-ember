import Ember from 'ember';

export function isinarray(param) {
    if (param[1]) {
        let idx = param[1].filter(function(el) { return el.id == param[0].id; });
        if (idx.length > 0) {
        return true;
        }
        else return false;
    }
    else return false;
}

export default Ember.Helper.helper(isinarray);