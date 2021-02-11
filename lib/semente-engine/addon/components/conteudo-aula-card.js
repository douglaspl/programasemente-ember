import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    aulasAno: Ember.computed('ano', function(){
        if (this.get('show') !== 'Biblioteca') {
            return this.get('conteudo.aulas').filterBy('plataformaAno.name', this.get('ano'));
        } else {
            return this.get('conteudo')
        }
    }).property('ano'),
    actions: {}
});
