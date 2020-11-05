import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';


export default Ember.Component.extend({
    store: Ember.inject.service(),

    plataformaTurmas: Ember.computed('pessoa', function () {
        return this.get('pessoa').get('instituicao').get('plataformaTurmas');
    }),
    selectedAno: Ember.computed('pessoa', function () {
        debugger;
        return this.get('pessoa').get('plataformaAnos').get('firstObject');
    }),
    selectedGenero: Ember.computed('pessoa', function () {
        return this.get('pessoa').get('genero');
    }),
    selectedTurma: Ember.computed('pessoa', function () {
        return this.get('pessoa').get('plataformaTurmas').get('firstObject');
    }),

    isMasculino: Ember.computed('pessoa', function () {
        var isMasc 
        try {
            isMasc = this.get('pessoa').get('genero').toLowerCase() == 'masculino';
        } catch (error) {
            isMasc = false;
        }

        return isMasc;
    }),
    
    isFeminimo: Ember.computed('pessoa', function () {
        var isFem;
        try {
            isFem = this.get('pessoa').get('genero').toLowerCase() == 'feminimo';
        } catch {
            isFem = false;
        }

        return isFem;
    }),

    actions: {
        refreshSelectedGenero(selectedGenero) {
            this.set('selectedGenero', selectedGenero);
        },
        refreshSelectedAno(selectedPlatAnoId) {
            let ano = this.get('store').peekRecord('plataforma-ano', selectedPlatAnoId);
            this.set('selectedAno', ano);
        },
        refreshSelectedPlataformaTurma(plataformaTurmaId) {
            let turma = this.get('store').peekRecord('plataforma-turma', plataformaTurmaId);
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
                debugger;
            }).catch(function(error) {
                debugger;
            });
        },

        saveResponsible(pessoa) {
            pessoa.save().then(function(pessoa){
                debugger;
            }).catch(function(error) {
                debugger;
            });
        }
    }
});