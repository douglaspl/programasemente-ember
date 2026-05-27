import Controller from '@ember/controller';
import Ember from 'ember';
import InstValidations from "../../validations/instituicao";

export default Controller.extend({
   store: Ember.inject.service(),
   InstValidations,
   pessoaLogged: Ember.computed('model',function(){
      let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
      return this.get('store').peekRecord('pessoa',infosLogged.id);
   }),
   instituicao:Ember.computed('model',function(){
      return this.get('model.instituicao');
   }),
   segmentos:Ember.computed('model',function(){
      let listaSegmentos = [];
      let plataformaAnos = this.get('model.instituicao').get('plataformaAnos');
      plataformaAnos.forEach(pa => {
         var listaIds = listaSegmentos.map(x => x.get('id'));
         if(listaIds.indexOf(pa.get('segmento').get('id')) == -1){
            listaSegmentos.push(pa.get('segmento'));
         }
      });
      return listaSegmentos.sort(function(a, b){ return a.get('id') - b.get('id') });
   }),
   plataformaAnoId: 0,
   plataformaAnos:Ember.computed('model',function(){
      return this.get('model.instituicao').get('plataformaAnos');
   }),
   plataformaTurmas:Ember.computed('model',function(){
      var sorted = this.get('model.instituicao').get('plataformaTurmas').toArray().sort(function (a, b){
         if(a.get("name") < b.get("name")) return -1;
         if(a.get("name") > b.get("name")) return 1;
         return 0;
      })
      return sorted;
   }),
   actions: {
      create(plataformaAnoSelected){
         let instituicao = this.get('model.instituicao');
         let plataformaAno = this.get('store').peekRecord('plataforma-ano', plataformaAnoSelected.id);
         let list = document.getElementById("platTurmas-list-" + plataformaAnoSelected.id);
         const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
         let name = alphabet[list.children.length];

         let plataformaTurmaObj = this.get('store').createRecord('plataforma-turma',{
            'instituicao': instituicao,
            'plataformaAno': plataformaAno,
            'name': name,
         });
         
         let that = this;
         plataformaTurmaObj.save().then(() => {
            var pts = that.get('model.instituicao').get('plataformaTurmas').toArray().sort(function (a, b){
               if(a.get("name") < b.get("name")) return -1;
               if(a.get("name") > b.get("name")) return 1;
               return 0;
            });
            that.set('plataformaTurmas', pts);
         });
      },
      edit(plataformaTurma){
         document.getElementById('plat_turma' + plataformaTurma.get('id')).contentEditable = true;
         document.getElementById('icon-edit' + plataformaTurma.get('id')).style.display = 'none';
         if(document.getElementById('icon-delete' + plataformaTurma.get('id'))){
            document.getElementById('icon-delete' + plataformaTurma.get('id')).style.display = 'none';
         }
         document.getElementById('icon-x' + plataformaTurma.get('id')).style.display = 'block';
         document.getElementById('icon-save' + plataformaTurma.get('id')).style.display = 'block';
      },
      cancelEdit(plataformaTurma){
         document.getElementById('plat_turma' + plataformaTurma.get('id')).contentEditable = false;
         document.getElementById('plat_turma' + plataformaTurma.get('id')).value = plataformaTurma.get('name');
         document.getElementById('plat_turma' + plataformaTurma.get('id')).innerText = plataformaTurma.get('name');
         document.getElementById('icon-edit' + plataformaTurma.get('id')).style.display = 'block';
         if(document.getElementById('icon-delete' + plataformaTurma.get('id'))){
            document.getElementById('icon-delete' + plataformaTurma.get('id')).style.display = 'block';
         }
         document.getElementById('icon-x' + plataformaTurma.get('id')).style.display = 'none';
         document.getElementById('icon-save' + plataformaTurma.get('id')).style.display = 'none';
      },
      saveEdit(plataformaTurma){
         let newName = document.getElementById('plat_turma' + plataformaTurma.get('id')).innerText;
         plataformaTurma.set('name', newName);
         plataformaTurma.save();
         this.send('cancelEdit', plataformaTurma);
      },
      delete(plataformaTurma){
         document.getElementsByTagName('body')[0].style.overflow = 'hidden';
         document.getElementById('deleteModal').classList.add('modal--is-show');
         document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
         this.set('selectedTurma', plataformaTurma);
      },
      cancelDelete(){
         document.getElementsByTagName('body')[0].style.overflow = 'auto';
         document.getElementById('deleteModal').classList.remove('modal--is-show');
         document.getElementsByTagName('body')[0].classList.remove('overflow-hidden');
      },
      confirmDelete(){
         let platTurma = this.get('selectedTurma')
         platTurma.set('deleted', true);
         let that = this;
         platTurma.save().then(() => {
            var pts = that.get('model.instituicao').get('plataformaTurmas').filterBy('deleted', false).toArray().sort(function (a, b){
               if(a.get("name") < b.get("name")) return -1;
               if(a.get("name") > b.get("name")) return 1;
               return 0;
            });
            that.set('plataformaTurmas', pts);
         });;
         this.send('cancelDelete');
      },
   }
})