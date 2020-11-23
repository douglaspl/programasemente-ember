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
        this.gonext();
      } else {
      return false;
      }
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


    trimall() {

      this.trimall();
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
