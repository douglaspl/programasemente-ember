import Controller from '@ember/controller';
import Ember from 'ember';
import InstValidations from "../../validations/instituicao";

export default Controller.extend({
   store: Ember.inject.service(),
   InstValidations,
   pessoaLogged: Ember.computed('model', function () {
      let infosLogged = JSON.parse(localStorage.getItem('person_logged'));
      return this.get('store').peekRecord('pessoa', infosLogged.id);
   }),


   updateStatus: Ember.computed('model', function () {
      return this.get('model.instituicao').get('updateStatus')
   }),



   actions: {
      save: function (changeset) {
         $("#form-inst-error").html('');
         changeset.validate().then(() => {
            if (changeset.get("isValid"))

            var isEscola = document.getElementById('isEscola').value;
            var updateStatus = this.get('updateStatus');

            changeset.set('isEscola', isEscola);
            changeset.set('vendaDireta', $(".vendaDireta")[0].checked);
            changeset.set('statusTermoAceite', $(".statusTermoAceite")[0].checked);
            changeset.set('enabled', $(".enabled")[0].checked);
            changeset.set('baseUpdated', $(".baseUpdated")[0].checked);
            changeset.set('updateStatus', updateStatus);

            // Sistemas
            var sis = this.get('store').peekAll('sistema');
            var plataforma = sis.find((x) => { return x.get('idx') === 1 });
            var s = sis.find((x) => { return x.get('idx') === 2 });
            var cs = sis.find((x) => { return x.get('idx') === 3 });
            if (changeset.get('enabled')) {
               changeset.get('sistemas').pushObject(plataforma);
               changeset.get('sistemas').pushObject(s);
               changeset.get('sistemas').pushObject(cs);
            }
            else {
               changeset.get('sistemas').removeObject(plataforma);
               changeset.get('sistemas').removeObject(s);
               changeset.get('sistemas').removeObject(cs);
            }

            let that = this;
            document.getElementById('btnSubmit').innerText = "Salvando...";
            document.getElementById('btnSubmit').disabled = true;
            changeset.save().then(function () {
               document.getElementById('btnSubmit').disabled = false;
               document.getElementById('btnSubmit').innerText = (changeset.get('id')) ? "Salvar alterações" : "Adicionar";
            });

         })
      }
   }
})