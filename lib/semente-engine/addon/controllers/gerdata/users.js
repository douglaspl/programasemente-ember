import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../../config/environment';
import pagedArray from 'ember-cli-pagination/computed/paged-array';

export default Controller.extend({
  envnmt: ENV.APP,
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  pagedContent: pagedArray('model.pessoas'),

  pessoaLogged: Ember.computed('model',function(){
    let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
    return this.get('store').peekRecord('pessoa', infosLogged.id);
  }),

  instituicaoId: 0,
  instituicao: Ember.computed('model', function(){
    this.set('instituicaoId', this.get('model.pessoas').otherParams.instituicao_id);
    let inst = this.get('store').peekRecord('instituicao', this.get('model.pessoas').otherParams.instituicao_id);
    if(inst.get('instituicaoFilhas').content.length > 1) this.set('instituicaoMae', true);
    else this.set('instituicaoMae', false);
    return inst;
  }),

  selectedSegmento: '',
  segmentos:Ember.computed('model',function(){
    let segmentos = this.get('store').peekAll('segmento');
    if(this.get('selected_segmento_id') == null) this.set('selectedSegmento', '');
    else this.set('selectedSegmento', this.get('store').peekRecord('segmento', this.get('selected_segmento_id')))
    return segmentos;
  }),

  selectedPlataformaAno: '',
  plataformaAnos:Ember.computed('model',function(){
    let plataformaAnos = this.get('store').peekRecord('instituicao', this.get('instituicaoId')).get('plataformaAnos');
    if(this.get('selected_ano_id') == null) this.set('selectedPlataformaAno', '');
    else this.set('selectedPlataformaAno', this.get('store').peekRecord('plataforma-ano', this.get('selected_ano_id')))
    return plataformaAnos;
  }),

  selectedPlataformaTurma: '',
  plataformaTurmas:Ember.computed('model',function(){
    let plataformaTurmas = this.get('store').peekRecord('instituicao', this.get('instituicaoId')).get('plataformaTurmas');
    if(this.get('selected_turma_id') == null) this.set('selectedPlataformaTurma', '');
    else this.set('selectedPlataformaTurma', this.get('store').peekRecord('plataforma-turma', this.get('selected_turma_id')))
    return plataformaTurmas;
  }),
  
  str_search: '',
  page: Ember.computed.alias('pagedContent.page'),
  perPage: Ember.computed.alias('pagedContent.perPage'),
  queryParams: ["page", "perPage", "ordem", "str_search", "selected_segmento_id", "selected_ano_id", "selected_turma_id", "selected_instituicao_filha", "disabled"],
  totalPessoas: Ember.computed.alias('pagedContent.content.meta.page.total'),
  sortCol: 'name',
  sortAsc: true,
  ordem: 'az',
  reSort: 0,
  gerdataLoaderState: 0,
  disabled: false,
  
  paginationSelected: {
    p5: false,
    p10: true,
    p25: false,
    p50: false,
    p100: false,
    p500: false,
    p1000: false
  },
  
  pessoas_sorted: Ember.computed('pagedContent.content', 'sortCol', 'sortAsc', 'reSort', function () {
    document.getElementById('search_input_pessoas_ger').value = this.get('str_search');
    let people = this.get('pagedContent.content');
    if (people) {
      let sortCol = this.get('sortCol');
      if (this.get('sortAsc') && this.get('reSort') < 3)
      return people.sortBy(sortCol, 'DimensionName');
      else return people.sortBy(sortCol, 'DimensionName').reverse();
    } else return [];
  }),
  
  observeSearch: function () {
    let busca = document.getElementById('search_input_pessoas_ger').value;
    this.set('gerdataLoaderState', 1);
    if(busca == 'professor') busca = 'instrutor';
    this.set('disabled', true);
    this.set('str_search', busca);
    if (busca === null || busca === '' || busca === ' ') {
      this.set('disabled', false);
      this.set('str_search', '');
    }
    this.get('pagedContent').set('page', 1);
  }.observes('searchVal'),

  contentChanged: Ember.observer('pagedContent.content', function () {
    this.set('gerdataLoaderState', 0);
  }),
  
//   refreshAcessoS(){
//     let id = document.getElementById('new_user_ano').value;
//     if(id != "" && id != "0"){
//       let platAno = this.get('store').peekRecord('plataforma-ano', id);
  
//       if(!(platAno.get('idx') > 5 && platAno.get('idx') < 13 || platAno.get('idx') > 13 && platAno.get('idx') <= 20)){
//         if(this.get('sEnabled')){
//           this.set('new_user_acessoPlataformaS', false);
//           document.getElementById('new_user_acessoPlataformaS').checked = false;
//         }
//       }
//     }
//   },


  actions: {
    baixarTemplateAtivos() {
      let instituicao = this.get('instituicao');
      let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
      window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/templateativos?pessoaId=' + infosLogged.id + '&instituicaoId=' + instituicao.get('id');
    },

    sendEmail() {
      let instituicao = this.get('instituicao');
      let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
      window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/sendEmail?pessoaId=' + infosLogged.id + '&instituicaoId=' + instituicao.get('id');
    },

    allUsersDisabled() {
      let instituicao = this.get('instituicao');
      let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
      window.location.href = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/pessoas/allUsersDisabled?pessoaId=' + infosLogged.id + '&instituicaoId=' + instituicao.get('id');
    },

    exitsearch() {
      document.getElementById('search_input_pessoas_ger').value = '';
      this.set('str_search', '');
      this.get('pagedContent').set('page', 1);
    },

    setExibir() {
      let exib = document.getElementById('amount').value;
      this.get('pagedContent').set('page', 1);
      this.get('pagedContent').set('perPage', exib);
    },

    setSort(param) {
      if (this.get('sortCol') === param && this.get('sortAsc')) {
        this.set('sortAsc', false);
      } else {
        this.set('sortCol', param);
        this.set('sortAsc', true);
      }
    },

    setEnableds(){
      this.set('disabled', !this.get('disabled'));
    },

    selectedInstituicaoFilha(selectedInstituicaoId) {
      this.set('selectedPlataformaAno', "");
      this.set('selected_ano_id', null);
      this.set('selectedPlataformaTurma', "");
      this.set('selected_turma_id', null);
      if (selectedInstituicaoId != "") {
        var selectedInstituicao = this.get('store').peekRecord('instituicao', selectedInstituicaoId);
        this.set('selectedInstituicao', selectedInstituicao);
        this.set('selected_instituicao_filha', selectedInstituicaoId);
      } else {
        this.set('selectedInstituicao', "");
        this.set('selected_instituicao_filha', null);
      }
    },

    selectedSegmento(selectedSegmentoId) {
      this.set('selectedPlataformaAno', "");
      this.set('selected_ano_id', null);
      this.set('selectedPlataformaTurma', "");
      this.set('selected_turma_id', null);
      if (selectedSegmentoId != "") {
        var selectedSegmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
        this.set('selectedSegmento', selectedSegmento);
        this.set('selected_segmento_id', selectedSegmentoId);
      } else {
        this.set('selectedSegmento', "");
        this.set('selected_segmento_id', null);
      }
    },

    selectedPlataformaAno(selectedPlatAnoId){
      this.set('selectedPlataformaTurma', "");
      this.set('selected_turma_id', null);
      if (selectedPlatAnoId != "") {
        var selectedPlatAno = this.get('store').peekRecord('plataforma-ano', selectedPlatAnoId);
        this.set('selectedPlataformaAno', selectedPlatAno);
        this.set('selected_ano_id', selectedPlatAnoId);
      } else {
        this.set('selectedPlataformaAno', "");
        this.set('selected_ano_id', null);
      }
    },

    selectedPlataformaTurma(selectedPlatTurmaId){
      if (selectedPlatTurmaId != "") {
        var selectedPlatTurma = this.get('store').peekRecord('plataforma-turma', selectedPlatTurmaId);
        this.set('selectedPlataformaTurma', selectedPlatTurma);
        this.set('selected_turma_id', selectedPlatTurmaId);
      } else {
        this.set('selectedPlataformaTurma', "");
        this.set('selected_turma_id', null);
      }
    },

    // refreshSelectedInstFilha(selectedIstFilhaId) {
    //   var selectedInstFilha = this.get('store').findRecord('instituicao', selectedIstFilhaId, {include: 'plataforma-anos.segmento, plataforma-turmas.plataforma-ano'});
    //   this.set('selectedInstFilha', selectedInstFilha);
    //   this.set('selected_instituicao_filha', selectedIstFilhaId);
    // },
    
    // verifyPlatAno(){
    //   let id = document.getElementById('new_user_ano').value;
    //   if(id != "" && id != "0"){
    //     let platAno = this.get('store').peekRecord('plataforma-ano', id);
    //     if(!(platAno.get('idx') > 5 && platAno.get('idx') < 13 || platAno.get('idx') > 13 && platAno.get('idx') <= 20)){
    //       this.set('timeoutTxt', "Ano não possui acesso à Plataforma S");
    //       this.timeoutAlert('error');
    //       if(this.get('sEnabled')){
    //         this.set('new_user_acessoPlataformaS', false);
    //         document.getElementById('new_user_acessoPlataformaS').checked = false;
    //       }
    //     }
    //   }
    // },

  }
});


