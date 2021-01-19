import Ember from 'ember';
import Component from '@ember/component';

export default Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    allChecked: true,
    toggleRole: Ember.computed('pessoa' , function() {
        return localStorage.getItem('toggleRole')
    }).property(localStorage.getItem('toggleRole')) ,
    mudouAplicacao: false,
    actions: {
        mostrarTurmas(){
            let turmasCheckBox = document.querySelectorAll('[id^="turmasId"]');
            turmasCheckBox.forEach(checkbox => {
                if (checkbox.style.display == "none") checkbox.style.display = "block";
                else if (checkbox.style.display == "block") checkbox.style.display = "none";
            })
        },
        turmasChanged: function(selectedTurmaId){
            let Aplicadas = this.get('aula').get('aplicacoes').filterBy('turma.instituicao.id', this.get('pessoa.instituicao.id'));
            if (Aplicadas.length > 0){
                if (Aplicadas.mapBy('turma.id').includes(selectedTurmaId)){
                    let oldAppTurma = Aplicadas.filterBy('turma.id', selectedTurmaId)[0];
                    oldAppTurma.set('aplicado', !oldAppTurma.get('aplicado'));
                }else{
                    let novaAp = this.get('store').createRecord('aplicacao-plataforma-aula', {
                        'aula': this.get('aula'),
                        'turma': this.get('store').peekRecord('plataforma-turma', selectedTurmaId),
                        'pessoa': this.get('pessoa'),
                        'aplicado': true
                    });
                    Aplicadas.pushObject(novaAp)
                }
            } else {
                let novaAp = this.get('store').createRecord('aplicacao-plataforma-aula', {
                    'aula': this.get('aula'),
                    'turma': this.get('store').peekRecord('plataforma-turma', selectedTurmaId),
                    'pessoa': this.get('pessoa'),
                    'aplicado': true
                });
                Aplicadas.pushObject(novaAp);
            }

            document.getElementById('Botaoturmas').disabled = false;
            // document.getElementById('Botaoturmas').style.display = "block";
        },
        selectAllTurmas(allChecked){
            let TurmasIds = this.get('pessoa').get('plataformaTurmas').filterBy('plataformaAno.id', this.get('aula').get('plataformaAno.id')).mapBy('id');
            TurmasIds.forEach(id => this.send('turmasChanged', id)); // criados e/ou atualizados
            let Aplicadas = this.get('aula').get('aplicacoes').filterBy('turma.instituicao.id', this.get('pessoa.instituicao.id'));
            if (allChecked == true){
                Aplicadas.setEach('aplicado', true); // já criados e/ou atualizados => tudo true
                this.set('allChecked', false)

                this.get('aula').get('aplicacoes').filterBy('turma.instituicao.id', this.get('pessoa.instituicao.id')).setEach('aplicado', true);
            } else if (allChecked == false){
                Aplicadas.forEach(ap => ap.set('aplicado', false)); // já criados e/ou atualizados => tudo false
                this.set('allChecked', true)
            }
            this.set('TurmasAplicadas', Aplicadas.filterBy('aplicado', true).mapBy('turma'));
        },
        saveAplicacaoTurmas(aplicacoes){
            let target = event.target;
            target.closest(".popover").classList.remove("popover--is-show");
            target.closest(".btn").disabled = true;
            let that = this;
            aplicacoes.forEach(app => {
                app.save()
                .then(function(){
                                                          // let turmasCheckBox = document.querySelectorAll('[id^="turmasId"], [id*="Botaoturmas"]');
                    // turmasCheckBox.forEach(checkbox => { checkbox.style.display = "none" })
                }).catch(function(error) {});
            });
            let ultimaData = that.get('aula').get('aplicacoes').filterBy('aplicado', true).filterBy('turma.instituicao.id', that.get('pessoa.instituicao.id')).sortBy('dataAplicacao').reverse()[0];
            setTimeout(() => {
                that.set('UltimaAplicacao', ultimaData); 
            }, 100);
            
            
        },
    }

});
