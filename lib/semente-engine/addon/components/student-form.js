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
    
  }
});
