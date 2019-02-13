import Route from '@ember/routing/route';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        return this.get('store').findAll('modulo', {include: 'atividades, atividades.secoes, atividades.secoes.conteudos, atividades.secoes.conteudos.html, atividades.secoes.conteudos.video, atividades.secoes.conteudos.quiz, atividades.secoes.conteudos.quiz.questoes, atividades.secoes.conteudos.quiz.questoes.alternativas'});
    }
});