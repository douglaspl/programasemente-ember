import Ember from 'ember';

export function arraysize(param) {
    try {
        return param[0].get('length');
    } catch {
        return 'erro'
    }
}

export default Ember.Helper.helper(arraysize);