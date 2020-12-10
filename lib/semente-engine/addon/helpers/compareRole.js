import Ember from 'ember';


export function containInListID(params) {
    // debugger;
    if (params[0].length == 0){
        return true;
    }
    else{
        let pIds = params[1].mapBy('name');
        let spId = params[0];
        if (pIds.length > 0 ){
            var isSubset = pIds.includes(spId);
            return isSubset
        } else return false
    }
}

export default Ember.Helper.helper(containInListID);