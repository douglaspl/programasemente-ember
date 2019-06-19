import Controller from '@ember/controller';
import ENV from '../../../config/environment';
import Ember from 'ember';

export default Controller.extend({
  menuIsOpen: true,
  rootURL: ENV.rootURL,
  store: Ember.inject.service(),
  isOpen: true, //sidebar starts opened
  appController: Ember.inject.controller('application'),
  modController: Ember.inject.controller('modulos'),
  mdetController: Ember.inject.controller('modulos.modetails'),
  appstate: Ember.inject.service(),
  activeLocal: '',
  activeIndex: 0,
  role: Ember.computed('appController', function () {
    let ac = this.get('appController');
    return ac.get('role');
  }),
  init() {
    this._super(...arguments);
    let mq = window.matchMedia("(max-width: 800px");
    let md = window.matchMedia("(max-width: 899px");

    let str = localStorage.getItem('person_logged');
    if (str) {
      str = JSON.parse(str);
      this.set('person_role', str.role);
    }

    if (mq.matches) {
      this.set('mobileView', true);
    } else {
      this.set('mobileView', false);
    }

    if (md.matches) {
      this.set('menuIsOpen', false);
    }
  },
  atividadeId() {
    return this.get('model').get('id');
  },
  scroll_action: Ember.observer('model', 'appstate.upState', function () {
    if (this.get('appstate.upState') === 0) this.get('appstate').updateApp();
    let ativ = this.get('appstate').getItem('atividades', this.get('model').get('id'));
    let secoes_enabled = [];
    let questoes_enabled = [];
    let questoes_respondidas = [];
    if (ativ) {
      let secoes = ativ.secoes;
      let max_secoes = ativ.secoes.length;
      secoes.forEach(secao => {
        if (secao.conteudo) {
          if (parseInt(secao.idx) === 1) secoes_enabled.pushObject({
            'id': secao.id
          });
          if (secao.conteudo.percent >= 100 || this.get('role') != 'aluno') {
            secoes_enabled.pushObject({
              'id': secao.id
            });
            if (parseInt(secao.idx) < max_secoes) {
              secoes.forEach(nsecao => {
                if (parseInt(nsecao.idx) === parseInt(secao.idx) + 1) secoes_enabled.pushObject({
                  'id': nsecao.id
                });
              })
            }
          }
          if (secao.conteudo.type === 'quiz') {
            let questoes = secao.conteudo.questoes;
            let max_questoes = secao.conteudo.questoes.length;
            questoes.forEach(questao => {
              if (parseInt(questao.idx) === 1) questoes_enabled.pushObject({
                'id': questao.id
              });
              if (questao.respondida) {
                questoes_enabled.pushObject({
                  'id': questao.id
                });
                questoes_respondidas.pushObject({
                  'id': questao.id
                });
                if (parseInt(questao.idx) < max_questoes) {
                  questoes.forEach(nquestao => {
                    if (parseInt(nquestao.idx) === parseInt(questao.idx) + 1) questoes_enabled.pushObject({
                      'id': nquestao.id
                    });
                  })
                }
              }
            })
          }
        }
      });
      this.set('secoes_enabled', secoes_enabled);
      this.set('questoes_enabled', questoes_enabled);
      this.set('questoes_respondidas', questoes_respondidas);
    }
  }),
  sortingKey: ['idx'],
  sortedSecoes: Ember.computed.sort('model.secoes', 'sortingKey'),
  // setPosition: Ember.computed('appController.transited', function() {
  // }),/

  moduloPercent: Ember.computed('model', 'appstate.upState', function () {
    if (this.get('appstate.upState') === 0) this.get('appstate').updateApp();
    let data = this.get('appstate').getItem('modulos', this.get('model.id'));
    // Ember.run.once(function() {
    if (data) return data.percent.toFixed(0) + "%";
    else return '0'
    // });
  }),
  moduloPercentStyle: Ember.computed('model', 'appstate.upState', function () {
    if (this.get('appstate.upState') === 0) this.get('appstate').updateApp();

    let data = this.get('appstate').getItem('modulos', this.get('model.id'));

    if (data) {
      return new Ember.String.htmlSafe("width: " + data.percent.toFixed(0) + "%;");
    } else {
      return new Ember.String.htmlSafe("width: 0%;");
    }
  }),
  ativMenuMobileClick: document.getElementsByTagName("body")[0].addEventListener("click", function (e) {
    let targetElement = e.target;
    let courseMenuBtn = document.getElementsByClassName('course-nav__menu-toggle')[0];
    let ativMenu = document.getElementsByClassName('course')[0];

    if (targetElement.classList.contains('course-nav__node') ||
      targetElement.classList.contains('course-nav__link') ||
      targetElement.classList.contains('course-nav__label')
    ) {
      if (window.innerWidth < 900) {
        if (ativMenu.classList.toggle('course--nav-is-show') != true)
          ativMenu.classList.remove('course--nav-is-show');
        courseMenuBtn.click();
      }
    }
  }),
  // #######################################
  // --------------------------------- !TEMP
  isBradesco: JSON.parse(localStorage.getItem('person_logged')).instituicao_id,
  // --------------------------------- /TEMP
  // #######################################
  actions: {
    linkTransition: function (param1) {
      let str = 'modulos.modetails.ativdetails.secdetails';
      let mod = this.get('model').get('modulo').get('id');
      let ativ = this.get('model');
      let secoes = this.get('sortedSecoes');
      let idx_gen = secoes.get('firstObject').get('conteudos').get('firstObject').get('id');
      let idx_html, idx_video;
      secoes.forEach(secao => {
        if (secao.get('conteudos').get('firstObject').get('html').get('id') && !idx_html) {
          idx_html = secao.id;
        }
        if (secao.get('conteudos').get('firstObject').get('video').get('id') && !idx_video) {
          idx_video = secao.id;
        }
      });
      if (param1 === 'leitura') {
        document.getElementById('transition_aula_' + ativ.get('id')).style.display = "none";
        if (idx_html) this.transitionToRoute(str, mod, ativ, idx_html);
        else this.transitionToRoute(str, mod, ativ, idx_gen);
      } else if (param1 === 'video') {
        document.getElementById('transition_aula_' + ativ.get('id')).style.display = "none";
        if (idx_video) this.transitionToRoute(str, mod, ativ, idx_video);
        else this.transitionToRoute(str, mod, ativ, idx_gen);
      }
      // let str = 'modulos.modetails.ativdetails.secdetails';
      // if (param2 === 'same') {
      //     this.transitionToRoute(str, param1);
      // }
      // else {
      //     let secoes = this.get('sortedSecoes');
      //     let idx_tgt = 0;
      //     secoes.forEach(secao => {
      //         if (secao.get('id') == param1) {
      //             idx_tgt = secao.get('idx') - 1;
      //         }
      //     });
      //     if (param2 === 'rev' && idx_tgt >= 1) {
      //         let id = -1;
      //         secoes.forEach(secao => {
      //             if (secao.get('idx') == idx_tgt) {
      //                 id = secao.get('id');
      //             }
      //         });
      //         if (id > 0) this.transitionToRoute(str, id);
      //     }
      // }
      // let order = ['abertura', 'video', 'quiz', 'teoria', 'atividade'];
      // if (this.get('role') === "aluno") {
      //     order = ['abertura', 'video', 'quiz', 'teoria', 'atividade'];
      // }
      // //else if (this.get('role') === "gestor" || this.get('role') === "instrutor" || this.get('role') === "coordenador") {
      // //    order = ['abertura', 'video', 'quiz', 'atividade'];
      // //}
      // let local = this.get('activeLocal');
      // let max = order.length - 1;
      // let idx = order.indexOf(local);
      // let tgt;
      // if (param === 'rev') {
      //     if (idx > 0) tgt = order[idx-1];
      //     else tgt = order[max];
      // }
      // else if (param === 'fw') {
      //     if (idx < max) tgt = order[idx+1];
      //     else tgt = order[0];
      // }
      // else {
      //     tgt = param;
      // }
      //     str = str + '.' + tgt;
      // if (document.getElementById('sidebar-ativ-mob'))  document.getElementById('sidebar-ativ-mob').style.left = '-110%';
      // // document.getElementById('main_output').style.height = '0px';
      // let disable_abertura = document.getElementById('act_nav_abertura').classList.contains('disabled');
      // let disable_video = document.getElementById('act_nav_video').classList.contains('disabled');
      // let disable_quiz = document.getElementById('act_nav_quiz').classList.contains('disabled');
      // let disable_teoria = document.getElementById('act_nav_teoria').classList.contains('disabled');
      // let disable_atividade = document.getElementById('act_nav_atividade').classList.contains('disabled');
      // if ((tgt === 'abertura' && !disable_abertura) || (tgt === 'video' && !disable_video) || (tgt === 'quiz' && !disable_quiz) || (tgt === 'teoria' && !disable_teoria) || (tgt === 'atividade' && !disable_atividade)) {
      //     this.set('activeLocal', tgt);
      //     this.transitionToRoute(str);
      // }
    },
    closeSideMob: function () {
      document.getElementById('sidebar-ativ-mob').style.left = '-110%';
    },
    openSideMob: function () {
      document.getElementById('sidebar-ativ-mob').style.left = '0%';
    },
    atividadeModal() {
      let modetails_controller = this.get('mdetController');
      modetails_controller.atividadeModal();
    },
    closeModal() {
      let modetails_controller = this.get('mdetController');
      modetails_controller.actions.closeModal();
    },
    toggleMenuStatus() {
      this.toggleProperty('menuIsOpen');
    }
  }
});
