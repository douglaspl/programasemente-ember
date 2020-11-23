import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';

Ember.TextField.reopen({
  attributeBindings: ['data-type', 'data-required']
});


export default Ember.Component.extend({
  tagName: '',
  store: Ember.inject.service(),

  formValidation: Ember.observer('selectedGenero', 'selectedAno', 'selectedTurma', function () {
    this.removeerrors();
  }),

  plataformaAnosToHide: Ember.computed(function() {
    let pessoa = this.get('pessoa');
    
    let idxToHide = [];
    if (pessoa.get('role') == 'aluno'){
      idxToHide = [-2,-1,1,2,3,4,5];
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

  actions: {

    refreshSelectedGenero(selectedGenero) {
      let pessoa = this.get('pessoa');
      pessoa.set('genero', selectedGenero);
      this.set('selectedGenero', selectedGenero);
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
        this.gonext();
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
        pessoa.save().then(function (pessoa) {

        }).catch(function (error) {});
      } else {
        return false;
      }


    },

    saveResponsible(pessoa) {
      pessoa.save().then(function (pessoa) {}).catch(function (error) {});
      this.gonext();
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

    
    checkName() {
      this.checkname();
    },
    
    
    next() {
      this.gonext();
    },

    checkName() {
      this.checkname();
    },

    checkcel() {
      this.checkcel();
    },

    maskcel(v) {
      this.maskcel(v);
    }


  }
});
