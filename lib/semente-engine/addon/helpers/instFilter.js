import { helper } from '@ember/component/helper';

export function instFilter([arg1, arg2]) {
   

  var filtered = arg[0].map(function(el){
    return el.replace(arg[1].toString(), "");
  });

  return filtered;
  
}

export default helper(instFilter);
