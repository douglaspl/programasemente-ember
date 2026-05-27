import Controller from '@ember/controller';
import PessoaValidations from "../../../validations/pessoa";
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  PessoaValidations,
  isEdit: true,

  segmentos:Ember.computed('model',function(){
    return this.get('model.segmentos');
  }),

  instituicao:Ember.computed('model',function(){
    let id = this.get('model.pessoa').get('instituicao').get('id');
    return this.get('store').peekRecord('instituicao', id);    
  }),

  anoAtual: new Date().getFullYear(),

  actions: {
    save: function(changeset){
      $("#form-user-error").html('');
      $("#role-error").html('');
      $("#function-error").html('');
      $("#cpf-error").html('');
      $("#email-error").html('');
      $("#phone-error").html('');
      $("#gender-error").html('');
      $("#aluno-ano-error").html('');
      $("#aluno-turma-error").html('');
      $("#nascimento-error").html('');
      $("#disciplina-error").html('');
      changeset.validate().then(() => {
          if (changeset.get("isValid")) {

            if ((changeset.get('emailCadastrado') == null || changeset.get('emailCadastrado') == "") && 
                (changeset.get('telefone') == null || changeset.get('telefone') == "")) {
                  $("#phone-error").html('Email ou Telefone devem ser preenchidos');
                  $("#email-error").html('Email ou Telefone devem ser preenchidos');  
              return;
            }
            
            changeset.set('enabled', document.getElementById('new_user_enabled').checked);
            if(this.get('instituicao').get('sEnabled')){
              changeset.set('acessoPlataformaS', document.getElementById('new_user_acessoPlataformaS').checked);
            }
            // if(this.get('instituicao').get('csEnabled')){
            //   changeset.set('acessoCs', document.getElementById('new_user_acessoCs').checked);
            // }

            if(document.getElementById('new_user_role').value == "") return $("#role-error").html('Selecione um perfil'); 
            changeset.set('role', document.getElementById('new_user_role').value);

            if(document.getElementById('new_user_gender').value == "") return $("#gender-error").html('Selecione um genero'); 
            changeset.set('genero', document.getElementById('new_user_gender').value);

            if(changeset.get('role') != 'aluno' && changeset.get('role') != 'instrutor'){
              if(changeset.get('telefone') == null || changeset.get('telefone') == "") return $("#phone-error").html('Obrigatório');
            }

            if(changeset.get('role') != 'aluno'){
              if(document.getElementById('new_user_function').value == "") return $("#function-error").html('Selecione uma função'); 
              changeset.set('function', document.getElementById('new_user_function').value);

              if(document.getElementById('new_user_birth').value == "") changeset.set('nascimentoPlataforma', null);
              else changeset.set('nascimentoPlataforma', document.getElementById('new_user_birth').value);

              var idx = 21;
              if(this.get('instituicao').get('isEscola') == "escola") idx = 20;
              var platAnoAdulto = this.get('store').peekAll('plataforma-ano').filterBy('idx', idx).get('firstObject');
              if(changeset.get('acessoPlataformaS')){
                var platAnosS = this.get('store').peekAll('instituicao-plataforma-ano-sistema').filterBy('sistema.idx', 2);
                if(platAnoAdulto == null || !platAnosS.mapBy('plataformaAno.id').includes(platAnoAdulto.get('id'))){
                  changeset.set('acessoPlataformaS', false);
                }
              }
              if(changeset.get('acessoCs')){
                var platAnosS = this.get('store').peekAll('instituicao-plataforma-ano-sistema').filterBy('sistema.idx', 3);
                if(platAnoAdulto == null || !platAnosS.mapBy('plataformaAno.id').includes(platAnoAdulto.get('id'))){
                  changeset.set('acessoCs', false);
                }
              }
            }

            if(changeset.get('role') == 'instrutor'){
              if(changeset.get('enabled')){
                changeset.set('enabled', false);
              }

              changeset.set('isAplicador', document.getElementById('new_user_aplicador').checked);
              if(!changeset.get('isAplicador')){
                let listAnos = changeset.get('plataformaAnos').toArray();
                changeset.get('plataformaAnos').removeObjects(listAnos);

                let listTurmas = changeset.get('plataformaTurmas').toArray();
                changeset.get('plataformaTurmas').removeObjects(listTurmas);
              }
              else{
                if (changeset.get('emailCadastrado') == null || changeset.get('emailCadastrado') == ""){
                  return $("#email-error").html('Email obrigatório para professores aplicadores');
                }
                if (changeset.get('telefone') == null || changeset.get('telefone') == "") {
                  return $("#phone-error").html('Telefone obrigatório para professores aplicadores');
                }
                if (changeset.get('disciplinaMinistrada') == null || changeset.get('disciplinaMinistrada') == "") {
                  return $("#disciplina-error").html('Disciplina ministrada obrigatório para professores aplicadores');
                }
              }
            }
            
            if(changeset.get('role') == 'aluno'){
              if(document.getElementById('new_user_ano').value == "") return $("#aluno-ano-error").html('Selecione um ano'); 
              let platAno = this.get('store').peekRecord('plataforma-ano', document.getElementById('new_user_ano').value);
              let listPa = changeset.get('plataformaAnos');
              listPa.forEach(pa => { 
                changeset.get('plataformaAnos').removeObject(pa); 
              });
              changeset.get('plataformaAnos').pushObject(platAno);

              if(document.getElementById('new_user_turma').value == "") return $("#aluno-turma-error").html('Selecione uma turma'); 
              let platTurma = this.get('store').peekRecord('plataforma-turma', document.getElementById('new_user_turma').value);
              let listPt = changeset.get('plataformaTurmas');
              listPt.forEach(pt => { 
                changeset.get('plataformaTurmas').removeObject(pt); 
              });
              changeset.get('plataformaTurmas').pushObject(platTurma);

              if(changeset.get('enabled')){
                changeset.set('enabled', false);

                // var platAnosPortal = this.get('store').peekAll('instituicao-plataforma-ano-sistema').filterBy('sistema.idx', 1);
                // var platAnosS = this.get('store').peekAll('instituicao-plataforma-ano-sistema').filterBy('sistema.idx', 2);
                // if(!platAnosPortal.mapBy('plataformaAno.id').includes(platAno.get('id'))){
                //   changeset.set('enabled', false);
                // }
                // else if(platAnosS.filterBy('plataformaAno.id', platAno.get('id'))[0] != null && platAnosS.filterBy('plataformaAno.id', platAno.get('id'))[0].get('isEssencial')){
                //   changeset.set('enabled', false);
                // }
              }

              if(changeset.get('acessoPlataformaS')){
                var platAnosS = this.get('store').peekAll('instituicao-plataforma-ano-sistema').filterBy('sistema.idx', 2);
                if(!platAnosS.mapBy('plataformaAno.id').includes(platAno.get('id'))){
                  changeset.set('acessoPlataformaS', false);
                }
              }

              if(changeset.get('acessoCs')){
                var platAnosCs = this.get('store').peekAll('instituicao-plataforma-ano-sistema').filterBy('sistema.idx', 3);
                if(!platAnosCs.mapBy('plataformaAno.id').includes(platAno.get('id'))){
                  changeset.set('acessoCs', false);
                }
              }

              if(document.getElementById('new_user_birth').value == ""){
                if(platAno.get('segmento').get('titulo') == "EJA") return $("#nascimento-error").html('Obrigatório para alunos EJA'); 
                if(platAno.get('segmento').get('titulo') == "Adultos") return $("#nascimento-error").html('Obrigatório para adultos'); 
              }
              else 
              changeset.set('nascimentoPlataforma', document.getElementById('new_user_birth').value);
            }
            else{
              if(document.getElementById('new_user_turma').value == "") return $("#adulto-turma-error").html('Selecione uma turma'); 
              let platTurma = this.get('store').peekRecord('plataforma-turma', document.getElementById('new_user_turma').value);
              let listPt = changeset.get('plataformaTurmas').filterBy('plataformaAno.idx', 20);
              listPt.forEach(pt => { 
                changeset.get('plataformaTurmas').removeObject(pt); 
              });
              changeset.get('plataformaTurmas').pushObject(platTurma);
            }

            if(changeset.get('role') == 'marketing'){
              if(changeset.get('enabled')){
                changeset.set('enabled', false);
              }
              if(changeset.get('acessoCs')){
                changeset.set('acessoCs', false);
              }
            }

            if(changeset.get('role') == 'secretaria' || changeset.get('role') == 'recursosHumanos'){
              if(changeset.get('acessoCs')){
                changeset.set('acessoCs', false);
              }
            }

            if(changeset.get('cpf') != null && changeset.get('cpf') != ""){
              let Soma = 0;
              let Resto = 0;
              let strCPF = changeset.get('cpf');
              strCPF = strCPF.replace(".", "");
              strCPF = strCPF.replace(".", "");
              strCPF = strCPF.replace("-", "");
              strCPF = strCPF.trim();

              if (strCPF == "00000000000") return $("#cpf-error").html('CPF inválido');

              for (let i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
              Resto = (Soma * 10) % 11;

              if ((Resto == 10) || (Resto == 11)) Resto = 0;
              if (Resto !== parseInt(strCPF.substring(9, 10))) return $("#cpf-error").html('CPF inválido');

              Soma = 0;
              for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
              Resto = (Soma * 10) % 11;

              if ((Resto == 10) || (Resto == 11)) Resto = 0;
              if (Resto !== parseInt(strCPF.substring(10, 11))) return $("#cpf-error").html('CPF inválido');
            }

            changeset.set('mustSendWelcomeEmail', false);
            if(document.getElementById('new_user_reenviaremail')) changeset.set('mustSendWelcomeEmail', document.getElementById('new_user_reenviaremail').checked);

            let that = this;
            document.getElementById('btnSubmit').innerText ="Salvando...";
            document.getElementById('btnSubmit').disabled = true;
            changeset.save().then(function () {
              document.getElementById('btnSubmit').disabled = false;
              document.getElementById('btnSubmit').innerText ="Informações Salvas!";
              setTimeout(function () {
                that.transitionToRoute('gerdata.users',  that.get('instituicao').get('id'));
              }, 2000);
            }).catch((reason) => {
              document.getElementById('btnSubmit').disabled = false;
              document.getElementById('btnSubmit').innerText ="Salvar";
              if (reason.errors) {
                reason.errors.forEach((error) => {
                  if (error.status === "500") return $("#form-user-error").html('Entre em contato com os desenvolvedores.'); 
                  else return $("#form-user-error").html(error.title); 
                });
              }
              else return $("#form-user-error").html(reason.message);
            });
          }
          else return $("#form-user-error").html('Revise os campos');
      })
    }
  }
})