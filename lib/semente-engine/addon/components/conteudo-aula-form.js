import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
    store: Ember.inject.service(),
    selectedSegmentos: [],
    actions: {
        refreshSelectedSegmento(selectedSegmentoId) {
            let segmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
            this.set('selectedSegmento', segmento);
        },
        refreshSelectedAno(selectedAnoId) {
            let ano = this.get('store').peekRecord('plataforma-ano', selectedAnoId);
            this.set('selectedAno', ano);
        },
        refreshSelectedAula(selectedAulaId) {
            let aula = this.get('store').peekRecord('aula', selectedAulaId);
            this.set('selectedAula', aula);
        },
        salvarAula(selectedAula){
            let conteudo = this.get('conteudo');
            conteudo.get('aulas').pushObject(selectedAula);
            this.set('adicionarAula', "false")
        },
        refreshSelectedSegmentoAulaCadastrada(aulacadastradaId, selectedSegmentoId) {
            let aulacadastrada =  this.get('store').peekRecord('aula', aulacadastradaId);
            let aulasConteudo = this.get('conteudo').get('aulas');
            let segmento = this.get('store').peekRecord('segmento', selectedSegmentoId);
            
            aulasConteudo.forEach(a => {
                if (a){
                    if (a.id == aulacadastradaId){
                        aulasConteudo.removeObject(aulacadastrada)
                        let anos = segmento.get('plataformaAnos');
                        if (anos.get('firstObject')){
                            let aulas = anos.get('firstObject').get('aulas');
                            if (aulas.get('firstObject')){
                                aulasConteudo.pushObject(aulas.get('firstObject'))
                            }
                        }
                    }
                }
            })
        },
        refreshSelectedAnoAulaCadastrada(aulacadastradaId, selectedAnoId) {
            let aulacadastrada =  this.get('store').peekRecord('aula', aulacadastradaId);
            let aulasConteudo = this.get('conteudo').get('aulas');
            let ano = this.get('store').peekRecord('plataforma-ano', selectedAnoId);

            aulasConteudo.forEach(a => {
                if (a){
                    if (a.id == aulacadastradaId){
                        aulasConteudo.removeObject(aulacadastrada)
                        let aulas = ano.get('aulas');
                        if (aulas.get('firstObject')){
                            let aula = aulas.find(au => !aulasConteudo.includes(au));
                            aulasConteudo.pushObject(aula)
                        }
                    }
                }
            })
        },
        refreshSelectedAulaAulaCadastrada(aulacadastradaId, selectedAulaId) {
            let aulacadastrada =  this.get('store').peekRecord('aula', aulacadastradaId);
            let aulasConteudo = this.get('conteudo').get('aulas');
            let aula = this.get('store').peekRecord('aula', selectedAulaId);

            aulasConteudo.forEach(a => {
                if (a){
                    if (a.id == aulacadastradaId){
                        aulasConteudo.removeObject(aulacadastrada)
                        aulasConteudo.pushObject(aula)
                    }
                }
            })
        },
        publicoChanged(selectedPublicoId) {
            let publico = this.get('store').peekRecord('publico', selectedPublicoId);
            let sp = this.selectedPublicos;
            if (sp.length > 0){
                sp.forEach(s => {
                if (s.id == selectedPublicoId){
                    sp.removeObject(publico)
                } else{
                    sp.pushObject(publico)
                }
                })
            } else sp.pushObject(publico);
        
            this.set('selectedPublicos', sp)
        },
    }
});
        