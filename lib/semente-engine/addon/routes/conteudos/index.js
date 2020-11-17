import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        //return this.get('store').findRecord('pessoa', person_id, {include: 'instituicao.plataforma-anos.aulas.plataforma-conteudos, agrupamento.temas, plataforma-anos.segmento, publico', reload: true});
        return RSVP.hash({
            pessoa: this.get('store').findRecord('pessoa', person_id, {}),
            agrupamentos: this.get('store').findAll('agrupamento', {include: 'temas', reload: true}),
            segmentos: this.get('store').findAll('segmento', {include: 'plataforma-ano.aulas', reload: true}),
            platconteudos: this.get('store').findAll('plataforma-conteudo', {include: 'aulas.plataforma-ano.segmento, publicos, agrupamento.temas, tema', reload: true}),
            });
    },
});
