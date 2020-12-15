import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return RSVP.hash({
            pessoa: this.get('store').findRecord('pessoa', person_id, {}),
            platconteudos: this.get('store').findAll('plataforma-conteudo', {include: 'aulas.plataforma-ano.segmento, publicos, agrupamento.temas, tema', reload: true}),
        });
    },
});
