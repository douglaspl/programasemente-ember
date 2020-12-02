import Ember from 'ember';

export function filter(array, ByObj) {
    debugger;
    let filt = array.filter(element => element.aula == ByObj);
    // let filtrado = array.filterBy(byStr, byObj);
    // var isSubset = pIds.includes(spId);
    return filt
}

export default Ember.Helper.helper(filter);