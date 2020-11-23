import Ember from 'ember';

export function equalstrOrnull(param) {
    let one = param[0];
    let two = param[1];
    let selected = param[2]
    if ((one == two) || (selected == null)){
        return true;
    }
    else return false;
}

export default Ember.Helper.helper(equalstrOrnull);