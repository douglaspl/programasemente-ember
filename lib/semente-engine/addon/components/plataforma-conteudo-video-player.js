
import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  store: Ember.inject.service(),
  playVideo() {
    let vdwidth = 760;
    let vdheight = 429;
    let options_vimeo = {
      id: this.get('conteudo.videoUrl'),
      autoplay: true,
      playsinline: false,
      title: true,
      width: vdwidth,
      height: vdheight
    };
    let player_section = new Vimeo.Player('video_conteudo', options_vimeo);

    player_section.on('progress', function (data, id){ console.log(data.percent); }); // conta a porcentagem para o primeiro video
    if (this.get('stopVideo')){
      player_section.unload();
      player_section.destroy();
    }

    if (!this.get('stopVideo')) {
      let conteudoPessoa = this.get('store').createRecord('conteudo-pessoa', { // está salvando quando abre o modal
        pessoa: this.get('pessoa'),
        plataformaConteudo: this.get('conteudo')
      })
      conteudoPessoa.save().then(() => {
      });
    }
    // player_section.on('play', function () {
    //   let conteudoPessoa = this.get('store').createRecord('conteudo-pessoa', { // está salvando quando abre o modal
    //     pessoa: this.get('pessoa'),
    //     plataformaConteudo: this.get('conteudo')
    //   })
    //   conteudoPessoa.save().then(() => {
    //   });
    // })
  },

  actions: {

  },
  init() {
    this._super(...arguments);
    let that = this;
    Ember.run.schedule('afterRender', function () {
      if (that.get('conteudo.tipo') == 'Video'){
        that.playVideo();
      }
    });
  },

  didUpdateAttrs() {
    if (conteudo.get('tipo') == 'Video'){
      this.playVideo();
      // if (!this.get('stopVideo')) this.playVideo()
      // else $('#video_conteudo').attr('src', '');
    }
  }
});







