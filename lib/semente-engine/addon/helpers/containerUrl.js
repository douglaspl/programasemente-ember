import { helper } from '@ember/component/helper';

export function containerUrl(param) {
    debugger;
    if (param && typeof param == 'string'){
        if (param.includes("//spasementemedio.blob.core.windows.net/")){
            return true
        } else return false
    } else return false
}

export default helper(containerUrl);
