import { helper } from '@ember/component/helper';

export function capitalize(string) {
  
  let str = string.toString();
  let capitalized = str.charAt(0).toUpperCase() + str.slice(1)
  
  return capitalized
 
 }
export default helper(capitalize);
