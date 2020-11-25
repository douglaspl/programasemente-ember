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
    let idxToHide = [];
    idxToHide = [6,7,8,9,10,11,12];

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
    }
  }
});
