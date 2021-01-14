import Ember from 'ember';
import Component from '@ember/component';

Ember.LinkComponent.reopen({
  activeClass: 'tabs__tab--is-active'
});

export default Component.extend({
  store: Ember.inject.service(),
  tagName: '',
  router: Ember.inject.service('-routing'),
  session: Ember.inject.service('session'),

  toogleModal(target) {
    var el = document.getElementById(target);
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
  },

  isAplicador: Ember.computed('', function() {
    let aplicador = this.get('pessoa').get('isAplicador');
    return aplicador;
  }),

  init() {
    this._super(...arguments);
    let showtoggle = this.get('showToggle');
    this.set('showToggle', showtoggle);
    Ember.run.schedule("afterRender", this, function(){
      if (this.get('activeAula')) {
        if (this.alunoMedio) $("#aulas-header-medio").addClass("tabs__tab--is-active");
        else $("#aulas-header-semente").addClass("tabs__tab--is-active");
      }
    });
  },
  livro: Ember.computed('livros.[]', function() {
    let livros = this.get('livros');
    if (livros){
      let perfil = (['aluno', 'responsavel'].includes(this.get('parentController.toggleRole'))) ? 'aluno' : 'instrutor';
      if (livros.get('length')) {
        let url = livros.filter((l) => l.get('perfil') == perfil);
        if (url.length > 0) return url.get('firstObject'); else return "#";
      } else return "#"
    } else return "#"
  }).property('livros.[]'),
  alunoMedio: Ember.computed('', function() {
    if (this.get('parentController.toggleRole') == 'aluno' && [10, 11, 12].includes(this.get('pessoa.plataformaAnos.firstObject.idx'))){
      return true;
    }
  }),
  

  actions: {
    goToModulos(modulo) {
      let modIdx = modulo.get('idx');
      this.goToModulos(modIdx);
    },
    invalidateSession() {
        localStorage.clear();
        this.get('session').invalidate();
    },

    toggleRole(selectedRole) {
        this.togglerole(selectedRole);
    },

    toggleAvatarModal(){
      this.toogleModal('change_image_modal');
    },
  }

});
