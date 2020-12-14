import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  vimeoCode: Ember.computed('', function () {
    let vimeoCode = this.get('conteudo.videoUrl');
    let conteudoid = this.get('conteudo.id');
    $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + vimeoCode, { format: "json" }, function (data) {
      $("#vimeo-" + vimeoCode + conteudoid).attr("src", data.thumbnail_url_with_play_button);
    }).fail(function () {
      $("#vimeo-" + vimeoCode + conteudoid).attr("src", '/assets/img/dark__thumb.png');
    });
    return vimeoCode
  }).property('aula'),
  filejpg: Ember.computed('', function () {
    let file = this.get('conteudo.path');
    return file.replace('pdf', 'jpg')
  }),
  actions: {
    // transitToConteudo(id) {
    //   this.transit(id);
    // }
  },
  init: function () {
    this._super();
  },
});
