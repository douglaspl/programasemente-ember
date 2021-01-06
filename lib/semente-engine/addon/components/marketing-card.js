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
    actions: {
    }
});
