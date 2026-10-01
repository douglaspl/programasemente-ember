import Ember from 'ember';
import moment from 'moment';

const NOMES_PERFIS = { aluno: 'Aluno', instrutor: 'Professor', coordenador: 'Coordenador' };

export default Ember.Component.extend({
    tagName: '',
    store: Ember.inject.service(),

    periodo: Ember.computed('modulo.{inicio,fim}', function () {
        let formatar = data => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY');
        return formatar(this.get('modulo.inicio')) + ' até ' + formatar(this.get('modulo.fim'));
    }),

    perfis: Ember.computed('modulo.perfis.[]', function () {
        return (this.get('modulo.perfis') || []).map(perfil => NOMES_PERFIS[perfil] || perfil).join(', ');
    }),

    // "Nome (peso N)"; o nome vem da API ou, para módulo recém-criado, do comp que já está no store
    competencias: Ember.computed('modulo.competencias.[]', function () {
        let store = this.get('store');
        return (this.get('modulo.competencias') || [])
            .slice().sort((a, b) => b.peso - a.peso)
            .map(item => {
                let nome = item.nome;
                if (!nome) {
                    let comp = store.peekRecord('comp', item.competencia);
                    nome = comp ? comp.get('name') : 'Competência ' + item.competencia;
                }
                return nome + ' (peso ' + item.peso + ')';
            });
    }),

    // Anos agrupados por segmento numa linha só, ex.: "Fundamental I: 1º ano, 2º ano"
    anosPorSegmento: Ember.computed('modulo.plataformaAnos.[]', function () {
        let segmentos = [];
        this.get('modulo.plataformaAnos').sortBy('segmento.idx', 'idx').forEach(ano => {
            let titulo = ano.get('segmento.titulo');
            let segmento = segmentos.find(s => s.titulo == titulo);
            if (!segmento) {
                segmento = { titulo: titulo, anos: [] };
                segmentos.push(segmento);
            }
            segmento.anos.push(ano.get('name'));
        });
        return segmentos.map(s => ({ titulo: s.titulo, anos: s.anos.join(', ') }));
    }),

    atividadesOrdenadas: Ember.computed('modulo.atividades.@each.idx', function () {
        return this.get('modulo.atividades').sortBy('idx');
    }),
});
