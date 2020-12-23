import Controller from '@ember/controller';
import Ember from 'ember';
import pagedArray from 'ember-cli-pagination/computed/paged-array';

export default Controller.extend({
  aulasController: Ember.inject.controller('aulas'),
  parentController: Ember.inject.controller('aulas.acompanhamento'),
  store: Ember.inject.service(),
  queryParams: ["page", "perPage", "instituicao_id", "ordem", "str_search", "ano1", "ano2", "ano3", "pre", "tur"],
  appController: Ember.inject.controller('application'),
  pagedContent: pagedArray('model'),
  ordem: 'az',
  page: Ember.computed.alias('pagedContent.page'),
  perPage: Ember.computed.alias('pagedContent.perPage'),
  totalPessoas: Ember.computed.alias('pagedContent.content.meta.page.total'),
  modulos: Ember.computed.alias('aulasController.inst_selected.modulos'),
  inst_selected: Ember.computed.alias('aulasController.inst_selected'),
  hasChildren: Ember.computed('model', function () {
    let inst = this.get('inst_selected');
    if (this.get('store').peekRecord('instituicao', inst.get('id')).hasMany('instituicaoFilhas').value()) {
      return true;
    }
    return false;
  }),
  setPosition: Ember.computed('parentController.transited', function () {
    let that = this;
    Ember.run.once(function () {
      that.set('selected_pessoa', false);
      that.set('curso_selected', false);
    });
    return this.get('appController.transited');
  }),
  pessoaLogged: Ember.computed('model', function () {
    let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
    return this.get('store').peekRecord('pessoa', infosLogged.id);
  }),

  /*
  setLoader: Ember.observer('model', function () {
    let xin = this.get('model');
    if (xin && this.get('load_state')) this.set('load_state', false);
  }),*/
  setLocation: Ember.observer('instituicao_id', function () {
    if (this.get('instituicao_id') == 0) {
      this.get('aulasController').set('inst_selected', false);
      this.set('array_pessoas_calc', []);
      this.set('array_pessoas', []);
      this.set('curso_selected_compare', false);
      this.set('atividade_selected_compare', false);
      this.set('pessoas_selected_add', false);
    }
  }),
  admdataLoaderState: 0,
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
  contentChanged: Ember.observer('pagedContent.content', function () {
    this.set('admdataLoaderState', 0);
  }),

  // ### TOGGLE ###
  toggle(param) {
    return toggle(param);
  },
  atualizaSelects() {
    let inst = document.getElementById('inst_selector');
    let inst_id = this.get('inst');
    if (inst_id) {
      let instOpts = inst.options;
      for (let opt, j = 0; opt = instOpts[j]; j++) {
        if (opt.value == inst_id) {
          inst.selectedIndex = j;
          break;
        }
      }
    }
  },
  actions: {
    toggleRole(selectedRole) {
      this.get('aulasController').send('toggleRole', selectedRole)
    },
    goToPlataforma(seg){
      this.get('parentController').send('refreshSelectedSegmento', seg);
      this.transitionToRoute('aulas.acompanhamento.plataforma');
    },
    pagedsearch() {
      let busca = document.getElementById('search_input_pessoas_adm').value;
      if (busca.length >= 3) {
        this.set('admdataLoaderState', 1);
        this.set('str_search', busca);
      }
      if (busca === null || busca === '' || busca === ' ') {
        this.set('admdataLoaderState', 1);
        this.set('str_search', '');
      }
      this.get('pagedContent').set('page', 1);

    },
    exitpagedsearch() {
      document.getElementById('search_input_pessoas_adm').value = '';
      this.set('admdataLoaderState', 1);
      this.set('str_search', '');
      this.get('pagedContent').set('page', 1);
    },
    filterano(ano) {
      let currentAnos = this.get('anos');
      this.set('admdataLoaderState', 1);
      if (currentAnos) {
        if (currentAnos.includes(ano + ',')) {
          currentAnos = currentAnos.replace(ano + ',', '');
        } else if (currentAnos.includes(ano)) {
          currentAnos = currentAnos.replace(ano, '');
        } else {
          currentAnos += ',' + ano;
        }
        this.set('anos', currentAnos);
      } else {
        this.set('anos', ano);
      }
      this.send('atualizaTurmas');
    },
    filterTurma() {
      let select = document.getElementById('turma_selector');
      let turma = select.options[select.selectedIndex].value;
      this.set('admdataLoaderState', 1);
      this.get('inst_selected').get('modulos').forEach(function (modu) {
        document.getElementById('ano_' + modu.id).checked = false;
      })
      if (turma != 0) {
        let mod = this.get('store').peekRecord('turma', turma).get('modulo').content.id;
        document.getElementById('ano_' + mod).checked = true;
        this.set('anos', mod);
      } else {
        this.set('anos', null);
      }
      this.set('tur', turma);
      this.send('atualizaTurmas');
    },
    filterInstF() {
      let select = document.getElementById('inst_selector');
      this.set('admdataLoaderState', 1);
      let inst = select.options[select.selectedIndex].value;
      if (inst == 0) {
        this.set('inst', null);
        this.set('inst_filtered', null);
      } else {
        this.set('inst', inst);
        let instDb = this.get('store').peekRecord('instituicao', inst);
        this.set('inst_filtered', instDb);
      }
    },
    async atualizaTurmas() {
      let anos = this.get('anos');
      let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
      let pessoa = this.get('store').peekRecord('pessoa', infosLogged.id);
      let turmasFiltro;
      if (pessoa.data.role == 'instrutor') {
        turmasFiltro = pessoa.get('turmas');
      } else {
        if (this.get('inst_filtered')) {
          turmasFiltro = this.get('inst_filtered').get('turmas');
        } else {
          turmasFiltro = this.get('inst_selected').get('turmas');
        }
      }
      turmasFiltro.forEach(function (tur) {
        let turmaMod = tur.get('modulo');
        if (anos) {
          if (!anos.includes(turmaMod.get('id'))) {
            document.getElementById('opt_' + tur.id).style.display = 'none';
          } else {
            document.getElementById('opt_' + tur.id).style.display = 'block';
          }
        } else {
          document.getElementById('opt_' + tur.id).style.display = 'block';
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
    selectPessoa(id) {
      document.getElementById('report-person-specific').style.display = 'block';
      document.getElementById('report-header').style.display = 'none';
      document.getElementById('report-tabs').style.display = 'none';

      // document.getElementById('report-people').classList.remove('report__section--is-active');
      // document.getElementById('report-header').style.display = 'none';
      // let modulos = this.get('modulos');
      // let pessoa =  this.get('store').findRecord('pessoa', id, {
      //   include: 'modulos.atividades.secoes.conteudos, matriculas, estado-videos, estado-videos-alternativas, respostas, leituras'
      // });
      // this.get('appstate').calculateProgress(pessoa).then((result)=>{
      //   this.set('selected_pessoa', result);
      //   if (result.modulos.get('length') > 0) {
      //     this.set('curso_selected', result.modulos[0]);
      //   }
      // });
      this.transitionToRoute('administracao.persondetails', id);
    },
    closeEspecifico() {
      alert("boom!");
      document.getElementById('report-tabs').style.display = 'flex';
      document.getElementById('report-header').style.display = 'flex';
      document.getElementById('report-person-specific').style.display = 'none';
      document.getElementById('report-people').classList.add('report__section--is-active');
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