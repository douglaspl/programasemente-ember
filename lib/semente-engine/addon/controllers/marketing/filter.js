import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  areas: Ember.computed('model', function(){
    return this.get('store').peekAll('area-marketing')
  }),
  selectedAreaName: 'Todos',
  queryParams: ["area_id"],
  itens: Ember.computed('model', function(){
    return this.get('model');
  }),
  selectedArea: Ember.computed('model', function(){
    if (this.get('area_id') != ''){
      let area = this.get('areas').filterBy('id', this.get('area_id'))[0];
      this.set('selectedAreaName', area.get('name'));
    } else this.set('selectedAreaName', 'Todos');
    return this.get('area_id');
  }).property('area_id'),
  pessoaRole: Ember.computed('', function(){
    let person_read = JSON.parse(localStorage.getItem('person_logged'));

    // let person = this.get('store').peekRecord('pessoa', person_read.id);
    let personRole = person_read.role;
    return personRole;
  }),

  actions: {
    goToCreateItem() {
      this.transitionToRoute('marketing.create');
    },
    refreshSelectedArea(selectedAreaId){
      this.set('area_id', selectedAreaId);
    },
    goToEditItem(itemId) {
      this.transitionToRoute('marketing.edit', itemId);
    },
  },
  init: function(){
    this._super();
  }

});
