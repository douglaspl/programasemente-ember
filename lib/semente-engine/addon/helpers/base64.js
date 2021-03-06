import { helper } from '@ember/component/helper';

export function base64(param) {
    if (param[0] && typeof param[0] == 'string'){
        if (param[0].includes('base64,')){
            return true
        } else return false
    } else return false
}

export default helper(base64);
