import Ember from 'ember';

export function firststringpart(stringParam) {
    return stringParam.toString().split(' ').shift();
}

export default Ember.Helper.helper(firststringpart);