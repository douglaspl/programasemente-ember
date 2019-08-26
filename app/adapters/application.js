import DS from 'ember-data';
// import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import Inflector from 'ember-inflector';
import { computed } from '@ember/object';
import ENV from '../config/environment';
import Ember from 'ember';

const inflector = Inflector.inflector;
inflector.irregular('instituicao', 'instituicoes');
inflector.irregular('secao', 'secoes');
inflector.irregular('quiz', 'quizes');
inflector.irregular('resposta', 'respostas');
inflector.irregular('questao', 'questoes');
inflector.irregular('material', 'materiais');
// inflector.uncountable('acompanhamento-curso-instituicao');
inflector.uncountable('acompanhamento-atividade-instituicao');
inflector.uncountable('acompanhamento-ativitade-turma');
export default DS.JSONAPIAdapter.extend({
    envnmt: ENV.APP,
    session: Ember.inject.service('session'),
    host: Ember.computed('envnmt', function() { //this will define if the server endpoint for the API calls are relative or absolute. Dev - absolute API endpoint; Prod - relative
        return this.get('envnmt.host');
    }),
    namespace: Ember.computed('envnmt', function() {
        return this.get('envnmt.namespace');
    }),
    headers: computed(function() {
        let header = localStorage.getItem('person_logged');
        let header_person;
        if (header) {
            header = JSON.parse(header);
            header_person = header.id;
        }
        else {
            header_person = "";
        }
        let sessionData = this.get('session.data');
        let tok = sessionData.authenticated.access_token;
        let temp = 'Bearer ';
        let userToken = temp.concat(tok);
        return {
            'Content-Type': 'application/json',
            'pessoaid': header_person,
            'Authorization': userToken          
        };
        }).volatile(),
});
