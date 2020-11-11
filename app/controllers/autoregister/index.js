import Controller from '@ember/controller';
import Ember from 'ember';

export default Ember.Controller.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  transitionToForm: function(e) { this.transitionToRoute('autoregister.form', e.get('id')); },

  preventDefault: Ember.run.later(function(){
    document.getElementById("inicia-cadastro").addEventListener("click", function(event){
      event.preventDefault()
    });
  }),

  actions: {
    checkForm(){
      $('form').removeData('validator');
      $('form').removeData('unobtrusiveValidation');
      $.validator.unobtrusive.parse('form');
      let that = this;
      let schoolCode = document.getElementById('codigo-escola').value;
      let codigo = this.get('store').queryRecord('codigo-cadastro', {
        include: 'instituicao.plataforma-anos, instituicao.plataforma-turmas',
        codigo: schoolCode
      }).then(function(e){
        // that.transitionToForm(e);
        that.transitionToRoute('autoregister.form', e.get('id'));
      }).catch(function(error) {
        if (error.errors) {
          let errorCompartiment = document.getElementById('codigo-error');
          let errorStatus =  error.errors[0].status;
          errorCompartiment.innerHTML = errorStatus === "400" ? 'Verifique o código inserido' : 'Erro genérico';
          errorCompartiment.classList.add('alert--is-show');
          // errorCompartiment.innerHTML = error.errors[0].title;
        }
      })
    }

  }
});
