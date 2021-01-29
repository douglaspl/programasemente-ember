import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  aulaThumb: Ember.computed('aula', function(){
    let thumb = this.get('aula.thumbnail');
    let videosAula = this.get('aula.plataformaConteudos').filterBy('situacao', true).filterBy('tipo', "Video");
    if (thumb.includes("/assets/img/dark__thumb.png") && videosAula.length > 0){
      for (let i = 0; i < videosAula.length; i++) {
        $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + videosAula[i].get('videoUrl'), { format: "json" }, function (data) {
          $("#thumbnail-aula-card").attr("src", data.thumbnail_url_with_play_button);
        })
      }
    }
    else return thumb;
  }),
  situacao: Ember.computed('', function(){
    let aplicacoes = [];
    let aula = this.get('aula');
    let turmas = this.get('pessoa.plataformaTurmas').filterBy('plataformaAno.id', aula.get('plataformaAno.id'));
    this.get('pessoa.plataformaTurmas').forEach(t => { t.get('aplicacoes').forEach(ap => { 
      if ((ap.get('aula.id') == aula.get('id')) && ap.get('aplicado')){
        aplicacoes.pushObject(ap)
      } }) });
    this.set('UltimaAplicacao', aplicacoes.sortBy('dataAplicacao').reverse()[0]);
    if (aplicacoes.length == 0) return "Não aplicada"
    else if (aplicacoes.length == turmas.length) return "Aplicada"
    else if (aplicacoes.length < turmas.length) return "Parcialmente aplicada"
  }).property('selectedSituacao'),

  actions: {
    transitToAula(id) {
      this.transit(id);
    }
  },
  init: function () {
    this._super();
  },
});
