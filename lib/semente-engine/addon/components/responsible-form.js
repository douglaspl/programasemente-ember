import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
    tagName: '',
    store: Ember.inject.service(),

    actions: {
        saveResponsavel(responsavel) {
          if (this.checkform()) {
            this.gonext();   
                responsavel.get('dependentes').forEach(dep => {
                responsavel.get('dependentes').removeObject(dep);
               });
               responsavel.get('dependentes').pushObject(this.get('model'));
   
               responsavel.save().then(function(responsavel){
               }).catch(function(error) {
               });

           } else {
               return false
           }
        },

        next() {
            this.gonext();
        },

        previous() {
            this.goback();  
        },

             
        phoneMask(v) {
            let target = event.target;
            var r = v.replace(/\D/g, "");
            r = r.replace(/^0/, "");
            if (r.length > 10) {
              r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
            } else if (r.length > 5) {
              r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
            } else if (r.length > 2) {
              r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
            } else if (r.length == 0) {
                r = "";
            } else {
              r = r.replace(/^(\d*)/, "($1");
            }
          target.value = r;
        },

        checkName() {
            this.checkname();
          },

        checkemail() {
          this.checkemail();
        },

        checkcel() {
          this.checkcel();
          this.send('phoneMask');
        }
      
    }
});