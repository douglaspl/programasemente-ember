import Controller from '@ember/controller';
import Ember from 'ember';

export default Ember.Controller.extend({

   inputfocus: Ember.run.schedule('afterRender', function () {
       let input = document.getElementById("codigo-escola");
       if(input) {
           input.focus();
       }
    }),
    
});


