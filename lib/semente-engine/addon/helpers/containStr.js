import Ember from 'ember';

export function containStr(params, namedArgs) {
    if (namedArgs.subStr == null){
        return true;
    }
    let str_sub = namedArgs.subStr.toLowerCase();
    if (namedArgs.mainStr){
        let str_main = namedArgs.mainStr.toLowerCase();
        return str_main.includes(str_sub);
    } else return true
}

export default Ember.Helper.helper(containStr);