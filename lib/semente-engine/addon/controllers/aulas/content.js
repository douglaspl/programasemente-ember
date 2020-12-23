import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  annotationsSorting: ['id:desc'],
  sortedAnnotations: Ember.computed.sort('anotacoes', 'annotationsSorting'),

  thisRoute: Ember.run('render', function(){
    if(window.location.pathname.includes('aulas')) {
      return 'aulas';
    }
    if(window.location.pathname.includes('plataformabiblioteca')) {
      return 'plataformabiblioteca';
    }
  }),
  store: Ember.inject.service(),
  newAnotacao: false,
  toggleRole: localStorage.getItem('toggleRole'),
  showToggle: false,
  pessoa: Ember.computed('model', function(){ return this.get('model.pessoa'); }),
  parentController: Ember.inject.controller('aulas'),
  aula: Ember.computed('model', function(){ return this.get('model.aula'); }),
  TurmasAplicadas: Ember.computed('aula', function(){
    let turmasAplicadas =  this.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('parentController.selectedDependente.instituicao.id')).mapBy('turma');
    return turmasAplicadas
  }).property('aula'),
  UltimaAplicacao: Ember.computed('aula', function(){
    let ultimaData =  this.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('parentController.selectedDependente.instituicao.id')).sortBy('dataAplicacao').reverse()[0];
    return ultimaData;
  }).property('aula'),
  selectedAgrupamento: 'Básico',
  conteudos: Ember.computed('aula', function(){
    return this.get('aula.plataformaConteudos').filter(c => c.get('publicos').mapBy('name').includes(localStorage.getItem('toggleRole'))).filterBy('situacao', true).filterBy('agrupamento.name', this.get('selectedAgrupamento'))
  }).property('aula', 'selectedAgrupamento'),
  stopVideo: false,
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

  avaliacao: Ember.computed('model.aula', function(){
    let pessoa = this.get('pessoa');
    return pessoa.get('avaliacoes').filterBy('aula.id', this.get('aula').get('id'))[0];
  }),

  anotacoes: Ember.computed('model', function(){
    let pessoa = this.get('pessoa');
    return pessoa.get('anotacoes').filterBy('aula.id', this.get('aula').get('id'));
  }),

  actions: {
    voltar() {
      this.transitionToRoute('aulas.index');
    },
    toggleRole(selectedRole) {
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
      this.set('stopVideo', false);
      var conteudo = this.get('model.aula.plataformaConteudos').filterBy('id', conteudoId).get('firstObject');
      this.set('selectedConteudo', conteudo);
      debugger;
      this.toggleConteudoModal();
    },
    toggleModalEad(videoId){
      this.set('stopVideo', false);
      this.set('videoId', videoId);
      var el = document.getElementById('content-modal-ead');
      $(el).toggleClass('modal--is-show');
      $('body').toggleClass('overflow-hidden');
    },
    closeConteudoModal() {
      this.set('stopVideo', true);
      this.toggleConteudoModal();
    },
    closeConteudoModalEad() {
      this.set('stopVideo', true);
      var el = document.getElementById('content-modal-ead');
      $(el).toggleClass('modal--is-show');
      $('body').toggleClass('overflow-hidden');
    },

    refreshTarefa(){
      let tarefa = this.get('tarefa');
      if (tarefa){
        tarefa.set('realizado', !tarefa.get('realizado'));
        tarefa.save();
      } else {
        let newTarefa = this.get('store').createRecord('tarefa',{
          pessoa: this.get('pessoa'),
          aula: this.get('aula')
        });
        newTarefa.save();
      }
    },

    avaliar(nota){
      let avaliacao = this.get('avaliacao');
      if (avaliacao){
        avaliacao.set('nota', nota);
        avaliacao.save();
      } else{
        let newAvaliacao = this.get('store').createRecord('avaliacao',{
          pessoa: this.get('pessoa'),
          aula: this.get('aula'),
          nota: nota
        });
        newAvaliacao.save();
        this.set('avaliacao', newAvaliacao);
      }

      // Adiciona feedback para o usuário ter uma dica que salvou a nota nova
      // Pega o rating (dificilmente existirá mais de um na página)
      let rating = document.querySelector('#rating');

      // Confere se ele já recebeu a classe blink. Se sim, remove a classe
      if(rating.classList.contains('blink')) {
        rating.classList.remove('blink');
      }

      // Aplica classe blink no rating para dar retorno visual ao usuário, após um "pentelésimo"
      setTimeout(function() {
        rating.classList.add('blink');
      }, 1);

    },

    createAnotacao() {
      let textArea = document.getElementById('nova-anotacao');
      let texto = textArea.value;
      let newAnotacao = this.get('store').createRecord('anotacao', {
        texto: texto,
        pessoa: this.get('pessoa'),
        aula: this.get('aula')
      });
      newAnotacao.save();
      this.get('anotacoes').pushObject(newAnotacao);
      this.set('newAnotacao', false);
      // this.send('toggleCreateAnotacao');
      // this.set('anotacoes', this.get('anotacoes').pushObject(newAnotacao));
    },

    deleteAnotacao(id) {
      let anotacao = this.get('store').peekRecord('anotacao', id);
      this.get('anotacoes').removeObject(anotacao);
      anotacao.destroyRecord();
    },

    toggleCreateAnotacao() {
      this.set('newAnotacao', true);
      setTimeout(function(){
        let textArea = document.getElementById('nova-anotacao');
        textArea.value = '';
        textArea.focus();
      }, 1);
    }
  }

});
