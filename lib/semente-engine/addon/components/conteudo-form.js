import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
    store: Ember.inject.service(),
    actions: {
        agrupamentoChanged(selectedAgrupamentoId) {
            let conteudo = this.get('conteudo');
            let agrupamento = this.get('store').peekRecord('agrupamento', selectedAgrupamentoId);
            conteudo.set('agrupamento', agrupamento);
        },
        refreshSelectedSituacao(selectedSituacao) {
            let conteudo = this.get('conteudo');
            if (selectedSituacao == "true"){ conteudo.set('situacao', true); }
            if (selectedSituacao == "false"){ conteudo.set('situacao', false); }
        },
        refreshSelectedTema(selectedTemaId) {
            debugger;
            let conteudo = this.get('conteudo');
            let tema = this.get('store').peekRecord('tema', selectedTemaId);
            conteudo.set('tema', tema);
        },
        publicoChanged(selectedPublicoId) {
            let conteudo = this.get('conteudo');        
            let publico = this.get('store').peekRecord('publico', selectedPublicoId);
            
            if (conteudo.get('publicos.length') > 0){
                conteudo.get('publicos').forEach( p => {
                    if (p.id == publico.id){
                        conteudo.get('publicos').removeObject(p)
                    } else{
                        conteudo.get('publicos').pushObject(publico);
                    }
                });
            } else{
                conteudo.get('publicos').pushObject(publico);
            }
        },
           
        saveConteudo(conteudo) {
            conteudo.save().then(function(conteudo){
            }).catch(function(error) {
            });
        }
    }
});