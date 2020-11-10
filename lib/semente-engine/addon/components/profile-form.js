import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
    store: Ember.inject.service(),

    segmentos: Ember.computed('pessoa', function() {
        return this.get('store').peekAll('segmento');
    }),

    actions: {
        refreshSelectedGenero(selectedGenero) {
            let pessoa = this.get('pessoa');
            pessoa.set('genero', selectedGenero);
            this.set('selectedGenero', selectedGenero);
        },
        refreshSelectedAno(selectedPlatAnoId) {
            let pessoa = this.get('pessoa');
            var pessoaAnos = pessoa.get('plataformaAnos');
            pessoaAnos.forEach(pa => {
                pessoa.get('plataformaAnos').removeObject(pa);
            })
            let ano = this.get('store').peekRecord('plataforma-ano', selectedPlatAnoId);
            pessoa.get('plataformaAnos').pushObject(ano);
            this.set('selectedAno', ano);
        },
        refreshSelectedPlataformaTurma(plataformaTurmaId) {
            let pessoa = this.get('pessoa');
            var pessoaTurmas = pessoa.get('plataformaTurmas');
            pessoaTurmas.forEach(pt => {
                pessoa.get('plataformaTurmas').removeObject(pt);
            });
            let turma = this.get('store').peekRecord('plataforma-turma', plataformaTurmaId);
            pessoa.get('plataformaTurmas').pushObject(turma);
            this.set('selectedTurma', turma);
        },

        saveProfile(pessoa) {
            var pessoaTurmas = pessoa.get('plataformaTurmas');
            pessoaTurmas.forEach(pt => {
                pessoa.get('plataformaTurmas').removeObject(pt);
            });
            pessoa.get('plataformaTurmas').pushObject(this.get('selectedTurma'));

            var pessoaAnos = pessoa.get('plataformaAnos');
            pessoaAnos.forEach(pa => {
                pessoa.get('plataformaAnos').removeObject(pa);
            })
            pessoa.get('plataformaAnos').pushObject(this.get('selectedAno'));

            pessoa.set('genero', this.get('selectedGenero'));
            pessoa.save().then(function(pessoa){
            }).catch(function(error) {
            });
        },

        saveResponsible(pessoa) {
            pessoa.save().then(function(pessoa){
            }).catch(function(error) {
            });
        },

        selectAno(platAno, selected) {
            let pessoa = this.get('pessoa');
            if (selected) {
                pessoa.get('plataformaAnos').pushObject(platAno);
            } else {
                pessoa.get('plataformaAnos').removeObject(platAno);
            }
        },

        selectSegmento(seg, selected) {
            debugger;
            let pessoa = this.get('pessoa');
            let platAnos = this.get('store').peekAll('plataforma-ano');
            let segPlatAnos = [];
            platAnos.forEach(pa => {
                if (pa.get('segmento').get('id') == seg.get('id')){
                    segPlatAnos.push(pa);
                }
            })
            
            segPlatAnos.forEach(pa => {
                if (selected) {
                    pessoa.get('plataformaAnos').pushObject(pa);
                }else {
                    pessoa.get('plataformaAnos').removeObject(pa);
                }
            })
        }
    }
});