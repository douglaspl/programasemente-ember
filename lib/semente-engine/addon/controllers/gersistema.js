import Controller from '@ember/controller';
import ENV from '../config/environment';
import Ember from 'ember';
import {
  isArray
} from '@ember/array';
import {
  accordion
} from '../helpers/accordion';
import { and } from '../helpers/and';

export default Controller.extend({
  appstate: Ember.inject.service(),
  session: Ember.inject.service(),
  aulasController: Ember.inject.controller('aulas'),
  store: Ember.inject.service(),
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  creatingNewArea: false,
  savingNewArea: false,
  creatingNewAno: false,
  savingNewAno: false,
  appController: Ember.inject.controller('application'),
  modulos_list: Ember.computed('model',function(){
    let modulos = this.get('model').modulos;
    let modulosList=[];
    modulos.forEach(function(modulo){
      if(modulo.get("sistema").content.data.idx == 1){
        modulosList.push(modulo);
      }
    });
    return modulosList;
  }),
  role: Ember.computed('appController', function () {
    let ac = this.get('appController');
    return ac.get('role');
  }),
  temMedio: false,
  temS: false,
  temCoreSkills: false,
  role: Ember.computed('appController', function () {
    let ac = this.get('appController');
    return ac.get('role');
  }),
  sortingKey: ['id'],
  pessoaLogged: Ember.computed('model',function(){
    let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
    return this.get('store').peekRecord('pessoa',infosLogged.id);
  }),
  sortedModulos: Ember.computed.sort('model.modulos', 'sortingKey'),
  segmentos: Ember.computed('pessoa', function () {
    let segmentos = [];
    let segmentosIds;
    let segmento;
    this.get('inst_selected').get('plataformaAnos').forEach(ano => {
      segmentosIds = segmentos.map(seg => seg.get('id'));
      segmento = ano.get('segmento');
      if (!segmentosIds.includes(segmento.get('id'))){
        segmentos.push(segmento)
      }
    })
    return segmentos;
  }),
  oneInst: Ember.computed('model', 'role', function () {
    let inst = this.get('model.instituicoes');
    let that = this;
    if (!isArray(inst)) {
      Ember.run.once(function () {
        that.set('inst_selected', inst);
        that.set('instView', true);
        that.transitionToRoute('gersistema.gerdata', {
        queryParams: {
          instituicao_id: inst.id,
          page: 1,
        }
      });
      });
      return true;
    } else {
      return false;
    }
  }),
  sortCol: 'name',
  sortAsc: true,
  reSort: 0,
  istView: false,
  goToStepTwo: false,
  areaToDelete: null,
  selectedInstTabs: Ember.computed('model',function(){
    let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
    let pessoa = this.get('store').peekRecord('pessoa',infosLogged.id);
    if ((pessoa.get("role") != "secretaria")||(pessoa.get("role") != "marketing")){
      return {
      informations: true,
      courses: false,
      areas: false,
      users: false,
      };
    }

    return {
      informations: false,
      courses: false,
      areas: true,
      users: false,
      }
  }),
  modalTextDisplay: null,
  modalTxtConfirmation: null,
  modalTxt: {
    load: {
      default: 'Carregando...',
      saving: 'Salvando...',
      sending: 'Enviando...',
      deleting: 'Deletando...',
      reseting: 'Zerando progresso...',
    },
    confirmation: {
      turma: {
        title: 'Deseja realmente remover essa turma?',
        description: 'Todas as associações serão perdidas.'
      },
      areas: 'Deseja realmente remover a área selecionada? Todas as associações serão perdidas.',
      emails: 'Deseja realmente enviar e-mail para os usuários selecionados?',
    },
    success: {
      institution: {
        enabled: 'Instituição habilitada.',
        disabled: 'Instituição desabilitada.',
        created: 'Nova instituição incluída com sucesso.',
      },
      informations: 'As informações da instituição foram salvas com sucesso.',
      courses: 'As preferências de cursos para a instituição forams salvas com sucesso.',
      areas: {
        created: 'Nova área incluída com sucesso.',
        edited: 'Área editada com sucesso.',
        deleted: 'Área deletada com sucesso.',
      },
      turmas:{
        created: 'Nova turma incluída com sucesso.',
        edited: 'Turma editada com sucesso.',
        deleted: 'Turma deletada com sucesso.',
      }
    },
    error: {
      default: 'Ocorreu um erro, tente novamente. ',
      server: 'Ocorreu um erro de servidor, tente novamente.',
      connection: 'Ocorreu um errro de conexão, tente novamente.',
      session: 'Sessão expirada, favor logar novamente.',
      unknown: 'Ocorreu um erro desconhecido, tente novamente.',
      institution: {
        enabled: 'Ocorreu um erro ao alterar a instituição, tente novamente.',
        format: 'Nome inválido para instituição.',
        number: 'Número inválido de usuários.',
        exist: 'Nome de instituição já existente.',
        create: 'Ocorreu um erro ao incluir a instituição, tente novamente.'
      },
      courses: 'Ocoreu um erro ao salvar as preferências de cursos para a instituição, tente novamente.',
      areas: {
        format: 'Nome de área inválido',
        exist: 'Nome de área já existente',
        create: 'Ocorreu um erro ao salvar a área, tente novamente',
        edit: 'Ocorreu um erro ao editar a área, tente novamente',
        delete: 'Ocorreu um erro ao remover a área, tente novamente'
      },
      turmas: {
        format: 'Nome de turma inválido',
        exist: 'Nome de turma já existente',
        create: 'Ocorreu um erro ao salvar a turma, tente novamente',
        edit: 'Ocorreu um erro ao editar a turma, tente novamente',
        delete: 'Ocorreu um erro ao remover a turma, tente novamente',
        trackNotSelected: 'Você precisa selecionar um ano para adicionar a nova turma!'
      },
    }
  },
  coursesStateChange: {
    course1: null,
    course2: null,
    course3: null,
    course4: null,
    course5: null,
    course6: null,
  },
  areaToEdit: {
    id: null,
    name: null,
  },
  displayAccordion(param) {
    let modulo;
    this.get('inst_selected').get('modulos').forEach(function(mod){
      if (mod.id == param){
        modulo = mod;
      }
    })
    let listaAtividades = [];
    modulo.get('atividades').forEach(function(atv){
      let Intmes = parseInt(atv.data.dia.substr(5,2));
      let dia = parseInt(atv.data.dia.substr(8,2));
      let mes;
      if (Intmes == 1) mes = 'jan'
      if (Intmes == 2) mes = 'fev'
      if (Intmes == 3) mes = 'mar'
      if (Intmes == 4) mes = 'abr'
      if (Intmes == 5) mes = 'mai'
      if (Intmes == 6) mes = 'jun'
      if (Intmes == 7) mes = 'jul'
      if (Intmes == 8) mes = 'ago'
      if (Intmes == 9) mes = 'set'
      if (Intmes == 10) mes = 'out'
      if (Intmes == 11) mes = 'nov'
      if (Intmes == 12) mes = 'dez'
      let atvList = {
        'id': 'Aula ' + atv.data.idx,
        'name': atv.data.name,
        'dia': dia,
        'mes': mes,
      }
      listaAtividades.push(atvList);
    })
    this.set('atividadeList',listaAtividades);
    return accordion(param);
  },
  // ------------------------------- set selected institution
  async setSelected(inst) {
    document.getElementById('matchValue').value = null;
    document.getElementById('matchDisplay').style.display = 'none';
    document.getElementById('modelInstList').style.display = 'block';
    this.set('temS',false);
    this.set('temMedio', false);
    this.set('temCoreSkills',false);
    // let inst_selected;
    // let instit = this.get('model.instituicoes');

    // instit.forEach(function (el) {
    //   if (el.id === inst) {
    //     inst_selected = el;
    //   }
    // });
    let inst_selected = await this.get('store').findRecord('instituicao', inst, {
      include: 'modulos.atividades, sistemas, turmas', reload: true
    });
    this.set('inst_selected', inst_selected);
    let that = this;
    inst_selected.get('sistemas').forEach(function(sis){
      if(sis.data.idx == 2){
        that.set('temS', true);
      }
      if(sis.data.idx == 1){
        that.set('temMedio', true);
      }
      if(sis.data.idx == 3){
        that.set('temCoreSkills', true);
      }
    })
    if (this.get('reSort') === 0) this.set('reSort', 1);
    else this.set('reSort', 0);

    this.set('instView', true);
    window.scrollTo(0, 0);
  },

  //------------------------------------------------------------------------------------------------
  solicitaListaCodigo() {
    if (this.get('allow_refresh')) {
      setTimeout(function () {
        this.refreshListaCodigo();
      }, 1000);
    }
  },

  refreshListaCodigo() {
    this.getListaCodigo().then((response) => {
      let lista = response.data;
      let data_ls = localStorage.getItem('person_logged');
      if (data_ls) {
        data_ls = JSON.parse(data_ls);
      }
      let result = [];
      let refresh;
      lista.forEach(item => {
        let actionUser = response.included.find(el => {
          if (el.id == item.relationships.pessoa.data.id)
            return el;
        });

        let link;
        if (item.attributes.status === "Sucesso" || item.attributes.status === "Realizada com Erros") {
          link = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/cadastrocodigos/download?id=' + item.id + '&pessoaId=' + data_ls.id;
        }
        if (item.attributes.status === "Processando") refresh = true;
        let obj = {
          'id': item.id,
          'pessoaNome': actionUser.attributes.name,
          'nomeArquivo': item.attributes.nomeArquivo,
          'data': item.attributes.data,
          'status': item.attributes.status,
          'quantidadeDeCodigos': item.attributes.quantidadeDeCodigos,
          'codigosProcessados': item.attributes.codigosProcessados,
          'codigosNaoProcessados': item.attributes.codigosNaoProcessados,
          'link': link

          // 'id': item.id,
          // 'pessoaNome': actionUser.attributes.name,
          // 'data': moment(1000 * item.attributes.data).format('D/M/Y hh:mm a'),
          // 'nomeArquivo': item.attributes.nomeArquivo,
          // 'quantidadeDeUsuarios': item.attributes.quantidadeDeUsuarios,
          // 'status': item.attributes.status,
          // 'usuariosNaoProcessados': item.attributes.usuariosNaoProcessados,
          // 'usuariosProcessados': item.attributes.usuariosProcessados,
          // 'link': link
        };
        result.pushObject(obj);
      });
      var spinner = document.getElementById('spinner-importar-lote');
      if (refresh) {
        this.solicitaListaCodigo();
        spinner.style.display = "inline-block";
      } else {
        spinner.style.display = "none";
      }
      this.set('wait_lote', false);
      this.set('lista_lote', result);
    }).catch((erro) => {
      this.set('wait_lote', false);
      this.set('erro_lista', erro);
    });
  },

  sendFiletoServer2(file) {
    let header = localStorage.getItem('person_logged');
    let header_inst;
    if (header) {
      header = JSON.parse(header);
      header_inst = header.id;
    } else {
      header_inst = "";
    }
    //let inst = this.get('inst_selected');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/cadastrocodigoLoja';
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
      xhr.setRequestHeader('pessoaid', header_inst);
      xhr.setRequestHeader('instituicaoid', 1);
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

  getListaCodigo() {
    let header = localStorage.getItem('person_logged');
    let header_inst;
    if (header) {
      header = JSON.parse(header);
      header_inst = header.id;
    } else {
      header_inst = "";
    }
    //let inst = this.get('inst_selected');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    // alterar url com include de pessoas
    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/cadastrocodigos?include=pessoas';
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('pessoaid', header_inst);
      xhr.setRequestHeader('instituicaoid', 1);
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

  userListReload2() {
    let tg = this.get('str_search');

    if (tg == '' || tg == null) this.set('str_search', ' ');
    else this.set('str_search', '');

    // document.getElementById('search_input_pessoas_ger').value = null;
  },

  // --------------------------------- generic modal function
  modalDisplay(param) {
    let modal = document.getElementById('administrationModal');

    function autoClose() {
      const showClass = document.getElementsByClassName('alert--is-show');

      for (let i = 0; i < showClass.length; i++) {
        showClass[i].classList.remove('alert--is-show');
      }
    }

    const tgt = document.getElementById('administrationModal');
    if (param == 'userAlertConfirmation') tgt.classList.remove('alert--no-interaction alert--is-show');

    document.getElementById('admModalInstLoading').classList.remove('alert--is-show');
    document.getElementById('admModalInstError').classList.remove('alert--is-show');
    document.getElementById('admModalInstSuccess').classList.remove('alert--is-show');
    document.getElementById('admModalInstConfirmation').classList.remove('alert--is-show');

    if (param === 'close') {
      this.set('modalTxtDisplay', null);
      this.set('modalTxtConfirmation', null);
      modal.classList.remove('alert--is-show');
    } else {
      document.getElementById(param).classList.add('alert--is-show');

      if (param == 'admModalInstSuccess' ||
        param == 'admModalInstError'
      ) setTimeout(autoClose, 5000);
    }
  },
  // ###############################################
  // ###############################################
  // ###############################################
  timeoutIcon: null,
  /* laod | error | success */
  timeoutTxt: null,
  staticType: null,
  /* area */
  alertTitle: null,
  alertDesc: null,
  staticTxt2: null,
  timeoutAlert(param) {
    const tAlert = document.getElementById('timeoutAlertAdm');
    const timeOpen = 3000;
    const distanceBetweenAlerts = '24px';

    // Lista todos os alertas que estão sendo mostrados na tela
    if (param == 'close') {
      setTimeout(function () {
        tAlert.classList.remove('alert--is-show');
        tAlert.style.bottom = distanceBetweenAlerts;
      }, timeOpen);
    } else {

      let allOpenAlerts = document.getElementsByClassName('alert--is-show');

      if (allOpenAlerts.length > 1) {

        // Pega altura da tela
        let windowHeight = window.innerHeight;

        ///////////////
        // SOBRE O ULTIMO ALERTA MOSTRADO NA TELA
        ///////////////

        // Pega o último alerta da lista
        let lastAlert = allOpenAlerts[allOpenAlerts.length - 1];
        // Pega o offset em relação ao topo do último alerta da lista
        let lastAlertoffsetTop = parseInt(lastAlert.offsetTop);
        // Pega a altura do último alerta da lista
        let lastAlertHeight = parseInt(lastAlert.clientHeight);
        // Recupera margin bottom do último alerta da lista
        let lastAlertMarginBottom = parseInt(window.getComputedStyle(tAlert).getPropertyValue('margin-bottom'));



        ///////////////
        // SOBRE O PRÓXIMO ALERTA A SER MOSTRADA
        ///////////////

        // Pega altura do novo alerta (ainda não renderizado).
        // Primeiro alerta fica com bottom um pouco menor que o do segundo em diante.
        let tAlertHeight = parseInt(tAlert.clientHeight);
        // Calcula bottom do ultimo alerta no array de alertas
        let lastAlertBottom = windowHeight - lastAlertoffsetTop - lastAlertHeight - lastAlertMarginBottom;
        // Calcula novo bottom
        let tAlertNewBottom = lastAlertBottom + (2 * lastAlertMarginBottom) + tAlertHeight;
        // Aplica novo bottom
        tAlert.style.bottom = tAlertNewBottom + "px";

      }

      // Mostra alerta
      tAlert.classList.add('alert--is-show');

      if (param == 'load') this.set('timeoutIcon', 'load');
      else {
        if (param == 'error') this.set('timeoutIcon', 'error');
        if (param == 'success') this.set('timeoutIcon', 'success');

        this.timeoutAlert('close');
      }
    }
  },
  staticAlert(param) {
    const sAlert = document.getElementById('staticAlertAdm');

    if (param == 'close') {
      sAlert.classList.remove('alert--is-show');
      this.set('alertTitle', null);
      this.set('staticTxt2', null);
    } else {
      sAlert.classList.add('alert--is-show');
      this.set('staticType', param);
    }
  },



 redirectToTurmas: Ember.computed(function() {

  let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
  let pessoa = this.get('store').peekRecord('pessoa',infosLogged.id);
  

  if (pessoa.get('role') == 'secretaria') {
    this.set('selectedInstTabs.informations', false);
      this.set('selectedInstTabs.courses', false);
      this.set('selectedInstTabs.areas', false);
      this.set('selectedInstTabs.users', true);
      window.scrollTo(0, 0);
  }

 }),


  // ###############################################
  // ###############################################
  // ###############################################
  actions: {
    capsLockDetection: window.addEventListener("click", function (e) {
      let targetElement = e.target;
      // console.log('113');
      if (!targetElement.classList.contains('j-areaFocus') && document.getElementById('newArea')) {
        document.getElementById('newAreaName').value = null;
        // document.getElementById('newArea').style.display = 'none';

        // let itemEdits = document.getElementsByClassName('j-cancelArea');
        // for (let i = 0; i < itemEdits.length; i++) {
        //   if (document.getElementById('areaItemActions' + itemEdits[i].id.replace('j-cancelAction', '')).style.display == 'inherit') {
        //     document.getElementById(itemEdits[i].id).click();
        //   }
        // }
      }
    }),
    // -------------------------------- filter istitutions list
    filterInst() {
      let modelInstList = document.getElementById('modelInstList');
      let matchDisplay = document.getElementById('matchDisplay');
      let matchValue = document.getElementById('matchValue');
      let instList = this.get('model.instituicoes');

      if (matchValue != null){

        if (matchValue.value) {
          let searchResult = instList.filter(function (i) {
            if ((i.data.name).toLowerCase().match(new RegExp((matchValue.value).toLowerCase(), 'g'))) {
              return i;
            }
          });
          this.set('matchInsts', searchResult);
          modelInstList.style.display = 'none';
          matchDisplay.style.display = 'block';
        } else {
          let searchResult = instList;
          this.set('matchInsts', searchResult);
          matchDisplay.style.display = 'block';
          modelInstList.style.display = 'none';
        }
      }
    },
    // ------------------------------ change institution status
    enableInst(id) {
      this.set('timeoutTxt', this.modalTxt.load.default);
      this.timeoutAlert('load');

      this.set('inst_selected', false);
      let inst_selected;
      let instit = this.get('model.instituicoes');
      instit.forEach(function (el) {
        if (el.id === id) {
          inst_selected = el;
        }
      });
      this.set('inst_selected', inst_selected);
      let inst = this.get('inst_selected');
      let ena = document.getElementById('activeInstId' + id).checked;
      inst.set('enabled', ena);
      inst.save().then(() => {
        let successTxt;
        if (ena === true) successTxt = this.modalTxt.success.institution.enabled;
        else successTxt = this.modalTxt.success.institution.disabled;
        this.set('timeoutTxt', successTxt);
        this.timeoutAlert('success');
      }).catch((reason) => {
        if (reason.errors) {
          reason.errors.forEach((error) => {
            if (error.status === "500") {
              this.set('timeoutTxt', this.modalTxt.error.server);
              this.timeoutAlert('error');
            } else if (error.status === "401") {
              localStorage.clear();
              this.get('session').invalidate();
              this.set('timeoutTxt', this.modalTxt.error.session);
              this.timeoutAlert('error');
            } else {
              this.set('timeoutTxt', this.modalTxt.error.connection);
              this.timeoutAlert('error');
            }
          });
        } else if (reason.message) {
          this.set('timeoutTxt', this.modalTxt.error.institution.enabled);
          this.timeoutAlert('error');
        } else {
          this.set('timeoutTxt', this.modalTxt.error.institution.enabled);
          this.timeoutAlert('error');
        }
        this.set('timeoutTxt', this.modalTxt.error.institution.enabled);
        this.timeoutAlert('error');
        inst.rollbackAttributes();
      });
    },
    // ---------------------------------------- new institution
    newInst() {
      this.set('new_inst_name', '');
      this.set('new_inst_image', '');
      this.set('new_inst_nrgest', '');
      this.set('new_inst_nralunos', '');
      this.set('new_inst_nrinstr', '');
      this.set('new_inst_nrcoord', '');
      this.set('new_inst_changePassword', '');
      this.set('new_inst_library', '');
      this.set('new_inst_uf', '');
      this.set('new_inst_cidade', '');
      this.set('new_inst_cdprof', '');
      this.set('new_inst_cdalun', '');
      this.set('new_inst_cdresp', '');

      document.getElementById('new_inst_name').value = '';
      // document.getElementById('new_inst_uploadImage').value = '';
      // document.getElementById('new_inst_uploadPreview').src = '';
      document.getElementById('new_inst_nrgest').value = '';
      document.getElementById('new_inst_nralunos').value = '';
      document.getElementById('new_inst_nrcoord').value = '';
      document.getElementById('new_inst_nrinstr').value = '';
      document.getElementById('new_inst_cdprof').value = '';
      document.getElementById('new_inst_cdalun').value = '';
      document.getElementById('new_inst_cdresp').value = '';
      document.getElementById('new_inst_enabled').checked = true;
      //document.getElementById('new_inst_changePassword').checked = false;
      //document.getElementById('new_inst_library').checked = false;
      document.getElementById('new_sis_1').checked = false;
      document.getElementById('new_sis_2').checked = false;
      document.getElementById('new_sis_3').checked = false;
      document.getElementById('new_inst_uf').value = '';
      document.getElementById('new_inst_cidade').value = '';

      document.getElementById('new_inst_modal').classList.add('modal--is-show');
      document.getElementById('new_inst_name').focus();
      let modulos = this.get('model.modulos');
      modulos.forEach((mod) => {
        document.getElementById('ckb_new_' + mod.id).checked = true;
      });

      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    },
    // -------------------------------- new institutuion cancel
    newInstCancel() {
      this.set('goToStepTwo', false);
      this.set('addInst', false);
      document.getElementById('new_inst_modal').classList.remove('modal--is-show');

      document.getElementsByTagName('body')[0].style.overflow = 'auto';
    },
    // ------------------------------ new institution next step
    newInstNextStep() {
      this.set('goToStepTwo', true);
    },

    // ------------------------------------ new institution save
    newInstSave() {
      this.set('timeoutTxt', this.modalTxt.load.saving);
      this.timeoutAlert('load');

      let errors = 0;
      let name = document.getElementById('new_inst_name').value;
      let enabled = document.getElementById('new_inst_enabled').checked;
      //let image = document.get('new_inst_uploadImage').value;
      let nr_alunos = document.getElementById('new_inst_nralunos').value;
      let nr_gestores = document.getElementById('new_inst_nrgest').value;
      let nr_instrutores = document.getElementById('new_inst_nrinstr').value;
      let nr_coordenadores = document.getElementById('new_inst_nrcoord').value;
      let codigo_professor = document.getElementById('new_inst_cdprof').value;
      let codigo_aluno = document.getElementById('new_inst_cdalun').value;
      let codigo_responsavel = document.getElementById('new_inst_cdresp').value;
      //let changePassword = document.getElementById('new_inst_changePassword').checked;
      //let library = document.getElementById('new_inst_library').checked;
      let modulos = this.get('model.modulos');
      let sistemas = this.get('model.sistemas');
      let uf = document.getElementById('new_inst_uf').value;
      let cidade = document.getElementById('new_inst_cidade').value;
      let selected_modulos = [];
      modulos.forEach((mod) => {
        if (document.getElementById('ckb_new_' + mod.id).checked) {
          selected_modulos.pushObject({
            "id": mod.id,
            "type": "modulo"
          });
        }
      });
      let selected_sistemas = [];
      sistemas.forEach((sis) => {
        if (document.getElementById('new_sis_' + sis.data.idx).checked) {
          selected_sistemas.pushObject({
            "id": sis.data.idx,
            "type": "sistema"
          });
        }
      });

      // data validation
      let roles = nr_gestores + nr_coordenadores + nr_instrutores + nr_alunos;
      if (roles < 1) {
        this.set('timeoutTxt', this.modalTxt.error.institution.number);
        this.timeoutAlert('error');
        errors++;
      }
      if (name === null || name === '' || name === ' ' || name.length < 5) {
        this.set('timeoutTxt', this.modalTxt.error.institution.format);
        this.timeoutAlert('error');
        errors++;
      }
      if (errors === 0) {
        let obj_inst = this.get('store').createRecord('instituicao', {
          "name": name,
          "enabled": enabled,
          //"image":image,
          "nrgestores": nr_gestores,
          "nralunos": nr_alunos,
          "nrinstrutores": nr_instrutores,
          "nrcoordenadores": nr_coordenadores,
         // "trocasenhaobrigatoria": changePassword,
         // "temBiblioteca": library,
          "uf": uf,
          "cidade": cidade,
          "codigoProfessores":codigo_professor,
          "codigoAlunos":codigo_aluno,
          "codigoAlunosInfantil":codigo_responsavel,
        });
        if (selected_modulos.length > 0) {
          selected_modulos.forEach((mod) => {
            let temp = this.get('model.modulos');
            temp.forEach((modl) => {
              if (mod.id === modl.id) {
                obj_inst.get('modulos').pushObject(modl);
              }
            });
          });
        }
        if (selected_sistemas.length > 0) {
          selected_sistemas.forEach((sis) => {
            let temp = this.get('model.sistemas');
            temp.forEach((sis1) => {
              if (sis.id == sis1.data.idx) {
                obj_inst.get('sistemas').pushObject(sis1);
              }
            });
          });
        }
        obj_inst.save().then(() => {
          this.set('timeoutTxt', this.modalTxt.success.institution.created);
          this.timeoutAlert('success');
          let inst = this.get('store').peekRecord('instituicao', obj_inst.id);
          this.setSelected(inst.id);
          this.transitionToRoute('gersistema.gerdata', {
            queryParams: {
              instituicao_id: inst.id,
              page: 1
            }
          });
          this.set('goToStepTwo', false);
          this.set('addInst', false);
          document.getElementById('new_inst_modal').classList.remove('modal--is-show');
          document.getElementsByTagName('body')[0].style.overflow = 'auto';
        }).catch((reason) => {
          if (reason.errors[0].status == "409") {
            this.set('timeoutTxt', this.modalTxt.error.default);
            this.timeoutAlert('error');
          } else if (reason.error_description) {
            this.set('timeoutTxt', this.modalTxt.error.institution.create);
            this.timeoutAlert('error');
          } else if (reason) {
            this.set('timeoutTxt', this.modalTxt.error.institution.create);
            this.timeoutAlert('error');
          } else {
            this.set('timeoutTxt', this.modalTxt.error.unknown);
            this.timeoutAlert('error');
          }
          obj_inst.rollbackAttributes();
        });
      }
    },
    // ----------------------------- select institution to view
    selectInst(id) {
      this.set('inst_selected', false);
      if (id !== 'none') {
        this.setSelected(id);
        this.transitionToRoute('gersistema.gerdata', {
          queryParams: {
            instituicao_id: id,
            page: 1
          }
        });
        this.set('instView', true);
      }
    },
    // ------------------------------ back to institutions list
    backToInstList() {
      this.set('selectedInstTabs.informations', true);
      this.set('selectedInstTabs.courses', false);
      this.set('selectedInstTabs.areas', false);
      this.set('selectedInstTabs.users', false);

      this.set('inst_selected', false);
      this.set('instView', false);
      this.set('areaToEdit.id', null);
      this.set('areaToEdit.name', null);
      this.send('filterInst');
    },
    // ------------------- selected institutions tab navigation
    tabNavigation(tab) {
      this.set('selectedInstTabs.informations', false);
      this.set('selectedInstTabs.courses', false);
      this.set('selectedInstTabs.areas', false);
      this.set('selectedInstTabs.users', false);
      this.set('selectedInstTabs.' + tab, true);
      window.scrollTo(0, 0);
    },
    // ---------------------------- save display on data change
    dataChange(param,param2) {
      let changes = 0;
      let id = 'ckb_'+param2;
      let isId = 'isCkb'+param2;

      if (param == 'btn_save_inst') {
        if (document.getElementById('inst_name').value != this.get('inst_selected.name')) changes++;
        if (document.getElementById('inst_hab').checked != this.get('inst_selected.enabled')) changes++;
        //  if (document.getElementById('img').value != this.get('inst_selected.img')) changes++;
        if (document.getElementById('nr_gestores').value != this.get('inst_selected.nrgestores')) changes++;
        if (document.getElementById('nr_coordenadores').value != this.get('inst_selected.nrcoordenadores')) changes++;
        if (document.getElementById('nr_instrutores').value != this.get('inst_selected.nrinstrutores')) changes++;
        if (document.getElementById('nr_alunos').value != this.get('inst_selected.nralunos')) changes++;
        if (document.getElementById('cd_professores').value != this.get('inst_selected.codigoProfessores')) changes++;
        if (document.getElementById('cd_alunos').value != this.get('inst_selected.codigoAlunos')) changes++;
        if (document.getElementById('cd_responsaveis').value != this.get('inst_selected.codigoAlunosInfantil')) changes++;
       // if (document.getElementById('inst_changePassword').checked != this.get('inst_selected.trocasenhaobrigatoria')) changes++;
       // if (document.getElementById('inst_library').checked != this.get('inst_selected.temBiblioteca')) changes++;
        if (document.getElementById('sis_1').checked != this.get('temMedio')) changes++;
        if (document.getElementById('sis_2').checked != this.get('temS')) changes++;
        if (document.getElementById('sis_3').checked != this.get('temCoreSkills')) changes++;
        if (document.getElementById('inst_uf').value != this.get('inst_selected.uf')) changes++;
        if (document.getElementById('inst_cidade').value != this.get('inst_selected.cidade')) changes++;
      }
      if (param == 'btn_save_courses') {
        if (document.getElementById(id).checked != document.getElementById(isId).checked) changes++;
      }

      if (changes == 0) document.getElementById(param).style.display = 'none';
      else document.getElementById(param).style.display = 'inherit';
    },
    // ------------------------------------------ image preview
    previewImage(i) {
      const fileReader = new FileReader();

      if (i === 'new') {
        fileReader.readAsDataURL(document.getElementById("new_inst_uploadImage").files[0]);
        fileReader.onload = function (fileReaderEvent) {
          document.getElementById("new_inst_uploadPreview").src = fileReaderEvent.target.result;
        };
      } else {
        fileReader.readAsDataURL(document.getElementById("uploadImage").files[0]);
        fileReader.onload = function (fileReaderEvent) {
          document.getElementById("uploadPreview").src = fileReaderEvent.target.result;
        };
      }
    },
    // --------------------------- save institution informations
    saveInformations() {
      this.set('timeoutTxt', this.modalTxt.load.saving);
      this.timeoutAlert('load');

      let errors = 0;

      let inst = this.get('inst_selected');
      let name = document.getElementById('inst_name').value;
      let gest = document.getElementById('nr_gestores').value;
      let coord = document.getElementById('nr_coordenadores').value;
      let instr = document.getElementById('nr_instrutores').value;
      let aluno = document.getElementById('nr_alunos').value;
      let codigo_professor = document.getElementById('cd_professores').value;
      let codigo_aluno = document.getElementById('cd_alunos').value;
      let codigo_responsavel = document.getElementById('cd_responsaveis').value;
      let ena = document.getElementById('inst_hab').checked;
      //let image = document.getElementById('new_inst_uploadImage').value;
      //let passwordChangeStatus = document.getElementById('inst_changePassword').checked;
      //let library = document.getElementById('inst_library').checked;
      let uf = document.getElementById('inst_uf').value;
      let cidade = document.getElementById('inst_cidade').value;


      // let selected_sistemas = [{"id": 1,"type": "sistema"}, {"id": 2, "type": "sistema"}];


      // data validation
      let roles = gest + coord + instr + aluno;
      if (roles < 1) {
        this.set('timeoutTxt', this.modalTxt.error.institution.number);
        this.timeoutTxt('error');
        errors++;
      }
      if (name === null || name === '' || name === ' ' || name.length < 5) {
        this.set('timeoutTxt', this.modalTxt.error.institution.format);
        this.timeoutAlert('error');
        errors++;
      }

      if (errors === 0) {
        let temp = this.get('model.sistemas');
        temp.forEach((sis1) => {
          inst.get('sistemas').removeObject(sis1);
          if (document.getElementById('sis_' + sis1.get("idx")).checked) {
            inst.get('sistemas').pushObject(sis1);
          }
        });

        inst.set('name', name);
        inst.set('nrgestores', gest);
        inst.set('nrinstrutores', instr);
        inst.set('nralunos', aluno);
        inst.set('nrcoordenadores', coord);
        inst.set('codigoProfessores', codigo_professor);
        inst.set('codigoAlunos', codigo_aluno);
        inst.set('codigoAlunosInfantil', codigo_responsavel);
        inst.set('enabled', ena);
       // inst.set('trocasenhaobrigatoria', passwordChangeStatus);
       // inst.set('temBiblioteca', library);
        inst.set('uf', uf)
        inst.set('cidade', cidade)
        //inst.set('image', image);

        inst.save().then(() => {
          this.set('timeoutTxt', this.modalTxt.success.informations);
          this.timeoutAlert('success');
          document.getElementById('btn_save_inst').style.display = 'none';

        }).catch((reason) => {
          if (reason.errors) {
            reason.errors.forEach((error) => {
              if (error.status === "500") {
                this.set('timeoutTxt', this.modalTxt.error.server);
                this.timeoutAlert('error');
              } else if (error.status === "401") {
                localStorage.clear();
                this.get('session').invalidate();
                this.set('timeoutTxt', this.modalTxt.error.session);
                this.timeoutAlert('error');
              } else {
                this.set('timeoutTxt', this.modalTxt.error.connection);
                this.timeoutAlert('error');

              }
            });
          } else if (reason.message) {
            this.set('timeoutTxt', this.modalTxt.error.unknown);
            this.timeoutAlert('error');
          } else {
            this.set('tiemoutTxt', this.modalTxt.error.unknown);
            this.timeoutAlert('error');
          }
          this.set('timeoutTxt', this.modalTxt.error.default);
          this.timeoutAlert('error');
          //document.getElementById('btn_save_inst').disabled = false;
          inst.rollbackAttributes();
        });
      }
    },
    // -------------------------------- save institution courses
    saveCourses() {
      //debugger
      this.set('timeoutTxt', this.modalTxt.load.saving);
      this.timeoutAlert('load');
      let inst = this.get('inst_selected');
      let platAnos = inst.get('plataformaAnos');

      let old_mod = [];
      inst.get('modulos').forEach((mod) => {
          old_mod.pushObject(mod);
      });

      let temp = this.get('model.modulos');
      temp.forEach((modl) => {
        inst.get('modulos').removeObject(modl);

        platAnos.forEach(function (pa){
          if(pa.id == 12 && modl.id == 11){
            inst.get('modulos').pushObject(modl);
          }else if (pa.id == 13 && modl.id == 12){
            inst.get('modulos').pushObject(modl);
          }else if(pa.id == 14 && modl.id == 13){
            inst.get('modulos').pushObject(modl);
          }
        })
      });

      let instToSave = inst;
      instToSave.save().then(() => {
        this.set('timeoutTxt', this.modalTxt.success.courses);
        this.timeoutAlert('success');
        document.getElementById('btn_save_courses').style.display = 'none';
      }).catch((reason) => {
        if (reason.errors) {
          reason.errors.forEach((error) => {
            if (error.status === "500") {
              this.set('timeoutTxt', this.modalTxt.error.server);
              this.timeoutAlert('error');
            } else if (error.status === "401") {
              localStorage.clear();
              this.get('session').invalidate();
              this.set('timeoutTxt', this.modalTxt.error.session);
              this.timeoutAlert('error');
            } else {
              this.set('timeoutTxt', this.modalTxt.error.connection);
              this.timeoutAlert('error');
            }
          });
        } else if (reason.message) {
          this.set('timeoutTxt', this.modalTxt.error.courses);
          this.timeoutAlert('error');
        } else {
          this.set('timeoutTxt', this.modalTxt.error.courses);
          this.timeoutAlert('error');
        }
        this.set('timeoutTxt', this.modalTxt.error.unknown);
        this.timeoutAlert('error');
        inst.rollbackAttributes();

        // temp.forEach((modl) => {
        //   document.getElementById('ckb_' + modl.id).checked = false;
        //   inst.get('modulos').removeObject(modl);
        // });
        // old_mod.forEach((mod) => {
        //   document.getElementById('ckb_' + mod.id).checked = true;
        //   inst.get('modulos').pushObject(mod);
        // });
      });
    },

    // -------------------------- cancel institution area action
    cancelAreaAction(param) {
      if (param === 'new') {
        document.getElementById('newAreaName').value = null;
        this.set('creatingNewArea', false);
      } else {
        let itemEdit = document.getElementById('areaItemName' + param);

        itemEdit.disabled = true;
        itemEdit.value = this.get('areaToEdit.name');
        this.set('areaToEdit.name', null);
        this.set('areaToEdit.id', null);

        document.getElementById('areaItemOptions' + param).style.display = 'inherit';
        document.getElementById('areaItemActions' + param).style.display = 'none';
      }
    },

    // ------------------------------------ new institution area
    newArea() {
      let targetInput = document.getElementById("newAreaName");
      targetInput.value = null;

      let targetDefineYear = document.getElementById("define_year");
      targetDefineYear.value = "0";
      targetDefineYear.closest('.form-group').classList.remove('blink');

      this.set('creatingNewArea', true);

      setTimeout(() => {
        targetInput.focus();
      }, 100);

      let activeAreaToEditId = this.get('areaToEdit.id');

      if (activeAreaToEditId) {
        document.getElementById('areaItemOptions' + activeAreaToEditId).style.display = 'inherit';
        document.getElementById('areaItemActions' + activeAreaToEditId).style.display = 'none';

        let itemEdit = document.getElementById('areaItemName' + activeAreaToEditId);

        itemEdit.disabled = true;
        itemEdit.value = this.get('areaToEdit.name');
        this.set('areaToEdit.name', null);
        this.set('areaToEdit.id', null);
      }
    },

    // ----------------------------------
    refreshSegmento(selectedSegmentoId) {
      var selectedSegmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
      this.set('selectedSegmento', selectedSegmento);
    },
    // ----------------------------------
    refreshAno(selectedAnoId){
      var selectedAno = this.get('store').peekRecord('plataforma-ano', selectedAnoId);
      this.set('selectedAno', selectedAno);
    },

    // --------------------------------- add new institution area
    addArea() {
      this.set('timeoutTxt', this.modalTxt.load.saving);
      this.timeoutAlert('laod');

      let errors = 0;
      let name = document.getElementById('newAreaName').value;
      let inst = this.get('inst_selected');
      let anoId = document.getElementById('define_year').value;
      let ano;
      this.get('inst_selected').get('plataformaAnos').forEach(function(a){
        if (a.get('id') == anoId){
          ano = a;
        }
      })
      // let modulo;
      // this.get('model.modulos').forEach(function(mod){
      //   if(mod.id == ano){
      //     modulo = mod;
      //   }
      // })

      let turma_info;
      turma_info = {
        'name': name,
        'instituicao': inst,
        'plataformaAno': ano,
      };

      if (name === null || name === '' || name === ' ') {
        let targetInput = document.getElementById("newAreaName");
        targetInput.closest('.edit-text').classList.remove('blink');

        setTimeout(() => {
          targetInput.closest('.edit-text').classList.add('blink');
          targetInput.focus();
          this.set('timeoutTxt', this.modalTxt.error.turmas.format);
          this.timeoutAlert('error');
        }, 100);

        errors++;
      }

      let turma = this.get('store').createRecord('plataforma-turma');
      turma.set('name', name);
      turma.set('instituicao', inst);
      turma.set('plataformaAno', ano);

      if (errors === 0) {
        turma.save().then(() => {
          document.getElementById('newAreaName').value = null;
          this.set('timeoutTxt', this.modalTxt.success.turmas.created);
          this.timeoutAlert('success');
          this.set('creatingNewArea', false);
          // document.getElementById('newArea').style.display = 'none';
        }).catch((reason) => {
          if (reason.errors[0].status == "409") {
            this.set('timeoutTxt', this.modalTxt.error.turmas.exist);
            this.timeoutAlert('error');
          } else if (reason.error_description) {
            this.set('timeoutTxt', this.modalTxt.error.turmas.create);
            this.timeoutAlert('error');
          } else if (reason) {
            let targetDefineYear = document.getElementById("define_year");
            targetDefineYear.closest('.form-group').classList.remove('blink');

            setTimeout(() => {
              targetDefineYear.closest('.form-group').classList.add('blink');
              targetDefineYear.focus();
              this.set('timeoutTxt', this.modalTxt.error.turmas.trackNotSelected);
              this.timeoutAlert('error');
            }, 100);

          } else {
            this.set('timeoutTxt', this.modalTxt.error.unknown);
            this.timeoutAlert('error');
          }
          //turma.rollbackAttributes();
        });
      }
    },

    // ----------------------------------- edit institution area
    editArea(param) {
      // document.getElementById('newArea').style.display = 'none';
      this.set('creatingNewArea', false);

      let prevId = this.get('areaToEdit.id');
      let targetArea = document.getElementById('areaItemName' + param);

      if (prevId !== null) {
        let prevToEdit = document.getElementById('areaItemName' + prevId);

        prevToEdit.value = this.get('areaToEdit.name');
        prevToEdit.disabled = true;
        document.getElementById('areaItemOptions' + prevId).style.display = 'inherit';
        document.getElementById('areaItemActions' + prevId).style.display = 'none';
      }

      this.set('areaToEdit.id', param);
      this.set('areaToEdit.name', targetArea.value);
      targetArea.disabled = false;
      targetArea.focus();
      document.getElementById('areaItemOptions' + param).style.display = 'none';
      document.getElementById('areaItemActions' + param).style.display = 'inherit';
    },

    // ------------------------------- save new institution area
    saveArea(param) {
      this.set('savingNewArea', true);
      this.set('timeoutTxt', this.modalTxt.load.saving);
      this.timeoutAlert('load');
      let errors = 0;
      let name = document.getElementById('areaItemName' + param).value;
      let area = this.get('store').peekRecord('plataforma-turma', param);
      if (area.get('name') !== name && name !== null && name !== '' && name !== ' ') {
        area.set('name', name);
        area.save().then(() => {
          this.set('areaToEdit.id', null);
          this.set('areaToEdit.name', null);
          this.set('timeoutTxt', this.modalTxt.success.areas.edited);
          this.timeoutAlert('success');

          document.getElementById('areaItemName' + param).disabled = true;

          document.getElementById('areaItemOptions' + param).style.display = 'inherit';
          document.getElementById('areaItemActions' + param).style.display = 'none';

          this.set('savingNewArea', false);
        }).catch((reason) => {
          if (reason.errors[0].status == "409") {
            this.set('timeoutTxt', this.modalTxt.error.areas.exist);
            this.timeoutAlert('error');
          } else if (reason.error_description) {
            this.set('timeoutTxt', this.modalTxt.error.areas.edit);
            this.timeoutAlert('error');
          } else if (reason) {
            this.set('timeoutTxt', this.modalTxt.error.areas.edit);
            this.timeoutAlert('error');
          } else {
            this.set('timeoutTxt', this.modalTxt.error.unknown);
            this.timeoutAlert('success');
          }
          area.rollbackAttributes();
        });
      } else {
        this.set('timeoutTxt', this.modalTxt.error.areas.format);
        this.timeoutAlert('error');
      }
    },

    // --------------------------------- delete institution area
    deleteArea(param) {
      this.set('areaToDelete', param);

      this.get('store').findRecord('plataforma-turma', param)
        .then((turma) => {
          this.set('alertTitle', this.modalTxt.confirmation.turma.title);
          this.set('alertDesc', this.modalTxt.confirmation.turma.description);
          this.set('staticTxt2', turma.get('name'));
          this.staticAlert('area');
        }).catch((reason) => {
          if (reason.errors) {
            reason.errors.forEach((error) => {
              if (error.status === "500") {
                this.set('timeoutTxt', this.modalTxt.error.server);
                this.timeoutAlert('error');
              } else if (error.status === "401") {
                localStorage.clear();
                this.get('session').invalidate();
                this.set('timeoutTxt', this.modalTxt.error.session);
                this.timeoutAlert('error');
              } else {
                this.set('timeoutTxt', this.modalTxt.error.connection);
                this.timeoutAlert('error');
              }
            })
          } else if (reason.message) {
            this.set('timeoutTxt', this.modalTxt.error.turmas.delete);
            this.timeoutAlert('error');
          } else {
            this.set('timeoutTxt', this.modalTxt.error.turmas.delete);
            this.timeoutAlert('error');
          }
          this.set('timeoutTxt', this.modalTxt.error.default);
          this.timeoutAlert('error');
        });
    },

    // ----------------------------------
    actionConfirmation(param) {

      // setTimeout(() => {
        this.set('timeoutTxt', this.modalTxt.load.deleting);
        this.timeoutAlert('load');
      // }, 250);

      let obj = this.get('store').peekRecord('plataforma-turma', param);
      obj.destroyRecord().then(() => {
        this.set('areaToDelete', null);
        this.set('timeoutTxt', this.modalTxt.success.turmas.deleted);
        this.timeoutAlert('success');

        let inst = this.get('inst_selected');
        this.setSelected(inst.id);
        this.staticAlert('close');
      }).catch((reason) => {
        if (reason.errors) {
          reason.errors.forEach((error) => {
            if (error.status === "500") {
              this.set('timeoutTxt', this.modalTxt.error.server);
              this.timeoutAlert('error');
            } else if (error.status === "401") {
              localStorage.clear();
              this.get('session').invalidate();
              this.set('timeoutTxt', this.modalTxt.error.session);
              this.timeoutAlert('error');
            } else {
              this.set('timeoutTxt', this.modalTxt.error.connection);
              this.timeoutAlert('error');
            }
          })
        } else if (reason.message) {
          this.set('timeoutTxt', this.modalTxt.error.unknown);
          this.timeoutAlert('error');
        } else {
          this.set('timeoutTxt', this.modalTxt.error.unknown);
          this.timeoutAlert('error');
        }
      });
    },
    goTo(param) {
      if (param === '1') this.set('goToStepTwo', false);
      else this.set('goToStepTwo', true);
    },
    userModal: function() {
      this.get('child').send('userModal');
    },

    // -------------------------------------
    cadastroCodigo() {
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      document.getElementById('codigo_modal').classList.add('modal--is-show');
      document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
      this.set('error_lote', '');
      this.set('erro_lista', '');
      this.set('wait_lote', true);
      this.set('selected_file', '');
      this.set('lista_lote', '');
      this.set('allow_refresh', true);
      this.refreshListaCodigo();
    },

    cancelCodigo() {
      document.getElementsByTagName('body')[0].style.overflow = 'auto';
      document.getElementById('get_lote').value = '';
      document.getElementById('codigo_modal').classList.remove('modal--is-show');
      document.getElementsByTagName('body')[0].classList.remove('overflow-hidden');
      this.set('error_lote', '');
      this.set('wait_lote', false);
      this.set('selected_file', '');
      this.set('erro_lista', '');
      this.set('lista_lote', '');
      this.set('allow_refresh', false);
    },

    baixarTemplateCodigo() {
      //let inst = this.get('inst_selected');
      let header = localStorage.getItem('person_logged');
      let header_inst;
      if (header) {
        header = JSON.parse(header);
        header_inst = header.id;
      } else {
        header_inst = "";
      }
      window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/templatecadastrocodigo?pessoaId=' + header_inst + '&instituicaoId=' + 1;
    },

    buscarArquivoCodigo() {
      let file_name = document.getElementById('get_lote').files[0].name;
      this.set('selected_file', file_name);
    },

    importarCodigo() {
      let file_lote = document.getElementById('get_lote').files[0];

      if (file_lote) {
        this.sendFiletoServer2(file_lote).then(() => {
          this.set('error_lote', '');
          this.set('erro_lista', '');
          this.set('wait_lote', true);
          this.set('selected_file', '');
          this.set('lista_lote', '');
          this.set('allow_refresh', true);
          this.refreshListaCodigo();
          this.userListReload2();
          document.getElementsByTagName('body')[0].style.overflow = 'auto';
        }).catch((erro) => {
          this.set('error_lote', erro);
        });

        var spinner = document.getElementById('spinner-importar-lote');
        spinner.style.display = "inline-block";
      } else {
        this.set('selected_file', '');
        this.set('error_lote', 'impossivel achar arquivo');
      }
    },

    selectAno(platAno, selected) {
      //this.send('removeAplicadorError');
      //this.checkform();
      let inst = this.get('inst_selected');
      if (selected) {
        inst.get('plataformaAnos').pushObject(platAno);
      } else {
        inst.get('plataformaAnos').removeObject(platAno);
      }
    }
  }
});
