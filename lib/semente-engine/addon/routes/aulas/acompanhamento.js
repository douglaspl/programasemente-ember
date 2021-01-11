import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return RSVP.hash({
            pessoa: this.get('store').findRecord('pessoa', person_id, {include: 'instituicao.modulos, instituicao.turmas.acompanhamentos-atividade-turma.atividade, instituicao.acompanhamentos-curso-instituicao.modulo, instituicao.acompanhamentos-atividade-instituicao.atividade, instituicao.instituicao-filhas.turmas.modulo', reload: true}),
        });
    }
});
