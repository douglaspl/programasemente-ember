
import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
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
    // quality: quality_number
    };
    let iframe1 = document.querySelector('#video_conteudo');
    let player_section = new Vimeo.Player(iframe1, options_vimeo);
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







