import Controller from '@ember/controller';
import InstValidations from "../../validations/instituicao";
import Ember from 'ember';

export default Controller.extend({
   InstValidations,
   store: Ember.inject.service(),
   actions: {
      save: function(changeset) {
         $("#form-inst-error").html('');
         changeset.validate().then(() => {
             if (changeset.get("isValid")) {
                // Instituição ja existe    
                var existingInst = this.get('store').peekAll('instituicao').find((x) => { return x.get('name') === changeset.get('name')});
                if (existingInst) {
                    $("#form-inst-error").html('Instituição já existe'); 
                    return;
                }
                 
                var isEscola = document.getElementById('isEscola').value;
                changeset.set('isEscola', isEscola);
                changeset.set('vendaDireta', $(".vendaDireta")[0].checked);
                changeset.set('statusTermoAceite', $(".statusTermoAceite")[0].checked);
                changeset.set('enabled', $(".enabled")[0].checked);
                changeset.set('baseUpdated', $(".baseUpdated")[0].checked);

                // Sistemas
                var sis = this.get('store').peekAll('sistema');
                var plataforma = sis.find((x) => { return x.get('idx') === 1 });
                var s = sis.find((x) => { return x.get('idx') === 2 });
                var cs = sis.find((x) => { return x.get('idx') === 3 });
                if(changeset.get('enabled')){
                   changeset.get('sistemas').pushObject(plataforma);
                   changeset.get('sistemas').pushObject(s);
                   changeset.get('sistemas').pushObject(cs);
                }

                // Get Plataforma Anos
                var pas = this.get('store').peekAll('plataforma-ano');
                $(".segmento").each((i, x) => {
                    if (x.checked === true) {
                        var segmentoid = $(x).attr('id').split("_")[1];
                        var pa = pas.filter((y) => {
                            return y.get('segmento.id') === segmentoid
                        });
                        changeset.get('plataformaAnos').pushObjects(pa);
                    }
                })

                var selectedAdulto = document.getElementById('platAnoAdulto');
                var paAdulto = this.get('store').peekRecord('plataforma-ano', selectedAdulto.value);
                changeset.get('plataformaAnos').pushObject(paAdulto);

                // Get Calendario
                var selectedCalendario = document.getElementById('new_inst_calendario');
                var calendario = this.get('store').peekRecord('calendario', selectedCalendario.value);
                changeset.set('calendario', calendario);

                // Get Instituição Mãe
                var selectedInstituicaoMaeId = document.getElementById('instituicaoMae').value;
                changeset.set('instituicaoPaiId', selectedInstituicaoMaeId ? parseInt(selectedInstituicaoMaeId, 10) : null);

                var that = this;
                changeset.save().then(function () {
                    var instituicao = that.get('store').peekAll('instituicao').find((x) => { return x.get('name') === changeset.get('name')});
                    that.transitionToRoute('gerdata.informations', instituicao.get('id'))
                });
             }
         })
      }
   }
})