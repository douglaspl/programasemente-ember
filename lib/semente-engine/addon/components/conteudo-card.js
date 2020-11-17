import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
        postSelectedSituacao(conteudo) {
            conteudo.set('situacao', !conteudo.get('situacao'));
            conteudo.save().then(function(conteudo){
                debugger;
            }).catch(function(error) {
            });
        },
        goToCreateConteudo() {
            var that = this.get('thisIndex');
            that.transitionToRoute('conteudos.create');
        },
    }

});
