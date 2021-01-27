import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    aulasAno: Ember.computed('ano', function(){
        return this.get('conteudo.aulas').filterBy('plataformaAno.name', this.get('ano'));
    }).property('ano'),
    actions: {}
});
