import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  parentController: Ember.inject.controller('aulas'),
  store: Ember.inject.service(),
  selectedSegmentoLocal: Ember.computed('model', function() {
    return this.get('parentController').get('segmentosObjects').get('firstObject');
  }),  
  actions: {
    toggleRole(selectedRole) {
      this.get('parentController').send('toggleRole', selectedRole)
    },
    refreshSelectedSegmento(selectedSegmento) {
      // let segmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
      this.set('segmento_id', selectedSegmento.get('id'));
      this.set('selectedSegmentoLocal', selectedSegmento);
    },
  }
});