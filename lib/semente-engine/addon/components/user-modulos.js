import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    appstate: Ember.inject.service(),
    classNames: ['data'],
    calculate: Ember.computed('pessoa', async function() {
        let matriculas = await this.get('pessoa').get('matriculas');
        let concluido = 0;
        let total = 0;
        if (matriculas) {
            matriculas.forEach(mat=>{
                if (mat.get('matriculado')) {
                    total = total + 1;
                    if (mat.get('progresso') >= 99.5) concluido = concluido+1;
                }
                
            });
        }
        this.set('total', total);
        this.set('concluido', concluido);
        this.set('show', true);
        return concluido;
    })
});