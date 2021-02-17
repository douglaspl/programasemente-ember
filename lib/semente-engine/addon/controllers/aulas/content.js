import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../../config/environment';

export default Controller.extend({
  envnmt: ENV.APP,
  annotationsSorting: ['id:desc'],
  sortedAnnotations: Ember.computed.sort('anotacoes', 'annotationsSorting'),
  appController: Ember.inject.controller('application'),
  thisRoute: Ember.run('render', function(){
    if(window.location.pathname.includes('aulas')) {
      return 'aulas';
    }
  }),
  store: Ember.inject.service(),
  newAnotacao: false,
  toggleRole: localStorage.getItem('toggleRole'),
  showToggle: false,
  pessoa: Ember.computed('model', function(){ return this.get('model.pessoa'); }),
  parentController: Ember.inject.controller('aulas'),
  aula: Ember.computed('model', function(){ return this.get('model.aula'); }),
  TurmasAplicadas: Ember.computed('aula', function(){
    let turmasAplicadas =  this.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('parentController.selectedDependente.instituicao.id')).mapBy('turma');
    return turmasAplicadas
  }).property('aula'),
  UltimaAplicacao: Ember.computed('aula', function(){
    let ultimaData =  this.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', this.get('parentController.selectedDependente.instituicao.id')).sortBy('dataAplicacao').reverse()[0];
    return ultimaData;
   }).property('aula'),

  // AplicacaoObserver: Ember.observer('UltimaAplicacao', function() {
  // debugger;
  //   this.set('UltimaAplicacao', this.get('UltimaAplicacao'));
  
  // }),


  selectedAgrupamento: 'Básico',
  conteudos: Ember.computed('aula', function(){
    let conts = this.get('aula.plataformaConteudos');
    if (['admin', 'gestor', 'coordenador'].includes(localStorage.getItem('toggleRole'))){
      conts = conts.filterBy('situacao', true).filterBy('agrupamento.name', this.get('selectedAgrupamento'));
    } else{
      conts = conts.filter(c => c.get('publicos').mapBy('name').includes(localStorage.getItem('toggleRole'))).filterBy('situacao', true).filterBy('agrupamento.name', this.get('selectedAgrupamento'))
    }
    return conts
  }).property('aula', 'selectedAgrupamento'),
  stopVideo: false,
  stopVideoEad: false,
  toggleConteudoModal(target) {
    var el = document.getElementById('content-modal');
    $(el).toggleClass('modal--is-show');
    document.getElementById("header_layout").removeAttribute('style');
    $('body').toggleClass('overflow-hidden no-header');
  },

  tarefa: Ember.computed('model', function(){
    let pessoa = this.get('pessoa');
    let aula = this.get('aula');
    let tarefa;
    pessoa.get('tarefas').forEach(function(t){
      if (t.get('aula').get('id') == aula.get('id')){
        tarefa = t;
      }
    });
    return tarefa;
  }),

  avaliacao: Ember.computed('model.aula', function(){
    let pessoa = this.get('pessoa');
    return pessoa.get('avaliacoes').filterBy('aula.id', this.get('aula').get('id'))[0];
  }),

  anotacoes: Ember.computed('model', function(){
    let pessoa = this.get('pessoa');
    return pessoa.get('anotacoes').filterBy('aula.id', this.get('aula').get('id'));
  }),
  activeAula: true,
  todasAulas: Ember.computed('model', function(){ return this.get('store').findAll('aula', {include: 'plataforma-ano'}) }),

  actions: {
    voltar() {
      this.transitionToRoute('aulas.index');
    },
    toggleRole(selectedRole) {
      this.get('parentController').send('toggleRole', selectedRole)
    },

    refreshSelectedAula(selectedAulaId) {
      let aula = this.get('store').peekRecord('aula', selectedAulaId);
      this.set('aula', aula);
    },
    refreshSelectedAgrupamento(selectedAgrupamento){
      this.set('selectedAgrupamento', selectedAgrupamento);
    },
    toggleModal(conteudoId){
      this.set('stopVideo', false);
      var conteudo = this.get('model.aula.plataformaConteudos').filterBy('id', conteudoId).get('firstObject');
      this.set('selectedConteudo', conteudo);
      this.toggleConteudoModal();
    },
    closeConteudoModal() {
      this.set('stopVideo', true);
      this.set('selectedConteudo', null);
      this.toggleConteudoModal();
    },
    toggleModalEad(params) {
      this.set('stopVideoEad', false);
      this.set('videoId', params[0]);
      this.set('videoName', params[1]);
      var el = document.getElementById('content-modal-ead');
      $(el).toggleClass('modal--is-show');
      $('body').toggleClass('overflow-hidden no-header');
    },
    closeConteudoModalEad() {
      this.set('stopVideoEad', true);
      var el = document.getElementById('content-modal-ead');
      $(el).toggleClass('modal--is-show');
      $('body').toggleClass('overflow-hidden no-header');
   
    },

    refreshTarefa(){
      let tarefa = this.get('tarefa');
      if (tarefa){
        tarefa.set('realizado', !tarefa.get('realizado'));
        tarefa.save();
      } else {
        let newTarefa = this.get('store').createRecord('tarefa',{
          pessoa: this.get('pessoa'),
          aula: this.get('aula')
        });
        newTarefa.save();
      }
    },

    avaliar(nota){
      let avaliacao = this.get('avaliacao');
      if (avaliacao){
        avaliacao.set('nota', nota);
        avaliacao.save();
      } else{
        let newAvaliacao = this.get('store').createRecord('avaliacao',{
          pessoa: this.get('pessoa'),
          aula: this.get('aula'),
          nota: nota
        });
        newAvaliacao.save();
        this.set('avaliacao', newAvaliacao);
      }

      // Adiciona feedback para o usuário ter uma dica que salvou a nota nova
      // Pega o rating (dificilmente existirá mais de um na página)
      let rating = document.querySelector('#rating');

      // Confere se ele já recebeu a classe blink. Se sim, remove a classe
      if(rating.classList.contains('blink')) {
        rating.classList.remove('blink');
      }

      // Aplica classe blink no rating para dar retorno visual ao usuário, após um "pentelésimo"
      setTimeout(function() {
        rating.classList.add('blink');
      }, 1);

    },

    createAnotacao() {
      let textArea = document.getElementById('nova-anotacao');
      let texto = textArea.value;
      let newAnotacao = this.get('store').createRecord('anotacao', {
        texto: texto,
        pessoa: this.get('pessoa'),
        aula: this.get('aula')
      });
      newAnotacao.save();
      this.get('anotacoes').pushObject(newAnotacao);
      this.set('newAnotacao', false);
      // this.send('toggleCreateAnotacao');
      // this.set('anotacoes', this.get('anotacoes').pushObject(newAnotacao));
    },

    deleteAnotacao(id) {
      let anotacao = this.get('store').peekRecord('anotacao', id);
      this.get('anotacoes').removeObject(anotacao);
      anotacao.destroyRecord();
    },

    toggleCreateAnotacao() {
      this.set('newAnotacao', true);
      setTimeout(function(){
        let textArea = document.getElementById('nova-anotacao');
        textArea.value = '';
        textArea.focus();
      }, 1);
    },


    sendSuggestion() {
      let aula = this.get('aula').get('titulo')
      let ano = this.get('aula').get('plataformaAno').get('name');
      let segmento = this.get('aula').get('plataformaAno').get('segmento').get('titulo');

      let suggestionBox = document.getElementById('suggestion');
      let benefitBox = document.getElementById('benefit');

      let localTok = JSON.parse(localStorage.getItem('person_logged'));

      let mailBody =
        "<html>" +
        "<body>" +
        "<meta name='viewport' content='width=device-width' />" +
        "<table border='0' cellpadding='0' cellspacing='0'>" +
        "<tr>" +
        "<td>" +
        "<table border='0' cellpadding='0' cellspacing='0'>" +
        "<tr>" +
        "<td style='color: #25212a; display: block; margin: 0 auto; max-width: 100%; padding: 16px; text-align: left; width: 640px;'>" +
        "<h1 style='text-transform: uppercase; font-size: 20px; letter-spacing: .1em; border-bottom: 1px solid #efeff0; margin: 0 0 24px; padding-bottom: 8px;'>Sugestão para <span class='color-leaf-50'>" + aula + "</span> | <span class='color-leaf-50'>" + ano + " </span> | <span class='color-leaf-50'>" + segmento + "</span></h1>" +
        "<ul style='list-style: none; margin: 0; padding: 0;'>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Email:</strong> " + localTok.email + "</li>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Nome:</strong> " + localTok.name + "</li>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Instituicao:</strong> " + localTok.instituicao_name + "</li>" +
        "<li style='margin-bottom:  0px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Sugestão:</strong> " + suggestionBox.value + "</li>" +
        "<li style='margin-bottom:  0px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Benefício:</strong> " + benefitBox.value + "</li>" +
        "</ul>" +
        "</td>" +
        "</tr>" +
        "</table>" +
        "</td>" +
        "</tr>" +
        "</table>" +
        "</body>" +
        "</html>";

      let url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/emails-semente';
      let params = JSON.stringify({
        "data": {
          "type": "email-semente",
          "id": "0",
          "attributes": {
            "email-origem": "no-reply@programasemente.com.br",
            "email-destino": "douglas.linhares@programasemente.com.br",
            "assunto": "Sugestão para melhoria de aula", 
            "plain-text": "Melhoria de aula",
            "html-content": mailBody,
            //"meta-dados": "{path: " + location.pathname + ", screen: " + window.screen.width + 'x' + window.screen.height + ", browser: " + browserName + "}"
          },
          "relationships": {
            "pessoa": {
              "data": [{
                "type": "pessoa",
                "id": localTok.id.toString()
              }]
            }
          }
        }
      });
      
      this.get('appController').makeCustomCall('POST', url, params).then(() => {
        
      }).catch(() => {

      });

        suggestionBox.value = '';
        benefitBox.value = '';
        document.getElementById('suggestionSent').classList.add('suggestions__sent--is-show');
        setTimeout(() => {
          document.getElementById('suggestionSent').classList.remove('suggestions__sent--is-show');
        }, 3500);

     
    }
  
  },
});
