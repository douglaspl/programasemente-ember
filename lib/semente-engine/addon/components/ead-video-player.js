
import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  store: Ember.inject.service(),
  playVideo() {
    let vdwidth = 760;
    let vdheight = 429;
    let options_vimeo = {
        id: this.get('videoId'),
        autoplay: true,
        playsinline: false,
        title: true,
        width: vdwidth,
        height: vdheight
     };
    let iframe1 = document.querySelector('#video_conteudo_ead');
    let player_section = new Vimeo.Player(iframe1, options_vimeo);
    player_section.on('progress', function (data, id){ console.log(data.percent); }); // conta a porcentagem para o primeiro video
    if (this.get('stopVideoEad')){
      player_section.destroy();
    }
  },

  actions: {

  },
  init() {
    this._super(...arguments);
    let that = this;
    Ember.run.schedule('afterRender', function () {
        that.playVideo();
    });
  },

  didUpdateAttrs() {
    this.playVideo()
  }
});







