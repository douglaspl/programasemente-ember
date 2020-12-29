import Ember from 'ember';
import Component from '@ember/component';

Ember.LinkComponent.reopen({
  activeClass: 'tabs__tab--is-active'
});

export default Component.extend({
  tagName: '',
  router: Ember.inject.service('-routing'),
  session: Ember.inject.service('session'),

  toogleModal(target) {
    var el = document.getElementById(target);
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
  },

  init() {
    this._super(...arguments);
    let showtoggle = this.get('showToggle');
    this.set('showToggle', showtoggle);
    Ember.run.schedule("afterRender", this, function(){
      debugger;
      if (this.get('activeAula')) $("#aulas-header").addClass("tabs__tab--is-active");
    });
  },

  actions: {
    goToAulas() {
        this.get('router').transitionTo('aulas.index');
    },
    goToBiblioteca(){
      this.get('router').transitionToRoute('plataformabiblioteca.index');
    },
    invalidateSession() {
        localStorage.clear();
        this.get('session').invalidate();
    },

    toggleRole(selectedRole) {
        this.togglerole(selectedRole);
    },

    toggleAvatarModal(){
      this.toogleModal('change_image_modal');
    },
  }

});
