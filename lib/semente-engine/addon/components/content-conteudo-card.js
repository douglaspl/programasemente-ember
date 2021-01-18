import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',
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
    } else if (this.get('conteudo.tipo') == "Documento") {
      let url = this.get('conteudo.thumbnail');
      return url;
    } else if (this.get('conteudo.tipo') == "Imagem") {
      let url = this.get('conteudo.arquivoUrl');
      return url;
    }
  }).property('aula'),
  actions: {
    openModal() {
      this.toggleModal(this.get('conteudo.id'));
    }
  },
});
