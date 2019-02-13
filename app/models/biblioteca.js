import DS from 'ember-data';
import moment from 'moment';
import Ember from 'ember';

export default DS.Model.extend({
  id: DS.attr(),
  dataUpload: DS.attr(),
  readbleDate: Ember.computed('ultimoacesso', function () {
    return moment(this.get('ultimoacesso'), 'X').format('DD/MM/YYYY');
  }),
  tipo: DS.attr(),
  nome: DS.attr(),
  thumb: DS.attr(),
  link: DS.attr(),
  acompanhamentosPessoaMateriais: DS.hasMany('acompanhamento-pessoa-material', {
    async: true
  }),
});
