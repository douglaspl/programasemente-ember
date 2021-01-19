import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return this.get('store').findRecord('pessoa', person_id, {include: 'instituicao, plataforma-anos.segmento, plataforma-anos.aulas.unidade, plataforma-anos.livros, plataforma-turmas.aplicacoes-plataforma-aula.aula, dependentes.plataforma-anos.aulas.unidade, dependentes.plataforma-turmas.aplicacoes-plataforma-aula.aula, dependentes.plataforma-anos.segmento, dependentes.plataforma-anos.livros', reload: true});
    },

    afterModel(model) {
        if (model.get('role') == 'instrutor' && !model.get('isAplicador')) {
            this.transitionTo('aulas.bibliotecaindex');
        }
    }
});