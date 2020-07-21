import { helper } from '@ember/component/helper';

export function instFilter(params) {

  return params[0].replace(params[1].toString(), "");

}

export default helper(instFilter);
