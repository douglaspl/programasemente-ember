import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    displayEdition: false,
    focusInput: Ember.computed('displayEdition', function () {
        if (this.get('displayEdition')){
            // document.getElementById('p-edit-' + this.get('anotacao.id')).focus();
            let pContent = document.getElementById('p-edit-' + this.get('anotacao.id'));
            pContent.focus();

            const range = document.createRange();
            const sel = window.getSelection();

            range.selectNodeContents(pContent);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
            pContent.focus();
            pContent.select();
        }
    }),
    actions: {
        saveAnotacao(){
            let pContent = document.getElementById('p-edit-' + this.get('anotacao.id'));
            let anotacao = this.get('anotacao');
            anotacao.set('texto', pContent.textContent);
            anotacao.save();
            this.send('toggleEdition');
        },
        toggleEditionTrue() {
            this.set('displayEdition', true);
        },
        toggleEdition(){
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
