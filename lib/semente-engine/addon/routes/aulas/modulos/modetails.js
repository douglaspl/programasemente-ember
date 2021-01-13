import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    model(params) {
           return this.get('store').findRecord('modulo', params.modulo_id); //, {include: 'atividades, atividades.secoes, atividades.secoes.conteudos, atividades.secoes.conteudos.html, atividades.secoes.conteudos.html.leitura, atividades.secoes.conteudos.video, atividades.secoes.conteudos.video.estado-video, atividades.secoes.conteudos.quiz, atividades.secoes.conteudos.quiz.questoes, atividades.secoes.conteudos.quiz.questoes.alternativas, atividades.secoes.conteudos.quiz.questoes.alternativas.resposta'});
    }
});