import Controller from '@ember/controller';
import Ember from 'ember';

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  transitionToForm: function(e) { this.transitionToRoute('autoregister.form', e.get('instituicao').get('id')); },
  actions: {
    makeAjax(){
    },
    checkForm(){
      $('form').removeData('validator');
      $('form').removeData('unobtrusiveValidation');
      $.validator.unobtrusive.parse('form');
      let that = this;

      let schoolCode = document.getElementById('codigo-escola').value;
      let codigo = this.get('store').queryRecord('codigo-cadastro', {
        include: 'instituicao',
        codigo: schoolCode
      }).then(function(e){
        debugger;
        that.transitionToForm(e);
      }).catch(function(error) {
        let errorCompartiment = document.getElementById('codigo-error');
        errorCompartiment.innerHTML = error.errors[0].title;
      })
    }

  }
});
