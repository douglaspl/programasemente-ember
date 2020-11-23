import Ember from 'ember';

export function isnotinarray(param) {
    if (param[1]) {
        let idx = param[1].filter(function(el) { return el.id == param[0].id; });
        if (idx.length > 0) {
            return false;
        }
        else return true;
    }
    else return true;
}

export default Ember.Helper.helper(isnotinarray);