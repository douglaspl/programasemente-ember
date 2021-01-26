import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoaRole: Ember.computed('pessoa' , function() {
    return JSON.parse(localStorage.getItem('person_logged')).role;
  }),
  conteudos: Ember.computed('model', function(){
    let conts = this.get('model');
    if (this.get('selectedSituacao') == "false") conts = conts.filterBy('situacao', false);
    if (this.get('selectedSituacao') == "true") conts = conts.filterBy('situacao', true);
    if (this.get('selectedPublico') != 'Todos') conts = conts.filter(c => c.get('publicos').mapBy('name').includes(this.get('selectedPublico')));
    if (this.get('selectedTipo') != 'Todos') conts = conts.filterBy('tipo', this.get('selectedTipo'));
    if (this.get('selectedTema') != 'Todos') conts = conts.filterBy('tema.name', this.get('selectedTema'));
    if (this.get('show') == 'Biblioteca') conts = conts.filterBy('agrupamento.name', 'Biblioteca');
    else {
      if (this.get('selectedAgrupamento') != 'Todos') conts = conts.filterBy('agrupamento.name', this.get('selectedAgrupamento'));
      else conts = conts.filter(c => c.get('agrupamento.name') == 'Básico' || c.get('agrupamento.name') == 'Complementar');
      if (this.get('selectedSegmento') != '') conts = conts.filter(c => c.get('aulas').mapBy('plataformaAno.segmento.titulo').includes(this.get('selectedSegmento')));
      if (this.get('selectedAno') != '') conts = conts.filter(c => c.get('aulas').mapBy('plataformaAno.name').includes(this.get('selectedAno')));
      if (this.get('selectedAula') != '') conts = conts.filter(c => c.get('aulas').mapBy('titulo').includes(this.get('selectedAula')));
    }  
    return conts.sortBy('agrupamento.name')
  }).property('search', 'selectedTipo', 'selectedTema', 'selectedAgrupamento', 'selectedPublico', 'selectedSegmento', 'selectedAno', 'selectedAula', 'show', 'selectedSituacao'),
  agrupamentos: Ember.computed('model', function(){
    return this.get('store').peekAll('agrupamento')   
  }),
  temas: Ember.computed('model', function(){
    return this.get('store').findAll('tema')  
  }),
  tipos: Ember.computed('model', function(){
    let tipos = this.get('conteudos').mapBy('tipo');
    return tipos.filter((value, index) => tipos.indexOf(value) === index);
  }).property('selectedAgrupamento'),
  segmentos: Ember.computed('model', function(){
    return this.get('store').peekAll('segmento')   
  }),
  publicos: Ember.computed('model', function(){
    return this.get('store').peekAll('publico')
  }),
  actions: {
    goToCreateConteudo() {
      this.transitionToRoute('conteudos.create'); 
    },
    eraseText() {
      let btnTarget = document.getElementById("search");
      btnTarget.value = '';
      this.set('search','')
     },
    filtroAgrupa(filtro){
      this.set('show', filtro);
      if (filtro == 'Biblioteca') this.set('selectedAgrupamento', 'Biblioteca');
      else this.set('selectedAgrupamento', 'Todos');
    },
    refreshSelectedTipo(selectedTipo) {
      this.set('selectedTipo', selectedTipo);
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
      let selectedPublico = this.get('store').peekRecord('publico', selectedPublicoId);
      this.set('selectedPublico', selectedPublico.get('name'));
    },
    refreshSelectedTema(selectedTema) {
      this.set('selectedTema', selectedTema);
    },
    refreshSelectedAgrupamento(selectedAgrupamento){
      this.set('selectedAgrupamento', selectedAgrupamento);
    }
  },
  init: function(){
    this._super();
    this.set('show', 'Aulas');
    this.set('selectedTipo', 'Todos');
    this.set('selectedTema', 'Todos');
    this.set('selectedAgrupamento', 'Todos');
    this.set('selectedAula', '');
    this.set('selectedAno', '');
    this.set('selectedSegmento', '');
    this.set('selectedSituacao', 'true');
    this.set('selectedPublico', 'Todos');
  }

});
