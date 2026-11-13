import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  
  pessoaLogged: Ember.computed('model', function () {
    let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
    return this.get('store').peekRecord('pessoa', infosLogged.id);
  }),

  aulasController: Ember.inject.controller('aulas'),
  matchInsts: Ember.computed('model', function() {
    if (this.get('modoGestor')) return this.get('instituicoesArvore');
    return this.get('model.instituicoes');
  }),

  // Gestor de instituição com filhas: lista = árvore da própria instituição (raiz no topo),
  // em objetos simples { id, name, nivel, recuo }. Admin segue com as instituições do store.
  modoGestor: Ember.computed('model', function () {
    let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
    return infosLogged.role != 'admin';
  }),
  instituicoesArvore: Ember.computed('model', function () {
    return (this.get('model.arvore') || []).map(no => ({
      id: no.id,
      name: no.nome,
      nivel: no.nivel,
      recuo: Ember.String.htmlSafe('padding-left: ' + (no.nivel * 1.5) + 'rem;')
    }));
  }),

  actions: {
    filterInst() {
      let matchValue = document.getElementById('matchValue');
      if (this.get('modoGestor')) {
        // Busca plana pelo nome (sem acento/caixa), mantendo a ordem e o recuo da árvore
        let normalizar = texto => (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
        let busca = normalizar(matchValue ? matchValue.value : '');
        let lista = this.get('instituicoesArvore');
        this.set('matchInsts', busca ? lista.filter(inst => normalizar(inst.name).includes(busca)) : lista);
        return;
      }
      let instList = this.get('model.instituicoes');

      if (matchValue != null) {
        if(this.get('statusAtual')){
          instList = instList.filterBy('status', this.get('statusAtual'));
        }

        if (matchValue.value) {
          let searchResult = instList.filter(function (i) {
            if(i.data.name != null){
              if ((i.data.name).toLowerCase().match(new RegExp((matchValue.value).toLowerCase(), 'g'))) {
                return i;
              }
            }
          });
          this.set('matchInsts', searchResult);
        } else {
          let searchResult = instList;
          this.set('matchInsts', searchResult);
        }
      }
    },

    updateStatus(status){
      this.set('statusAtual', status);

      if (matchValue != null) {
        if (matchValue.value) {
          let inst = this.get('matchInsts');
          this.set('matchInsts', inst.filterBy('status', status));
        }
        else{
          let inst = this.get('model.instituicoes');
          this.set('matchInsts', inst.filterBy('status', status));
        }
      }
    },
  }
})
