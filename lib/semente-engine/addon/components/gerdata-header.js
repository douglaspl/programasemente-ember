import Ember from 'ember';

export default Ember.Component.extend({
    escopoGestor: Ember.inject.service('escopo-gestor'),

    isGestorLogado: Ember.computed(function () {
        let person = JSON.parse(localStorage.getItem('person_logged') || 'null');
        return !!person && person.role == 'gestor';
    }),

    // Gestor de instituição com filhas: "voltar" para a lista de Instituições (gersistema).
    // O caso antigo (admin e gestor da instituição 9) continua no bloco original do template.
    gestorComInstituicoes: Ember.computed.and('isGestorLogado', 'escopoGestor.temInstituicoesFilhas'),

    init() {
        this._super(...arguments);
        if (this.get('isGestorLogado')) this.get('escopoGestor').carregarArvoreInstituicoes();
    }
});
