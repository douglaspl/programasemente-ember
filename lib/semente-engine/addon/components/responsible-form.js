import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
  tagName: '',
  store: Ember.inject.service(),
  index: '',
  updatedIndex: Ember.computed('data', function() {
    var update = this.index + 2; // +1 vem do Array, +1 vem do profile.form que é o primeiro responsável
    return update;
  }),

  actions: {
    saveResponsavel: function(responsavel) {
      if (this.checkform()) {
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

    phoneMask: function(v) {
      debugger;
      let target = event.target;
      var r = v.replace(/\D/g, "");
      r = r.replace(/^0/, "");
      if (r.length > 10) {
        r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
      } else if (r.length > 5) {
        r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (r.length > 2) {
        r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
      } else if (r.length == 0) {
        r = "";
      } else {
        r = r.replace(/^(\d*)/, "($1");
      }
      target.value = r;
    },

    checkName: function() {
      this.checkname();
    },

    checkemail: function() {
      this.checkemail();
    },

    checkcel: function() {
      this.checkcel();
      this.send('phoneMask');
    }

  }
});
