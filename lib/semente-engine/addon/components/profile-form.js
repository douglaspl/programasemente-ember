import Ember from 'ember';
import Component from '@ember/component';
import ENV from '../config/environment';
// import pessoa from '../../../../app/models/pessoa';

Ember.TextField.reopen({
  attributeBindings: ['data-type', 'data-required', 'data-context']
});

Ember.Checkbox.reopen({
  attributeBindings: ['data-type', 'data-required']
});

export default Ember.Component.extend({
  tagName: '',
  session: Ember.inject.service('session'),
  store: Ember.inject.service(),
  envnmt: ENV.APP,
  env: ENV.APP,

  formValidation: Ember.observer('selectedGenero', 'selectedAno', 'selectedTurma', function () {
    this.removeerrors();
  }),


  plataformaAnosToHide: Ember.computed(function () {
    let pessoa = this.get('pessoa');

    let idxToHide = [];
    if (pessoa.get('role') == 'aluno') {
      idxToHide = [-2, -1, 1, 2, 3, 4, 5];
    }

    let plataformaAnos = pessoa.get('instituicao').get('plataformaAnos');
    let plataformaAnosToHide = [];
    plataformaAnos.forEach(pa => {
      if (idxToHide.includes(pa.get('idx'))) {
        plataformaAnosToHide.pushObject(pa);
      }
    });

    return plataformaAnosToHide;
  }),

  segmentos: Ember.computed('pessoa', function () {
    return this.get('store').peekAll('segmento').sortBy('id');
  }),

  uri_avatar: Ember.computed('model', function () {
    let pessoa = this.get('pessoa');
    if (pessoa.get('uriAvatar')) {
      return pessoa.get('uriAvatar');
    }
    return new Ember.String.htmlSafe("/assets/img/avatar-default.svg");
  }),

  sendAvatarToServer() {
    let file = document.getElementById('arquivoAvatar').files[0];
    if (file) {
      let header = localStorage.getItem('person_logged');
      let header_inst;
      if (header) {
        header = JSON.parse(header);
        header_inst = header.id;
      } else header_inst = "";
      let sessionData = this.get('session.data');
      let tok = sessionData.authenticated.access_token;
      let temp = 'Bearer ';
      let userToken = temp.concat(tok);
      let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/avatar';
      return new Ember.RSVP.Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', final_url);
        xhr.responseType = 'json';
        xhr.onreadystatechange = handler;
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
        xhr.setRequestHeader('pessoaid', header_inst);
        xhr.setRequestHeader('Authorization', userToken);
        xhr.setRequestHeader('filename', document.getElementById('arquivoAvatar').files[0].name);
        xhr.send(file);

        function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200 || this.status === 204) {
              resolve(this.response);
            } else if (this.status === 404) {
              reject('Server not found');
            } else if (this.status >= 400) {
              reject(new Error(this.response.error));
            } else {
              reject(new Error('Failure from server call: [' + this.status + ']'));
            }
          }
        }
      });
    }
  },

  actions: {

    refreshSelectedGenero(selectedGenero) {
      let pessoa = this.get('pessoa');
      pessoa.set('genero', selectedGenero);
      this.set('selectedGenero', selectedGenero);
    },

    buscarArquivoAvatar() {
      var input = document.getElementById('arquivoAvatar');
      let file_name = input.files[0].name;
      this.set('selected_file_avatar', file_name);
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("avatar-modale").style.backgroundImage = "url(" + e.target.result + ")";
      }
      reader.readAsDataURL(input.files[0]);
    },

    refreshSelectedAno(selectedPlatAnoId) {
      if (!selectedPlatAnoId == "") {
        let pessoa = this.get('pessoa');
        var pessoaAnos = pessoa.get('plataformaAnos');
        pessoaAnos.forEach(pa => {
          pessoa.get('plataformaAnos').removeObject(pa);
        })
        let ano = this.get('store').peekRecord('plataforma-ano', selectedPlatAnoId);
        pessoa.get('plataformaAnos').pushObject(ano);
        this.set('selectedAno', ano);
      } else {
        this.set('selectedAno', "");
      }
    },
    refreshSelectedPlataformaTurma(plataformaTurmaId) {

      if (!plataformaTurmaId == "") {
        let pessoa = this.get('pessoa');
        var pessoaTurmas = pessoa.get('plataformaTurmas');
        pessoaTurmas.forEach(pt => {
          pessoa.get('plataformaTurmas').removeObject(pt);
        });
        let turma = this.get('store').peekRecord('plataforma-turma', plataformaTurmaId);
        pessoa.get('plataformaTurmas').pushObject(turma);
        this.set('selectedTurma', turma);
      } else {

        this.set('selectedTurma', "");
      }
    },

    saveProfile(pessoa) {
      if (this.checkform()) {
        let that = this
        pessoa.save().then(function (pessoa) {
          if (pessoa.get('responsaveis').get('length') <= 0) {
            that.addresponsible();
          }
        }).catch(function (error) {});
        this.sendAvatarToServer();
        this.gonext();
      } else {
        return false;
      }
    },

    saveResponsible(pessoa) {
      if (this.checkform()) {
        let that = this
        pessoa.save().then(function (pessoa) {
          if (pessoa.get('dependentes').get('length') <= 0) {
            that.adddependente();
          }
        }).catch(function (error) {});
        this.sendAvatarToServer();
        this.gonext();
      } else {
        return false;
      }
    },

    saveTeacher(pessoa) {
      if (this.checkform()) {
        let that = this
        pessoa.save().then(function (pessoa) {}).catch(function (error) {});
        this.sendAvatarToServer();
        this.gonext();
      } else {
        return false;
      }
    },

    selectAno(platAno, selected) {
      this.send('removeAplicadorError');
      //this.checkform();
      let pessoa = this.get('pessoa');
      if (selected) {
        pessoa.get('plataformaAnos').pushObject(platAno);
      } else {
        pessoa.get('plataformaAnos').removeObject(platAno);
      }
    },

    selectSegmento(seg, selected) {
      let pessoa = this.get('pessoa');
      let platAnos = this.get('store').peekAll('plataforma-ano');
      let segPlatAnos = [];
      platAnos.forEach(pa => {
        if (pa.get('segmento').get('id') == seg.get('id')) {
          segPlatAnos.push(pa);
        }
      })

      segPlatAnos.forEach(pa => {
        if (selected) {
          pessoa.get('plataformaAnos').pushObject(pa);
        } else {
          pessoa.get('plataformaAnos').removeObject(pa);
        }
      })
    },

    removeAplicadorError() {
      let isAplicadorCkechbox = document.getElementById("instrutor_aplica-programa");
      let error_aplicador = document.getElementById("error_aplicador");
      let anos = document.querySelectorAll("input[class^='j-validate-aplicador-child']:checked");
      if ((isAplicadorCkechbox.checked && anos.length > 0) || (!isAplicadorCkechbox.checked && anos.length == 0)) {
        error_aplicador.classList.remove('form__msg--is-show');
      }
    },

    toggleinput() {
      this.toggleinput();
    },

    trimall() {
      this.trimall();
    },

    checkName() {
      this.checkname();
    },

    next() {
      this.gonext();
    },

    checkMail() {
      this.checkmail();
    },

    validateEmail() {
      this.validateemail();
    },

    checkDate() {
      this.checkdate();
    },

    checkcel() {
      this.checkcel();
    },

    celmaxlength() {
      this.celmaxlength();
    },

    maskcel(v) {
      this.maskcel(v);
    },

    checkaplicador(v) {
      let pessoa = this.get('pessoa');
      let pessoaAnos = pessoa.get('plataformaAnos');
      pessoa.set('isAplicador', v.currentTarget.checked);
      this.set('isAplicador', v.currentTarget.checked);

      if (!v.currentTarget.checked) {

        if (pessoaAnos.get('length') > 0) {
          let list = pessoaAnos.toArray();
          pessoaAnos.removeObjects(list);
        }
        //this.checkform();
        this.send('removeAplicadorError');
      }

    }
  },
});
