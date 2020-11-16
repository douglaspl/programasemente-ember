import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
  tagName: '',
  store: Ember.inject.service(),


  plataformaTurmas: Ember.computed('pessoa', function () {
    return this.get('pessoa').get('instituicao').get('plataformaTurmas');
  }),
  selectedAno: Ember.computed('pessoa', function () {
    return this.get('pessoa').get('plataformaAnos').get('firstObject');
  }),
  selectedGenero: Ember.computed('pessoa', function () {
    return this.get('pessoa').get('genero');
  }),
  selectedTurma: Ember.computed('pessoa', function () {
    return this.get('pessoa').get('plataformaTurmas').get('firstObject');
  }),

  isMasculino: Ember.computed('pessoa', function () {
    var isMasc
    try {
      isMasc = this.get('pessoa').get('genero').toLowerCase() == 'masculino';
    } catch (error) {
      isMasc = false;
    }

    return isMasc;
  }),

  isFeminimo: Ember.computed('pessoa', function () {
    var isFem;
    try {
      isFem = this.get('pessoa').get('genero').toLowerCase() == 'feminimo';
    } catch {
      isFem = false;
    }

    return isFem;
  }),

  segmentos: Ember.computed('pessoa', function () {
    return this.get('store').peekAll('segmento');
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
      debugger;
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

      let formInputs = document.querySelectorAll('select,input[for="validation"]');
      let naoValidados = [];
      formInputs.forEach(input => {
       
        if (input.value === "") {
          naoValidados.push(input);
        }
    });
       
        if (naoValidados.length > 0) {
          alert('Validação falhou');
        } else {

          var pessoaTurmas = pessoa.get('plataformaTurmas');
          pessoaTurmas.forEach(pt => {
            pessoa.get('plataformaTurmas').removeObject(pt);
          });
          pessoa.get('plataformaTurmas').pushObject(this.get('selectedTurma'));

          var pessoaAnos = pessoa.get('plataformaAnos');
          pessoaAnos.forEach(pa => {
            pessoa.get('plataformaAnos').removeObject(pa);
          })
          pessoa.get('plataformaAnos').pushObject(this.get('selectedAno'));

          pessoa.set('genero', this.get('selectedGenero'));
          pessoa.save().then(function (pessoa) {}).catch(function (error) {});
        }

    
      },

    saveResponsible(pessoa) {
      pessoa.save().then(function (pessoa) {}).catch(function (error) {});
    },

    selectAno(platAno, selected) {
      let pessoa = this.get('pessoa');
      if (selected) {
        pessoa.get('plataformaAnos').pushObject(platAno);
      } else {
        pessoa.get('plataformaAnos').removeObject(platAno);
      }
    },

    selectSegmento(seg, selected) {
      // debugger;
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


    trimAll() {

      let inputs = document.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        let str = input.value;
        let trimmed = str.trim();
        input.value = trimmed;
      })

    },

    liveCheckName: function () {
      $('#person_name').on('keypress', function (event) {
        var regex = new RegExp(/^[a-zA-Z'\s]*$/);
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        let errorMsg = 'Somente letras são permitidas';
        let error_name = document.getElementById('error_name');
        if (!regex.test(key)) {
          error_name.innerHTML = errorMsg;

          event.preventDefault();
          return false;

        } else {
          error_name.innerHTML = '';
        }

      });

    },

  }
});
