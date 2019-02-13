import DS from 'ember-data';

export default DS.Model.extend({
    idx: DS.attr(),
    html: DS.belongsTo('html', {async: true}),
    video: DS.belongsTo('video', {async: true}),
    quiz: DS.belongsTo('quiz', {async: true})
});