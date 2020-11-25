import Ember from 'ember';

export function isbigger(params) {
    let [arg1, arg2] = params;
   if (parseInt(arg1) > parseInt(arg2)) {
       return true;
   }
   else {
       return false;
   }
}

export default Ember.Helper.helper(isbigger);