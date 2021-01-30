import { helper } from '@ember/component/helper';

export function getExt(string) {
  
  let str = string[0].split(".");
  let ext = str[1];
  
  return ext
 
 }
export default helper(getExt);
