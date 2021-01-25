import { helper } from '@ember/component/helper';

export function containerUrl(param) {
    if (param[0] && typeof param[0] == 'string'){
        if (param[0].includes('https://spasementemedio.blob.core.windows.net/')){
            return true
        } else return false
    } else return false
}

export default helper(containerUrl);
