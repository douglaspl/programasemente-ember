import Ember from 'ember';
import Component from '@ember/component';
// import pessoa from '../../../../app/models/pessoa';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    agrupamentoAula: "true",
    adicionarAula: "false",
    fileurl: Ember.computed('model', function(){
        return "https://res.cloudinary.com/douglaslinhares/image/upload/v1605111732/" + this.get('conteudo').get('path');
    }),
    actions: {
        urlvideoChanged(urlvideo){
            let conteudo = this.get('conteudo');
            conteudo.set('videoUrl', '');

            if (urlvideo.includes("https://vimeo.com/")){
                urlvideo = urlvideo.replace("https://vimeo.com/","");
            }
            let isnum = /^\d+$/.test(urlvideo);
            if (isnum){
                conteudo.set('videoUrl', urlvideo);
                conteudo.set('tipo', 'video');
            }
            else{
                // colocar erro (numeros ou site todo)
            }
        },
        Upload: function(event) {
            const reader = new FileReader();
            const file = event.target.files[0];

            let imageData;
            var conteudo = this.get('conteudo');
            reader.onload = (e) => {
              imageData = e.target.result;
              conteudo.set('tipo', file.type.substr(file.type.length - 3));
              conteudo.set('path', imageData);
            };
            
            if (file) {
                reader.readAsDataURL(file); //pdf to base64
            }

        },
        
        agrupamentoChanged(selectedAgrupamentoId) {
            let conteudo = this.get('conteudo');
            let agrupamento = this.get('store').peekRecord('agrupamento', selectedAgrupamentoId);
            conteudo.set('agrupamento', agrupamento);
            if (selectedAgrupamentoId != "3"){
                this.set('agrupamentoAula', 'true');
            } else{
                this.set('agrupamentoAula', 'false');
                if (conteudo.get('aulas.length') > 0){
                    conteudo.get('aulas').forEach( a => {
                        conteudo.get('aulas').removeObject(a) 
                    })
                }
            }
        },
        refreshSelectedSituacao(selectedSituacao) {
            let conteudo = this.get('conteudo');
            if (selectedSituacao == "true"){ conteudo.set('situacao', true); }
            if (selectedSituacao == "false"){ conteudo.set('situacao', false); }
        },
        refreshSelectedTema(selectedTemaId) {
            let conteudo = this.get('conteudo');
            let tema = this.get('store').peekRecord('tema', selectedTemaId);
            conteudo.set('tema', tema);
        },
        publicoChanged(selectedPublicoId) {
            let conteudo = this.get('conteudo');        
            let publico = this.get('store').peekRecord('publico', selectedPublicoId);
            
            if (conteudo.get('publicos.length') > 0){
                conteudo.get('publicos').forEach( p => {
                    if (p.id == publico.id){
                        conteudo.get('publicos').removeObject(p)
                    } else{
                        conteudo.get('publicos').pushObject(publico);
                    }
                });
            } else{
                conteudo.get('publicos').pushObject(publico);
            }
        },
        addAulas(){
            this.set('adicionarAula', "true");
        },
        removeAula(aulacadastrada){
            let conteudo = this.get('conteudo');
            conteudo.get('aulas').removeObject(aulacadastrada);
        },
        removePath() {
            let conteudo = this.get('conteudo');                    
            if (conteudo.get('path')){
                conteudo.set('path', null)
                conteudo.set('tipo', null)
            }
        },
       
    }
});