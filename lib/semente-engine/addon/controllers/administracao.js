import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../config/environment';
import {
  isArray
} from '@ember/array';

export default Controller.extend({
  env: ENV.APP,
  rootURL: ENV.rootURL,
  envnmt: ENV.APP,
  session: Ember.inject.service('session'),
  sectionToDisplay: 'pessoas',
  store: Ember.inject.service(),
  appController: Ember.inject.controller('application'),
  role: Ember.computed('appController', function () {
    let ac = this.get('appController');
    return ac.get('role');
  }),
  oneInst: Ember.computed('model', 'role', function () {
    let inst = this.get('model');
    let that = this;
    if (!isArray(inst)) {
      Ember.run.once(function () {
        that.set('inst_selected', inst);
        that.set('instView', true);
      });
      let inst_id = this.get('inst_selected.id');
      this.transitionToRoute('administracao.admdata', {
        queryParams: {
          instituicao_id: inst_id,
          page: 1,
        }
      });
      return true;
    } else {
      return false;
    }
  }),
  istView: false,
  actions: {
    // -------------------------------- filter istitutions list
    filterInst() {
      let modelInstList = document.getElementById('modelInstList');
      let matchDisplay = document.getElementById('matchDisplay');
      let matchValue = document.getElementById('matchValue');
      let instList = this.get('model');

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
    async selectInst(id) {
      this.set('inst_selected', false);
      this.set('curso_selected', false);

      if (id !== 'none') {
        let inst_selected = await this.get('store').findRecord('instituicao', id, {
          include: 'modulos, acompanhamentos-curso-instituicao, modulos.atividades, acompanhamentos-atividade-instituicao, modulos.atividades.secoes, modulos.atividades.secoes.conteudos, modulos.atividades.secoes.conteudos.quiz, modulos.atividades.secoes.conteudos.quiz.questoes, modulos.atividades.secoes.conteudos.quiz.questoes.alternativas, modulos.atividades.secoes.conteudos.htmls, modulos.atividades.secoes.conteudos.videos'
        });
        this.set('inst_selected', inst_selected);
        this.transitionToRoute('administracao.admdata', {
          queryParams: {
            instituicao_id: inst_selected.get('id'),
            page: 1
          }
        });
        this.set('instView', true);
      }
    },
    backToInstList() {
      this.set('inst_selected', false);
      this.set('instView', false);
    },
    selectCurso() {
      this.set('curso_selected', false);
      let mod = document.getElementById('select_course').value;
      if (mod !== 'none') {
        let curso_selected;
        let modulos = this.get('inst_selected').get('modulos');
        modulos.forEach(function (element) {
          if (element.id === mod) {
            curso_selected = element;
          }
        });
        this.set('curso_selected', curso_selected);
      }
    },
    selectTab(tab) {
      if (tab === 'cursos') {
        this.set('sectionToDisplay', 'cursos');
        // document.getElementById('report-courses').classList.add('report__section--is-active');
        document.getElementById('button_tab_cursos').classList.add('tabs__tab--is-active');
        document.getElementById('button_tab_pessoas').classList.remove('tabs__tab--is-active');
        // document.getElementById('report-people').classList.remove('report__section--is-active');
        this.transitionToRoute('administracao');
      } else if (tab === 'pessoas') {
        this.set('sectionToDisplay', 'pessoas');
        // document.getElementById('report-courses').classList.remove('report__section--is-active');
        document.getElementById('button_tab_cursos').classList.remove('tabs__tab--is-active');
        document.getElementById('button_tab_pessoas').classList.add('tabs__tab--is-active');
        // document.getElementById('report-people').classList.add('report__section--is-active');
        let inst_id = this.get('inst_selected.id');
        this.transitionToRoute('administracao.admdata', {
          queryParams: {
            instituicao_id: inst_id,
            page: 1,
          }
        });
      }
    },
    goToMatriculados(mod_id) {
      document.getElementById('backToInstList').style.display = 'none';

      if (mod_id) {
        let inst_id = this.get('inst_selected.id');
        this.set('sectionToDisplay', 'pessoas');
        // document.getElementById('report-people').classList.add('report__section--is-active');
        this.transitionToRoute('administracao.moddata', {
          queryParams: {
            instituicao_id: inst_id,
            page: 1,
            modulo_id: mod_id
          }
        });
      }
    },
    downloadFile() {
      let user = JSON.parse(localStorage.getItem('person_logged')).id;

      if (document.getElementById('button_tab_pessoas').classList.contains('tabs__tab--is-active')) window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/relatorios/matriculas?pessoaId=' + user;
      if (document.getElementById('button_tab_cursos').classList.contains('tabs__tab--is-active')) window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/relatorios/cursos?pessoaId=' + user;
    },
  }
});
