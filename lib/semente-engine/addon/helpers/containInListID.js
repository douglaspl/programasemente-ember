import Ember from 'ember';

export function containInListID(params) {
    if (params[0].length == 0){
        return true;
    }
    else{
        let pIds = params[1].mapBy('id');
        let spId = params[0];
        var isSubset = pIds.includes(spId);
        return isSubset
    }
}

export default Ember.Helper.helper(containInListID);