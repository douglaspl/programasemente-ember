import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    thumbnail: Ember.computed('item', function(){
      let a = this.get('item.arquivos.firstObject');
      let url = a.get('url');
      if (!url.includes('/assets/img/')) {
        url = url.replace(new RegExp("." + a.get('tipo') + '$'), '.jpg');
      }
      return url
      }),
      pessoaRole: Ember.computed('', function(){
        let person_read = JSON.parse(localStorage.getItem('person_logged'));

        // let person = this.get('store').peekRecord('pessoa', person_read.id);
        let personRole = person_read.role;
        return personRole;
      }),
    actions: {
      goToEditItem(itemId) {
        this.goToEditItem(itemId);
      },
    }
});
