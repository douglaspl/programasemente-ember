import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  conteudo: Ember.computed('model', function(){
    return this.get('model')
  }),
  agrupamentos: Ember.computed('model', function(){
    return this.get('store').peekAll('agrupamento');
  }),
  segmentos: Ember.computed('model', function(){
    return this.get('store').peekAll('segmento');
  }),
  publicos: Ember.computed('model', function(){
    return this.get('store').peekAll('publico');
  }),
  inputCapa: "true",
  salvarbutton: "Salvar",
  actions: {
    saveConteudo(conteudo) {
      let that = this;
      if ((conteudo.get('tipo') != 'Documento') || (conteudo.get('thumbnail') != null) ){
        this.set('salvarbutton','Aguarde...');
        conteudo.save().then(function(){
          that.set('model', that.get('store').createRecord('plataforma-conteudo'));
          this.set('salvarbutton','Salvar');
        }).catch(function(error) {
          // erro
          this.set('salvarbutton','Salvar');
        });
      } else{
        debugger;
        this.set('inputCapa', "true");
      }
    },
  }
});
