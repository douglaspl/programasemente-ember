import Ember from 'ember';

export function containStr(params, namedArgs) {
    //debugger;
    if (namedArgs.subStr == null){
        return true;
    }
    let str_sub = namedArgs.subStr.toLowerCase();
    let str_main = namedArgs.mainStr.toLowerCase();
    return str_main.includes(str_sub);
}

export default Ember.Helper.helper(containStr);