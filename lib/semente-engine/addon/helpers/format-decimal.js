import { helper } from '@ember/component/helper';

export function formatDecimal(param) {
  let fixed = parseInt(param).toFixed(0);
  return fixed
}

export default helper(formatDecimal);
