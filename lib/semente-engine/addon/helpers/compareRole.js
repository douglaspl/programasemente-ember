import Ember from 'ember';

export function compareRole(params, namedArgs) {
    debugger;
    if (namedArgs.f_role == null){
        return true;
    }
    let first_role = namedArgs.f_role;
    let second_role = namedArgs.s_role;

    if(first_role == "Alunos" && second_role == "aluno"){
        return true;
    }
    else if(first_role == "Professores" && second_role == "instrutor"){
        return true;
    }
    else if(first_role == "Responsáveis" && second_role == "responsavel"){
        return true;
    }
    else if(second_role == "coordenador"  || second_role == "diretor" || second_role == "gestor"){
        return true;
    } else {
        return false;
    }
}

export default Ember.Helper.helper(compareRole);