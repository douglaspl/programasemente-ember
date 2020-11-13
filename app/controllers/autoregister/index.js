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
    checkForm() {
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
          // Pega alerta
          const errorCompartiment = document.getElementById('codigo-error');
          // Pega animação do alerta
          const alertAnimation = errorCompartiment.dataset.animation;
          // Pega container da mensagem a ser escrita
          const msg = errorCompartiment.querySelector('[class*="__msg"]');
          // Pega a identificação do erro
          const errorStatus =  error.errors[0].status;
          // Define mensagem de erro, caso seja o erro XYZ
          let errorMsg = errorStatus === "400" ? 'Por favor verifique código inserido.' : 'Ocorreu um erro geral, mas nossos desenvolvedores já foram alertados e iremos corrigir em breve.';

          // Injeta mensagem de erro.
          msg.innerHTML = '<strong>' + errorMsg + '</strong>';

          // Confere se o elemento já está aparecendo
          if(!errorCompartiment.classList.contains('alert--is-show')) {
            // Adiciona duas classes: uma para o alerta aparecer e outra com a animação definida no html, por meio de data-SBRUBLES
            errorCompartiment.classList.add('alert--is-show', alertAnimation);
          }

        }

      })
    },

    /**
     * Captura o uso do enter em um input
     * @param  {Element} elemento que foi usado para acionar a função
     */
    checkFormEnter: function(e) {
      if (e.key === 'Enter') {
        // Evita do form ser enviado
        e.preventDefault();
        // Chama outro método dentro de "actions"
        this.send(e.target.dataset.function);
      }
    }

  }
});
