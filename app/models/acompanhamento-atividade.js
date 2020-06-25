import DS from 'ember-data';

export default DS.Model.extend({
    percentComplete: DS.attr(),
    conteudosCompletos: DS.attr(),
    atividade: DS.belongsTo('atividade', {async: true}),
    pessoa: DS.belongsTo('pessoa', {async: true}),
    percentFixed: Ember.computed('percentComplete', function() {
        let percentComplete = this.get('percentComplete');
        if (percentComplete > 100){
            percentComplete = 100;
        }
        return percentComplete.toFixed(0);
      }),
});