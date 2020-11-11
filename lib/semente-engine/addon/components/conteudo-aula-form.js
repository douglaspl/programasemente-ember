import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
        refreshSelectedSegmento(selectedSegmentoId) {
            let segmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
            this.set('selectedSegmento', segmento);
        },
        refreshSelectedAno(selectedAnoId) {
            let ano = this.get('store').peekRecord('plataforma-ano', selectedAnoId);
            this.set('selectedAno', ano);
        },
        refreshSelectedAula(selectedAulaId) {
            let aula = this.get('store').peekRecord('aula', selectedAulaId);
            this.set('selectedAula', aula);
        },
        salvarAula(selectedAula){
            let conteudo = this.get('conteudo');
            conteudo.get('aulas').pushObject(selectedAula);
            this.set('adicionarAula', "false")
        },
    }
});
        