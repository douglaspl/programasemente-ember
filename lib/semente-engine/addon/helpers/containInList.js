import Ember from 'ember';

export function containInList(params) {
    debugger;
    if (params[0].length == 0){
        return true;
    }
    else{
        let pIds = params[1].mapBy('id');
        let spIds = params[0].mapBy('id');
        var isSubset = spIds.every(spId => pIds.includes(spId));
        return isSubset
    }
}

export default Ember.Helper.helper(containInList);