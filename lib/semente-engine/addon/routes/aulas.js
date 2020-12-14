import Route from '@ember/routing/route';

export default Route.extend({
    store: Ember.inject.service(),
    model() {
        let person = JSON.parse(localStorage.getItem('person_logged'));
        let person_id = person.id;
        return this.get('store').findRecord('pessoa', person_id, {include: 'instituicao, plataforma-anos.segmento, plataforma-anos.aulas.unidade, plataforma-anos.aulas.plataforma-conteudos.agrupamento, plataforma-anos.aulas.plataforma-conteudos.publicos, plataforma-turmas.aplicacoes-plataforma-aula.aula, dependentes.plataforma-anos.aulas.plataforma-conteudos.agrupamento, dependentes.plataforma-anos.aulas.plataforma-conteudos.publicos, dependentes.plataforma-turmas.aplicacoes-plataforma-aula.aula, dependentes.plataforma-anos.aulas.unidade, dependentes.plataforma-anos.segmento'});
    },
});
