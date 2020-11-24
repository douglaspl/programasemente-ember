import Ember from 'ember';

export function resumeaula(param) {
    if (param[0]) {
        let aulas = param[0];
        let anos = []
        aulas.forEach(aula => {
            if (!anos.some(ano => ano.get('id') === aula.get('plataformaAno').get('id'))){
                anos.push(aula.get('plataformaAno'))
              }
        });
        if (anos.length == 1) {
            return true;
        }
        else return false;
    }
    else return false;
}

export default Ember.Helper.helper(resumeaula);