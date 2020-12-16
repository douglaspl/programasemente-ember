import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  store: Ember.inject.service(),
  selectedDependente: Ember.computed('model', function(){
    let toggleRole = localStorage.getItem('toggleRole');
    let person = JSON.parse(localStorage.getItem('person_logged'));
    let id = person.id;
    if (toggleRole == 'responsavel') {
      id = this.get('store').peekRecord('pessoa', id).get('dependentes.firstObject.id');
    }
    let pessoaDep = this.get('store').peekRecord('pessoa', id);
    return pessoaDep
  }),

  selectedSegmento: Ember.computed('model', function(){
   if (this.get('selectedDependente')){
      return this.get('selectedDependente.plataformaAnos.firstObject.segmento.titulo');
    } else{
      return this.get('model.plataformaAnos.firstObject.segmento.titulo');
    }
  }),

  selectedAno: Ember.computed('model', function(){
    
    return this.get('selectedDependente.plataformaAnos').filterBy('segmento.titulo', this.get('selectedSegmento')).get('firstObject.name');
  }),

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

  segmentosObjects: Ember.computed('model', function(){
    var segmentos = this.get('model.plataformaAnos').mapBy('segmento');
    let segmentosFilter = segmentos.filter((value, index) => segmentos.mapBy('titulo').indexOf(value.get('titulo')) === index);
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
