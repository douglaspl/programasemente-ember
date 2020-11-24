import Ember from 'ember';

export function sizeequals(param) {
    if (param[0]) {
        let length = param[1];
        if (param[0].content.length == length) {
        return true;
        }
        else return false;
    }
    else return false;
}

export default Ember.Helper.helper(sizeequals);