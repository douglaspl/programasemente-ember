import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    
    situacaoAtual: Ember.computed('conteudo', function() {
        let editStatus = this.get('editando');
        let conteudoStatus;

        if (editStatus) {
            conteudoStatus = this.get('conteudo.situacao'); 
            return conteudoStatus
        } else {
            return true;
        }
    }),
    
    agrupamentoAula: "true",
    adicionarAula: "false",
    segmentos: Ember.computed('', function () {
        return this.get('store').peekAll('segmento');
    }),
    anos: Ember.computed('', function () {
        return this.get('store').peekAll('plataforma-ano').filterBy('segmento.id', this.get('selectedSegmentoId'));
    }).property('selectedSegmentoId'),
    aulas: Ember.computed('', function () {
        return this.get('store').peekAll('aula').filterBy('plataformaAno.id', this.get('selectedAnoId'));
    }).property('selectedAnoId'),
    capa: Ember.computed('conteudo', function () {
        if (this.get('conteudo.thumbnail') != null) return this.get('conteudo.thumbnail');
        if (this.get('conteudo.tipo') == "Imagem"){
            this.send('ResizeImage', this.get('conteudo.path'), this.get('conteudo'));
        }
    }).property('conteudo.path','conteudo.thumbnail', 'conteudo.thumbnailname', 'conteudo.tipo'),
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
                conteudo.set('tipo', 'Video');
                conteudo.set('path', null);
                conteudo.set('arquivoUrl', null);
            }
            else{
                // colocar erro (numeros ou site todo)
            }
        },

        Upload: function(event) {
            $("#message-processing").text("Processando...");
            const file = event.target.files[0];
            if (file){
                this.get('conteudo').set('filename', file.name);
                this.get('conteudo').set('path', file);
                if (file.type.includes('jpeg') || file.type.includes('png')) {
                    this.get('conteudo').set('tipo', 'Imagem');
                    this.send('ResizeImage', file, this.get('conteudo'));
                } else if (file.type.includes('pdf')) {
                    this.get('conteudo').set('tipo', 'Documento');
                }
                this.get('conteudo').set('videoUrl', '');
            }
            $("#message-processing").text("");
        },
        UploadCapa: function(event) {
            this.set('showProcessing', true);
            $("#message-processing-capa").text("Processando...");
            const file = event.target.files[0];

            if (file) this.send('ResizeImage', file, this.get('conteudo'));
            $("#message-processing-capa").text("");
            this.set('showProcessing', false);
        },
        ResizeImage: function(file, conteudo) {
            var img = document.createElement("img");
            var canvas = document.createElement("canvas");
            img.src = URL.createObjectURL(file);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var MAX_WIDTH = 200;
            var MAX_HEIGHT = 200;
            img.onload = function () {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                var base64resized = canvas.toDataURL(file.type);
                conteudo.set('thumbnail', base64resized);
                conteudo.set('thumbnailname', file.name);
            }
        },
        agrupamentoChanged(selectedAgrupamentoId) {
            let conteudo = this.get('conteudo');
            let agrupamento = this.get('store').peekRecord('agrupamento', selectedAgrupamentoId);
            conteudo.set('agrupamento', agrupamento);
            if (agrupamento.get('idx') != "3"){
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
            if (conteudo.get('publicos').mapBy('id').includes(selectedPublicoId)){
                conteudo.get('publicos').removeObject(publico);
            } else{
                conteudo.get('publicos').pushObject(publico);
            }
        },
        removePath() {

            document.getElementById("arqConteudo").classList.remove('fadeInLeftShort');
            document.getElementById("arqConteudo").classList.add('fadeOutRightShort');

            setTimeout(() => {
                if (this.get('conteudo.thumbnailname') == this.get('conteudo.filename')) {
                    this.get('conteudo').set('thumbnail', null);
                    this.get('conteudo').set('thumbnailname', null);
                }
                if (this.get('conteudo').get('path')) {
                    this.get('conteudo').set('path', null);
                    this.get('conteudo').set('arquivoUrl', null);
                    this.get('conteudo').set('filename', null);
                    this.get('conteudo').set('tipo', null);
                }
            }, 500);

        },
        removePathCapa() {
            document.getElementById("arqCapa").classList.remove('fadeInLeftShort');
            document.getElementById("arqCapa").classList.add('fadeOutRightShort');

            setTimeout(() => {
                if (this.get('conteudo').get('thumbnail')){
                    this.get('conteudo').set('thumbnail', null);
                    this.get('conteudo').set('thumbnailname', null);
                }
            }, 500);

        },
        // Aulas
        addAulas(){
            this.set('adicionarAula', "true");
        },
    }
});