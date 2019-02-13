import Ember from 'ember';
import moment from 'moment';

export function momthelper(param) {
  let resp = moment(parseInt(param[0]), 'X').format(param[1]);
  return resp;
  // return param1;
}

export default Ember.Helper.helper(momthelper);