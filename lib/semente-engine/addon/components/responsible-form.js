import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';

Ember.TextField.reopen({
  attributeBindings: ['data-type', 'data-required']
});


export default Ember.Component.extend({
  tagName: '',
  store: Ember.inject.service(),
  role:  Ember.computed(function() {
    let person_read = JSON.parse(localStorage.getItem('person_logged'));
    let person = this.get('store').peekRecord('pessoa', person_read.id);
    return person.get('role');
  }),
  
  index: '',
  updatedIndex: Ember.computed('data', function() {
    var update = this.index + 1; // +1 vem do Array, +1 vem do profile.form que é o primeiro responsável
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

    removeResponsible: function(model, responsavel) {
      model.get('responsaveis').removeObject(responsavel);
      responsavel.get('dependentes').removeObject(model);

      // model.save().then(function(model) {}).catch(function(error) {});
      if (responsavel.get('id')) {
        let that = this;
        responsavel.save().then(function(responsavel) {
          that.get('store').unloadRecord(responsavel);
        }).catch(function(error) {});
      } else {
        this.get('store').unloadRecord(responsavel);
      }
    },
    
    removePartner: function(model, parceiro) {
      
      var dependentes = model.get('dependentes');

      dependentes.forEach(dep => {
        dep.get('responsaveis').removeObject(parceiro);
        parceiro.get('dependentes').removeObject(dep);
        dep.save().then(function(model) {}).catch(function(error) {});
      });

      // parceiro.save().then(function(parceiro) {}).catch(function(error) {});
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

    validateemail() {
      this.validateemail();
    },

    maskcel(v) {
      this.maskcel(v);
    },

   
    checkcel: function() {
      this.checkcel();
    },

     celmaxlength() {
       this.celmaxlength();
     },

     trimall() {

      this.trimall();
    },

  }
});
