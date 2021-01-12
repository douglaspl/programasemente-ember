import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    videoId: Ember.computed('secao', function () {
        let videoId;
        this.get('secao').get('conteudos').forEach(function(c){
            videoId = c.get('video').get('videoId');
            if (videoId){
                $.getJSON('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + videoId, { format: "json" }, function (data) {
                    $("#vimeo-" + videoId + c.get('id')).attr("src", data.thumbnail_url_with_play_button);
                }).fail(function () {
                    $("#vimeo-" + videoId + c.get('id')).attr("src", '/assets/img/dark__thumb.png');
                });
            }
        })
        return videoId;
    }).property('aula'),

    videoName: Ember.computed('secao', function () {
        let videoName = this.get('secao').get('nome');
        return videoName;
    }),

    quiz: Ember.computed('secao', function(){
        let secao = this.get('secao');
        let quiz;
        secao.get('conteudos').forEach(function(c){
            if (c.get('quiz')){
                quiz = c.get('quiz');
            }
        });
        return quiz;
    }),

    modalParams: Ember.computed('secao', function() {
        return [this.get('videoId'), this.get('videoName')];
    }),

    actions: {
        openModal(modalParams) {
            this.toggleModalEad(modalParams);
        }
    },
    init: function () {
        this._super();
    },
});
