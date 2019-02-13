import Ember from 'ember';

export function isbigger(param) {
   if (parseInt(param[1]) > parseInt(param[0])) {
       return true;
   }
   else {
       return false;
   }
}

export default Ember.Helper.helper(isbigger);