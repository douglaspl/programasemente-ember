import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ENV from '../config/environment';
import Ember from 'ember';

export default Route.extend(AuthenticatedRouteMixin, {
  env: ENV.APP,
  store: Ember.inject.service(),
  session: Ember.inject.service('session'),
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  goToStepTwo: false,
  userName: null,
  
  detectIE() {
   
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      var rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge');
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
  },
  
  
  afterModel() {
  var version = this.detectIE();
    if (version === false) {
      if (this.get('session.isAuthenticated')) {
        //     this.firstAccessVerify();
             this.transitionTo('/webapp');
           }
    } else {
    this.transitionTo('/login');
    } 
  
  
  
  
    // if (this.get('session.isAuthenticated')) {
    //    this.transitionTo('/webapp');
    // }
  },
  // firstAccessVerify() {
  //   //always requesting without header 'pessoaid' will retrieve the data from the user which bears the stored token
  //   let sessionData = this.get('session.data');
  //   let tok = sessionData.authenticated.access_token;
  //   let temp = 'Bearer ';
  //   let userToken = temp.concat(tok);
  //   let tgt_url = this.get('env.host') + '/' + this.get('env.namespace') + '/pessoas?include=instituicao';
  //   let that = this;
  //   return new Ember.RSVP.Promise(function (resolve, reject) {
  //     let xhr = new XMLHttpRequest();
  //     xhr.open('GET', tgt_url);
  //     xhr.onreadystatechange = handler;
  //     xhr.responseType = 'json';
  //     // xhr.withCredentials = true; // does not permit request answer due to cross-origin. Can be activated when in production
  //     xhr.setRequestHeader('Authorization', userToken);
  //     xhr.setRequestHeader('Accept', 'application/json');
  //     xhr.setRequestHeader('content-type', 'application/json');
  //     xhr.setRequestHeader('data-type', 'application/json');
  //     xhr.send();

  //     function handler() {
  //       if (this.readyState === this.DONE) {
  //         if (this.status === 200 || this.status === 204) {
  //           let data = this.response.data;
  //           let included = this.response.included;
  //           if (!data) {
  //             let temp = JSON.parse(this.response);
  //             data = temp.data;
  //             included = temp.included;
  //           }
  //           // --------------------------------------------------------
  //           // ------------------- FIRST ACCESS -----------------------
  //           // --------------------------------------------------------
  //           let logStorage = localStorage.getItem('person_logged');
  //           let log = JSON.parse(logStorage);
  //           if (logStorage) {
  //             // ------------------------------------ institution param 
  //             let institutions = included.filter(function (i) {
  //               return i.id === log.instituicao_id;
  //             });
  //             if (!institutions[0]){
  //               localStorage.clear();
  //               window.location.reload(true);
  //               return
  //             }
  //             let institutionChangePasswordParam = institutions[0].attributes.trocasenhaobrigatoria;
  //             // ---------------------------------------- account param
  //             let accounts = data.filter(function (i) {
  //               return i.id === log.id;
  //             });
  //             if (!accounts[0]){
  //               localStorage.clear();
  //               window.location.reload(true);
  //               return
  //             }
  //             let accountChangePasswordParam = accounts[0].attributes.trocousenha;
  //             // ----------------------------------------- verification
  //             if (institutionChangePasswordParam === true) {
  //               if (accountChangePasswordParam !== 1) window.location = '/firstaccess';
  //             }
  //           } else {
  //             let logData, name, trocousenha, hasTo;

  //             name = data[0].attributes.name;
  //             trocousenha = data[0].attributes.trocousenha;

  //             let hasToVerify = included.filter(function (i) {
  //               return i.attributes.trocasenhaobrigatoria === true;
  //             });
  //             if (hasToVerify[0]) hasTo = true;
  //             else hasTo = false;
  //             if (trocousenha === 0) {
  //               logData = '{"name":"' + name + '","trocousenha":"' + trocousenha + '","hasTo":"' + hasTo + '"}';
  //               localStorage.setItem('log_data', logData);
  //               if (hasTo === true) window.location = '/firstaccess';
  //             } else localStorage.removeItem('log_data');
  //           }
  //           // --------------------------------------------------------
  //           // --------------------------------------------------------
  //           // --------------------------------------------------------
  //           resolve(data);
  //         } else if (this.status === 400 || this.status === 500) {
  //           reject(new Error(this.response.error));
  //         } else if (this.status === 401) {
  //           localStorage.clear();
  //           that.get('session').invalidate();
  //         } else {
  //           reject(new Error('Failure from server call: [' + this.status + ']'));
  //         }
  //       }
  //     }
  //   });
  // },
});
