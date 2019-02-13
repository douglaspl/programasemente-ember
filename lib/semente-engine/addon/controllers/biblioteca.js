import Controller from '@ember/controller';
import ENV from '../config/environment';
import Ember from 'ember';
import moment from 'moment';

export default Controller.extend({
  env: ENV.APP,
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  appController: Ember.inject.controller('application'),
  role: Ember.computed('appController', function () {
    let ac = this.get('appController');
    return ac.get('role');
  }),
  filesList: Ember.computed('appController', function () {
    let ac = this.get('appController');
    return ac.get('filesList');
  }),
  // --------------------------------------------- notification modal
  timeoutIcon: null,
  /* laod | error | success */
  timeoutTxt: null,
  staticType: null,
  /* checklist | mail | failed | delete | progress */
  staticTxt1: null,
  staticTxt2: null,
  staticList: null,
  timeoutAlert(param) {
    const tAlert = document.getElementById('libraryAlert');

    if (param == 'close') {
      setTimeout(function () {
        tAlert.classList.remove('alert--is-show');
        //this.set('timeoutIcon', null);
        //this.set('timeoutTxt', null);
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
  modalClose() {
    document.getElementById('modalBtn').style.display = 'none';
    document.getElementById('libModal').classList.remove('report-people__selected-users--is-show');
  },
  // ----------------------------------------------------------------
  makeCustomCall(verb, url, json) {
    let header = localStorage.getItem('person_logged');
    let header_inst;

    if (header) {
      header_inst = JSON.parse(header).id;
    } else header_inst = '';

    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);

    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open(verb, url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.setRequestHeader('data-type', 'application/json');
      xhr.setRequestHeader('pessoaid', header_inst);
      xhr.setRequestHeader('Authorization', userToken);
      xhr.send(json);

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
  actions: {
    // --------------------------------------- open file upload modal
    fileUpload() {
      document.getElementById('fileName').value = null;
      document.getElementById('fileType').getElementsByTagName('option')[0].selected = 'selected';
      document.getElementById('filePath').value = null;
      document.getElementById('fileThumb').value = null;
      document.getElementsByTagName('body')[0].classList.toggle('overflow-hidden');
      document.getElementById('j-uploadModal').classList.toggle('modal--is-show');
      document.getElementById('libModal').classList.remove('report-people__selected-users--is-show');
    },
    // ----------------- change upload file input on select file type
    fileType() {

    },
    // -------------------- save new file for the institution library
    fileSave() {
      this.set('timeoutTxt', 'Registrando...');
      this.timeoutAlert('laod');
      const url = this.get('env.host') + '/' + this.get('env.namespace') + '/materiais';
      let params = JSON.stringify({
        "data": {
          "type": "material",
          "id": "0",
          "attributes": {
            "link": document.getElementById('filePath').value,
            "thumb": document.getElementById('fileThumb').value,
            "nome": document.getElementById('fileName').value,
            "tipo": document.getElementById('fileType').value,
          },
          "relationships": {
            "instituicao": {
              "data": [{
                "type": "instituicao",
                "id": JSON.parse(localStorage.getItem('person_logged')).instituicao_id.toString()
              }],
            }
          }
        }
      });

      this.makeCustomCall('POST', url, params).then(() => {}).catch(() => {
        document.getElementsByTagName('body')[0].classList.toggle('overflow-hidden');
        document.getElementById('j-uploadModal').classList.toggle('modal--is-show');
        document.getElementById('libModal').classList.remove('report-people__selected-users--is-show');

        let tempFilesList = this.get('filesList');

        tempFilesList.pushObject({
          "id": null,
          "uploadDate": Date.now()/1000,
          "readableDate": moment(Date.now()/1000, 'X').fromNow().replace('ago', 'atrás').replace('few', '').replace('seconds', 'segundo').replace('hour', 'hora').replace('hours', 'horas').replace(new RegExp("\\ba\\b"), 'Um').replace('day', 'dia').replace('days', 'dias').replace('week', 'semana').replace('weeks', 'semanas').replace('months', 'meses').replace('month', 'mês').replace('year', 'ano').replace('years', 'ano'),
          "type": document.getElementById('fileType').value,
          "name": document.getElementById('fileName').value,
          "thumb":document.getElementById('fileThumb').value,
          "link": document.getElementById('filePath').value,
          "view": {
            "id": 0,
            "status": false,
            "date": 0
          },
        });
        
        this.set('filesList', tempFilesList);

        // push new file to the filesList
        this.set('timeoutTxt', 'Novo material criado.');
        this.timeoutAlert('success');
      });
    },
    // ----------------------- delete file of the institution library
    fileDelete() {

    },
    // ------------------------- edit file of the institution library
    fileEdit() {

    },
    // -------------------------------- mark all unread files as read
    markAllAsRead() {
      let toMark = [];
      let i;

      this.get('filesList').forEach(el => {
        if (el.view.status == false) toMark.push(el.view.id);
      });

      if (toMark.length > 0) {
        this.set('timeoutTxt', 'Salvando...');
        this.timeoutAlert('load');
        
        for (i = 0; i < toMark.length; i++) {
          const url = this.get('env.host') + '/' + this.get('env.namespace') + '/acompanhamento-pessoa-material/' + toMark[i];
          let params = JSON.stringify({
            "data": {
              "type": "acompanhamento-pessoa-material",
              "id": toMark[i].toString(),
              "attributes": {
                "visualizado": true,
              },
            }
          });
  
          this.makeCustomCall('PATCH', url, params).then(() => {}).catch(() => {});
          document.getElementById('newAlert' + toMark[i]).style.display = 'none';
          this.set('timeoutTxt', 'Materiais marcados como vistos.')
          this.timeoutAlert('success');
        }
      } else this.timeoutAlert('close');
    },
    // ----------------------------------------------- video view patch
    playView(param) {
      let cPlayer = document.getElementById('player' + param);

      document.getElementById('thumb' + param).style.display = 'none';
      cPlayer.src = cPlayer.src + '?autoplay=1';
      cPlayer.style.display = 'inherit';

      const url = this.get('env.host') + '/' + this.get('env.namespace') + '/acompanhamento-pessoa-material/' + param;
      let params = JSON.stringify({
        "data": {
          "type": "acompanhamento-pessoa-material",
          "id": param.toString(),
          "attributes": {
            "visualizado": true,
          },
        }
      });

      this.makeCustomCall('PATCH', url, params).then(() => {
        document.getElementById('newAlert' + param).style.display = 'none';
      }).catch(() => {});
    },
    // ------------------------------------------------ link view patch 
    linkView(param) {
      document.getElementById('file' + param).click();

      const url = this.get('env.host') + '/' + this.get('env.namespace') + '/acompanhamento-pessoa-material/' + param;
      let params = JSON.stringify({
        "data": {
          "type": "acompanhamento-pessoa-material",
          "id": param.toString(),
          "attributes": {
            "visualizado": true,
          },
        }
      });
      this.makeCustomCall('PATCH', url, params).then(() => {
        document.getElementById('newAlert' + param).style.display = 'none';
      }).catch(() => {});
    },
  }
});
