import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    pessoaRole: Ember.computed('', function(){
      let person_read = JSON.parse(localStorage.getItem('person_logged'));
      let personRole = person_read.role;
      return personRole;
    }),
    actions: {
      goToEditItem(itemId) {
        this.goToEditItem(itemId);
      },
    }
});
