import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';

Ember.TextField.reopen({
  attributeBindings: ['data-type', 'data-required', 'data-duplicate']
});

export default Ember.Component.extend({
  tagName: '',
  store: Ember.inject.service(),

  formValidation: Ember.observer('selectedGenero', 'selectedAno', 'selectedTurma', function () {
    this.removeerrors();
  }),

  plataformaAnosToHide: Ember.computed(function() {
    let idxToHide = [];
    idxToHide = [6,7,8,9,10,11,12];

    let plataformaAnos = this.get('pessoa').get('instituicao').get('plataformaAnos');
    let plataformaAnosToHide = [];
    plataformaAnos.forEach(pa => {
      if (idxToHide.includes(pa.get('idx'))) {
        plataformaAnosToHide.pushObject(pa);
      }
    });

    return plataformaAnosToHide;
  }),


  actions: {
    refreshSelectedGenero(selectedGenero) {
      let pessoa = this.get('pessoa');
      pessoa.set('genero', selectedGenero);
      this.set('selectedGenero', selectedGenero);
    },
    refreshSelectedAno(selectedPlatAnoId) {
      let pessoa = this.get('pessoa');
      var pessoaAnos = pessoa.get('plataformaAnos');
      pessoaAnos.forEach(pa => {
        pessoa.get('plataformaAnos').removeObject(pa);
      })
      let ano = this.get('store').peekRecord('plataforma-ano', selectedPlatAnoId);
      pessoa.get('plataformaAnos').pushObject(ano);
      this.set('selectedAno', ano);
    },
    refreshSelectedPlataformaTurma(plataformaTurmaId) {
      let pessoa = this.get('pessoa');
      var pessoaTurmas = pessoa.get('plataformaTurmas');
      pessoaTurmas.forEach(pt => {
        pessoa.get('plataformaTurmas').removeObject(pt);
      });
      let turma = this.get('store').peekRecord('plataforma-turma', plataformaTurmaId);
      pessoa.get('plataformaTurmas').pushObject(turma);
      this.set('selectedTurma', turma);
    },

    saveProfile(pessoa) {
      pessoa.save().then(function (pessoa) {}).catch(function (error) {});
      this.gonext();
    },

    next() {
      this.gonext();
    },

    previous() {
      this.goback();
    },

    trimall() {

      this.trimall();
    },
    
    checkName() {
      this.checkname();
    },
    
    removeDependente(model, dependente) {
      var responsaveis = dependente.get('responsaveis');

      responsaveis.forEach(resp => {
        dependente.get('responsaveis').removeObject(model);
        resp.get('dependentes').removeObject(dependente);
      });

      model.save().then(function(model) {}).catch(function(error) {});
      // parceiro.save().then(function(parceiro) {}).catch(function(error) {});
    },

    checkmail: function() {
      this.checkmail();
    },

    checkDuplicateLogins(pessoa) {
      let target = event.target;
      // let error_duplicate = target.closest('.form-group__container').querySelector('.form__msg');
      // error_duplicate.classList.remove('form__msg--is-show');
      let logins = document.querySelectorAll('.j-check-duplicate');
      let numLogins = logins.length;
      let arrayLogins = [];
      let errorMsg = 'Este nome de usuário já foi utilizado aqui'

      pessoa.verifyEmail({
        login: pessoa.get('email'),
        instituicaoId: pessoa.get('instituicao').get('id')
      }).then(function (response) {
        target.dataset.duplicate = "false";
        // let error_container = login.closest('.form-group__container').querySelector('.form__msg');
        // error_container.innerHTML = errorMsg;
        // error_container.classList.add('form__msg--is-show');
        return;
      }).catch(function (error) {
       if (error.errors) {
        const errorStatus = error.errors[0].status;
        const error_container = target.closest('.form-group__container').querySelector('.form__msg');
        if (errorStatus === "400") {
          switch (true) {
            case target.value.length == 0:
              errorMsg = 'Por favor, insira um nome de usuário';
              error_container.innerHTML = errorMsg;
              error_container.classList.add('form__msg--is-show');
              break;
            case target.value.length > 0:
              errorMsg = 'O nome de usuário informado já está sendo usado, por favor, escolha outro.'
              target.dataset.duplicate = "true";
              error_container.innerHTML = errorMsg;
              error_container.classList.add('form__msg--is-show');
              break;

          }
        } else if (errorStatus === "500") {
          errorMsg = 'Ocorreu um erro no sistema, mas não se preocupe! Nossos desenvolvedores já foram alertados.'
          error_container.innerHTML = errorMsg;
          error_container.classList.add('form__msg--is-show');
        } else {
          errorMsg = 'Ops! Parece que não conseguimos conexão com nossos servidores. Por favor, tente novamente em instantes.'
          error_container.innerHTML = errorMsg;
          error_container.classList.add('form__msg--is-show');
        }
       }
      })
      if (numLogins > 1) {
        logins.forEach(login => {
          if (login.value !== "") {
            arrayLogins.push(login.value);
          }
          let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index);
          if (findDuplicates(arrayLogins).length > 0) {
            logins.forEach(login => {
              login.dataset.duplicate = "true";
              let error = login.closest('.form-group__container').querySelector('.form__msg');
              error.innerHTML = errorMsg;
              error.classList.add('form__msg--is-show');
            })
          } else {
            logins.forEach(login => {
              login.dataset.duplicate = "false";
              let error = login.closest('.form-group__container').querySelector('.form__msg');
              error.innerHTML = errorMsg;
              error.classList.remove('form__msg--is-show');
            })
          }
        })
      }
    }    
  }
});
