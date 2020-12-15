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
  showToggle: false,
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
    return this.get('aula.plataformaConteudos').filter(c => c.get('publicos').mapBy('name').includes(localStorage.getItem('toggleRole'))).filterBy('situacao', true).filterBy('agrupamento.name', this.get('selectedAgrupamento'))
  }).property('aula', 'selectedAgrupamento'),
  toggleConteudoModal(target) {
    var el = document.getElementById('content-modal');
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
  },

  tarefa: Ember.computed('model', function(){
    let pessoa = this.get('pessoa');
    let aula = this.get('aula');
    let tarefa;
    pessoa.get('tarefas').forEach(function(t){
      if (t.get('aula').get('id') == aula.get('id')){
        tarefa = t;
      }
    });
    return tarefa;
  }),

  actions: {
    voltar() {
      this.transitionToRoute('aulas.index');
    },
    toggleRole(selectedRole) {
      // let selectedDependenteId;
      // if (selectedRole == "responsavel"){
      //     selectedDependenteId = this.get('model.dependentes.firstObject.id');
      // } else if (selectedRole == 'aluno' || selectedRole == 'instrutor'){
      //     selectedDependenteId = this.get('model.id');
      // }
      //this.send('refreshSelectedDependente', selectedDependenteId);
      this.get('parentController').send('toggleRole', selectedRole)
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
    toggleModalEad(videoId){
      this.set('videoId', videoId);
      var el = document.getElementById('content-modal-ead');
      $(el).toggleClass('modal--is-show');
      $('body').toggleClass('overflow-hidden');
    },
    closeConteudoModal() {
      this.toggleConteudoModal();
    },
    closeConteudoModalEad() {
      var el = document.getElementById('content-modal-ead');
      $(el).toggleClass('modal--is-show');
      $('body').toggleClass('overflow-hidden');
    },
    refreshTarefa(){
      let tarefa = this.get('tarefa');
      if (tarefa){
        tarefa.set('realizado', !tarefa.get('realizado'));
        tarefa.save();
      }else{
        let newTarefa = this.get('store').createRecord('tarefa',{
          pessoa: this.get('pessoa'),
          aula: this.get('aula')
        });
        newTarefa.save();
      }
    }
  }

});
