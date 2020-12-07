import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return this.get('store').findRecord('pessoa', person_id, {include: 'instituicao, plataforma-anos.segmento, plataforma-anos.aulas.unidade, plataforma-anos.plataforma-turmas, plataforma-anos.aulas, plataforma-turmas.aplicacao-plataforma-aula.aula, dependentes.plataforma-anos.plataforma-turmas, dependentes.plataforma-anos.aulas, dependentes.plataforma-turmas.aplicacao-plataforma-aula.aula, dependentes.plataforma-anos.aulas.unidade, dependentes.plataforma-anos.segmento', reload: true});
    },
});

//dependetes.plataforma-anos.aulas