import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  thisRoute: Ember.run('render', function(){
    if(window.location.pathname.includes('aulas')) {
      return 'aulas';
    }
    if(window.location.pathname.includes('plataformabiblioteca')) {
      return 'plataformabiblioteca';
    }
  }),
  store: Ember.inject.service(),
  toggleRole: localStorage.getItem('toggleRole'),
  pessoa: Ember.computed('model', function(){ return this.get('model.pessoa'); }),
  parentController: Ember.inject.controller('aulas'),
  selectedDependente: Ember.computed('model', function(){ return this.get('parentController').get('selectedDependente') }),
  aula: Ember.computed('model', function(){ return this.get('model.aula'); }),
  TurmasAplicadas: Ember.computed('aula', function(){
    let turmasAplicadas =  this.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('selectedDependente.instituicao.id')).mapBy('turma');
    return turmasAplicadas
  }).property('aula'),
  UltimaAplicacao: Ember.computed('aula', function(){
    let ultimaData =  this.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('selectedDependente.instituicao.id')).sortBy('dataAplicacao').reverse()[0];
    return ultimaData;
  }).property('aula'),
  selectedAgrupamento: 'Básico',
  conteudos: Ember.computed('aula', function(){
    return this.get('aula.plataformaConteudos').filter(c => c.get('publicos').mapBy('name').includes(this.get('toggleRole'))).filterBy('situacao', true).filterBy('agrupamento.name', this.get('selectedAgrupamento'))
  }).property('aula', 'selectedAgrupamento'),
  toggleConteudoModal(target) {
    var el = document.getElementById('content-modal');
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
  },

  actions: {
    voltar() {
      this.transitionToRoute('aulas.index');
    },
    goToAulas() {
      this.transitionToRoute('aulas.index');
    },
    goToBiblioteca(){
      this.transitionToRoute('plataformabiblioteca.index');
    },

    refreshSelectedAula(selectedAulaId) {
      let aula = this.get('store').peekRecord('aula', selectedAulaId);
      this.set('aula', aula);
    },
    refreshSelectedAgrupamento(selectedAgrupamento){
      this.set('selectedAgrupamento', selectedAgrupamento);
    },
    toggleModal(conteudoId){
      var conteudos = this.get('model.aula').get('plataformaConteudos');
      let that = this;
      conteudos.forEach((c) => {
        if (c.id == conteudoId){
          that.set('selectedConteudo', c);
        }
      })
      this.toggleConteudoModal();
    },
    closeConteudoModal() {
      this.toggleConteudoModal();
    }
  }

});
