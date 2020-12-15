import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    conteudoAnos: Ember.computed('conteudo', function(){
        if (this.get('show') == 'Biblioteca') return [''];
        let anos = this.get('conteudo.aulas')
        if (this.get('selectedSegmento') != '') anos = anos.filterBy('plataformaAno.segmento.titulo', this.get('selectedSegmento'));
        if (this.get('selectedAno') != '') anos = anos.filterBy('plataformaAno.name', this.get('selectedAno'));
        let anosFilter = anos.mapBy('plataformaAno.name').filter((value, index) => anos.mapBy('plataformaAno.name').indexOf(value) === index);
        return anosFilter
    }).property('conteudo', 'selectedSegmento', 'selectedAno'),
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
