import Ember from 'ember';
import Component from '@ember/component';

Ember.LinkComponent.reopen({
  activeClass: 'tabs__tab--is-active'
});

export default Component.extend({
  router: Ember.inject.service('-routing'),
  session: Ember.inject.service('session'),
  store: Ember.inject.service(),
  vimeoCode: Ember.computed('', function() {
    
    return 
  }).property('selectedSituacao'),
  
  actions: {
    goToAulas() {
        this.get('router').transitionTo('aulas.index');
    },
    // goToBiblioteca() {
    //     this.transitToBiblioteca();
    // },
    invalidateSession() {
        localStorage.clear();
        this.get('session').invalidate();
    },

    toggleRole(selectedRole) {
        this.togglerole(selectedRole);
    }
  },
});
