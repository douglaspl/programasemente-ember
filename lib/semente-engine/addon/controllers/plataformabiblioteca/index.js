import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  show: "Aulas",
  selectedPublicos: [],
  thisRoute: Ember.run('render', function(){
    if(window.location.pathname.includes('aulas')) {
      return 'aulas';
    }
    if(window.location.pathname.includes('plataformabiblioteca')) {
      return 'plataformabiblioteca';
    }
  }),
  pessoa: Ember.computed('model', function(){
    return this.get('model.pessoa');
  }),
  agrupamentos: Ember.computed('model', function(){
    return this.get('model.agrupamentos')
  }),
  temas: Ember.computed('model', function(){
    let a = this.get('model.agrupamentos');
    let temas = [];
    a.forEach(a => {
      if (a.get('temas')){
        a.get('temas').forEach(tema => {
          if (!temas.some(t => t.id === tema.id)){
            temas.pushObject(tema)
          }
        })
      }
    })
    return temas
  }),
  conteudos: Ember.computed('model', function(){
    let conteudos = this.get('model.platconteudos').filterBy('situacao', true).filterBy('agrupamento.name', "Biblioteca");
    return conteudos;
  }),
  tipos: Ember.computed('model', function(){
    let a = this.get('conteudos').mapBy('tipos');
    let segmentosFilter = segmentos.filter((value, index) => segmentos.indexOf(value) === index);

    let tipos = [];
    a.forEach(a => {
      if (a.get('tipo')){
        if (!tipos.some(t => t === a.get('tipo'))){
          tipos.pushObject(a.get('tipo'))
        }
      }
    })
    return tipos
  }),
  segmentos: Ember.computed('model', function(){
    return this.get('model.segmentos');
  }),
  publicos: Ember.computed('model', function(){
    return this.get('store').findAll('publico');
  }),
  actions: {
    goToCreateConteudo() {
      this.transitionToRoute('conteudos.create');
    },
    filtroAgrupa(filtro){
      this.set('show', filtro);
    },
    refreshSelectedTipo(selectedTipoStr) {
      //let segmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
      this.set('selectedTipo', selectedTipoStr);
    },
    refreshSelectedSegmento(selectedSegmentoId) {
      let segmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
      this.set('selectedSegmento', segmento);
    },
    refreshSelectedAno(selectedAnoId) {
      let ano = this.get('store').peekRecord('plataforma-ano', selectedAnoId);
      this.set('selectedAno', ano);
    },
    refreshSelectedAula(selectedAulaId) {
      let aula = this.get('store').peekRecord('aula', selectedAulaId);
      this.set('selectedAula', aula);
    },
    goToAulas(){
      // let header = localStorage.getItem('person_logged');
      // let pessoa = JSON.parse(header);
      this.transitionToRoute('aulas');
    },
    publicoChanged(selectedPublicoId) {
      let publico = this.get('store').peekRecord('publico', selectedPublicoId);
      let sp = this.selectedPublicos;
      if (sp.length > 0){
        sp.forEach(s => {
          if (s.id == selectedPublicoId){
            sp.removeObject(publico)
          } else{
            sp.pushObject(publico)
          }
        })
      } else sp.pushObject(publico);

      this.set('selectedPublicos', sp)
    },
    refreshSelectedTema(selectedTemaId) {
      let tema = this.get('store').peekRecord('tema', selectedTemaId);
      this.set('selectedTema', tema);
    },
  }

});
