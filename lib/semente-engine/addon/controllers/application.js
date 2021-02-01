import Ember from 'ember';
import ENV from '../config/environment';
import moment from 'moment';
import {
  detectIE11
} from '../helpers/detectIE11';

export default Ember.Controller.extend({
  appstate: Ember.inject.service(),
  store: Ember.inject.service(),
  rootURL: ENV.rootURL,
  env: ENV.APP,
  session: Ember.inject.service('session'),
  transited: false,
  backOn: false,
  isClosed: true, // the menu for the mobile version is closed at the initialization
  mainTitle: '---',
  appLocation: 'app',
  role: '',
  envnmt: ENV.APP,
  filesList: [],

  // hideHeader: Ember.run.schedule('afterRender', function(){
  //   if(window.location.pathname.search('review') > 1) {
  //     document.querySelector('body').classList.add('no-header');
  //   } else {
  //     document.querySelector('body').classList.remove('no-header');
  //   }
  // }),

  hasReport: Ember.computed('model', function(){
    // let obj = localStorage.getItem('person_logged');
    if (obj) {
      obj = JSON.parse(obj);
      if (obj.role == 'aluno') {
        return false;
      } else {
        return true;
      }
    }

  }),


  hasModulo: Ember.computed('model', function(){
    function findMatricula(element) {
        return (element.type == 'matricula' && element.attributes.matriculado == true);
    }
    let matricula = this.get('model').included.find(findMatricula);
    if (matricula){
      return true;
    }
    return false;
  }),
  ModuloIdx: Ember.computed('model', function () {
    function findMatricula(element) {
      return (element.type == 'matricula' && element.attributes.matriculado == true);
    }
    let matricula = this.get('model').included.find(findMatricula);
    if (matricula){
      return matricula.relationships.modulo.data.id;
    }
    return false;

  }),
  instList: Ember.computed('model', function(){
    let instList = this.get('model').data;
    let included = this.get('model').included;
      instList.forEach(obj => {
        let inst_id = obj.relationships.instituicao.data.id;
        let inst_obj = included.find(obj => {
          return obj.id === inst_id && obj.type === "Instituicao";
        });
        obj['instituicao_name'] = inst_obj.attributes.name;
        obj['instituicao_id'] = inst_id;
      });
    return instList;
  }),
  InstituicaoId: Ember.computed('model', function () {
    function findInstituicao(element){
      return(element.type=='Instituicao');
    }
    let instituicao = this.get('model').included.find(findInstituicao);
    let instituicaoid = instituicao.id;

    return instituicaoid;
  }),
  InstituicaoName: Ember.computed('model', function () {
    function findInstituicao(element){
      return(element.type=='Instituicao');
    }
    let instituicao = this.get('model').included.find(findInstituicao);
    let instituicaoName = instituicao.attributes.name;

    return instituicaoName;
  }),
  primeiroAno: Ember.computed('model', function () {
    let moduloid;
    if(this.get('model').included.find(function(obj){
      moduloid = obj.attributes['modulo-id'];
      return obj.type=='matricula' && obj.attributes['modulo-idx']==1 && obj.attributes['matriculado']
    })) {
      return moduloid;
    } else {
      return false;
    }

  }),
  segundoAno: Ember.computed('model', function () {

    let moduloid;
    if(this.get('model').included.find(function(obj){
      moduloid = obj.attributes['modulo-id'];
      return obj.type=='matricula' && obj.attributes['modulo-idx']==2 && obj.attributes['matriculado']
    })) {
      return moduloid;
    } else {
      return false;
    }

  }),
  terceiroAno: Ember.computed('model', function () {

    let moduloid;
    if(this.get('model').included.find(function(obj){
      moduloid = obj.attributes['modulo-id'];
      return obj.type=='matricula' && obj.attributes['modulo-idx']==3 && obj.attributes['matriculado']
    })) {
      return moduloid;
    } else {
      return false;
    }

  }),

  // acessoS: Ember.computed('model', function() {
  //   return false;
  // }),
  
  // acessoFp: Ember.computed('model', function() {
  //   return false;
  // }),

  // livro: Ember.computed('model', function() {
  //   debugger;
  //   let pessoa = this.get('model').data[0];
  //   if (pessoa.attributes.role != 'aluno') return;
  //   let platAno = this.get('model').get('plataformaAnos.firstObject');
  //   let livro = platAno.get('livros').filterBy('perfil', pessoa.get('role')).get('firstObject');
  //   return livro;
  // }),

  showLivroUrl(moduloIdx) {
    let urlLivro;
    switch (moduloIdx) {
      case 11:
        urlLivro = 'https://spasementemedio.blob.core.windows.net/plataforma/1%C2%AA%20S%C3%A9rie/1%C2%AA%20s%C3%A9rie%20medio%20ALUNO%202021%20BAIXA.pdf';
        break;
    
      case 12:
        urlLivro = 'https://spasementemedio.blob.core.windows.net/plataforma/2%C2%AA%20S%C3%A9rie/2%C2%AA%20s%C3%A9rie%20medio%20ALUNO%202021%20BAIXA.pdf';
        break;
    
      case 13:
        urlLivro = 'https://spasementemedio.blob.core.windows.net/plataforma/3%C2%AA%20S%C3%A9rie/3%C2%AA%20s%C3%A9rie%20medio%20ALUNO%202021%20BAIXA.pdf';
        break;
    
      default:
        return;
    }

    this.set('urlLivro', urlLivro);
  },

  instLibVerify() {
    const headerLib = document.getElementById('header-biblioteca');

    let localData = JSON.parse(localStorage.getItem('person_logged'));
    let tok = this.get('session.data').authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let instEndpoint = this.get('env.host') + '/' + this.get('env.namespace') + '/pessoas?include=instituicao,modulos';
    let that = this;

    new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', instEndpoint);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Authorization', userToken);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.setRequestHeader('data-type', 'application/json');
      xhr.setRequestHeader('pessoaid', localData.id);
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200 || this.status === 204) {
            let data;

            if (detectIE11() === true) {
              data = JSON.parse(this.response).included.filter(el => {
                if (el.id == localData.instituicao_id) return el;
              });
            } else {
              data = this.response.included.filter(el => {
                if (el.id == localData.instituicao_id) return el;
              });
            }
            if (data[0].attributes['tem-biblioteca'] == true) headerLib.style.display = 'flex';
            else headerLib.style.display = 'none';

            resolve(data);
          } else if (this.status === 400 || this.status === 500) {
            reject(new Error(this.response.error));
          } else if (this.status === 401) {
            localStorage.clear();
            that.get('session').invalidate();
          } else {
            reject(new Error('Failure from server call: [' + this.status + ']'));
          }
        }
      }
    });
  },
  // ------------------------------------------ institution lib list request
  libraryListRequest() {
    const notificationNumber = document.getElementById('j-libraryNotificationNumber');

    let userLastAccess = 0;
    let tempFilesList = [];
    let numCount = 0;

    let localData = JSON.parse(localStorage.getItem('person_logged'));
    let tok = this.get('session.data').authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let accessEndpoint = this.get('env.host') + '/' + this.get('env.namespace') + '/data-visualizacao-biblioteca/' + localData.id;
    let libEndpoint = this.get('env.host') + '/' + this.get('env.namespace') + '/pessoas/' + localData.id + '?include=acompanhamento-pessoa-materiais.material';
    let that = this;

    new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', accessEndpoint);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Authorization', userToken);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.setRequestHeader('data-type', 'application/json');
      xhr.setRequestHeader('pessoaid', localData.id);
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200 || this.status === 204) {
            let data;

            if (detectIE11() === true) {
              data = JSON.parse(this.response).data.attributes.dataVisualizacao;
              userLastAccess = data;
            } else {
              data = this.response.data.attributes.dataVisualizacao;
              userLastAccess = data;
            }

            resolve(data);
          } else if (this.status === 400 || this.status === 500) {
            reject(new Error(this.response.error));
          } else if (this.status === 401) {
            localStorage.clear();
            that.get('session').invalidate();
          } else {
            reject(new Error('Failure from server call: [' + this.status + ']'));
          }
        }
      }
    });

    new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', libEndpoint);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Authorization', userToken);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.setRequestHeader('data-type', 'application/json');
      xhr.setRequestHeader('pessoaid', localData.id);
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200 || this.status === 204) {
            let data;

            if (detectIE11() === true) {
              data = JSON.parse(this.response).included;
            } else {
              data = this.response.included;
            }

            if (data) {
              data.forEach(el => {
                let thisView = data.filter(function (i) {
                  if (i.type == 'acompanhamento-pessoa-material')
                    if (i.relationships.material.data.id == el.id)
                      return i;
                });

                if (el.type == 'material') {
                  tempFilesList.pushObject({
                    "id": el.id,
                    "uploadDate": el.attributes['data-upload'],
                    "readableDate": moment(el.attributes['data-upload'], 'X').fromNow().replace('ago', 'atrás').replace('hour', 'hora').replace('hours', 'horas').replace(new RegExp("\\ba\\b"), 'Um').replace('day', 'dia').replace('days', 'dias').replace('week', 'semana').replace('weeks', 'semanas').replace('months', 'meses').replace('month', 'mês').replace('year', 'ano').replace('years', 'ano'),
                    "type": el.attributes.tipo,
                    "name": el.attributes.nome,
                    "thumb": el.attributes.thumb,
                    "link": el.attributes.link,
                    "view": {
                      "id": thisView[0].id,
                      "status": thisView[0].attributes.visualizado,
                      "date": thisView[0].attributes['data-visualizado']
                    },
                  });

                  if (thisView[0].attributes.visualizado == false)
                    if (el.attributes['data-upload'] >= userLastAccess) numCount++;
                }
              });
            }
            if (numCount > 0) notificationNumber.classList.add('counter__bubble--is-show');
            else notificationNumber.classList.remove('counter__bubble--is-show');

            if (numCount >= 10) notificationNumber.innerHTML = '+9';
            else notificationNumber.innerHTML = numCount;

            resolve(data);
          } else if (this.status === 400 || this.status === 500) {
            reject(new Error(this.response.error));
          } else if (this.status === 401) {
            localStorage.clear();
            that.get('session').invalidate();
          } else {
            reject(new Error('Failure from server call: [' + this.status + ']'));
          }
        }
      }
    });
    this.set('filesList', tempFilesList);
  },
  libSet() {
    this.instLibVerify();
    this.libraryListRequest();
  },
  makeCustomCall(verb, url, json) {
    let header = localStorage.getItem('person_logged');
    let header_inst;
    if (header) {
      header = JSON.parse(header);
      header_inst = header.id;
    } else {
      header_inst = "";
    }
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
  change_uri_avatar() {
   let obj = localStorage.getItem('person_logged');
   let p = JSON.parse(obj);
    if (obj) {
      let that = this;
      this.get('store').findRecord('pessoa', p.id, {
        reload: true
      }).then(function (pessoa) {
        let av = pessoa.get('uriAvatar');
        if (av) {
          that.set('uri_avatar', new Ember.String.htmlSafe(av));
          p.uri_avatar = av;
          localStorage.setItem("person_logged", JSON.stringify(p));
        } else {
          that.set('uri_avatar', new Ember.String.htmlSafe("/assets/img/avatar-default.svg"));
        }
      });
    }
  },
  anoDoUsuario: Ember.computed('model', function () {
    // let obj = localStorage.getItem('person_logged');
    // let pessoa = this.get("store").peekRecord("pessoa", obj.id);
    // let modulos = pessoa.get("modulos");
    // return "nada haver";
  }),
  oneInst: Ember.computed('model', function () {
    let inst_array = this.get('model').data;
    let obj = localStorage.getItem('person_logged');
    let that = this;
    if (obj) {
      that.set('acessoS', this.get('model').data[0].attributes["acesso-s"]);
      that.set('acessoFp', this.get('model').data[0].attributes["acesso-fp"]);
      obj = JSON.parse(obj);
      Ember.run.schedule('afterRender', function () {
        that.set('role', obj.role);
        if (obj.role === 'admin') that.set('id_instituicao', 0);
        else that.set('id_instituicao', obj.instituicao_id);
        let usertemp = obj.name.toLowerCase();
        let tocap = 1;
        let resp = '';
        for (let i = 0; i < usertemp.length; i++) {
          if (tocap === 1) resp = resp + usertemp.charAt(i).toUpperCase();
          else resp = resp + usertemp.charAt(i);
          if (usertemp[i] === ' ') tocap = 1;
          else tocap = 0;
        }
        that.set('username', resp);
        //that.set('uri_avatar', new Ember.String.htmlSafe(obj.uri_avatar));
        if (obj.uri_avatar) that.set('uri_avatar', new Ember.String.htmlSafe(obj.uri_avatar));
        else that.set('uri_avatar', new Ember.String.htmlSafe("/assets/img/avatar-default.svg"));

        //that.libSet();
        // #########################################
        // #########################################
        // #########################################
        // console.log('>_redirect: oneInstitution - logged;')

        let shouldReview;
        inst_array.forEach(function(elem) {
          if (elem.id === obj.id)
          {
            shouldReview = elem.attributes['should-review-profile']
          }
        });

        if (shouldReview)
        {
          that.transitionToRoute('profile', obj.id);
          return true;
        }
        // if ((obj.role == 'admin') && (window.location.pathname.search('styleguide') > 1)) that.transitionToRoute('styleguide')
        if (that.get('hasModulo')){
          if (obj.role == 'aluno') {
            that.showLivroUrl(that.get('ModuloIdx'));
            that.transitionToRoute('modulos.modlist', that.get('ModuloIdx'));
          } else {
            that.transitionToRoute('aulas');
          }
        } else {
          that.transitionToRoute('aulas');
        }

        // #########################################
        // #########################################
        // #########################################
      });
      return true;
    } else {
      if (inst_array) {
        if (inst_array.length === 1) {
          let pessoa = inst_array[0];
          if (pessoa.relationships.area) {
            let obj = {
              "id": pessoa.id,
              "name": pessoa.attributes.name,
              "role": pessoa.attributes.role.toLowerCase(),
              "email": pessoa.attributes.email,
              "instituicao_id": that.get('InstituicaoId'),
              "instituicao_name": that.get('InstituicaoName'),
              "area_id": pessoa.relationships.area.data.id,
              "uri_avatar": pessoa.attributes['uri-avatar'],
            };
            localStorage.setItem('person_logged', JSON.stringify(obj));
          } else {
            let obj = {
              "id": pessoa.id,
              "name": pessoa.attributes.name,
              "role": pessoa.attributes.role.toLowerCase(),
              "email": pessoa.attributes.email,
              "instituicao_id": that.get('InstituicaoId'),
              "instituicao_name": that.get('InstituicaoName'),
              "uri_avatar": pessoa.attributes['uri-avatar'],
            };
            localStorage.setItem('person_logged', JSON.stringify(obj));
          }
          // this.change_uri_avatar();
          Ember.run.schedule('afterRender', function () {
            if (pessoa.attributes.role === 'admin') that.set('id_instituicao', 0);
            else that.set('id_instituicao', that.get('InstituicaoId'));
            that.set('role', pessoa.attributes.role.toLowerCase());
            let usertemp = pessoa.attributes.name.toLowerCase();
            let tocap = 1;
            let resp = '';
            for (let i = 0; i < usertemp.length; i++) {
              if (tocap === 1) resp = resp + usertemp.charAt(i).toUpperCase();
              else resp = resp + usertemp.charAt(i);
              if (usertemp[i] === ' ') tocap = 1;
              else tocap = 0;
            }

            that.set('username', resp);
            if (pessoa.attributes['uri-avatar']) that.set('uri_avatar', new Ember.String.htmlSafe(pessoa.attributes['uri-avatar']));
            else that.set('uri_avatar', new Ember.String.htmlSafe("/assets/img/avatar-default.svg"));
            // #########################################
            // #########################################
            // #########################################
            // console.log('>_redirect: oneInstitution - not_logged;');
            if (pessoa.attributes['should-review-profile'])
            {
              that.transitionToRoute('profile', pessoa.id);
              return true;
            }

            if (pessoa.attributes.role == 'aluno') {
              if (that.get('hasModulo')){
                that.showLivroUrl(that.get('ModuloIdx'));
                that.transitionToRoute('modulos.modlist', that.get('ModuloIdx'));
              } else {
                that.transitionToRoute('aulas');
              }
            }
            else if (pessoa.attributes.role == 'marketing') { 
              that.transitionToRoute('marketing.index');
            }
            else {
              that.transitionToRoute('aulas');
            }
          });
          return true;
        } else return false;
      } else return false;
    }
  }),
  currentPathChange: Ember.observer('transited', function () { //observing path transitions to set the page accordingly, like the title
    this.get('transited');
    this.set('isClosed', true);
    let that = this;
    Ember.run.schedule('afterRender', function () {
      that.setTitle();
    });
  }),
  setTitle: function () {
    let path = window.location.pathname;

    // ------------------------------------------------------------ utils consts
    const headerLayout = document.getElementById('header_layout');
    const subMenu = document.getElementsByClassName('global-nav__submenu');
    const contentMain = document.getElementById('content-main');

    // ---------------------------------------------------------- header modules
    const courses = document.getElementById('header-modulos');
    const library = document.getElementById('header-biblioteca');
    //const myProgress = document.getElementById('header-progressos');
    const followUp = document.getElementById('header-indicadores');
    const conteudos = document.getElementById('header-conteudos');
    // const marketing = document.getElementById('header-marketing');
    const administration = document.getElementById('header-gersistema');

    // ----------------------------------------------- reset header active module
    const activeClass = document.getElementsByClassName('global-nav__link--is-active');
    let i;

    for (i = 0; i < activeClass.length; i++) {
      activeClass[i].classList.remove("global-nav__link--is-active");
    }

    // ------------------------------------ verify active module to set as active
    // courses module
    if (path.search('/modulos') > -1) {
      courses.getElementsByClassName("global-nav__link")[0].classList.add("global-nav__link--is-active");

      this.set('mainTitle', 'Módulos');
      this.set('mobTitle', 'Módulos');

      // course preview
      if (path.search('modlist/') > -1) {
        headerLayout.style.display = 'flex';
        subMenu[0].classList.remove("submenu--is-show");
        contentMain.classList.remove('content-main--in-course');
      }
      // course view
      else if (path.search('modetails/') > -1) {
        headerLayout.style.display = 'none';
        subMenu[0].classList.remove("submenu--is-show");
        contentMain.classList.add('content-main--in-course');
      }
      //
      else {
        headerLayout.style.display = 'flex';
        subMenu[0].classList.remove("submenu--is-show");
        contentMain.classList.remove('content-main--in-course');
        this.set('appLocation', 'modulos');
        this.set('backOn', false);
      }

      let idx = path.search('/modulos/');
      let temp = path.substr(idx + 9);
      let ender = temp.search('/');
      let mod_name;

      if (ender > -1) {
        mod_name = temp.substr(0, ender);
      } else {
        mod_name = 'modulos';
      }

      this.set('appLocation', 'nestedmodulos');
      this.set('backOn', mod_name);
    }

    // library module
    else if (path.search('/biblioteca') > -1) {
      library.querySelector('a').classList.add("global-nav__link--is-active");

      headerLayout.style.display = 'flex';
      subMenu[0].classList.remove("submenu--is-open");
      contentMain.classList.remove('content-main--in-course');
      this.set('mainTitle', 'Tela de Biblioteca');
      this.set('mobTitle', 'Biblioteca');
      this.set('appLocation', 'biblioteca');
      this.set('backOn', false);
    }

    // my progress module
    //if (path.search('')) myProgress.firstChild.classList.add("global-nav__link--is-active");

    // follow up module
    else if (path.search('/administracao') > -1) {
      followUp.firstElementChild.classList.add("global-nav__link--is-active");

      headerLayout.style.display = 'flex';
      subMenu[0].classList.remove("submenu--is-show");
      contentMain.classList.remove('content-main--in-course');
      this.set('mainTitle', 'Tela de Acompanhamento');
      this.set('mobTitle', 'Acompanhamento');
      this.set('appLocation', 'administracao');
      this.set('backOn', false);
    }

    else if (path.search('/conteudos') > -1) {
      // conteudos.firstElementChild.classList.add("global-nav__link--is-active");

      headerLayout.style.display = 'flex';
      subMenu[0].classList.remove("submenu--is-show");
      contentMain.classList.remove('content-main--in-course');
      this.set('mainTitle', 'Tela de Conteúdos');
      this.set('mobTitle', 'Conteúdos');
      this.set('appLocation', 'conteudos');
      this.set('backOn', false);
    }

    else if (path.search('/marketing') > -1) {
      // marketing.firstElementChild.classList.add("global-nav__link--is-active");

      headerLayout.style.display = 'flex';
      subMenu[0].classList.remove("submenu--is-show");
      contentMain.classList.remove('content-main--in-course');
      this.set('mainTitle', 'Tela de Marketing');
      this.set('mobTitle', 'Marketing');
      this.set('appLocation', 'marketing');
      this.set('backOn', false);
    }

    // adminsitration module
    else if (path.search('/gersistema') > -1) {
      // administration.firstElementChild.classList.add("global-nav__link--is-active");

      headerLayout.display = 'flex';
      subMenu[0].classList.remove("submenu--is-show");
      contentMain.classList.remove('content-main--in-course');
      this.set('mainTitle', 'Instituições');
      this.set('mobTitle', 'Sistema');
      this.set('appLocation', 'gersistema');
      this.set('backOn', false);
    }
  },
  sendAvatarToServer(file) {
    let header = localStorage.getItem('person_logged');
    let header_inst;
    if (header) {
      header = JSON.parse(header);
      header_inst = header.id;
    } else header_inst = "";

    let sessionData = this.get('session.data');
    let tok = sessionData.authenticated.access_token;
    let temp = 'Bearer ';
    let userToken = temp.concat(tok);
    let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/avatar';
    return new Ember.RSVP.Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', final_url);
      xhr.responseType = 'json';
      xhr.onreadystatechange = handler;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
      xhr.setRequestHeader('pessoaid', header_inst);
      xhr.setRequestHeader('Authorization', userToken);
      xhr.setRequestHeader('filename', document.getElementById('arquivoAvatar').files[0].name);
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
  // ------------------------------- verify user internet connection
  connectionVerify: setInterval(function () {
    let snk = document.getElementById('snackbarConnection');
    let sts = window.navigator.onLine;

    if (sts == true) {
      /*
            new Ember.RSVP.Promise(function (resolve, reject) {
              let xhr = new XMLHttpRequest();
              xhr.open('POST', 'https://v1.api.gridduck.com/');
              xhr.onreadystatechange = handler;
              xhr.responseType = 'json';
              xhr.setRequestHeader('Accept', 'application/json');
              xhr.setRequestHeader('content-type', 'application/json');
              xhr.setRequestHeader('data-type', 'application/json');
              xhr.setRequestHeader('data-type', 'application/json');
              xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
              xhr.send();

              function handler() {
                if (this.readyState === this.DONE)
                  if (this.status === 200 || this.status === 201 || this.status === 204 || this.status === 400 || this.status === 401 || this.status === 404 || this.status === 405) snk.classList.remove("alert--is-show");
                  else snk.classList.add("alert--is-show");
              }

            })*/
      snk.classList.remove("alert--is-show")
    } else snk.classList.add("alert--is-show");
  }, 5000),
  globalCloseKey: window.addEventListener("keydown", function (e) {
    var key = e.which || e.keyCode;
    // 27: esc key code
    if (key == 27 || key == 'Escape' || key == 'Esc') {
      let userMenu = document.getElementsByClassName('global-nav__submenu');
      let userHelp = document.getElementById('help__container');

      userMenu[0].classList.remove('submenu--is-show');
      userHelp.classList.remove('help__container--is-show');
    }
  }),
  globalCloseClick: document.getElementsByTagName("body")[0].addEventListener("click", function (e) {
    let targetElement = e.target;
    let userMenu = document.getElementsByClassName('global-nav__submenu');
    let userHelp = document.getElementById('help__container');

    if (targetElement == document.getElementsByClassName('icon-chevron-down')[0] ||
      targetElement == document.getElementsByClassName('j-application-avatar')[0] ||
      targetElement == document.getElementsByClassName('global-nav__thumb')[0] ||
      targetElement == document.getElementById('help__trigger')
    ) {
      if (userMenu[0].classList.toggle('submenu--is-show') != true) userMenu[0].classList.add('submenu--is-show');
      else userMenu[0].classList.remove('submenu--is-show');
    } else {
      do {
        if (targetElement == userMenu[0] || targetElement == userHelp) return;
        targetElement = targetElement.parentNode;
      } while (targetElement);
      userMenu[0].classList.remove('submenu--is-show');
      userHelp.classList.remove('help__container--is-show');
    }
  }),
  golbalNavMobile: document.getElementsByTagName("body")[0].addEventListener("click", function (e) {
    if (window.innerHeight > window.innerWidth)
      if (e.target.tagName == 'A')
        document.getElementById('global-nav-menu').classList.remove('global-nav__list--is-show');
  }),
  checkBrowser() {
    var ua = window.navigator.userAgent;

    // ----------------------------------------------------- Internet Explorer
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older
      return 'IE ' + parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11
      var rv = ua.indexOf('rv:');
      return 'IE ' + parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    // ------------------------------------------------------------------ Edge
    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
      // Edge (IE 12+)
      return 'Edge ' + parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // ----------------------------------------------------------------- Opera
    var opera = ua.indexOf('Opera/');
    if (opera > 0) {
      // Opera 12-
      return 'Opera ' + parseInt(ua.substring(opera + 6, ua.indexOf('.', opera)), 10);
    }

    var opr = ua.indexOf('OPR/');
    if (opr > 0) {
      // Opera 15+
      return 'Opera ' + parseInt(ua.substring(opr + 4, ua.indexOf('.', opr)), 10);
    }

    // ---------------------------------------------------------------- Chrome
    var chrome = ua.indexOf('Chrome/');
    if (chrome > 0) {
      return 'Chrome ' + parseInt(ua.substring(chrome + 7, ua.indexOf('.', chrome)), 10);
    }

    // ---------------------------------------------------------------- Safari
    var safari = ua.indexOf('Safari/');
    if (safari > 0) {
      return 'Safari ' + parseInt(ua.substring(safari + 7, ua.indexOf('.', safari)), 10);
    }

    // --------------------------------------------------------------- FireFox
    var firefox = ua.indexOf('Firefox/');
    if (firefox > 0) {
      // Firefox
      return 'Firefox ' + parseInt(ua.substring(firefox + 8, ua.indexOf('.', firefox)), 10);
    }

    // other browser
    return 'unknown';
  },
  actions: {
    // goToAulas(){
    //   this.transitionToRoute('aulas.index');
    // },
    // goToModulo(id){
    //   this.transitionToRoute('modulos.modlist',id);
    // },
    // goToBiblioteca(){
    //   this.transitionToRoute('biblioteca');
    // },
    // goToAcompanhamento(){
    //   this.transitionToRoute('administracao.admdata');
    // },
    // goToAdministracao(){
    //   this.transitionToRoute('gersistema.gerdata');
    // },
    // goToConteudos(){
    //   this.transitionToRoute('conteudos.index');
    // },
    // goToMarketing(){
    //   this.transitionToRoute('marketing.index');
    // },
    goToProfile(){
      $('#thumbSubmenu').toggleClass('submenu--is-show');
      let header = localStorage.getItem('person_logged');
      let pessoa = JSON.parse(header);
      this.transitionToRoute('profile.index', pessoa.id);
    },
    instSearch() {
      let modelList = document.getElementById('modelList');
      let searchDisplay = document.getElementById('searchDisplay');
      let searchValue = document.getElementById('searchValue');

      let instList = this.get('model').data;
      let included = this.get('model').included;
      instList.forEach(obj => {
        let inst_id = obj.relationships.instituicao.data.id;
        let inst_obj = included.find(obj => {
          return obj.id === inst_id && obj.type === "Instituicao";
        });
        obj['instituicao_name'] = inst_obj.attributes.name;
        obj['instituicao_id'] = inst_id;
      });
      if (searchValue.value) {
        let searchResult = instList.filter(function (i) {

          if ((i.instituicao_name).toLowerCase().match(new RegExp((searchValue.value).toLowerCase(), 'g'))) {
            return i;
          }
        });
        this.set('filteredInsts', searchResult);

        modelList.style.display = 'none';
        searchDisplay.style.display = 'inline';
      } else {
        modelList.style.display = 'inline';
        searchDisplay.style.display = 'none';
      }
    },
    buscarArquivoAvatar() {
      var input = document.getElementById('arquivoAvatar');
      let file_name = input.files[0].name;
      this.set('selected_file_avatar', file_name);
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("avatar-modale").style.backgroundImage = "url(" + e.target.result + ")";
      }
      reader.readAsDataURL(input.files[0]);
    },
    sendAvatar() {
      let file_avatar = document.getElementById('arquivoAvatar').files[0];
      this.set('avatar_loading', true);
      if (file_avatar) {
        let that = this;
        this.sendAvatarToServer(file_avatar).then(() => {
          toogleModal('change_image_modal');
          that.change_uri_avatar();
          that.set('avatar_loading', false);
        }).catch((erro) => {
          that.set('error_avatar', erro);
          that.set('avatar_loading', false);
        });
      } else {
        this.set('selected_file_avatar', '');
        this.set('avatar_loading', false);
      }
    },
    selectPessoa: function (param) {
      let data = this.get('model').data;
      let that = this;
      data.forEach((pessoa) => {
        if (pessoa.id === param) {
          if (pessoa.relationships.area) {
            let obj = {
              "id": pessoa.id,
              "name": pessoa.attributes.name,
              "role": pessoa.attributes.role.toLowerCase(),
              "email": pessoa.attributes.email,
              "instituicao_id": pessoa.instituicao_id,
              "instituicao_name": pessoa.instituicao_name,
              "area_id": pessoa.relationships.area.data.id,
              "uri_avatar": pessoa.attributes['uri-avatar'],
            };
            localStorage.setItem('person_logged', JSON.stringify(obj));
          } else {
            let obj = {
              "id": pessoa.id,
              "name": pessoa.attributes.name,
              "role": pessoa.attributes.role.toLowerCase(),
              "email": pessoa.attributes.email,
              "instituicao_id": pessoa.instituicao_id,
              "instituicao_name": pessoa.instituicao_name,
              "uri_avatar": pessoa.attributes['uri-avatar'],
            };
            localStorage.setItem('person_logged', JSON.stringify(obj));
          }
          that.set('acessoS', pessoa.attributes["acesso-s"]);
          that.set('acessoFp', pessoa.attributes["acesso-fp"]);
          this.set('role', pessoa.attributes.role.toLowerCase());
          let usertemp = pessoa.attributes.name.toLowerCase();
          let tocap = 1;
          let resp = '';
          for (let i = 0; i < usertemp.length; i++) {
            if (tocap === 1) resp = resp + usertemp.charAt(i).toUpperCase();
            else resp = resp + usertemp.charAt(i);
            if (usertemp[i] === ' ') tocap = 1;
            else tocap = 0;
          }
          if (pessoa.attributes['uri-avatar']) this.set('uri_avatar', new Ember.String.htmlSafe(pessoa.attributes['uri-avatar']));
          else this.set('uri_avatar', new Ember.String.htmlSafe("/assets/img/avatar-default.svg"));
          this.set('username', resp);
          // #########################################
          // #########################################
          // #########################################
          // console.log('>_redirect: onSelectInstitution;');
          if (pessoa.attributes['should-review-profile'])
          {
            this.transitionToRoute('profile.index', pessoa.id);
            return true;
          }


          if (pessoa.attributes.role == 'aluno') {
            if (this.get('hasModulo')){
              this.showLivroUrl(that.get('ModuloIdx'));
              this.transitionToRoute('modulos.modlist', that.get('ModuloIdx'));
            }else{
              this.transitionToRoute('aulas');
            }
          }
          else this.transitionToRoute('aulas');
        }
      });
      //this.libSet();
      localStorage.removeItem('log_data');
    },
    toggleList: function () {
      if (document.getElementById('top-navbar-dropdown-menu').style.top === '0%') {
        this.set('isClosed', true);
        document.getElementById('top-navbar-dropdown-menu').style.top = '-100%';
      } else {
        this.set('isClosed', false);
        document.getElementById('top-navbar-dropdown-menu').style.top = '0%';
      }
    },
    invalidateSession: function () {
      localStorage.clear();
      this.get('session').invalidate();
    },
    closeLeftMenu: function () {
      document.getElementById('left-menu').style.left = "-330px";
      document.getElementById('drawer-overlay').style.display = 'none';
    },
    openLeftMenu: function () {
      document.getElementById('drawer-overlay').style.display = 'block';
      document.getElementById('left-menu').style.left = "0px";
    },
    changePw() {
      let pwd_old = document.getElementById('pass').value;
      let pwd_new = document.getElementById('pass_new').value;
      let pwd_conf = document.getElementById('pass_new_copy').value;
      this.set('success_pwd', '');
      this.set('error_pwd', '');
      if (pwd_new.length < 6) {
        this.set('error_pwd', 'Mínimo de 6 caracteres');
      } else if (pwd_new !== pwd_conf) {
        this.set('error_pwd', 'Nova senha e confirmação devem ser iguais');
      } else {
        let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/accounts/changePassword';
        let string = JSON.stringify({
          'data': {
            'id': '1',
            'type': 'change-password',
            'attributes': {
              'oldpassword': pwd_old,
              'newpassword': pwd_new,
              'confirmpassword': pwd_conf
            }
          }
        });
        let that = this;
        this.makeCustomCall('POST', final_url, string).then(() => {
          that.set('success_pwd', 'Sucesso! Senha alterada');
          that.set('error_pwd', '');
          document.getElementById("change_pass_modal").classList.remove('modal--is-show');
          document.getElementsByTagName('body')[0].style.overflow = 'auto';
        }).catch(() => {
          that.set('success_pwd', '');
          that.set('error_pwd', 'A senha atual informada não está correta.');
        });
      }
    },
    toggleHelp() {
      document.getElementById("help__container").classList.toggle('help__container--is-show');
      document.getElementById('helpMsg').value = ' ';
      setTimeout(function () {
        document.getElementById("help").classList.remove('help--step-two');
      }, 1000);
    },
    supportMailer() {
      function autoClose() {
        document.getElementById('help__container').classList.remove('help__container--is-show');
        document.getElementById("help").classList.remove('help--step-two')
      }

      let browserName = this.checkBrowser();

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
        "<h1 style='text-transform: uppercase; font-size: 20px; letter-spacing: .1em; border-bottom: 1px solid #efeff0; margin: 0 0 24px; padding-bottom: 8px;'>E-mail de suporte</h1>" +
        "<ul style='list-style: none; margin: 0; padding: 0;'>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Email:</strong> " + localTok.email + "</li>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Nome:</strong> " + localTok.name + "</li>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Instituicao:</strong> " + localTok.instituicao_name + "</li>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Path:</strong> " + location.pathname + "</li>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Screen:</strong> " + window.screen.width + 'x' + window.screen.height + "</li>" +
        "<li style='margin-bottom: 16px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Browser:</strong> " + browserName + "</li>" +
        "<li style='margin-bottom:  0px; margin-left: 0;'><strong style='font-size: 12px; letter-spacing: .1em; text-transform: uppercase;'>Message:</strong> " + document.getElementById('helpMsg').value + "</li>" +
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
            "email-destino": "douglas.linhares@coreskills.com.br",
            // "email-destino": "vicente.sarmento@sementeuniversidades.com.br",
            "assunto": "E-mail de suporte (Ensino Médio)",
            "plain-text": "Testando email",
            "html-content": mailBody,
            "meta-dados": "{path: " + location.pathname + ", screen: " + window.screen.width + 'x' + window.screen.height + ", browser: " + browserName + "}"
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

      this.makeCustomCall('POST', url, params).then(() => {}).catch(() => {});

      document.getElementById('help').classList.add('help--step-two');
      document.getElementById('helpMsg').value = ' ';
      setTimeout(autoClose, 2500);
    }
  }
});
