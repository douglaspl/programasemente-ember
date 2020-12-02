import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model.pessoa');
  }), 
  aula: Ember.computed('model', function(){
    return this.get('model.aula');
  }),
  TurmasAplicadas: Ember.computed('aula', function(){
    let turmasAplicadas =  this.get('aula').get('aplicacoes')
    .filterBy('aplicado', true)
    .filterBy('turma.instituicao.id', this.get('pessoa.instituicao.id'))
    .mapBy('turma'); // turmas com aplicacoes daquela aula
    return turmasAplicadas
  }),
  
  actions: {
    refreshSelectedAula(selectedAulaId) {
      let aula = this.get('store').peekRecord('aula', selectedAulaId);
      //this.transitionToRoute('aulas.content', selectedAulaId);
      this.set('aula', aula);
      let turmasAplicadas =  aula.get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('pessoa.instituicao.id')).mapBy('turma');
      this.set('TurmasAplicadas', turmasAplicadas);
    },
    
  }

});
