import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
    session: Ember.inject.service('session'),
    showHeader: Ember.run.schedule('afterRender', function () {
        $('body').removeClass('no-header');
    }),
    thisRoute: Ember.run('render', function(){
        if(window.location.pathname.includes('aulas')) {
        return 'aulas';
        }
        if(window.location.pathname.includes('plataformabiblioteca')) {
        return 'plataformabiblioteca';
        }
    }),
    store: Ember.inject.service(),
    pessoa: Ember.computed('model', function(){
        return this.get('model');
    }),
    toggleRole: Ember.computed('model', function(){
        if (localStorage.getItem('toggleRole')){
          return localStorage.getItem('toggleRole')
        }
        let role = this.get('model.role');
        localStorage.setItem('toggleRole', role);
        // para a visualização
        if (role == 'coordenador' || role == 'gestor' || role == 'diretor' || role == 'admin'){
          return 'instrutor';
        }
        return role;
    }),
    
    segmentos: Ember.computed('model', function(){
        var segmentos = this.get('model.plataformaAnos').mapBy('segmento.titulo');
        let segmentosFilter = segmentos.filter((value, index) => segmentos.indexOf(value) === index);
        return segmentosFilter;
    }),
    actions: {
        invalidateSession: function () {
            localStorage.clear();
            this.get('session').invalidate();
        },
        toggleRole(selectedRole) {
            this.set('toggleRole', selectedRole);
            localStorage.setItem('toggleRole', selectedRole);
        },
          
    }
});
