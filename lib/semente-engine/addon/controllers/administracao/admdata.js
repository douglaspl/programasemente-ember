import Controller from '@ember/controller';
import Ember from 'ember';
import pagedArray from 'ember-cli-pagination/computed/paged-array';
import { toggle } from '../../helpers/toggle';

export default Controller.extend({
  //       // setup our query params  
  store: Ember.inject.service(),
  appstate: Ember.inject.service(),
  queryParams: ["page", "perPage", "instituicao_id", "ordem", "str_search", "ano1", "ano2", "ano3","pre","tur"],
  admController: Ember.inject.controller('administracao'),
  appController: Ember.inject.controller('application'),
  pagedContent: pagedArray('model'),
  ordem: 'az',
  page: Ember.computed.alias('pagedContent.page'),
  perPage: Ember.computed.alias('pagedContent.perPage'),
  totalPessoas: Ember.computed.alias('pagedContent.content.meta.page.total'),
  modulos: Ember.computed.alias('admController.inst_selected.modulos'),
  setPosition: Ember.computed('appController.transited', function () {
    let that = this;
    Ember.run.once(function () {
      that.set('selected_pessoa', false);
      that.set('curso_selected', false);
    });
    return this.get('appController.transited');
  }),
  /*
  setLoader: Ember.observer('model', function () {
    let xin = this.get('model');
    if (xin && this.get('load_state')) this.set('load_state', false);
  }),*/
  setLocation: Ember.observer('instituicao_id', function () {
    if (this.get('instituicao_id') == 0) {
      this.get('admController').set('inst_selected', false);
      this.set('array_pessoas_calc', []);
      this.set('array_pessoas', []);
      this.set('curso_selected_compare', false);
      this.set('atividade_selected_compare', false);
      this.set('pessoas_selected_add', false);
    }
  }),
  admdataLoaderState: 0,
  inst_selected: Ember.computed.alias('admController.inst_selected'),
  array_pessoas: [],
  basePessoas: function () {
    let base = this.get('pagedContent.content');
    let out = this.get('array_pessoas_calc');
    let result = [];
    if (base.get('length') > 0) {
      base.forEach(pessoa_base => {
        let include = true;
        if (out.get('length') > 0) {
          out.forEach(pessoa_out => {
            if (pessoa_base.get('id') == pessoa_out.pessoa.get('id')) include = false;
          });
        }
        if (include) result.push(pessoa_base);
      });
    }
    return result;
  },
  contentChanged: Ember.observer('pagedContent.content', function() {
    this.set('admdataLoaderState', 0);
  }),
  
  // ### TOGGLE ###
  toggle(param) {
    return toggle(param);
  },

  actions: {
    pagedsearch() {
      let busca = document.getElementById('search_input_pessoas_adm').value;
      this.set('admdataLoaderState', 1);
      this.set('str_search', busca);
      if (busca === null || busca === '' || busca === ' ') {
        this.set('str_search', '');
      }
      this.get('pagedContent').set('page', 1);
    },
    exitpagedsearch() {
      document.getElementById('search_input_pessoas_adm').value = '';
      this.set('str_search', '');
      this.get('pagedContent').set('page', 1);
    },
    filterano1(){
      let ano = this.get('ano1');
      if (ano == null){
        this.set('ano1',1);
      }else{
        this.set('ano1',null);
      }
      this.get('pagedContent').set('page', 1);
      this.send('atualizaTurmas');
    },
    filterano2(){
      let ano = this.get('ano2');
      if (ano == null){
        this.set('ano2',1);
      }else{
        this.set('ano2',null);
      }
      this.get('pagedContent').set('page', 1);
      this.send('atualizaTurmas');
    },
    filterano3(){
      let ano = this.get('ano3');
      if (ano == null){
        this.set('ano3',1);
      }else{
        this.set('ano3',null);
      }
      this.get('pagedContent').set('page', 1);
      this.send('atualizaTurmas');
    },
    filterPre(){
      let ano = this.get('pre');
      if (ano == null){
        this.set('pre',1);
      }else{
        this.set('pre',null);
      }
      this.send('atualizaTurmas');
    },
    filterTurma(){
      let select = document.getElementById('turma_selector');
      let turma = select.options[select.selectedIndex].value;
      this.set('tur',turma);
    },
    atualizaTurmas(){
      let ano1 = this.get('ano1');
      let ano2 = this.get('ano2');
      let ano3 = this.get('ano3');
      let pre = this.get('pre');
      this.get('inst_selected').get('turmas').forEach(function(tur){
        let turmaMod = tur.get('modulo');
        debugger;
        if (ano1 != null || ano2 != null || ano3 != null || pre != null){
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
          if(pre == null && turmaMod.content.data.idx == 4){
            document.getElementById('opt_'+tur.id).style.display = 'none';
          } else if(turmaMod.content.data.idx == 4){
            document.getElementById('opt_'+tur.id).style.display = 'block';
          }
        } else{
          document.getElementById('opt_'+tur.id).style.display = 'block';
        }
      })
    },
    setExibir() {
      let exib = document.getElementById('amount').value;
      this.get('pagedContent').set('page', 1);
      this.get('pagedContent').set('perPage', exib);
    },
    ordenaPessoas() {
      let exib = document.getElementById('sort_pessoas').value;
      this.set('ordem', exib);
    },
    async selectPessoa(id) {
      document.getElementById('report-person-specific').style.display = 'block';
      document.getElementById('report-people').classList.remove('report__section--is-active');
      document.getElementById('report-header').style.display = 'none';
      let modulos = this.get('modulos');
      let pessoa = await this.get('store').findRecord('pessoa', id, {
        reload: true
      }, {
        include: 'matriculas, estado-videos, estado-videos-alternativas, respostas, leituras'
      });
      let result = await this.get('appstate').calculateProgress(pessoa, modulos);
      this.set('selected_pessoa', result);
      if (result.modulos.get('length') > 0) {
        this.set('curso_selected', result.modulos[0]);
      }
    },
    closeEspecifico() {
      document.getElementById('report-person-specific').style.display = 'none';
      document.getElementById('report-people').classList.add('report__section--is-active');
      document.getElementById('report-header').style.display = 'flex';
      this.set('selected_pessoa', false);
      this.set('curso_selected', false);
    },
    selectCurso() {
      this.set('curso_selected', false);
      let mod = document.getElementById('select_course_pessoa').value;
      if (mod !== 'none') {
        let curso_selected;
        let modulos = this.get('selected_pessoa.modulos');
        modulos.forEach(function (element) {
          if (element.id === mod) {
            curso_selected = element;
          }
        });
        this.set('curso_selected', curso_selected);
      }
    },
    selectCursoCompare() {
      this.set('curso_selected_compare', false);
      this.set('atividade_selected_compare', false);
      let mod = document.getElementById('select_course_compare').value;
      if (mod !== 'none') {
        let curso_selected;
        let modulos = this.get('modulos');
        modulos.forEach(function (element) {
          if (element.id === mod) {
            curso_selected = element;
          }
        });
        this.set('curso_selected_compare', curso_selected);
      }
    },
    selectAtividadeCompare() {
      this.set('atividade_selected_compare', false);
      let mod = document.getElementById('select_atividade_compare').value;
      if (mod !== 'none') {
        let ativ_selected;
        let curso = this.get('curso_selected_compare');
        if (curso) {
          if (curso.get('atividades').get('length') > 0) {
            curso.get('atividades').forEach(function (element) {
              if (element.id === mod) {
                ativ_selected = element;
              }
            });
          }
        }
        this.set('atividade_selected_compare', ativ_selected);
      }
    },
    selectPessoaCompare(pessoa_id) {
      let add = document.getElementById('personID_' + pessoa_id).checked;
      let temp;
      if (add) {
        temp = this.get('array_pessoas');
        temp.push({
          'id': pessoa_id
        });
      } else {
        temp = [];
        let atual = this.get('array_pessoas');
        if (atual.length > 0) {
          atual.forEach(pp => {
            if (pp.id != pessoa_id) temp.push(pp);
          })
        }
      }
      this.set('array_pessoas', temp);
      this.set('ap_length', temp.length);
      if (temp.length > 1) {
        document.getElementById('report-people-compare').classList.add('report-people__selected-users--is-show');
      } else {
        document.getElementById('report-people-compare').classList.remove('report-people__selected-users--is-show');
      }
    },
    deselectPessoaCompare() {
      let elements = document.getElementsByClassName('ckb_pessoa_cmp');
      for (let i = 0; i < elements.length; i++) {
        elements[i].checked = false;
      }
      this.set('array_pessoas', []);
      document.getElementById('report-people-compare').classList.remove('report-people__selected-users--is-show');
    },
    async showComparison() {
      document.getElementById('report-people-comparison').style.display = 'block';
      document.getElementById('report-people').classList.remove('report__section--is-active');
      document.getElementById('report-person-specific').style.display = 'none';
      document.getElementById('report-header').style.display = 'none';
      this.set('comparison_await', true);
      let array_p = this.get('array_pessoas');
      let array_pessoas_calc = [];
      let pessoa, result;
      let modulos = this.get('modulos');
      for (let index = 0; index < array_p.length; index++) {
        pessoa = await this.get('store').findRecord('pessoa', array_p[index].id, {
          reload: true
        }, {
          include: 'matriculas, estado-videos, estado-videos-alternativas, respostas, leituras'
        });
        result = await this.get('appstate').calculateProgress(pessoa, modulos);
        array_pessoas_calc.push(result);
      }
      this.set('array_pessoas_calc', array_pessoas_calc);
      this.set('comparison_await', false);
    },
    backComparison() {
      document.getElementById('report-header').style.display = 'flex';
      document.getElementById('report-people-comparison').style.display = 'none';
      document.getElementById('report-people').classList.add('report__section--is-active');
      document.getElementById('report-person-specific').style.display = 'none';
      this.set('array_pessoas', []);
      this.set('array_pessoas_calc', []);
      this.set('atividade_selected_compare', false);
      this.set('curso_selected_compare', false);
      let elements = document.getElementsByClassName('ckb_pessoa_cmp');
      for (let i = 0; i < elements.length; i++) {
        elements[i].checked = false;
      }
      document.getElementById('report-people-compare').classList.remove('report-people__selected-users--is-show');
    },
    livesearch(idx, key) {
      //avoid forbidden expression
      let data = this.basePessoas();
      if (key.code === 'IntlRo' || key.code === 'IntlBackslash' || key.code === 'Escape') {
        if (idx == -1) document.getElementById('search_input_add').value = '';
        else document.getElementById('search_input_add_' + idx).value = '';
        this.set('read_str', '');
        this.set('pessoas_selected_add', data);
      } else {
        let read_str;
        if (idx == -1) read_str = document.getElementById('search_input_add').value;
        else read_str = document.getElementById('search_input_add_' + idx).value;
        if (read_str) {
          read_str = read_str.toLowerCase();
          let pessoas_filtered = data;
          let result = [];
          let newp;
          if (pessoas_filtered.get('length') > 0) {
            pessoas_filtered.forEach((pessoa) => {
              newp = 1;
              if (pessoa.get('name')) {
                if (pessoa.get('name').toLowerCase().search(read_str) >= 0 && newp) {
                  result.pushObject(pessoa);
                  newp = 0;
                }
              }
              if (pessoa.get('email')) {
                if (pessoa.get('email').toLowerCase().search(read_str) >= 0 && newp) {
                  result.pushObject(pessoa);
                  newp = 0;
                }
              }
              if (pessoa.get('role')) {
                if (pessoa.get('role').toLowerCase().search(read_str) >= 0 && newp) {
                  result.pushObject(pessoa);
                  newp = 0;
                }
              }
            });
          }
          this.set('pessoas_selected_add', result);
        } else {
          if (idx == -1) document.getElementById('search_input_add').value = '';
          else document.getElementById('search_input_add_' + idx).value = '';
          this.set('read_str', '');
          this.set('pessoas_selected_add', data);
        }
      }
    },
    exitSearch() {
      document.getElementById('search_input_add').value = '';
      this.set('pessoas_selected_add', this.basePessoas());
      this.set('read_str', '');
    },
    openAdd(x, y) {
      let pessoas = this.basePessoas();
      this.set('pessoas_selected_add', pessoas);
      document.getElementById('add-user-' + x + '_' + y).classList.add('add-user--is-show');
    },
    closeAdd(x, y) {
      let pessoas = this.basePessoas();
      this.set('pessoas_selected_add', pessoas);
      document.getElementById('add-user-' + x + '_' + y).classList.remove('add-user--is-show');
    },
    async addPessoaCompare(pessoa_id) {
      let temp = this.get('array_pessoas');
      temp.push({
        'id': pessoa_id
      });
      this.set('array_pessoas', temp);
      this.set('ap_length', temp.length);
      this.set('comparison_await', true);
      let modulos = this.get('modulos');
      let pessoa = await this.get('store').findRecord('pessoa', pessoa_id, {
        reload: true
      }, {
        include: 'matriculas, estado-videos, estado-videos-alternativas, respostas, leituras'
      });
      let result = await this.get('appstate').calculateProgress(pessoa, modulos);
      let array_pessoas_calc = this.get('array_pessoas_calc');
      array_pessoas_calc.push(result);
      this.set('array_pessoas_calc', array_pessoas_calc);
      this.set('comparison_await', false);
    },
  }
});
