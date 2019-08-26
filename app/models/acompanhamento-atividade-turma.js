import DS from 'ember-data';
import Ember from 'ember';


export default DS.Model.extend({
    matriculas: DS.attr(),
    naoiniciados: DS.attr(),
    completaram: DS.attr(),
    turma: DS.belongsTo('turma', {async: true}),
    atividade: DS.belongsTo('atividade', {async: true}),
    completaramPerc: Ember.computed('matriculas', 'completaram', function() {
        var matriculas = this.get('matriculas');
        var completaram  = this.get('completaram');
        if (typeof matriculas != 'undefined' && typeof completaram != 'undefined') {
            if (matriculas > 0) {
                let result = 100*completaram/matriculas;
                return result.toFixed(1);
            }
            else return '0';
        }
        else return '0';
    }),
    naoiniciadosPerc: Ember.computed('matriculas', 'naoiniciados', function() {
        var matriculas = this.get('matriculas');
        var naoiniciados = this.get('naoiniciados');
        if (typeof matriculas != 'undefined' && typeof naoiniciados != 'undefined') {
            if (matriculas > 0) {
                let result = 100*naoiniciados/matriculas;
                return result.toFixed(1);
            }
            else return '0';
        }
        else return '0';
    }),
    andamento: Ember.computed('matriculas', 'naoiniciados', 'completaram', function() {
        var matriculas = this.get('matriculas');
        var naoiniciados = this.get('naoiniciados');
        var completaram  = this.get('completaram');
        if (typeof matriculas != 'undefined' && typeof naoiniciados != 'undefined' && typeof completaram != 'undefined') {
            return matriculas - naoiniciados - completaram;
        }
        else {
            return '0';
        }
    }),
    andamentoPerc: Ember.computed('matriculas', 'naoiniciados', 'completaram', function() {
        var matriculas = this.get('matriculas');
        var naoiniciados = this.get('naoiniciados');
        var completaram  = this.get('completaram');
        if (typeof matriculas != 'undefined' && typeof naoiniciados != 'undefined' && typeof completaram != 'undefined') {
            if (matriculas > 0) {
                let result = 100*(matriculas - naoiniciados - completaram)/matriculas;
                return result.toFixed(1);
            }
            else return '0';
        }
        else return '0';
    }),
    styleNaoiniciado: Ember.computed('matriculas', 'naoiniciados', function() {
        var matriculas = this.get('matriculas');
        var naoiniciados = this.get('naoiniciados');
        if (typeof matriculas != 'undefined' && typeof naoiniciados != 'undefined') {
            if (matriculas > 0) {
                let result = 100*naoiniciados/matriculas;
                return new Ember.String.htmlSafe("width: " + result.toFixed(0) + "%;");
            }
            else return new Ember.String.htmlSafe("width: 0%;");
        }
        else return new Ember.String.htmlSafe("width: 0%;");
    }),
    styleCompletaram: Ember.computed('matriculas', 'completaram', function() {
        var matriculas = this.get('matriculas');
        var completaram  = this.get('completaram');
        if (typeof matriculas != 'undefined' && typeof completaram != 'undefined') {
            if (this.get('matriculas') > 0) {
                let result = 100*this.get('completaram')/this.get('matriculas');
                return new Ember.String.htmlSafe("width: " + result.toFixed(0) + "%;");
            }
            else return new Ember.String.htmlSafe("width: 0%;");
        }
        else return new Ember.String.htmlSafe("width: 0%;");
    }),
    styleAndamento: Ember.computed('matriculas', 'naoiniciados', 'completaram', function() {
        var matriculas = this.get('matriculas');
        var naoiniciados = this.get('naoiniciados');
        var completaram  = this.get('completaram');
        if (typeof matriculas != 'undefined' && typeof naoiniciados != 'undefined' && typeof completaram != 'undefined') {
            if (matriculas > 0) {
                let result = 100*(matriculas - naoiniciados - completaram)/matriculas;
                return Ember.String.htmlSafe("width: " + result.toFixed(0) + "%;");
            }
            else return new Ember.String.htmlSafe("width: 0%;");
        }
        else return new Ember.String.htmlSafe("width: 0%;");
    }),
});