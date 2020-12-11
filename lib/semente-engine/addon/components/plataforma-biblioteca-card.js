import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  thumbnail: Ember.computed('', function() {
    let conteudoId = this.get('conteudo.id');
    if (this.get('selectedTipo')){
      $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + vimeoCode, { format: "json" }, function (data, resp) {
        if (resp == "success")  {
          $("#vimeo-" + vimeoCode + conteudoId).attr("src", data.thumbnail_url);
        } else {
          $("#vimeo-" + vimeoCode + conteudoId).attr("src", '/assets/img/dark__thumb.png');
        }
      });
    }
    return thumbnail
  }).property('selectedTipo'),
  actions: {
    // transitToConteudo(id) {
    //   this.transit(id);
    // }
  },
  init: function () {
    this._super();
  },
});
