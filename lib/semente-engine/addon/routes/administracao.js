import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
  store: Ember.inject.service(),
  beforeModel() {
    if (!localStorage.getItem('person_logged')) { // if the user had not selected an institution, then do not load
      this.transitionTo('index');
    }
    let person = JSON.parse(localStorage.getItem('person_logged'));
    let pessoa = this.get('store').peekRecord('pessoa', person.id);
    if (!pessoa){
      this.get('store').findRecord('pessoa', person.id, {include: 'turmas'});
    }
  },
  model() {
    let person = JSON.parse(localStorage.getItem('person_logged'));
    let role = person.role;
    let inst_id = person.instituicao_id;
    if (role === 'admin') {
      // return  this.get('store').findAll('instituicao', {include: 'areas,  modulos, acompanhamentos-curso-instituicao, modulos.atividades, modulos.atividades.acompanhamentos-atividade-instituicao, modulos.atividades.secoes, modulos.atividades.secoes.conteudos, modulos.atividades.secoes.conteudos.quiz, modulos.atividades.secoes.conteudos.quiz.questoes, modulos.atividades.secoes.conteudos.quiz.questoes.alternativas, modulos.atividades.secoes.conteudos.htmls, modulos.atividades.secoes.conteudos.videos'});
      return this.get('store').findAll('instituicao');
    } else {
      // return this.get('store').findRecord('instituicao', inst_id, {
      //   include: 'acompanhamentos-curso-instituicao, acompanhamentos-atividade-instituicao, modulos.atividades.secoes.conteudos.quiz.questoes, modulos.atividades.secoes.conteudos.quiz.questoes.alternativas, modulos.atividades.secoes.conteudos.htmls, modulos.atividades.secoes.conteudos.videos, turmas.acompanhamentos-atividade-turma'
      // });
      return this.get('store').findRecord('instituicao', inst_id, {
        include: 'acompanhamentos-curso-instituicao, acompanhamentos-atividade-instituicao, turmas.acompanhamentos-atividade-turma, modulos, instituicao-filhas.turmas.modulo'
      });
    }
  }
});
