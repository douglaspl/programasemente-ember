import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model');
  }),
  publico: Ember.computed('model', function(){
    return this.get('model.publico')
  }),
  agrupamento: Ember.computed('model', function(){
    return this.get('model.agrupamento')
  }),

  conteudos: Ember.computed('model', function(){
    var conteudos = this.get('store').peekAll('plataforma-conteudo');
    return conteudos
  }),
  // segmentos: Ember.computed('model', function(){
  //   var segmentos = this.get('store').findAll('plataforma-conteudo');
  //   var anos = this.get('store').findAll('plataforma-conteudo');
  //   var aulas = this.get('store').findAll('aula');
  //   return conteudos
  // }),

  actions: {
    agrupamentoChanged(choice) {
      debugger;
      console.log("changing flavor choice", choice);
      this.controller.set('agrupamento.name', choice);
    },
    refreshSelectedSituacao(selectedSituacao) {
      debugger;
      conteudo = this.get('conteudos');
      if (selectedSituacao == "true"){ conteudo.set('situacao', true); }
      if (selectedSituacao == "false"){ conteudo.set('situacao', false); }

      this.set('selectedSituacao', selectedSituacao);
    },
    // refreshSelectedAno(selectedPlatAnoId) {
    //     let pessoa = this.get('pessoa');
    //     var pessoaAnos = pessoa.get('plataformaAnos');
    //     pessoaAnos.forEach(pa => {
    //         pessoa.get('plataformaAnos').removeObject(pa);
    //     })
    //     let ano = this.get('store').peekRecord('plataforma-ano', selectedPlatAnoId);
    //     pessoa.get('plataformaAnos').pushObject(ano);
    //     this.set('selectedAno', ano);
    // },
    // refreshSelectedPlataformaTurma(plataformaTurmaId) {
    //     let pessoa = this.get('pessoa');
    //     var pessoaTurmas = pessoa.get('plataformaTurmas');
    //     pessoaTurmas.forEach(pt => {
    //         pessoa.get('plataformaTurmas').removeObject(pt);
    //     });
    //     let turma = this.get('store').peekRecord('plataforma-turma', plataformaTurmaId);
    //     pessoa.get('plataformaTurmas').pushObject(turma);
    //     this.set('selectedTurma', turma);
    // },

    saveProfile(conteudo) {
      conteudo.save().then(function(conteudo){
      }).catch(function(error) {
      });
    }
  }
});
