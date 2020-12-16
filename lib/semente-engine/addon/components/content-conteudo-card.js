import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    thumbnail: Ember.computed('', function () {
        let file;
        if (this.get('conteudo.tipo') == "Video"){
          let conteudoId = this.get('conteudo.id');
          let vimeoCode = this.get('conteudo.videoUrl');
          $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + vimeoCode, { format: "json" }, function (data) {
            $("#file-" + conteudoId).attr("src", data.thumbnail_url_with_play_button);
          }).fail(function () {
            $("#file-" + conteudoId).attr("src", '/assets/img/dark__thumb.png');
          });
        } else if (this.get('conteudo.tipo') == "Documento"){
          file = this.get('conteudo.path').replace('pdf', 'jpg');
          return "https://res.cloudinary.com/douglaslinhares/image/upload/v1605111732/conteudos/" + file;
        } else if (this.get('conteudo.tipo') == "Imagem"){
          file = this.get('conteudo.path');
          return "https://res.cloudinary.com/douglaslinhares/image/upload/v1605111732/conteudos/" + file;
        }
    }).property('aula'),
    actions: {
        openModal() {
            this.toggleModal(this.get('conteudo.id'));
        }
    },
    init: function () {
        this._super();
    },
});
