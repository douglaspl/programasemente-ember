import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
    store: Ember.inject.service(),
    displayEdition: false,
    focusInput: Ember.computed('displayEdition', function () {
        if (this.get('displayEdition')){
            document.getElementById('textarea-edit-'+this.get('anotacao.id')).focus();
        }
    }),
    actions: {
        saveAnotacao(){
            this.get('anotacao').save();
            this.send('toggleEdition');
        },
        toggleEdition(){
            debugger;
            this.set('displayEdition', !this.get('displayEdition'));
        },
        deleteAnotacao(){
            this.deleteAnotacao(this.get('anotacao.id'));
        }
    },
    init: function () {
        this._super();
    },
});
