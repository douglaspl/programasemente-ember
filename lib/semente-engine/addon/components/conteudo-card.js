import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
        postSelectedSituacao(conteudo) {
            conteudo.set('situacao', !conteudo.get('situacao'));
            conteudo.save().then(function(conteudo){
            }).catch(function(error) {
            });
        },
        goToEditConteudo(id) {
            var that = this.get('thisIndex');
            that.transitionToRoute('conteudos.edit', id);
        },
    }

});
