import DS from 'ember-data';

export default DS.Model.extend({
    pessoaId: DS.attr(),
    institutionId: DS.attr(),
    geolocation: DS.attr(),
    path: DS.attr(),
    device: DS.attr(),
    screen: DS.attr(),
    browser: DS.attr(),
    message: DS.attr(),
});