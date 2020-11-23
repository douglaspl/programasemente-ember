import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';

Ember.TextField.reopen({
  attributeBindings: ['data-type', 'data-required']
});


export default Ember.Component.extend({
  tagName: '',
  store: Ember.inject.service(),
  index: '',
  updatedIndex: Ember.computed('data', function() {
    var update = this.index + 1; // +1 vem do Array, +1 vem do profile.form que é o primeiro responsável
    return update;
  }),

  actions: {
    saveResponsavel: function(responsavel) {
      debugger;
      if (this.checkform()) {
        // this.gonext();
        // responsavel.get('dependentes').forEach(dep => {
        //   responsavel.get('dependentes').removeObject(dep);
        // });
        // responsavel.get('dependentes').pushObject(this.get('model'));

        responsavel.save().then(function (responsavel) {}).catch(function (error) {});

      } else {
        return false;
      }
    },

    next: function() {
      this.gonext();
    },

    previous: function() {
      this.goback();
    },

        toggleinput() {
          this.toggleinput();
        },

        checkName() {
            this.checkname();
          },

  
    checkName: function() {
      this.checkname();
    },

    checkemail: function() {
      this.checkemail();
    },

    maskcel(v) {
      this.maskcel(v);
    },

    checkcel: function() {
      this.checkcel();
     }

  }
});
