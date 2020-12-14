import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    vimeoCode: Ember.computed('', function() {
        debugger;
        let vimeoCode = this.get('conteudo.videoUrl');
        let conteudoid = this.get('conteudo.id');
        try{
            $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + vimeoCode, { format: "json" }, function (data, resp) {
                debugger;
                if (resp == "success")  {
                    $("#vimeo-" + vimeoCode + conteudoid).attr("src", data.thumbnail_url_with_play_button);
                } else {
                    $("#vimeo-" + vimeoCode + conteudoid).attr("src", '/assets/img/dark__thumb.png');
                }
            });
        } catch{
            $("#vimeo-" + vimeoCode + conteudoid).attr("src", '/assets/img/dark__thumb.png');
        }
        return vimeoCode
    }).property('aula'),
    filejpg: Ember.computed('', function() {
        let file = this.get('conteudo.path');
        return file.replace('pdf', 'jpg')
    }),
    actions: {
    },
    init: function () {
        this._super();
    },
});
