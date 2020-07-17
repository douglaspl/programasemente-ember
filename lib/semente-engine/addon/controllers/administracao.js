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
  // sectionToDisplay: 'pessoas',
  sectionToDisplay: 'cursos',
  store: Ember.inject.service(),
  appController: Ember.inject.controller('application'),
  role: Ember.computed('appController', function () {
    let ac = this.get('appController');
    return ac.get('role');
  }),
  oneInst: Ember.computed('model', 'role', function () {
    let inst = this.get('model');
    if (!isArray(inst)) {
      // let inst_selected = this.get('store').findRecord('instituicao', inst.get('id'), {
      //   include: 'acompanhamentos-curso-instituicao, acompanhamentos-atividade-instituicao, modulos.atividades.secoes.conteudos.quiz.questoes, modulos.atividades.secoes.conteudos.quiz.questoes.alternativas, modulos.atividades.secoes.conteudos.htmls, modulos.atividades.secoes.conteudos.videos, turmas.acompanhamentos-atividade-turma'
      // });
      this.set('inst_selected', inst);
      this.set('instView', true);
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
  pessoaLogged: Ember.computed('model',function(){
    let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
    return this.get('store').peekRecord('pessoa',infosLogged.id);
  }),
  instView: false,
  actions: {
    // -------------------------------- filter institutions list
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

    filterClasses(){
      let input, filter, ul, li, a, i, txtValue;
      input = document.getElementById('matchClass');
      filter = input.value.toUpperCase();
      ul = document.getElementById("acomp_classes");
      li = ul.getElementsByTagName('li');

      // Loop through all list items, and hide those who don't match the search query
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName('div')[0].getElementsByTagName('h3')[0].getElementsByTagName('a')[0];
        txtValue = a.textContent || a.innerText;
         if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    },

    exitpagedsearch() {
      document.getElementById('matchClass').value = '';
      this.send('filterClasses');
    },

    filterTurma() {
      debugger;
      this.set('filtered_turma', false);
      let select = document.getElementById('turma_selector');
      let turma = select.options[select.selectedIndex].value;
      if (turma != 0){
        let inst = this.get('inst_selected');
        let that = this;
        inst.get('turmas').forEach(function(tur){
          if (tur.id == turma){
            that.set('turma_selected', tur);
          }
        })
        this.set('alunos_turma', this.get('turma_selected').get('acompanhamentosatividades').get('firstObject').get('matriculas'));
        this.set('filtered_turma', true);
      }
    },
    async atualizaTurmas(){
      let curso = this.get('curso_selected');
      let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
      let pessoa = await this.get('store').findRecord('pessoa',infosLogged.id);
      let turmasFiltro;
      if(pessoa.data.role == 'instrutor'){
        turmasFiltro = pessoa.get('turmas');
      }else{
        turmasFiltro = this.get('inst_selected').get('turmas');
      }
      turmasFiltro.forEach(function(tur){
        let turmaMod = tur.get('modulo');
          if(curso.data.idx != 1 && turmaMod.content.data.idx == 1){
            document.getElementById('opt_'+tur.id).style.display = 'none';
          } else if(turmaMod.content.data.idx == 1){
            document.getElementById('opt_'+tur.id).style.display = 'block';
          }
          if(curso.data.idx != 2 && turmaMod.content.data.idx == 2){
            document.getElementById('opt_'+tur.id).style.display = 'none';
          } else if(turmaMod.content.data.idx == 2){
            document.getElementById('opt_'+tur.id).style.display = 'block';
          }
          if(curso.data.idx != 3 && turmaMod.content.data.idx == 3){
            document.getElementById('opt_'+tur.id).style.display = 'none';
          } else if(turmaMod.content.data.idx == 3){
            document.getElementById('opt_'+tur.id).style.display = 'block';
          }
      })
    },
    async selectInst(id) {
      this.set('inst_selected', false);
      this.set('curso_selected', false);
      this.set('filtered_turma', false);

      if (id !== 'none') {
        let inst_selected = await this.get('store').findRecord('instituicao', id, {
          include: 'modulos, acompanhamentos-curso-instituicao, modulos.atividades, acompanhamentos-atividade-instituicao, turmas.acompanhamentos-atividade-turma'
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
      this.set('filtered_turma', false);
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
      this.send('atualizaTurmas');
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
    goToAtividade(mod_id, atv_id){
      let modulo;
      this.get('inst_selected').get('modulos').forEach(function(mod){
        if (mod.id == mod_id){
          modulo = mod;
        }
      })
      let atividade;
      modulo.get('atividades').forEach(function(atv){
        if (atv.id == atv_id){
          atividade = atv;
        }
      })
      let secaoId = atividade.get('secoes').content.currentState[0].id;
      this.transitionToRoute('modulos.modetails.ativdetails.secdetails', this.get('model'), atv_id, secaoId);
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

      if (document.getElementById('button_tab_pessoas').classList.contains('tabs__tab--is-active')){
        window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/relatorios/alunos?pessoaId=' + user;
        $("#downloading").addClass("alert--is-show");
        setTimeout(function(){ $("#downloading").removeClass("alert--is-show"); }, 4000);
      } 
            
      if (document.getElementById('button_tab_cursos').classList.contains('tabs__tab--is-active')) window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/relatorios/cursos?pessoaId=' + user;
    },
  }
});
