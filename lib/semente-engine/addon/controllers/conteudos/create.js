import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function(){
    return this.get('model.pessoa');
  }),
  publico: Ember.computed('model', function(){
    return this.get('model.publico')
  }),
  agrupamento: Ember.computed('model', function(){
    return this.get('model.agrupamento')
  }),
  segmentos: Ember.computed('model', function(){
    var platAnos = this.get('model.pessoa').get('instituicao').get('plataformaAnos');
    var segmentoslist = [];
    platAnos.forEach(pa => {
      if (!segmentoslist.some(seg => seg.get('id') === pa.get('segmento').get('id'))){
        segmentoslist.push(pa.get('segmento'))
      }
    });
    return segmentoslist
  }),
  anos: Ember.computed('model', function(){
    let anoslist = this.get('store').peekAll('plataforma-ano');
    return anoslist
  }),
  aulas: Ember.computed('model', function(){
    let aulaslist = this.get('store').peekAll('aula');
    return aulaslist
  }),
  conteudo: Ember.computed('model', function(){
    var conteudo = this.get('store').createRecord('plataforma-conteudo')
    return conteudo
  }),
  actions: {
    
  }
});
