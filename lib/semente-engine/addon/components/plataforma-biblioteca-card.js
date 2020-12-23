import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  thumbnail: Ember.computed('', function () {
    if (this.get('conteudo.tipo') == "Video") {
      let conteudoId = this.get('conteudo.id');
      let vimeoCode = this.get('conteudo.videoUrl');
      $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + vimeoCode, { format: "json" }, function (data) {
        $("#file-" + conteudoId).attr("src", data.thumbnail_url_with_play_button);
      }).fail(function () {
        $("#file-" + conteudoId).attr("src", '/assets/img/dark__thumb.png');
      });
    } else {
      debugger;
      let url = this.get('conteudo.arquivoUrl');
      if (url.slice(-5).includes('.')){
        url = url.split('.').splice(0, -1).join('.') + '.jpg';
      }
      return url;
    }
  }).property('aula'),
  actions: {
    openModal(conteudo) {
      if (this.get('conteudo.tipo') == 'Video') {
        this.toggleModal(conteudo);
      } else {
        $("#conteudo-" + conteudo.get('id')).attr("href", this.get('file'));
      }
    },
    
  },
});
