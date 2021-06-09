import Controller from '@ember/controller';
import Ember from 'ember';
import moment from 'moment';
import ENV from '../../config/environment';
import pagedArray from 'ember-cli-pagination/computed/paged-array';
import { toggle } from '../../helpers/toggle';

export default Controller.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  appstate: Ember.inject.service(),
  queryParams: ["page", "perPage", "instituicao_id", "ordem", "str_search", "dummy", "ano1", "ano2", "ano3","pre","tur", "selected_segmento_id", "selected_ano_id", "selected_turma_id"],
  gerController: Ember.inject.controller('gersistema'),
  appController: Ember.inject.controller('application'),
  pagedContent: pagedArray('model'),
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  modulos: Ember.computed.alias('gerController.model.modulos'),
  page: Ember.computed.alias('pagedContent.page'),
  perPage: Ember.computed.alias('pagedContent.perPage'),
  totalPessoas: Ember.computed.alias('pagedContent.content.meta.page.total'),
  pessoas_sorted: Ember.computed('pagedContent.content', 'sortCol', 'sortAsc', 'reSort', function () {
    let people = this.get('pagedContent.content');
    if (people) {
      let sortCol = this.get('sortCol');
      if (this.get('sortAsc') && this.get('reSort') < 3)
        return people.sortBy(sortCol, 'DimensionName');
      else return people.sortBy(sortCol, 'DimensionName').reverse();
    } else return [];
  }),
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

  anos: Ember.computed('model', function (){
    let anos = [];
    let selectedSegmento = this.get('selectedSegmento');

    if(selectedSegmento == null){
      return this.get('inst_selected').get('plataformaAnos')
    }
    this.get('inst_selected').get('plataformaAnos').forEach(ano => {
      if (ano.get('segmento').get('id') == selectedSegmento.get('id')){
        anos.push(ano)
      }
    })
    return anos
  }),
  
  turmas: Ember.computed('model', function (){
    let turmas = [];
    let selectedSegmento = this.get('selectedSegmento');
    let selectedAno = this.get('selectedAno');

    if(selectedSegmento == null && selectedAno == null){
      return this.get('inst_selected').get('plataformaTurmas')
    }
    else if (selectedSegmento != null && selectedAno == null){
      this.get('inst_selected').get('plataformaAnos').forEach(ano => {
        if (ano.get('segmento').get('id') == selectedSegmento.get('id')){
          this.get('inst_selected').get('plataformaTurmas').forEach(tur => {
            if (tur.get('plataformaAno').get('id') == ano.get('id')){
              turmas.push(tur)
            }
          })
        }
      })
    }
    else{
      this.get('inst_selected').get('plataformaTurmas').forEach(tur => {
        if (tur.get('plataformaAno').get('id') == selectedAno.get('id')){
          turmas.push(tur)
        }
      })
    }
    return turmas
  }),

  plataformaAnos: Ember.computed('model', function (){
    return this.get('inst_selected').get('plataformaAnos')
  }),

  selectedPlataformaAnos: Ember.computed('model',function(){
    return []
  }),
  
  plataformaTurmas: Ember.computed('model', function (){
    let turmas = [];
    let selectedPA = this.get('selectedPA');
    
    if(selectedPA == null){
      return this.get('inst_selected').get('plataformaTurmas')
    }
    this.get('inst_selected').get('plataformaTurmas').forEach(tur => {
      if (tur.get('plataformaAno').get('id') == selectedPA.get('id')){
        turmas.push(tur)
      }
    })
    return turmas
  }),
  
  selectedPlataformaTurma: Ember.computed('model',function(){
    return []
  }),

  setLocation: Ember.observer('instituicao_id', function () {
    if (this.get('instituicao_id') == 0) {
      if (JSON.parse(localStorage.getItem('person_logged')).role == 'admin') {
        this.get('gerController').set('inst_selected', false);
      } else {
        this.set('instituicao_id', JSON.parse(localStorage.getItem('person_logged')).instituicao_id);
        this.transitionToRoute('gersistema.gerdata', {
          queryParams: {
            instituicao_id: JSON.parse(localStorage.getItem('person_logged')).instituicao_id,
            page: 1
          }
        });
      }
    }
  }),
  modulos_list: Ember.computed.alias('gerController.modulos_list'),
  inst_selected: Ember.computed.alias('gerController.inst_selected'),
  sortCol: 'name',
  sortAsc: true,
  ordem: 'az',
  reSort: 0,
  paginationSelected: {
    p5: false,
    p10: true,
    p25: false,
    p50: false,
    p100: false,
    p500: false,
    p1000: false
  },
  failedEmailsList: [],
  editUser: false,
  seAluno(value) {
    this.set('perfil', value);
    this.set('activeProfile', value);
  },
  
//------------------------------------------------------------------------------------------------------
  solicitaListaLote() {
    if (this.get('allow_refresh')) {
      setTimeout(function () {
        this.refreshListaLote();
      }, 1000);
    }
  },
  refreshListaLote() {
    this.getListaLote().then((response) => {
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
          link = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/cadastrolotes/download?id=' + item.id + '&pessoaId=' + data_ls.id;
        }
        if (item.attributes.status === "Processando") refresh = true;
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
        this.solicitaListaLote();
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
  getListaLote() {
    let header = localStorage.getItem('person_logged');
    let header_inst;
    if (header) {
      header = JSON.parse(header);
      header_inst = header.id;
    } else {
      header_inst = "";
    }
    let inst = this.get('inst_selected');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    // alterar url com include de pessoas
    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/cadastrolotes?include=pessoas';
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('pessoaid', header_inst);
      xhr.setRequestHeader('instituicaoid', inst.id);
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
  sendFiletoServer(file) {
    let header = localStorage.getItem('person_logged');
    let header_inst;
    if (header) {
      header = JSON.parse(header);
      header_inst = header.id;
    } else {
      header_inst = "";
    }
    let inst = this.get('inst_selected');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/cadastroloteMedio';
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
      xhr.setRequestHeader('pessoaid', header_inst);
      xhr.setRequestHeader('instituicaoid', inst.id);
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
  zera_Progressos(pessoa_id) {
    let header = localStorage.getItem('person_logged');
    let header_inst;
    if (header) {
      header = JSON.parse(header);
      header_inst = header.id;
    } else {
      header_inst = "";
    }
    let inst = this.get('inst_selected');
    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/zerarProgressos/' + pessoa_id;
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('pessoaid', header_inst);
      xhr.setRequestHeader('instituicaoid', inst.id);
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
  userListReload() {
    let tg = this.get('str_search');

    if (tg == '' || tg == null) this.set('str_search', ' ');
    else this.set('str_search', '');

    document.getElementById('search_input_pessoas_ger').value = null;
  },
  listingChecked: false,
  selectedToMail: false,
  selectedToDelete: false,
  selectedToReset: false,
  // modal alert pre set messages
  alertTxt: {
    load: {
      saving: 'Salvando...',
      sending: 'Enviando...',
      deleting: 'Deletando...',
      reseting: 'Zerando progresso...',
    },
    confirmation: {
      emails: {
        single: 'Enviar e-mail para ',
        multiple: 'Deseja enviar e-mail para os usuários selecionados?',
      },
      user: {
        emails: 'Enviar e-mail de ativação para o usuário ',
        delete: 'Remover o usuário ',
        progress: 'Zerar progresso para o usuário ',
      },
      selected: ' usuários selecionados.'
    },
    success: {
      users: {
        created: 'Novo usuário incluído com sucesso.',
        deleted: 'Usuário deletado com sucesso.',
        edited: 'Usuário editado com sucesso.',
        emails: {
          multiple: 'Envio de e-mails concluído com sucesso.',
          single: 'E-mail enviado com sucesso para o usuário.',
        },
        reseted: 'Progresso zerado com sucesso para o usuário.',
      }
    },
    error: {
      default: 'Erro',
      server: 'Erro de servidor.',
      connection: 'Erro de conexão.',
      session: 'Sessão expirada, favor logar novamente.',
      unknown: 'Erro desconhecido.',
      users: {
        format: 'Nome inválido de usuário.',
        email: 'E-mail inváido.',
        exist: 'E-mail já cadastrado para outro usuário.',
        limit: 'Limite máximo de usuários para o perfil selecionado.',
        delete: 'Erro ao remover o usuário, tente novamente.'
      },
      emails: {
        send: 'Erro ao enviar os e-mails, tente novamente.',
        multiple: 'Erro ao enviar os seguintes e-mails: ',
        single: 'Erro ao enviar e-mail para o usuário.',
      },
      progress: 'Erro ao zerar o progresso, tente novamente.',
    }
  },
  thisUserRole: {
    aluno: false,
    instrutor: false,
    coordenador: false,
    gestor: false,
    admin: false,
  },
  timeoutIcon: null,
  /* laod | error | success */
  timeoutTxt: null,
  staticType: null,
  /* checklist | mail | failed | delete | progress */
  staticTxt1: null,
  staticTxt2: null,
  staticList: null,
  timeoutAlert(param) {
    const tAlert = document.getElementById('timeoutAlertUser');

    if (param == 'close') {
      setTimeout(function () {
        tAlert.classList.remove('alert--is-show');
      }, 2500);
    } else {
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
    const sAlert = document.getElementById('staticAlertUser');

    if (param == 'close') {
      // document.getElementById('usersListCheckAll').checked = false;
      let itemCheck = document.getElementsByClassName('userCheck');
      for (let i = 0; i < itemCheck.length; i++) {
        itemCheck[i].checked = false;
      }

      sAlert.classList.remove('alert--is-show');
      this.set('staticTxt1', null);
      this.set('staticTxt2', null);
      this.set('staticList', null);

      this.set('listingChecked', false);
      this.set('failedEmailsList', []);
      this.set('selectedToMail', false);
      this.set('selectedToDelete', false);
      this.set('selectedToReset', false);
    } else {
      sAlert.classList.add('alert--is-show');
      this.set('staticType', param);
    }
  },
  gerdataLoaderState: 0,
  contentChanged: Ember.observer('pagedContent.content', function () {
    this.set('gerdataLoaderState', 0);
  }),

  // ### TOGGLE ###
  toggle(param) {
    return toggle(param);
  },

  actions: {
    // ------------------------------------ users list search
    livesearch() {
      this.staticAlert('close');
      let busca = document.getElementById('search_input_pessoas_ger').value;
      this.set('gerdataLoaderState', 1);
      this.set('str_search', busca);
      if (busca === null || busca === '' || busca === ' ') {
        this.set('str_search', '');
      }
      this.staticAlert('close');
      this.get('pagedContent').set('page', 1);
    },
    // ------------------------------ users list search clear
    exitsearch() {
      this.staticAlert('close');
      document.getElementById('search_input_pessoas_ger').value = '';
      this.set('str_search', '');
      this.get('pagedContent').set('page', 1);
    },
    // -------------------------------- users list pagination
    setExibir() {
      this.staticAlert('close');
      let exib = document.getElementById('amount').value;
      this.get('pagedContent').set('page', 1);
      this.get('pagedContent').set('perPage', exib);
    },
    // -------------------------------------- users list sort
    setSort(param) {
      this.staticAlert('close');
      if (this.get('sortCol') === param && this.get('sortAsc')) {
        this.set('sortAsc', false);
      } else {
        this.set('sortCol', param);
        this.set('sortAsc', true);
      }
    },

    filterAno(){
      // if (ano == 1){
      //   if (document.getElementById('ano_' + ano).checked){
      //     this.set('ano1', 1);
      //   }else{
      //     this.set('ano1',null);
      //   }
      //   this.get('pagedContent').set('page', 1);
      // }
      // if (ano == 2){
      //   if (document.getElementById('ano_' + ano).checked){
      //     this.set('ano2', 1);
      //   }else{
      //     this.set('ano2',null);
      //   }
      //   this.get('pagedContent').set('page', 1);
      // }
      // if (ano == 3){
      //   if (document.getElementById('ano_' + ano).checked){
      //     this.set('ano3', 1);
      //   }else{
      //     this.set('ano3',null);
      //   }
      //   this.get('pagedContent').set('page', 1);
      // }
      // this.send('atualizaTurmas');

      let select = document.getElementById('ano_selector');
      let ano = select.options[select.selectedIndex].value;
      if(ano == 0){
        this.get('inst_selected')
      }
    },
    filterTurma(){
      let select = document.getElementById('turma_selector');
      let turma = select.options[select.selectedIndex].value;
      if (turma == 0){
        this.get('inst_selected').get('modulos').forEach(function(modu){
          document.getElementById('ano_'+modu.get('idx')).checked = false;
        })
      }else{
        this.get('inst_selected').get('modulos').forEach(function(modu){
          document.getElementById('ano_'+modu.get('idx')).checked = false;
        })
        let mod = this.get('store').peekRecord('plataforma-turma',turma).get('plataformaAno');
        document.getElementById('ano_'+mod.get('idx')).checked = true;
      }
      this.set('tur',turma);
    },

    refreshSelectedSegmento(selectedSegmentoId) {
      var selectedSegmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
      this.set('selectedSegmento', selectedSegmento);
      this.set('selected_segmento_id', selectedSegmentoId);
    },

    refreshFilterAno(selectedAnoId){
      var selectedAno = this.get('store').peekRecord('plataforma-ano', selectedAnoId);
      this.set('selectedAno', selectedAno);
      this.set('selected_ano_id', selectedAnoId);
    },

    refreshFilterTurma(selectedTurmaId){
      var selectedTurma = this.get('store').peekRecord('plataforma-turma', selectedTurmaId);
      this.set('selectedTurma', selectedTurma);
      this.set('selected_turma_id', selectedTurmaId);
    },

    atualizaTurmas(){
      let ano1 = this.get('ano1');
      let ano2 = this.get('ano2');
      let ano3 = this.get('ano3');
      this.get('inst_selected').get('plataformaTurmas').forEach(function(tur){
        let turmaMod = tur.get('plataformaAno');
        if (ano1 != null || ano2 != null || ano3 != null){
          if(ano1 == null && turmaMod.content.data.idx == 1){
            document.getElementById('opt_'+tur.id).style.display = 'none';
          } else if(turmaMod.content.data.idx == 1){
            document.getElementById('opt_'+tur.id).style.display = 'block';
          }
          if(ano2 == null && turmaMod.content.data.idx == 2){
            document.getElementById('opt_'+tur.id).style.display = 'none';
          } else if(turmaMod.content.data.idx == 2){
            document.getElementById('opt_'+tur.id).style.display = 'block';
          }
          if(ano3 == null && turmaMod.content.data.idx == 3){
            document.getElementById('opt_'+tur.id).style.display = 'none';
          } else if(turmaMod.content.data.idx == 3){
            document.getElementById('opt_'+tur.id).style.display = 'block';
          }
        } else{
          document.getElementById('opt_'+tur.id).style.display = 'block';
        }
      })
    },
    uncheckOthers(id){
      let checked = 'ckb_new_p_'+id;
      this.get('inst_selected').get('turmas').forEach(function(tur){
        let docId = 'ckb_new_p_'+tur.id;
        if (docId == checked){
          document.getElementById('ckb_new_p_'+tur.id).checked = true;
        }else{
          document.getElementById('ckb_new_p_'+tur.id).checked = false;
        }
      })
    },
    // userActionDisplay(param) {
    //   this.staticAlert('close');

    //   document.getElementById('usersListCheckAll').checked = false;
    //   let usersListCheck = document.getElementsByClassName('userCheck');

    //   for (let i = 0; i < usersListCheck.length; i++) {
    //     usersListCheck[i].checked = false;
    //   }

    //   let actionClass = document.getElementsByClassName('j-user-action');
    //   let tg = document.getElementById('userActionOptions' + param);
    //   let classToOpen = 'submenu--is-show';

    //   if (param === 'close') {
    //     for (let i = 0; i < actionClass.length; i++) {
    //       actionClass[i].classList.remove(classToOpen);
    //     }
    //   } else {
    //     for (let i = 0; i < actionClass.length; i++) {
    //       if (actionClass[i].id === tg.id) {
    //         if (tg.classList.contains(classToOpen)) {
    //           tg.classList.remove(classToOpen);
    //         } else tg.classList.add(classToOpen);
    //       } else {
    //         actionClass[i].classList.remove(classToOpen);
    //       }
    //     }
    //   }
    // },
    // ------------------------------------- users list check
    listItemCheck(param) {
      let actionClass = document.getElementsByClassName('j-user-action');
      for (let i = 0; i < actionClass.length; i++) {
        actionClass[i].classList.remove('submenu--is-show');
      }

      this.set('selectedToMail', false);
      this.set('listingChecked', true);
      // let globalCheck = document.getElementById('usersListCheckAll');
      let usersListCheck = document.getElementsByClassName('userCheck');

      if (param === 'all') {
        // for (let i = 0; i < usersListCheck.length; i++) {
        //   usersListCheck[i].checked = globalCheck.checked;
        // }
        // if (globalCheck.checked === true) {
        //   if (usersListCheck.length > 1) {
        //     this.set('staticTxt1', usersListCheck.length);
        //     this.set('staticTxt2', this.alertTxt.confirmation.selected);
        //     this.staticAlert('checklist');
        //   }
        // } else {
        //   this.staticAlert('close');
        // }
      } else {
        let count = 0;

        for (let i = 0; i < usersListCheck.length; i++) {
          if (usersListCheck[i].checked === true) count++;
        }

        // if (usersListCheck.length === count) globalCheck.checked = true;
        // else globalCheck.checked = false;

        if (count > 0) {
          if (count > 1) {
            this.set('staticTxt1', count);
            this.set('staticTxt2', this.alertTxt.confirmation.selected);
            this.staticAlert('checklist');
          } else {
            document.getElementById('staticAlertUser').classList.remove('alert--is-show');
          }
        } else {
          document.getElementById('staticAlertUser').classList.remove('alert--is-show');
        }
      }
    },
    // ------------------------------------------- user modal
    userModal(param) {
      this.set('editUser', false);
      document.querySelector('body').classList.add('no-header');
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      // edit user
      if (param) {
        this.set('editUser', true);
        let pessoa = this.get('store').peekRecord('pessoa', param);
        this.set('pessoa_selected', pessoa);

        this.set('new_user_id', param);
        this.set('new_user_name', pessoa.get('name'));
        this.set('new_user_role', pessoa.get('role'));
        this.set('new_user_gender', pessoa.get('genero'));
        //this.set('new_user_subsc', pessoa.get('matricula'));
        // this.set('new_user_birth', pessoa.get('nascimentoPlataforma'));
        this.set('new_user_birth', pessoa.get('dataNascimento'));
        this.set('new_user_ano', pessoa.get('ano'));
        this.set('new_user_turma', pessoa.get('turma'));
        // sets user role to display
        this.set('thisUserRole.aluno', false);
        this.set('thisUserRole.instrutor', false);
        this.set('thisUserRole.coordenador', false);
        this.set('thisUserRole.gestor', false);
        this.set('thisUserRole.admin', false);
        let roleToSet = 'thisUserRole.' + pessoa.get('role');
        this.set(roleToSet, true);

        // sets role select
        let role = document.getElementById('new_user_role');
        if (this.get('thisUserRole.gestor') == true) {
          role.options[4].selected = true;
        } else if (this.get('thisUserRole.coordenador') == true) {
          role.options[3].selected = true;
        } else if (this.get('thisUserRole.instrutor') == true) {
          role.options[2].selected = true;
        } else {
          role.options[1].selected = true;
        }

        this.set('new_user_email', pessoa.get('emailCadastrado'));
        this.set('new_user_login', pessoa.get('userName'));
        this.set('new_user_enabled', pessoa.get('enabled'));
        if (pessoa.get('enabled')) {
          document.getElementById('new_user_enabled').checked = true;
        } else {
          document.getElementById('new_user_enabled').checked = false;
        }
        this.set('user_modulos', pessoa.get('modulos'));
        this.set('pessoa_selected_edit', pessoa);
        document.getElementById('userModal').classList.add('modal--is-show');
        // document.getElementById('userActionOptions' + param).classList.remove('submenu--each-animation-is-show');

        this.set('activeProfile',pessoa.get('role'));
      }
      // new user
      else {

        this.set('activeProfile', '');
        this.set('user_modulos', '');
        this.set('new_user_inst', '');
        this.set('new_user_id', '');
        this.set('new_user_name', '');
        this.set('new_user_role', '');
        this.set('new_user_email', '');
        this.set('new_user_login', '');
        this.set('new_user_enabled', true);
        this.set('pessoa_selected_edit', '');
        this.set('perfil', '');
        this.set('new_user_login', '');
        document.getElementById('new_user_name').value = '';
        document.getElementById('new_user_email').value = '';
        document.getElementById('new_user_login').value = '';
        document.getElementById('new_user_enabled').checked = false;
        document.getElementById('new_user_name').focus();
        let role = document.getElementById('new_user_role');
        role.options[0].selected = true;
        document.getElementById('userModal').classList.add('modal--is-show');
      }
    },
    // ------------------------------------ close user modal
    closeUserModal() {
      document.querySelector('body').classList.remove('no-header');
      document.getElementsByTagName('body')[0].style.overflow = 'auto';

      document.getElementById('userModal').classList.remove('modal--is-show');
      this.set('zerar_sucesso', '');
      this.set('user_modulos', '');
      this.set('new_user_inst', '');
      this.set('new_user_id', '');
      this.set('new_user_name', '');
      this.set('new_user_role', '');
      this.set('new_user_email', '');
      this.set('new_user_login', '');
      this.set('new_user_enabled', false);
      this.set('message_error_adduser', '');
      this.set('pessoa_selected_edit', '');
      this.set('progressos_to_zero', '');
      this.set('wait_prog', false);
      this.staticAlert('close');
    },
    // -------------------------------------------- user save
    userSave(param) {
      this.set('timeoutTxt', this.alertTxt.load.saving);
      this.timeoutAlert('load');
      let userToSave = null;
      let name = document.getElementById('new_user_name').value;
      let role = document.getElementById('new_user_role').value;
      let email = document.getElementById('new_user_email').value;
      let login = document.getElementById('new_user_login').value;
      let genero, matricula, nascimento;
      if (role == 'aluno'){
        genero = document.getElementById('new_user_gender').value;
        //matricula = document.getElementById('new_user_subsc').value;
        nascimento = document.getElementById('new_user_birth').value;

      }
      let inst = this.get('inst_selected');
      let enabled = document.getElementById('new_user_enabled').checked;
      // inputs values verification
      let errors = 0;

      if (name.length < 3) {
        errors++;
        this.set('timeoutTxt', this.alertTxt.error.users.format);
        this.timeoutAlert('error');
      }
      // if (email.length >= 5 && email.search('\\@') > -1 && email.search('\\.') > -1);
      // else {
      //   errors++;
      //   this.set('timeoutTxt', this.alertTxt.error.users.email);
      //   this.timeoutAlert('error');
      // }

      // save edited user
      if (param) {
        console.log("sdfhsdjhfksdjhfksj");
        let pessoa = this.get('pessoa_selected');
        let inst = this.get('inst_selected');
        pessoa.set('emailsent', false);
        if (pessoa.get('name') !== name) {
          pessoa.set('name', name);
        }
        if(pessoa.get('instituicao') != inst){
          pessoa.set('instituicao', inst)
        }
        if (role == 'aluno') {
          if (pessoa.get('matricula') != matricula){
            pessoa.set('matricula', matricula);
          }
          if (pessoa.get('genero') != genero){
            pessoa.set('genero', genero);
          }
          if (pessoa.get('nascimentoPlataforma') != nascimento){
            pessoa.set('nascimentoPlataforma', nascimento)
          }
        }
        if (pessoa.get('emailCadastrado') !== email) {
          pessoa.set('emailCadastrado', email);
        }
        if (pessoa.get('email') !== login) {
          pessoa.set('email', login);
        }
        if (pessoa.get('enabled') !== enabled) {
          pessoa.set('enabled', enabled);
        }
        if (pessoa.get('role') !== role) {
          pessoa.set('role', role);
        }
        this.get('modulos').forEach((mod) => {
          pessoa.get('modulos').removeObject(mod);
        });
        if (role == 'aluno' || role == 'instrutor'){
          let turmas = pessoa.get('turmas');
          turmas.forEach(tur => {
            pessoa.get('turmas').removeObject(tur);
          });
        
        }
        
        userToSave = pessoa;
      }
      // save new user
      else {
        let pessoa;
        if (role == 'aluno'){
          pessoa = {
            "name": name,
            "emailCadastrado": email,
            "enabled": enabled,
            "role": role,
            "instituicao": inst,
            "genero": genero,
            "matricula": matricula,
            "nascimentoPlataforma": nascimento,
            "email": login
          };
        } else{
          pessoa = {
            "name": name,
            "emailCadastrado": email,
            "enabled": enabled,
            "role": role,
            "instituicao": inst,
            "email": login
          };
        }

        let obj_pessoa = this.get('store').createRecord('pessoa', pessoa);
        
        if (role == 'instrutor'){
          debugger
          let anos = this.get('selectedPlataformaAnos');
          anos.forEach(function(ano){
            obj_pessoa.get('plataformaAnos').pushObject(ano);

            obj_pessoa.set('isAplicador', true);
          })
        }

        if (role == 'aluno'){
          let ano = this.get('selectedPlataformaAnos');
          ano.forEach(function(a){
            obj_pessoa.get('plataformaAnos').pushObject(a);
          })

          let turma = this.get('selectedPlataformaTurma');
          turma.forEach(function(t){
            obj_pessoa.get('plataformaTurmas').pushObject(t);
          })
        }
        
        debugger

        if (role == 'aluno' || role == 'instrutor'){
          let turmas = this.get('inst_selected').get('turmas');
          let modulos = this.get('modulos');
          turmas.forEach(function(tur){
            obj_pessoa.get('turmas').pushObject(tur);
            modulos.forEach(function(mod){
              if(tur.get('modulo').content.id == mod.id){
                obj_pessoa.get('modulos').pushObject(mod);
              }
            })
            // if (document.getElementById('ckb_new_p_' + tur.id).checked){
            // }
          })
        }
        // let modulos = this.get('modulos');
        // modulos.forEach((mod) => {
        //   if (document.getElementById('ckb_new_p_' + mod.id).checked) {
        //     obj_pessoa.get('modulos').pushObject(mod);
        //   }
        // });
        userToSave = obj_pessoa;
      }
      // if inputs values validated save
      if (errors === 0) {
        userToSave.save().then(() => {
          this.set('user_modulos', '');
          this.set('new_user_id', '');
          this.set('new_user_name', '');
          this.set('new_user_role', '');
          this.set('new_user_email', '');
          this.set('new_user_login', '');
          this.set('new_user_enabled', false);
          this.set('new_user_inst', '');
          this.set('perfil', '');
          document.getElementById('userModal').classList.remove('modal--is-show');
          document.getElementsByTagName('body')[0].style.overflow = 'auto';
          if (param) {
            this.set('timeoutTxt', this.alertTxt.success.users.edited);
            this.timeoutAlert('success');
            document.querySelector('body').classList.remove('no-header');
          } else {
            this.set('timeoutTxt', this.alertTxt.success.users.created);
            this.timeoutAlert('success');
            document.querySelector('body').classList.remove('no-header');
          }
          this.userListReload();
        }).catch((reason) => {
          if (reason.errors) {
            reason.errors.forEach((error) => {
              if (error.status === "500") {
                this.set('timeoutTxt', this.alertTxt.error.server);
                this.timeoutAlert('error');
              } else if (error.status === "401") {
                localStorage.clear();
                this.get('session').invalidate();
                this.set('timeoutTxt', this.alertTxt.error.session);
                this.timeoutAlert('error');
              } else if (error.status === "400") {
                localStorage.clear();
                this.set('timeoutTxt', this.alertTxt.error.users.exist);
                this.timeoutAlert('error');
              } else {
                this.set('timeoutTxt', this.alertTxt.error.connection);
                this.timeoutAlert('error');
              }
            })
          } else if (reason.message) {
            this.set('timeoutTxt', this.alertTxt.error.unknown);
            this.timeoutAlert('error');
          } else {
            this.set('timeoutTxt', this.alertTxt.error.unknown);
            this.timeoutAlert('error');
          }
        });
      }
      
    },
    // ---------------------------------- user edit progress
    editProgressos() {
      this.set('selectedToReset', true);
      this.set('staticTxt2', this.alertTxt.confirmation.user.progress);
      this.staticAlert('progress');
      this.set('zera_prog_nome', this.get('new_user_name'));
      this.set('zera_prog_id', this.get('new_user_id'));
    },
    // ---------------------------------- user reset progress
    resetarProgressos() {
      let p_id = this.get('new_user_id');
      this.set('timeoutTxt', this.alertTxt.load.reseting);
      this.timeoutAlert('load');
      this.zera_Progressos(p_id).then(() => {
        this.set('timeoutTxt', this.alertTxt.success.reseted);
        this.timeoutAlert('success');
      }).catch(() => {
        this.set('timeoutTxt', this.alertTxt.error.progress);
        this.timeoutAlert('error');
      });
    },

    // ------------------------------------- lot registration
    cadastroLote() {
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      document.getElementById('lote_modal').classList.add('modal--is-show');
      document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
      this.set('error_lote', '');
      this.set('erro_lista', '');
      this.set('wait_lote', true);
      this.set('selected_file', '');
      this.set('lista_lote', '');
      this.set('allow_refresh', true);
      this.refreshListaLote();
    },
    // ------------------------------ cancel lot registration
    cancelLote() {
      document.getElementsByTagName('body')[0].style.overflow = 'auto';
      document.getElementById('get_lote').value = '';
      document.getElementById('lote_modal').classList.remove('modal--is-show');
      document.getElementsByTagName('body')[0].classList.remove('overflow-hidden');
      this.set('error_lote', '');
      this.set('wait_lote', false);
      this.set('selected_file', '');
      this.set('erro_lista', '');
      this.set('lista_lote', '');
      this.set('allow_refresh', false);
    },
    // ------------------- lot registration template download
    baixarTemplate() {
      let inst = this.get('inst_selected');
      let header = localStorage.getItem('person_logged');
      let header_inst;
      if (header) {
        header = JSON.parse(header);
        header_inst = header.id;
      } else {
        header_inst = "";
      }
      window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/templatecargalote?pessoaId=' + header_inst + '&instituicaoId=' + inst.id;
    },
    // --------------------- lot registration template search
    buscarArquivo() {
      let file_name = document.getElementById('get_lote').files[0].name;
      this.set('selected_file', file_name);
    },
    // --------------------- lot registration template import
    importarLote() {
      let file_lote = document.getElementById('get_lote').files[0];

      if (file_lote) {
        this.sendFiletoServer(file_lote).then(() => {
          this.set('error_lote', '');
          this.set('erro_lista', '');
          this.set('wait_lote', true);
          this.set('selected_file', '');
          this.set('lista_lote', '');
          this.set('allow_refresh', true);
          this.refreshListaLote();
          this.userListReload();
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
    emailAction(param) {
      this.set('staticTxt1', null);
      this.set('listingChecked', false);
      this.set('selectedToMail', true);
      // single email
      if (param) {
        this.set('staticTxt2', this.alertTxt.confirmation.emails.single);
        let pessoa = this.get('store').peekRecord('pessoa', param);
        this.set('mail_multi', '');
        this.set('mail_single_pessoa', pessoa);
        // document.getElementById('userActionOptions' + param).classList.remove('submenu--each-animation-is-show');
        this.staticAlert('mail');
      }
      // multiple email
      else {
        this.set('staticTxt1', null);
        this.set('staticTxt2', this.alertTxt.confirmation.emails.multiple);
        this.staticAlert('mail');
        this.set('mail_single_pessoa', '');
        this.set('mail_multi', true);
      }
    },
    cancelarMail() {
      this.set('selectedToMail', false);
      this.set('mail_multi', '');
      this.set('mail_single_pessoa', '');
      this.set('failedEmailsList', null);
      this.staticAlert('close');
    },
    sendMail() {
      this.set('staticList', null);
      this.set('timeoutTxt', this.alertTxt.load.sending);
      this.timeoutAlert('load');
      let pessoa = this.get('mail_single_pessoa');
      let multi = this.get('mail_multi');
      if (pessoa) {
        pessoa.set('emailsent', true);
        pessoa.save().then(() => {
          this.set('mail_multi', '');
          this.set('mail_single_pessoa', '');
          this.set('timeoutTxt', this.alertTxt.success.users.emails.single);
          this.timeoutAlert('success');
          this.staticAlert('close');
        }).catch((reason) => {
          if (reason.errors) {
            reason.errors.forEach((error) => {
              if (error.status === "500") {
                this.set('timeoutTxt', this.alertTxt.error.server);
                this.timeoutAlert('error');
              } else if (error.status === "401") {
                localStorage.clear();
                this.get('session').invalidate();
                this.set('timeoutTxt', this.alertTxt.error.session);
                this.timeoutAlert('error');
              } else {
                this.set('timeoutTxt', this.alertTxt.error.connection);
                this.timeoutAlert('error');
              }
            })
          } else if (reason.message) {
            this.set('timeoutTxt', this.alertTxt.error.unknown);
            this.timeoutAlert('error');
          } else {
            this.set('timeoutTxt', this.alertTxt.error.unknown);
            this.timeoutAlert('error');
          }
        });
      } else if (multi) {
        let temp = document.getElementsByName('mail_send_list');
        let failedList = this.get('failedEmailsList');
        let list = [];

        if (this.get('failedEmailsList').length > 0) {
          // users failed to mail
          failedList.forEach((el) => {
            let id = el.id;
            let item = this.get('store').peekRecord('pessoa', id);
            list.pushObject(item);
          });
        } else {
          this.set('failedEmailsList', []);
          // users selected in list
          temp.forEach((el) => {
            if (el.checked) {
              let id = el.value;
              let item = this.get('store').peekRecord('pessoa', id);
              list.pushObject(item);
            }
          });
        }
        if (list.length > 0) {
          let count = 0;
          this.set('failedEmailsList', []);
          list.forEach((pessoa) => {
            pessoa.set('emailsent', true);
            pessoa.save().then(() => {
              this.set('timeoutTxt', this.alertTxt.success.users.emails.multiple);
              this.timeoutAlert('success');
              this.staticAlert('close');
            }).catch((reason) => {
              this.set('staticTxt1', null);
              this.set('staticTxt2', null);
              count++;
              this.get('failedEmailsList').pushObject({
                id: pessoa.id,
                email: pessoa.data.email
              });
              if (count == list.length) {
                if (reason.errors) {
                  reason.errors.forEach((error) => {
                    if (error.status === "500") {
                      this.set('timeoutTxt', this.alertTxt.error.server);
                      this.timeoutAlert('error');
                    } else if (error.status === "401") {
                      localStorage.clear();
                      this.get('session').invalidate();
                      this.set('timeoutTxt', this.alertTxt.error.session);
                      this.timeoutAlert('error');
                    } else {
                      this.set('timeoutTxt', this.alertTxt.error.connection);
                      this.timeoutAlert('error');
                    }
                  })
                } else if (reason.message) {
                  this.set('timeoutTxt', this.alertTxt.error.unknown);
                  this.timeoutAlert('error');
                } else {
                  this.set('timeoutTxt', this.alertTxt.error.unknown);
                  this.timeoutAlert('error');
                }
                let failedDisplay = this.get('failedEmailsList').filter(
                  function (i) {
                    return JSON.parse(JSON.stringify(i));
                  }
                );
                this.set('staticTxt2', this.alertTxt.error.emails.send);
                this.set('staticList', failedDisplay);
                this.staticAlert('failed');
              }
            });
          });
        } else {
          this.set('timeoutTxt', this.alertTxt.error.default);
          this.timeoutAlert('error');
        }
      }
    },
    deletePessoa(param) {
      // document.getElementById('userActionOptions' + param).classList.remove('submenu--each-animation-is-show');
      this.set('listingChecked', false);
      this.set('selectedToDelete', true);
      let pessoa = this.get('store').peekRecord('pessoa', param);
      let confirm_entity = {
        'name': pessoa.get('name'),
        'id': pessoa.get('id'),
        'type': 'pessoa'
      };
      this.set('confirm_entity', confirm_entity);
      this.set('staticTxt2', this.alertTxt.confirmation.user.delete);
      this.staticAlert('delete');
    },
    cancelDel() {
      this.set('confirm_entity', '');
      this.staticAlert('close');
    },
    confirmDel(params) {
      this.set('timeoutTxt', this.alertTxt.load.deleting);
      this.timeoutAlert('load');
      let type = params.type;
      let id = params.id;
      let obj = this.get('store').peekRecord(type, id);
      obj.destroyRecord().then(() => {
        this.set('confirm_entity', '');
        this.staticAlert('close');
        this.set('timeoutTxt', this.alertTxt.success.users.deleted);
        this.timeoutAlert('success');
        this.userListReload();
      }).catch((reason) => {
        if (reason.errors) {
          reason.errors.forEach((error) => {
            if (error.status === "500") {
              this.set('timeoutTxt', this.alertTxt.error.server);
              this.timeoutAlert('error');
            } else if (error.status === "401") {
              localStorage.clear();
              this.get('session').invalidate();
              this.set('timeoutTxt', this.alertTxt.error.session);
              this.timeoutAlert('error');
            } else {
              this.set('timeoutTxt', this.alertTxt.error.connection);
              this.timeoutAlert('error');
            }
          })
        } else if (reason.message) {
          this.set('timeoutTxt', this.alertTxt.error.users.delete);
          this.timeoutAlert('error');
        } else {
          this.set('timeoutTxt', this.alertTxt.error.users.delete);
          this.timeoutAlert('error');
        }
      });
    },
    
    baixarTemplateAtivos() {
      let inst = this.get('inst_selected');
      let header = localStorage.getItem('person_logged');
      let header_inst;
      if (header) {
        header = JSON.parse(header);
        header_inst = header.id;
      } else {
        header_inst = "";
      }
      window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/templateativos?pessoaId=' + header_inst + '&instituicaoId=' + inst.id;
    },

    refreshSelectedAno(selectedPlatAnoId) {
      if (!selectedPlatAnoId == "0") {
        let pessoa = this.get('pessoa_selected');

        if (pessoa != null){
          var pessoaAnos = pessoa.get('plataformaAnos');
          pessoaAnos.forEach(pa => {
            pessoa.get('plataformaAnos').removeObject(pa);
          })
          let ano = this.get('store').peekRecord('plataforma-ano', selectedPlatAnoId);
          pessoa.get('plataformaAnos').pushObject(ano);
          this.set('selectedPA', ano);
        }
        else{
          let ano = this.get('store').peekRecord('plataforma-ano', selectedPlatAnoId);
          this.get('selectedPlataformaAnos').pushObject(ano);
          this.set('selectedPA', ano);
        }
      } else {
        this.set('selectedPA', "");
      }
    },

    refreshSelectedPlataformaTurma(plataformaTurmaId) {
      if (!plataformaTurmaId == "0") {
        let pessoa = this.get('pessoa_selected');

        if (pessoa != null){
          var pessoaTurmas = pessoa.get('plataformaTurmas');
          pessoaTurmas.forEach(pt => {
            pessoa.get('plataformaTurmas').removeObject(pt);
          });
          let turma = this.get('store').peekRecord('plataforma-turma', plataformaTurmaId);
          pessoa.get('plataformaTurmas').pushObject(turma);
          this.set('selectedPT', turma);
        }
        else{
          let turma = this.get('store').peekRecord('plataforma-turma', plataformaTurmaId);
          this.get('selectedPlataformaTurma').pushObject(turma);
          this.set('selectedPT', turma);
        }
      } else {

        this.set('SelectedPT', "");
      }
    },

    selectAno(platAno, selected) {
      //this.send('removeAplicadorError');
      //this.checkform();
      let pessoa = this.get('pessoa_selected');

      if (pessoa != null){
        if (selected) {
          pessoa.get('plataformaAnos').pushObject(platAno);
        } else {
          pessoa.get('plataformaAnos').removeObject(platAno);
        }
      }
      else{
        this.get('selectedPlataformaAnos').pushObject(platAno);
      }
    },

    checkaplicador(v) {
      debugger
      let pessoa = this.get('pessoa_selected');
      if (pessoa != null){
        let pessoaAnos = pessoa.get('plataformaAnos');
        pessoa.set('isAplicador', v.currentTarget.checked);
        this.set('isAplicador', v.currentTarget.checked);
  
        if (!v.currentTarget.checked) {
  
          if (pessoaAnos.get('length') > 0) {
            let list = pessoaAnos.toArray();
            pessoaAnos.removeObjects(list);
          }
          //this.checkform();
          this.send('removeAplicadorError');
        }
      }
      else{
        this.set('isAplicador', v.currentTarget.checked);
      }

    }

  }
});
