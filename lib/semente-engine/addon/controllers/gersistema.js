import Controller from '@ember/controller';
import ENV from '../config/environment';
import Ember from 'ember';
import {
  isArray
} from '@ember/array';
import {
  accordion
} from '../helpers/accordion';

export default Controller.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  appController: Ember.inject.controller('application'),
  modulos_list: [{
    'id': 1,
    'name': 'Autocontrole',
    'coverImg': false
  }, {
    'id': 2,
    'name': 'Autocontrole (Regulação Emocional)',
    'coverImg': false
  }, {
    'id': 3,
    'name': 'Resiliência',
    'coverImg': 'https://res.cloudinary.com/douglaslinhares/image/upload/v1534170520/Covers%20Cursos/resiliencia__cover--xl-new.jpg'
  }, {
    'id': 4,
    'name': 'Empatia',
    'coverImg': false
  }, {
    'id': 5,
    'name': 'Julgamento e Tomada de Decisão (I)',
    'coverImg': false
  }, {
    'id': 6,
    'name': 'Julgamento e Tomada de Decisão (II)',
    'coverImg': false
  }],
  role: Ember.computed('appController', function () {
    let ac = this.get('appController');
    return ac.get('role');
  }),
  sortingKey: ['id'],
  sortedModulos: Ember.computed.sort('model.modulos', 'sortingKey'),
  oneInst: Ember.computed('model', 'role', function () {
    let inst = this.get('model.instituicoes');
    let that = this;
    if (!isArray(inst)) {
      Ember.run.once(function () {
        that.set('inst_selected', inst);
        that.set('instView', true);
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
  selectedInstTabs: {
    informations: true,
    courses: false,
    areas: false,
    users: false,
  },
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
    return accordion(param);
  },
  // ------------------------------- set selected institution
  setSelected(inst) {
    document.getElementById('matchValue').value = null;
    document.getElementById('matchDisplay').style.display = 'none';
    document.getElementById('modelInstList').style.display = 'inline';

    let inst_selected;
    let instit = this.get('model.instituicoes');
    instit.forEach(function (el) {
      if (el.id === inst) {
        inst_selected = el;
      }
    });
    this.set('inst_selected', inst_selected);
    if (this.get('reSort') === 0) this.set('reSort', 1);
    else this.set('reSort', 0);

    this.set('instView', true);
    window.scrollTo(0, 0);
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
  staticTxt1: null,
  staticTxt2: null,
  timeoutAlert(param) {
    const tAlert = document.getElementById('timeoutAlertAdm');

    // Lista todos os alertas que estão sendo mostrados na tela
    if (param == 'close') {
      setTimeout(function () {
        tAlert.classList.remove('alert--is-show');
        tAlert.style.bottom = "24px";
      }, 2500);
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
      this.set('staticTxt1', null);
      this.set('staticTxt2', null);
    } else {
      sAlert.classList.add('alert--is-show');
      this.set('staticType', param);
    }
  },
  // ###############################################
  // ###############################################
  // ###############################################
  actions: {
    capsLockDetection: window.addEventListener("click", function (e) {
      let targetElement = e.target;

      if (!targetElement.classList.contains('j-areaFocus') && document.getElementById('newArea')) {
        document.getElementById('newAreaName').value = null;
        document.getElementById('newArea').style.display = 'none';

        let itemEdits = document.getElementsByClassName('j-cancelArea');
        for (let i = 0; i < itemEdits.length; i++) {
          console.log(itemEdits[i].id);
          if (document.getElementById('areaItemActions' + itemEdits[i].id.replace('j-cancelAction', '')).style.display == 'inherit') {
            console.log('a');
            document.getElementById(itemEdits[i].id).click();
          }
        }
      }
    }),
    // -------------------------------- filter istitutions list
    filterInst() {
      let modelInstList = document.getElementById('modelInstList');
      let matchDisplay = document.getElementById('matchDisplay');
      let matchValue = document.getElementById('matchValue');
      let instList = this.get('model.instituicoes');

      if (matchValue.value) {
        let searchResult = instList.filter(function (i) {
          if ((i.data.name).toLowerCase().match(new RegExp((matchValue.value).toLowerCase(), 'g'))) {
            return i;
          }
        });

        this.set('matchInsts', searchResult);

        modelInstList.style.display = 'none';
        matchDisplay.style.display = 'inline';
      } else {
        modelInstList.style.display = 'inline';
        matchDisplay.style.display = 'none';
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
      document.getElementById('new_inst_name').value = '';
      // document.getElementById('new_inst_uploadImage').value = '';
      // document.getElementById('new_inst_uploadPreview').src = '';
      document.getElementById('new_inst_nrgest').value = '';
      document.getElementById('new_inst_nralunos').value = '';
      document.getElementById('new_inst_nrcoord').value = '';
      document.getElementById('new_inst_nrinstr').value = '';
      document.getElementById('new_inst_enabled').checked = true;
      document.getElementById('new_inst_changePassword').checked = false;
      document.getElementById('new_inst_library').checked = false;

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
      let changePassword = document.getElementById('new_inst_changePassword').checked;
      let library = document.getElementById('new_inst_library').checked;
      let modulos = this.get('model.modulos');
      let selected_modulos = [];
      modulos.forEach((mod) => {
        if (document.getElementById('ckb_new_' + mod.id).checked) {
          selected_modulos.pushObject({
            "id": mod.id,
            "type": "modulo"
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
          "trocasenhaobrigatoria": changePassword,
          "temBiblioteca": library,
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
    dataChange(param) {
      let changes = 0;

      if (param == 'btn_save_inst') {
        if (document.getElementById('inst_name').value != this.get('inst_selected.name')) changes++;
        if (document.getElementById('inst_hab').checked != this.get('inst_selected.enabled')) changes++;
        //  if (document.getElementById('img').value != this.get('inst_selected.img')) changes++;
        if (document.getElementById('nr_gestores').value != this.get('inst_selected.nrgestores')) changes++;
        if (document.getElementById('nr_coordenadores').value != this.get('inst_selected.nrcoordenadores')) changes++;
        if (document.getElementById('nr_instrutores').value != this.get('inst_selected.nrinstrutores')) changes++;
        if (document.getElementById('nr_alunos').value != this.get('inst_selected.nralunos')) changes++;
        if (document.getElementById('inst_changePassword').checked != this.get('inst_selected.trocasenhaobrigatoria')) changes++;
        if (document.getElementById('inst_library').checked != this.get('inst_selected.temBiblioteca')) changes++;
      }
      if (param == 'btn_save_courses') {
        if (document.getElementById('ckb_1').checked != document.getElementById('isCkb1').checked) changes++;
        if (document.getElementById('ckb_2').checked != document.getElementById('isCkb2').checked) changes++;
        if (document.getElementById('ckb_3').checked != document.getElementById('isCkb3').checked) changes++;
        if (document.getElementById('ckb_4').checked != document.getElementById('isCkb4').checked) changes++;
        if (document.getElementById('ckb_5').checked != document.getElementById('isCkb5').checked) changes++;
        if (document.getElementById('ckb_6').checked != document.getElementById('isCkb6').checked) changes++;
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
      let ena = document.getElementById('inst_hab').checked;
      //let image = document.getElementById('new_inst_uploadImage').value;
      let passwordChangeStatus = document.getElementById('inst_changePassword').checked;
      let library = document.getElementById('inst_library').checked;

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
        inst.set('name', name);
        inst.set('nrgestores', gest);
        inst.set('nrinstrutores', instr);
        inst.set('nralunos', aluno);
        inst.set('nrcoordenadores', coord);
        inst.set('enabled', ena);
        inst.set('trocasenhaobrigatoria', passwordChangeStatus);
        inst.set('temBiblioteca', library);
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
      this.set('timeoutTxt', this.modalTxt.load.saving);
      this.timeoutAlert('load');

      let inst = this.get('inst_selected');
      let old_mod = [];
      inst.get('modulos').forEach((mod) => {
        old_mod.pushObject(mod);
      });

      let temp = this.get('model.modulos');
      temp.forEach((modl) => {
        inst.get('modulos').removeObject(modl);
        if (document.getElementById('ckb_' + modl.id).checked) {
          inst.get('modulos').pushObject(modl);
        }
      });

      inst.save().then(() => {
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
        temp.forEach((modl) => {
          document.getElementById('ckb_' + modl.id).checked = false;
          inst.get('modulos').removeObject(modl);
        });
        old_mod.forEach((mod) => {
          document.getElementById('ckb_' + mod.id).checked = true;
          inst.get('modulos').pushObject(mod);
        });
      });
    },
    // -------------------------- cancel institution area action
    cancelAreaAction(param) {
      if (param === 'new') {
        document.getElementById('newAreaName').value = null;
        document.getElementById('newArea').style.display = 'none';
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
      document.getElementById('newAreaName').value = null;
      document.getElementById('newArea').style.display = 'inherit';
      document.getElementById('newAreaName').focus();

      let activeAreaToEditId = this.get('areaToEdit.id');
      if (activeAreaToEditId) {
        console.log(activeAreaToEditId);

        document.getElementById('areaItemOptions' + activeAreaToEditId).style.display = 'inherit';
        document.getElementById('areaItemActions' + activeAreaToEditId).style.display = 'none';

        let itemEdit = document.getElementById('areaItemName' + activeAreaToEditId);

        itemEdit.disabled = true;
        itemEdit.value = this.get('areaToEdit.name');
        this.set('areaToEdit.name', null);
        this.set('areaToEdit.id', null);
      }
    },
    // --------------------------------- add new institution area
    addArea() {
      this.set('timeoutTxt', this.modalTxt.load.saving);
      this.timeoutAlert('laod');

      let errors = 0;

      let name = document.getElementById('newAreaName').value;
      let inst = this.get('inst_selected');
      let area_info = {
        'name': name,
        'instituicao': inst
      };

      if (name === null || name === '' || name === ' ' || name.length < 5) {
        this.set('timeoutTxt', this.modalTxt.error.areas.format);
        this.timeoutAlert('error');
        errors++;
      }
      if (errors === 0) {
        let area = this.get('store').createRecord('area', area_info);

        area.save().then(() => {
          this.set('timeoutTxt', this.modalTxt.success.areas.created);
          this.timeoutAlert('success');

          document.getElementById('newAreaName').value = null;
          document.getElementById('newArea').style.display = 'none';
        }).catch((reason) => {
          if (reason.errors[0].status == "409") {
            this.set('timeoutTxt', this.modalTxt.error.areas.exist);
            this.timeoutAlert('error');
          } else if (reason.error_description) {
            this.set('timeoutTxt', this.modalTxt.error.areas.create);
            this.timeoutAlert('error');
          } else if (reason) {
            this.set('timeoutTxt', this.modalTxt.error.areas.create);
            this.timeoutAlert('error');
          } else {
            this.set('timeoutTxt', this.modalTxt.error.unknown);
            this.timeoutAlert('error');
          }
          area.rollbackAttributes();
        });
      }
    },
    // ----------------------------------- edit institution area
    editArea(param) {
      document.getElementById('newArea').style.display = 'none';

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
      this.set('timeoutTxt', this.modalTxt.load.saving);
      this.timeoutAlert('load');

      let errors = 0;
      let name = document.getElementById('areaItemName' + param).value;
      let area = this.get('store').peekRecord('area', param);
      if (area.get('name') !== name && name !== null && name !== '' && name !== ' ' && name.length >= 5) {
        area.set('name', name);
        area.save().then(() => {
          this.set('areaToEdit.id', null);
          this.set('areaToEdit.name', null);
          this.set('timeoutTxt', this.modalTxt.success.areas.edited);
          this.timeoutAlert('success');

          document.getElementById('areaItemName' + param).disabled = true;

          document.getElementById('areaItemOptions' + param).style.display = 'inherit';
          document.getElementById('areaItemActions' + param).style.display = 'none';
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

      this.get('store').findRecord('area', param)
        .then((area) => {
          this.set('staticTxt1', this.modalTxt.confirmation.areas);
          this.set('staticTxt2', area.get('name'));
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
            this.set('timeoutTxt', this.modalTxt.error.areas.delete);
            this.timeoutAlert('error');
          } else {
            this.set('timeoutTxt', this.modalTxt.error.areas.delete);
            this.timeoutAlert('error');
          }
          this.set('timeoutTxt', this.modalTxt.error.default);
          this.timeoutAlert('error');
        });
    },
    actionConfirmation(param) {
      this.set('timeoutTxt', this.modalTxt.load.deleting);
      this.timeoutAlert('load');

      let obj = this.get('store').peekRecord('area', param);
      obj.destroyRecord().then(() => {
        this.set('areaToDelete', null);
        this.set('timeoutTxt', this.modalTxt.success.areas.deleted);
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
  }
});
