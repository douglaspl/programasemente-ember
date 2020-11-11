import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return RSVP.hash({
            pessoa: this.get('store').findRecord('pessoa', person_id, {include: 'instituicao.plataforma-anos.aulas.plataforma-conteudos, instituicao.plataforma-anos.segmento', reload: true}),
            agrupamento: this.get('store').findAll('agrupamento', {include: 'temas', reload: true}),
            publico: this.get('store').findAll('publico'),
            });
    }
});
