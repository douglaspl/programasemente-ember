import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
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
            debugger;
            if (!this.get('conteudo.aulas').mapBy('id').includes(selectedAulaId)) {
                this.get('conteudo.aulas').pushObject(aula);
                this.set('adicionarAula', "false");
            } else{
                // erro, conteudo ja foi atrelado a esta aula
            }
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
        removeAula(aulacadastrada){
            this.get('conteudo.aulas').removeObject(aulacadastrada);
        },
    }
});
        