import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
    store: Ember.inject.service(),
    vimeoCode: Ember.computed('', function() {
        let vimeoCode = this.get('conteudo.videoUrl');
        let conteudoid = this.get('conteudo.id');
        $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + vimeoCode, { format: "json" }, function (data, resp) {
            if (resp == "success")  {
                $("#vimeo-" + vimeoCode + conteudoid).attr("src", data.thumbnail_url);
            } else {
                $("#vimeo-" + vimeoCode + conteudoid).attr("src", '/assets/img/dark__thumb.png');
            }
        });
        return vimeoCode
    }).property('aula'),
    fileThumb: Ember.computed('', function(){
        // https://res.cloudinary.com/christekh/image/upload/w_200,h_250,c_fill,pg_${i}/${this.file.public_id}.jpg
        return "https://res.cloudinary.com/douglaslinhares/image/upload/v1605111732/" + this.get('conteudo.path');
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
