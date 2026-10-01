import Controller from '@ember/controller';
import Ember from 'ember';
import moment from 'moment';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoaRole: Ember.computed('pessoa', function () {
    return JSON.parse(localStorage.getItem('person_logged')).role;
  }),
  conteudos: Ember.computed('model', function () {
    let conts = this.get('model').plataformaConteudos;
    if (this.get('selectedSituacao') == "false") conts = conts.filterBy('situacao', false);
    if (this.get('selectedSituacao') == "true") conts = conts.filterBy('situacao', true);
    if (this.get('selectedPublico') !== 'Todos') conts = conts.filter(c => c.get('publicos').mapBy('name').includes(this.get('selectedPublico')));
    if (this.get('selectedTipo') !== 'Todos') conts = conts.filterBy('tipo', this.get('selectedTipo'));
    
    if (this.get('selectedCal') !== 'Todos') conts = conts.filter(c => c.get('calendarios').mapBy('nome').includes(this.get('selectedCal')));

    if (this.get('selectedTema') !== 'Todos' && this.get('show') == 'Biblioteca') conts = conts.filterBy('tema.name', this.get('selectedTema'));
    if (this.get('show') == 'Biblioteca') conts = conts.filterBy('agrupamento.name', 'Biblioteca');
    else {

      if (this.get('selectedAgrupamento') !== 'Todos') conts = conts.filterBy('agrupamento.name', this.get('selectedAgrupamento'));
      else conts = conts.filter(c => c.get('agrupamento.name') == 'Básico' || c.get('agrupamento.name') == 'Complementar');

      if (this.get('selectedSegmento') !== '') conts = conts.filter(c => c.get('aulas').mapBy('plataformaAno.segmento.titulo').includes(this.get('selectedSegmento')));
      if (this.get('selectedAno') !== '') conts = conts.filter(c => c.get('aulas').mapBy('plataformaAno.name').includes(this.get('selectedAno')));
      if (this.get('selectedAula') !== '') conts = conts.filter(c => c.get('aulas').mapBy('titulo').includes(this.get('selectedAula')));
    }

    conts = conts.sortBy('agrupamento.name');
    if (this.get('selectedOrdenacao') == 'data') conts = conts.sortBy('dataCriacao').reverse();
    else if (this.get('selectedOrdenacao') == 'alfabetica') conts = conts.sortBy('titulo');

    return conts;
  }).property('search', 'selectedTipo', 'selectedCal', 'selectedTema', 'selectedAgrupamento', 'selectedPublico', 'selectedSegmento', 'selectedAno', 'selectedAula', 'show', 'selectedSituacao', 'selectedOrdenacao'),
  agrupamentos: Ember.computed('model', function () {
    return this.get('store').peekAll('agrupamento')
  }),
  temas: Ember.computed('model', function () {
    return this.get('store').findAll('tema')
  }),
  tipos: Ember.computed('model', function () {
    let tipos = this.get('conteudos').mapBy('tipo');
    return tipos.filter((value, index) => tipos.indexOf(value) === index);
  }).property('selectedAgrupamento'),
  segmentos: Ember.computed('model', function () {
    return this.get('store').peekAll('segmento')
  }),
  publicos: Ember.computed('model', function () {
    return this.get('store').peekAll('publico')
  }),
  calendarios: Ember.computed('model', function () {
    return this.get('store').peekAll('calendario')
  }),
  search: Ember.computed('model', function () {
    return "";
  }),
  modulos: Ember.computed(function () {
    return this.get('store').peekAll('modulo');
  }),
  // Módulos criados pela pessoa (GET /modulos?criados=true na rota, mais os criados nesta sessão).
  // Só eles vêm com código; os do EAD que estiverem no store ficam de fora
  modulosOrdenados: Ember.computed('modulos.@each.{inicio,codigo}', function () {
    return this.get('modulos').filter(modulo => modulo.get('codigo')).sortBy('inicio');
  }),
  // Filtros da aba Agrupar
  periodosModulo: [
    { valor: 'todos', nome: 'Todos' },
    { valor: 'andamento', nome: 'Em andamento' },
    { valor: 'futuros', nome: 'A iniciar' },
    { valor: 'encerrados', nome: 'Encerrados' }
  ],
  perfisModulo: [
    { valor: 'todos', nome: 'Todos' },
    { valor: 'aluno', nome: 'Aluno' },
    { valor: 'instrutor', nome: 'Professor' },
    { valor: 'coordenador', nome: 'Coordenador' }
  ],
  modulosFiltrados: Ember.computed('modulosOrdenados.@each.{name,codigo,inicio,fim,perfis}', 'moduloBusca', 'moduloPeriodo', 'moduloPerfil', function () {
    let normalizar = texto => (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    let busca = normalizar(this.get('moduloBusca'));
    let periodo = this.get('moduloPeriodo');
    let perfil = this.get('moduloPerfil');
    // Datas no formato 'YYYY-MM-DD', então a comparação de texto já respeita a ordem
    let hoje = moment().format('YYYY-MM-DD');

    return this.get('modulosOrdenados').filter(modulo => {
      if (busca && !normalizar(modulo.get('name')).includes(busca) && !normalizar(modulo.get('codigo')).includes(busca)) return false;
      if (periodo == 'andamento' && !(modulo.get('inicio') <= hoje && modulo.get('fim') >= hoje)) return false;
      if (periodo == 'futuros' && !(modulo.get('inicio') > hoje)) return false;
      if (periodo == 'encerrados' && !(modulo.get('fim') < hoje)) return false;
      if (perfil != 'todos' && !(modulo.get('perfis') || []).includes(perfil)) return false;
      return true;
    });
  }),
  actions: {
    refreshSelectedTab(selectedTab) {
      this.set('selectedTab', selectedTab);
    },
    // Sem módulo = criação; com módulo = edição (o mesmo modal, já preenchido)
    openModuloModal(modulo) {
      this.set('moduloEditando', modulo || null);
      this.set('showModuloModal', true);
    },
    closeModuloModal() {
      this.set('showModuloModal', false);
      this.set('moduloEditando', null);
    },
    // POST /modulos (criação) ou PATCH /modulos/{id} (edição, sem "atividades" = só os dados do módulo).
    // Devolve a promise para o modal mostrar o erro da API (ex.: código já usado)
    saveModulo(dados) {
      let modulo = this.get('moduloEditando');
      if (!modulo) {
        modulo = this.get('store').createRecord('modulo', dados);
        return modulo.save()
          .then(() => this.send('closeModuloModal'))
          .catch(erro => {
            modulo.unloadRecord();
            throw erro;
          });
      }

      // rollbackAttributes não desfaz relacionamentos no ember-data 2.16; guarda para restaurar em caso de erro
      let instituicoesAntes = modulo.get('instituicoes').toArray();
      let anosAntes = modulo.get('plataformaAnos').toArray();
      modulo.setProperties(dados);
      return modulo.save()
        .then(() => this.send('closeModuloModal'))
        .catch(erro => {
          modulo.rollbackAttributes();
          modulo.setProperties({ instituicoes: instituicoesAntes, plataformaAnos: anosAntes });
          throw erro;
        });
    },
    clearModuloFiltros() {
      this.setProperties({ moduloBusca: '', moduloPeriodo: 'todos', moduloPerfil: 'todos' });
    },
    openAtividadesModal(modulo) {
      this.set('moduloEmEdicao', modulo);
    },
    closeAtividadesModal() {
      this.set('moduloEmEdicao', null);
    },
    goToCreateConteudo() {
      this.transitionToRoute('conteudos.create');
      setTimeout(() => {
        let tabContents = document.getElementById('tabContents');
        tabContents.classList.add('l-user-header__nav-item--is-active');
      }, 1);
    },
    eraseText() {
      let btnTarget = document.getElementById("search");
      btnTarget.value = '';
      this.set('search', '')
    },
    refreshSelectedTipo(selectedTipo) {
      this.set('selectedTipo', selectedTipo);
    },
    refreshSelectedCal(calNome) {
      if (calNome == "Todos") this.set('selectedCal', calNome);
      else {
        let Calendario = this.get('calendarios').filterBy('nome', calNome).get('firstObject').get('id')
        let selectedCal = this.get('store').peekRecord('calendario', Calendario);
        this.set('selectedCal', selectedCal.get('nome'));
      }

    },
    refreshSelectedSituacao(selectedSituacao) {
      this.set('selectedSituacao', selectedSituacao);
    },
    refreshSelectedSegmento(selectedSegmento) {
      this.set('selectedSegmento', selectedSegmento);
    },
    refreshSelectedAno(selectedAno) {
      this.set('selectedAno', selectedAno);
    },
    refreshSelectedAula(selectedAula) {
      this.set('selectedAula', selectedAula);
    },
    refreshSelectedPublicos(selectedPublicoId) {
      if (selectedPublicoId == "Todos") this.set('selectedPublico', selectedPublicoId);
      else {
        let selectedPublico = this.get('store').peekRecord('publico', selectedPublicoId);
        this.set('selectedPublico', selectedPublico.get('name'));
      }
    },
    refreshSelectedTema(selectedTema) {
      this.set('selectedTema', selectedTema);
    },
    refreshSelectedOrdenacao(selectedOrdenacao) {
      this.set('selectedOrdenacao', selectedOrdenacao);
    },
    refreshSelectedAgrupamento(selectedAgrupamento) {
      this.set('selectedAgrupamento', selectedAgrupamento);
      if (selectedAgrupamento == 'Biblioteca') {
        this.set('show', selectedAgrupamento);
      } else {
        this.set('show', 'Aulas');
      }
    }
  },
  init: function () {
    this._super();
    this.set('selectedTab', 'geral');
    this.set('showModuloModal', false);
    this.set('moduloEditando', null);
    this.set('moduloEmEdicao', null);
    this.setProperties({ moduloBusca: '', moduloPeriodo: 'todos', moduloPerfil: 'todos' });
    this.set('show', 'Aulas');
    this.set('selectedTipo', 'Todos');
    
    let calendarioAtual = this.get('calendarios').sortBy('id').reverse().get('firstObject').get('nome');
    this.set('calendarioAtual', calendarioAtual);
    this.set('selectedCal', calendarioAtual);
    
    this.set('selectedTema', 'Todos');
    this.set('selectedAgrupamento', 'Todos');
    this.set('selectedAula', '');
    this.set('selectedAno', '');
    this.set('selectedSegmento', '');
    this.set('selectedSituacao', 'true');
    this.set('selectedPublico', 'Todos');
    this.set('selectedOrdenacao', 'alfabetica');
  }

});
