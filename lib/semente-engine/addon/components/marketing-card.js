import Ember from 'ember';

export default Ember.Component.extend({
    thumbnail: Ember.computed('item', function(){
        return this.get('item.arquivos').filterBy('tipo', 'png').get('firstObject.arquivo')   
      }),
    actions: {
    }
});
