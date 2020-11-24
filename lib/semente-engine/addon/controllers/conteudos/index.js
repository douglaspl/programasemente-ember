import Controller from '@ember/controller';
import Ember from 'ember';
import ArrayProxy from '@ember/array/proxy';
import { set } from '@ember/object';

export default Controller.extend({
  store: Ember.inject.service(),
  show: "Aulas",
  selectedPublicos: [],
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
  tipos: Ember.computed('model', function(){
    let a = this.get('conteudos');
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
  conteudos: Ember.computed('model', function(){
    return this.get('model.platconteudos');
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
