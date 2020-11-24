import { helper } from '@ember/component/helper';

export function base64(param) {
    if (param[0].length > 100){
        return true
    } else return false
}

export default helper(base64);
