import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
    store: Ember.inject.service(),

    actions: {
        saveResponsavel(responsavel) {
            responsavel.get('dependentes').forEach(dep => {
                responsavel.get('dependentes').removeObject(dep);
            });
            responsavel.get('dependentes').pushObject(this.get('model'));
            
            responsavel.save().then(function(responsavel){
            }).catch(function(error) {
            });
        }
    }
});