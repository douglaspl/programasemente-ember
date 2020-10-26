import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
    store: Ember.inject.service(),
    model(id) {
        return this.get('store').findRecord('codigo-cadastro', id.codigo_id ,{ include: 'instituicao.plataforma-anos, instituicao.plataforma-turmas.plataforma-ano, instituicao.sistemas', reload: true} );
    },
});