import Ember from 'ember';

export default Ember.Component.extend({
    thumbnail: Ember.computed('item', function(){
      let url = this.get('item.arquivos').filterBy('tipo', 'png').get('firstObject.url');
      if (!url.includes('/assets/img/')) {
        url = url.replace(new RegExp("." + a.get('tipo') + '$'), '.jpg');
      }
        return url  
      }),
    actions: {
    }
});
