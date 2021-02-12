import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../../config/environment';

export default Controller.extend({
  store: Ember.inject.service(),
  pubValidation: Ember.computed('', function(){
    return false
  }).property(),
  conteudo: Ember.computed('model', function(){
    return this.get('model')
  }),
  agrupamentos: Ember.computed('model', function(){
    return this.get('store').findAll('agrupamento');
  }),
  sortingKey: ['idx'],
  sortedAgrupamentos: Ember.computed.sort('agrupamentos', 'sortingKey'),
  segmentos: Ember.computed('model', function(){
    return this.get('store').peekAll('segmento');
  }),
  publicos: Ember.computed('model', function(){
    return this.get('store').peekAll('publico');
  }),
  salvarbutton: "Salvar",
  envnmt: ENV.APP,
  session: Ember.inject.service('session'),
  sendFile(conteudo){
    let tok = this.get('session.data').authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/arquivos/upload';
    let path = conteudo.get('agrupamento.name');
    if (conteudo.get('agrupamento.idx')=='3') path = path + '/' + conteudo.get('tema.name');
    let that = this;
    return new Ember.RSVP.Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
      xhr.setRequestHeader('Authorization', userToken);
      xhr.setRequestHeader('filename', conteudo.get('filename'));
      xhr.setRequestHeader('path', path);
      xhr.setRequestHeader('container', "conteudos");
      xhr.send(conteudo.get('path'));

      function handler() {
        that.set('percentage', " " + 100*(this.readyState/this.DONE) + " %");
        if (this.readyState === this.DONE) {
            if (this.status === 200 || this.status === 204) {
              conteudo.set('arquivoUrl', this.response.data.attributes["url"]);
              conteudo.set('path', null);
              resolve(this.response);
            } else if (this.status === 404) {
                reject('Server not found');
            } else if (this.status >= 400) {
            reject(new Error(this.response.error));
            } else {
            reject(new Error('Failure from server call: [' + this.status + ']'));
            }
          }
        }
      });
  },


  validateForm: function() {
      //  debugger;
    let errors = [];
    let globalError = document.getElementById('content-error');

    // Validação Origem preenchida
    let hasFile = this.get('conteudo.filename');
    let videoUrlId = document.getElementById('videoUrlId');
    let error_origem = document.getElementById('error_origem');
    
    if (!hasFile && videoUrlId.value === "") {
        error_origem.innerHTML = 'Escolha a origem do conteúdo';
        error_origem.classList.add('form__msg--is-show');
        errors.push('origem');
    } else if (videoUrlId.value.length > 0 && videoUrlId.value.length < 6) {
        error_origem.innerHTML = 'Este não parece ser um endereço de vídeo válido';
        error_origem.classList.add('form__msg--is-show');
        errors.push('origem');
    } else {
        error_origem.innerHTML = '';
        error_origem.classList.remove('form__msg--is-show');
        errors = errors.filter(function(item) {
            return item !== "origem"
        })
    }

    // Validação do título
    let titulo = document.getElementById('tituloConteudo');
    let error_titulo = document.getElementById('error_title')

    if (titulo.value === '') {
        error_titulo.innerHTML = 'Preencha o título';
        error_titulo.classList.add('form__msg--is-show');
        errors.push('titulo');
    } else {
        error_titulo.innerHTML = '';
        error_titulo.classList.remove('form__msg--is-show');
        errors = errors.filter(function(item) {
            return item !== "titulo"
        })
    }

    // Validação conjunta dos campos em Publico
    
    let error_publico = document.getElementById('error_publico');
    let conteudoAtual = this.get('conteudo');
  
    
    
    
      // Validação aulas
      debugger;  
      let agrupamentoAtual = this.get('conteudo.agrupamento');
    
        if (agrupamentoAtual.get('id') !== '3' && conteudoAtual.get('aulas').get('length') < 1) {
          this.set('classValidation', true);
          error_publico.innerText = 'Atrele o conteúdo a pelo menos um segmento, ano/série e bloco/aula';
          errors.push('aulas');
        } else {
          this.set('classValidation', false);
          errors = errors.filter(function(item) {
            return item !== "aulas"
        })
        }

        // Validação do público
        let pubChekboxes = document.getElementsByClassName('j-publico');
        let arrayCheckboxes = Array.from(pubChekboxes);
        let notCheckeds = [];

        arrayCheckboxes.forEach(checkbox => {
          if (checkbox.checked == false) {
            notCheckeds.push(checkbox);
          }
        });

        if (pubChekboxes.length == notCheckeds.length) {
          this.set('pubValidation', true);
          error_publico.innerText = 'Selecione pelo menos um público para este conteúdo';
          errors.push('publico');
        } else {
          this.set('pubValidation', false);
          errors = errors.filter(function(item) {
          return item !== "publico"
        })
        }
      
        if (this.get('classValidation') || this.get('pubValidation')) {
          error_publico.classList.remove('form__msg--is-show', 'fadeInRightShort');
          setTimeout(() => {
            error_publico.classList.add('form__msg--is-show', 'fadeInRightShort');
          }, 1);
        } else {
          error_publico.classList.remove('form__msg--is-show', 'fadeInRightShort');
        }


      // Validação da capa
      let error_capa = document.getElementById('error_capa');
      if (conteudoAtual.get('tipo') == 'Documento' && conteudoAtual.get('thumbnail') == null) {
        error_capa.classList.add('form__msg--is-show');
        error_capa.innerText = 'Você precisa especificar uma capa quando o conteúdo é um documento';
        errors.push('capa');
      } else if (conteudoAtual.get('tipo') == 'Documento' && conteudoAtual.get('thumbnail') !== null) {
        error_capa.classList.remove('form__msg--is-show');
        errors = errors.filter(function(item) {
          return item !== "capa"
        })
      }  

    // Retorno da função

    if (errors.length > 0) {
      this.set('hasErrors', true);
      return false;
    } else {
      this.set('hasErrors', false);
      return true;
    }
    
},
  actions: {    
    saveConteudo(conteudo) {
      if (this.validateForm()) {
        let that = this;
        if ((conteudo.get('tipo') != 'Documento') || (conteudo.get('thumbnail') != null) ){
          this.set('salvarbutton','Aguarde...');
          this.sendFile(conteudo).then(function(){
            conteudo.save().then(function(){
              that.set('salvarbutton','Salvar');
              that.set('model', that.get('store').createRecord('plataforma-conteudo', { situacao: true }));
             
            
            }).catch(function(error) {
              // erro
              that.set('salvarbutton','Salvar');
            });
          });
        } else{

        }
        let main = document.getElementById('content-main');
        let successAlert = document.getElementById('create-alert-sucess');
        main.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        successAlert.classList.add('alert--is-show');
        setTimeout(() => {
          successAlert.classList.remove('alert--is-show');
        }, 3000);
      }
    },

    removePubError() {
      this.set('pubValidation', false);
    }

  }
});
