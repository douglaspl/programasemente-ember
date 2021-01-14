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
      if (this.get('activeAula')) $("#aulas-header").addClass("tabs__tab--is-active");
    });
  },
  livro: Ember.computed('livros.[]', function() {
    debugger;
    let livros = this.get('livros');
    if (livros){
      let perfil = (['aluno', 'responsavel'].includes(this.get('parentController.toggleRole'))) ? 'aluno' : 'instrutor';
      if (livros.get('length')) {
        let url = livros.filter((l) => l.get('perfil') == perfil);
        if (url.length > 0) return url.get('firstObject'); else return "#";
      } else return "#"
    } else return "#"
  }).property('livros.[]'),
  
  idxPlatAnosMedio: [10, 11, 12],
  isAlunoMedio: Ember.computed('pessoa', function() {
    let pessoa = this.get('pessoa');
    
    if (!pessoa) return false;
    if (pessoa.get('role') != "aluno") return false;

    let pessoaPlatAno = pessoa.get('plataformaAnos').get('firstObject');
    if (this.idxPlatAnosMedio.includes(pessoaPlatAno.get('idx'))) return true;
    return false;
  }),

  actions: {
    goToAulas() {
        this.get('router').transitionTo('aulas.index');
    },
    goToBiblioteca(){
      this.get('router').transitionToRoute('plataformabiblioteca.index');
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
