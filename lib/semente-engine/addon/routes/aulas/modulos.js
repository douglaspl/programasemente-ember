import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    beforeModel() {
        if (!localStorage.getItem('person_logged')) { // if the user had not selected an institution, then do not load
            this.transitionTo('index');
        }
    },
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return this.get('store').findRecord('pessoa', person_id, 
            {include: 'modulos.atividades.secoes.conteudos.html, leituras, modulos.atividades.secoes.conteudos.video, estado-videos, modulos.atividades.secoes.conteudos.quiz.questoes.alternativas, estado-videos-alternativas, respostas, estado-questoes, plataforma-anos', reload: true });
    },
});