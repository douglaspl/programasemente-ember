import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
    store: Ember.inject.service(),
    model(aulaId) {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return RSVP.hash({
            pessoa: this.get('store').findRecord('pessoa', person_id, {include: 'plataforma-anos.segmento, plataforma-anos.aulas.unidade, plataforma-anos.aulas.aplicacao-plataforma-aula, plataforma-turmas.aplicacoes-plataforma-aula, dependentes.plataforma-anos.aulas, dependentes.plataforma-anos.segmento', reload: true}),
            aula: this.get('store').findRecord('aula', aulaId.aula_id, {include: 'plataforma-ano, aplicacao-plataforma-aula.plataforma-turma.instituicao', reload: true})
        })
    },
});
