import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    model(conteudoId) {
        return this.get('store').findRecord('plataforma-conteudo', conteudoId.conteudo_id);
    }
});
