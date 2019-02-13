import DS from 'ember-data';

export default DS.Model.extend({
    matriculas: DS.attr(),
    naoiniciados: DS.attr(),
    completaram: DS.attr(),
    instituicao: DS.belongsTo('instituicao', {async: true}),
    modulo: DS.belongsTo('modulo', {async: true}),
    completaramPerc: Ember.computed('matriculas', 'completaram', function() {
        var matriculas = this.get('matriculas');
        var completaram = this.get('completaram');
        if ( typeof matriculas != 'undefined' && typeof completaram != 'undefined') {
            if (matriculas > 0) {
                let result = 100*completaram/matriculas;
                return result.toFixed(1);
            }
            else return '0';
        }
        else return '0';
    })
});