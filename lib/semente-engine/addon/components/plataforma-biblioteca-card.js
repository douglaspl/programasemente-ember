import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
  router: Ember.inject.service('-routing'),
  store: Ember.inject.service(),
  thumbnail: Ember.computed('conteudo', function () {
    let thumb = this.get('conteudo.arquivoUrl').split('.').splice(0, -1).join('.');
    debugger;
    return thumb + '.png';
  }).property('aula'),
  actions: {
    openModal(conteudo) {
      if (this.get('conteudo.tipo') == 'Video') {
        this.toggleModal(conteudo);
      } else {
        $("#conteudo-" + conteudo.get('id')).attr("href", this.get('conteudo.arquivoUrl'));
      }
    },
    
  },
});
