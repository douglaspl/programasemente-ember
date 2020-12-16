import Route from '@ember/routing/route';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Route.extend({
    store: Ember.inject.service(),
    queryParams: {
        segmento_id: {
          refreshModel: true,
        },
        plataformaano_id: {
          refreshModel: true,
        },
        instituicao_id: {
          refreshModel: true,
        },
        plataforma_turma_id: {
          refreshModel: true,
        }
      },
    model(param) {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return RSVP.hash({
            acompsPlataforma: this.get('store').query('acompanhamento-plataforma', {segmento_id: param.segmento_id, plataformaano_id: param.plataformaano_id, instituicao_id: param.instituicao_id, plataforma_turma_id: param.plataforma_turma_id, include: ''}),
            pessoa: this.get('store').findRecord('pessoa', person_id, {include: ''}),
        });
    }
});
