import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../../../config/environment';

export default Controller.extend({
  envnmt: ENV.APP,
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.resumeCargaIfRunning();
  },

  willDestroy() {
    this._super(...arguments);

    if (this._cargaLoteInterval) {
      clearInterval(this._cargaLoteInterval);
    }
  },


  oneInst: false,
  pessoaLogged: Ember.computed('model', function () {
    let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
    return this.get('store').peekRecord('pessoa', infosLogged.id);
  }),
  percentCarga: 0,
  isRunning: 0,
  loadMessage: 'Carregando dados...',

  error_lote: '',
  erro_lista: '',
  selected_file: '',
  wait_lote: true,
  lista_lote: '',
  historyLote: true,
  preProcessamento: false,

  loadInfo: Ember.computed('model', function () {
    this.refreshListaLote();
  }),

  refreshListaLote() {
    this.getListaLote().then((response) => {
      let lista = response.data;
      let pessoaId = this.get('pessoaLogged').get('id');
      let result = [];
      let refresh;
      lista.forEach(item => {
        let actionUser = response.included.find(el => {
          if (el.id == item.relationships.pessoa.data.id)
            return el;
        });

        let link;
        if (item.attributes.status === "Sucesso" || item.attributes.status === "Realizada com Erros") {
          link = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/cadastrolotes/download?id=' + item.id + '&pessoaId=' + pessoaId;
        }
        if (item.attributes.status === "Processando") refresh = true;
        this.set('loadMessage', 'Há uma carga em andamento...');
        let obj = {
          'id': item.id,
          'pessoaNome': actionUser.attributes.name,
          'data': moment(1000 * item.attributes.data).format('D/M/Y hh:mm a'),
          'nomeArquivo': item.attributes.nomeArquivo,
          'quantidadeDeUsuarios': item.attributes.quantidadeDeUsuarios,
          'status': item.attributes.status,
          'usuariosNaoProcessados': item.attributes.usuariosNaoProcessados,
          'usuariosProcessados': item.attributes.usuariosProcessados,
          'link': link
        };
        result.pushObject(obj);
      });
      var spinner = document.getElementById('spinner-importar-lote');
      if (refresh) {
        this.refreshListaLote();
        spinner.style.display = "flex";
      } else {
        spinner.style.display = "none";
        this.set('loadMessage', 'Carregando dados...');
      }
      this.set('wait_lote', false);
      this.set('lista_lote', result);
    }).catch((erro) => {
      this.set('wait_lote', false);
      this.set('erro_lista', erro);
    });
  },

  getListaLote() {
    let pessoaId = this.get('pessoaLogged').get('id');
    let instituicaoId = this.get('model.instituicao').get('id');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);

    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/cadastrolotes?include=pessoas';
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('pessoaid', pessoaId);
      xhr.setRequestHeader('instituicaoid', instituicaoId);
      xhr.setRequestHeader('Authorization', userToken);
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200 || this.status === 204) {
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

  sendFiletoServer(file, isPre) {
    let pessoaId = this.get('pessoaLogged').get('id');
    let instituicaoId = this.get('model.instituicao').get('id');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);

    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/CargaLote';
    if (isPre) final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/PreCargaLote';
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
      xhr.setRequestHeader('pessoaid', pessoaId);
      xhr.setRequestHeader('instituicaoid', instituicaoId);
      xhr.setRequestHeader('Authorization', userToken);
      xhr.setRequestHeader('filename', document.getElementById('get_lote').files[0].name);
      xhr.send(file);

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200 || this.status === 204) {
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

  startCargaLotePolling() {
    // evita múltiplos intervals
    if (this._cargaLoteInterval) {
      clearInterval(this._cargaLoteInterval);
    }

    // primeira checagem imediata
    this.checkCargaLoteStatus();

    // depois a cada 5s
    this._cargaLoteInterval = setInterval(() => {
      this.checkCargaLoteStatus();
    }, 5000);
  },

  checkCargaLoteStatus() {
    let inst = this.get('model.instituicao').get('id');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let userToken = `Bearer ${tok}`;

    let url =
      this.get('envnmt.host') +
      '/' +
      this.get('envnmt.namespace') +
      '/pessoas/CargaLote/Status';

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('instituicaoId', inst);
    xhr.setRequestHeader('Authorization', userToken);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
          let resp = xhr.response;
debugger;
          if (resp.isRunning) {
            // continua loader
            console.log("Carga ainda rodando...");

            let processados = Number(resp.carga.usuariosProcessados);
            let total = Number(resp.carga.quantidadeDeUsuarios);

            let percent = total > 0 ? Math.round((processados / total) * 100) : 0;
            this.set('percentCarga', percent);


            return;
          }

          // terminou → para polling
          this.finishCargaLote();
        }
      }
    };

    xhr.send();
  },

  resumeCargaIfRunning() {
    this.checkCargaLoteStatusOnce()
      .then((resp) => {
        if (resp && resp.isRunning) {
          // garante loader ligado no step 4
          document.getElementById("icon-step-4")?.classList.remove('icon-timer-base');
          document.getElementById("icon-step-4")?.classList.add('icon-loader');

          this.set('processamentoOk', false);
          
          // começa polling contínuo
          this.startCargaLotePolling();
        }
      })
      .catch(() => {
        // se falhar, não quebra UX
      });
  },

  checkCargaLoteStatusOnce() {
    let pessoaId = this.get('pessoaLogged').get('id');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let userToken = `Bearer ${tok}`;

    let url =
      this.get('envnmt.host') +
      '/' +
      this.get('envnmt.namespace') +
      '/pessoas/CargaLote/Status';

    return new Ember.RSVP.Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'json';

      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('pessoaid', pessoaId);
      xhr.setRequestHeader('Authorization', userToken);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === xhr.DONE) {
          if (xhr.status === 200) resolve(xhr.response);
          else reject(xhr);
        }
      };

      xhr.send();
    });
  },


  finishCargaLote() {
    this.set('isRunning', false);
    if (this._cargaLoteInterval) {
      clearInterval(this._cargaLoteInterval);
      this._cargaLoteInterval = null;
    }

    // Atualiza UI para concluído
    document.getElementById('step-4').classList.remove('current');
    document.getElementById('step-4').classList.add('completed');

    document.getElementById("icon-step-4").classList.remove('icon-loader');
    document.getElementById("icon-step-4").classList.add('icon-check-g-base');

    this.set('processamentoOk', true);
    
    console.log("Carga finalizada!");
  },



  actions: {
    // baixarTemplateold() {
    //   let pessoaId = this.get('pessoaLogged').get('id');
    //   let instituicaoId = this.get('model.instituicao').get('id');
    //   window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/templatecargalote?pessoaId=' + pessoaId + '&instituicaoId=' + instituicaoId;
    // },

    baixarTemplate() {
      let percent = document.getElementById("progress-bar").style.getPropertyValue("--progress");
      if (percent == "") {
        document.getElementById("progress-bar").style.setProperty("--progress", "30%");
      }

      let pessoaId = this.get('pessoaLogged').get('id');
      let instituicaoId = this.get('model.instituicao').get('id');
      window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/templatecargalote?pessoaId=' + pessoaId + '&instituicaoId=' + instituicaoId;
      this.set('downloadStarted', true);
      Ember.run.later(this, function () {
        this.set('downloadStarted', false);
      }, 5100);

    },



    buscarArquivo() {
      this.set('errorsExists', false);
      let file_name = document.getElementById('get_lote').files[0].name;
      this.set('selected_file', file_name);


      document.getElementById('step-2').classList.remove('current');
      document.getElementById('step-2').classList.add('completed');
      document.getElementById("icon-step-2").classList.remove('icon-timer-base');
      document.getElementById("icon-step-2").classList.add('icon-check-g-base');

      document.getElementById('step-3').classList.remove('incompleto');
      document.getElementById('step-3').classList.add('current');
      document.getElementById("progress-bar").style.setProperty("--progress", "60%");

    },

    validarArquivo() {
      this.set('validacaoOK', false);
      this.set('errorsExists', false);
      this.set('avisoPlanilha', false);
      let file_lote = document.getElementById('get_lote').files[0];
      if (file_lote) {
        this.sendFiletoServer(file_lote, true).then((response) => {
          this.set('preProcessamento', true);

          var avisosPlanilha = response.filterBy('type', 'Aviso');

          var errosPlanilha = response.filterBy('type', 'Planilha');
          this.set('errosPlanilha', errosPlanilha);

          var infosInstituicao = response.filterBy('type', 'Instituição');
          this.set('infosInstituicao', infosInstituicao);

          if (avisosPlanilha.length > 0) {
            this.set('avisoPlanilha', true);
          }

          if (errosPlanilha.length > 0 || infosInstituicao[0].pessoas.length > 0) {
            this.set('errorsExists', true);
            this.set('selected_file', '');
            document.getElementById("icon-step-3").classList.remove('icon-loader');
            document.getElementById("icon-step-3").classList.add('icon-cancel-g');
          }
          else {
            document.getElementById('step-3').classList.remove('current');
            document.getElementById('step-3').classList.add('completed');
            document.getElementById("icon-step-3").classList.remove('icon-loader');
            document.getElementById("icon-step-3").classList.add('icon-check-g-base');
            document.getElementById('step-4').classList.remove('incompleto');
            document.getElementById('step-4').classList.add('current');
            document.getElementById("progress-bar").style.setProperty("--progress", "90%");
            this.set('validacaoOK', true);
            this.set('errorsExists', false);
          }

        }).catch((erro) => {
          this.set('timeoutTxt', "ocorreu um erro ao pré processar o arquivo");
        });

        document.getElementById("icon-step-3").classList.remove('icon-timer-base');
        document.getElementById("icon-step-3").classList.remove('icon-cancel-g');
        document.getElementById("icon-step-3").classList.add('icon-loader');
      } else {
        this.set('selected_file', '');
      }
    },

    processarArquivo() {
      this.set('validacaoOK', false);
      this.set('processamentoOk', false);
      this.set('errorsExists', false);
      this.set('preProcessamento', false);
      this.set('emAndamento', true);

      let file_lote = document.getElementById('get_lote').files[0];

      if (!file_lote) {
        this.set('selected_file', '');
        return;
      }

      // Coloca loader no step 4 imediatamente
      document.getElementById("icon-step-4").classList.remove('icon-timer-base');
      document.getElementById("icon-step-4").classList.add('icon-loader');

      // Envia arquivo para o backend (só enfileira no Hangfire)
      this.sendFiletoServer(file_lote, false)
        .then((response) => {

          // Aqui NÃO significa que terminou.
          // Só significa que foi enviado para a fila.

          this.set('timeoutTxt', null);
          this.set('processamentoOk', false);

          // Começa polling para acompanhar até finalizar
          this.startCargaLotePolling();
          this.set('isRunning', true);

        })
        .catch((erro) => {

          // Remove loader
          document.getElementById("icon-step-4").classList.remove('icon-loader');
          document.getElementById("icon-step-4").classList.add('icon-timer-base');

          this.set('timeoutTxt', "ocorreu um erro ao enviar o arquivo");
          console.error(erro);
        });
    },


    // importarLote() {
    //   let file_lote = document.getElementById('get_lote').files[0];

    //   if (file_lote) {
    //     this.sendFiletoServer(file_lote, false).then(() => {
    //       this.set('error_lote', '');
    //       this.set('erro_lista', '');
    //       this.set('wait_lote', true);
    //       this.set('historyLote', true);
    //       this.set('selected_file', '');
    //       this.set('lista_lote', '');
    //       this.set('preProcessamento', false);
    //       this.set('refreshListaPessoas', true);
    //       document.getElementById('get_lote').value = '';
    //       this.refreshListaLote();
    //       document.getElementsByTagName('body')[0].style.overflow = 'auto';
    //     }).catch((erro) => {
    //       this.set('refreshListaPessoas', false);
    //       this.set('timeoutTxt', "ocorreu um erro ao importar o arquivo");
    //       this.refreshListaLote();
    //     });

    //     var spinner = document.getElementById('spinner-importar-lote');
    //     spinner.style.display = "flex";
    //   } else {
    //     this.set('selected_file', '');
    //     this.set('error_lote', 'impossivel achar arquivo');
    //   }
    // },

    abrirPasso() {
      document.getElementById("passoapasso").classList.toggle('img-passoapasso');
    },
    giro() {
      document.getElementById("seta").classList.toggle('giro');
    },

    showDetails(id) {
      let el = document.getElementById('detalhes-' + id);
      if (el.style.display == 'none') el.style.display = 'flex';
      else el.style.display = 'none';
    },

    verifyListPessoas() {
      if (this.get('refreshListaPessoas')) {
        var params = { 'instituicao_id': null, 'perPage': null, 'page': null, 'ordem': null, 'str_search': null, 'selected_segmento_id': null, 'selected_instituicao_filha': null, 'selected_ano_id': null, 'selected_turma_id': null, 'disabled': null };
        params['instituicao_id'] = this.get('model.instituicao').get('id');
        params['perPage'] = 10;
        params['page'] = 1;
        params['ordem'] = 'az';
        params['disabled'] = true;
        this.transitionToRoute('gerdata.users', { queryParams: params });
      }
      else {
        this.transitionToRoute('gerdata.users', { queryParams: { instituicao_id: this.get('model.instituicao').get('id'), reload: true } });
      }
    },
  }
})