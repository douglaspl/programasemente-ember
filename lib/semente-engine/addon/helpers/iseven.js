import Ember from 'ember';

export function iseven(params/*, hash*/) {
return params % 2 == 0;
}

export default Ember.Helper.helper(iseven);