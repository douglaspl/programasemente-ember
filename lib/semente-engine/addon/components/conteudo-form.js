import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
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
    tnName: Ember.computed('', function () {
        if (this.get('conteudo.thumbnail').includes("Thumbnail_")){
            let index = this.get('conteudo.thumbnail').indexOf("Thumbnail_");
            let s = this.get('conteudo.thumbnail').substring(index + 10);
            return s
        } else return this.get('conteudo.filename')
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
                conteudo.set('tipo', 'Video');
                this.set('inputCapa', "false");
                conteudo.set('path', null);
                conteudo.set('tipo', null);
                $('#file-selector').val(null);
            }
            else{
                this.set('inputCapa', "true");
                // colocar erro (numeros ou site todo)
            }
        },
        // Upload: function(event) { // tentativa falha para subir arquivos grandes
        //     $("#message-processing").text("Processando...");
        //     const file = event.target.files[0];            
        //     const filesBlobs = document.getElementById("filesBlobs");
        //     var conteudo = this.get('conteudo');
        //     const object = document.createElement("object");
        //     // object.style = "display:none;";
        //     object.data = URL.createObjectURL(file);
        //     object.height = 60;
        //     let that = this;
        //     object.onload = function() {
        //         let fileUrl = this.data;
                
        //         if (file.type.includes('jpeg') || file.type.includes('png')) {
        //             conteudo.set('tipo', 'Imagem');
        //             that.set('inputCapa', "false");
        //             that.send('ResizeImage', [file, fileUrl, conteudo]);
        //         } else if (file.type.includes('pdf')) {
        //             conteudo.set('tipo', 'Documento');
        //             that.set('inputCapa', "true");
        //             conteudo.set('filename', file.name);
        //             conteudo.set('path', fileUrl);
        //         }
                
        //         debugger;
        //         var xhr = new XMLHttpRequest();
        //         xhr.open('GET', fileUrl, true);
        //         xhr.responseType = 'blob';
        //         xhr.onload = function(e) {
        //             debugger;
        //             if (this.status == 200) {
        //                 var myBlob = this.response;
        //                 // myBlob is now the blob that the object URL pointed to.
        //                 const array = myBlob.arrayBuffer();
        //                 const stream = myBlob.stream();
        //                 // conteudo.set('path', myBlob);

        //             }
        //         };
        //         xhr.send();

        //         conteudo.set('videoUrl', '');
        //         $("#message-processing").text("");
        //     }
        //     // URL.revokeObjectURL(this.data);
        //     filesBlobs.appendChild(object);
        // },
        Upload: function(event) {
            $("#message-processing").text("Processando...");
            const reader = new FileReader();
            const file = event.target.files[0];            
            let imageData;
            var conteudo = this.get('conteudo');
            reader.onload = (e) => {
                imageData = e.target.result;
                if (file.size < 6000000){
                    if (file.type.includes('jpeg') || file.type.includes('png')) {
                        conteudo.set('tipo', 'Imagem');
                        this.set('inputCapa', "false");
                        this.send('ResizeImage', [file, imageData, conteudo]);
                    } else if (file.type.includes('pdf')) {
                        conteudo.set('tipo', 'Documento');
                        this.set('inputCapa', "true");
                        conteudo.set('filename', file.name);
                        conteudo.set('path', imageData);
                    }
                    conteudo.set('videoUrl', '');
                    $("#message-processing").text("");
                } else{
                    conteudo.set('path', null);
                    conteudo.set('tipo', null);
                    $('#file-selector').val(null);

                    $("#message-processing").text("O arquivo deve ter no máximo 6MB.");
                }
            };
            if (file) {
                reader.readAsDataURL(file); //pdf to base64
            }
        },
        UploadCapa: function(event) {
            $("#message-processing-capa").text("Processando...");
            const reader = new FileReader();
            const file = event.target.files[0];
            let imageData;
            var conteudo = this.get('conteudo');
            reader.onload = (e) => {
                imageData = e.target.result;
                this.send('ResizeImage', [file, imageData, conteudo]);
                $("#message-processing-capa").text("");
            };
            if (file) {
                reader.readAsDataURL(file); //pdf to base64
            }
        },
        ResizeImage: function(params) {
            var img = document.createElement("img");
            var canvas = document.createElement("canvas");
            img.src = params[1];
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var MAX_WIDTH = 200;
            var MAX_HEIGHT = 200;
            var width;
            var height;
            img.onload = function () { 
                width = img.width;
                height = img.height;
            
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
                var base64resized = canvas.toDataURL(params[0].type);
                let cont = params[2];
                debugger;
                if (cont.get('tipo') == 'Imagem'){
                    cont.set('path', base64resized);
                    cont.set('filename', params[0].name);
                } else{
                    cont.set('thumbnail', base64resized);
                    cont.set('thumbnailname', params[0].name);
                }
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
        removePath() {
            let conteudo = this.get('conteudo');
            if (conteudo.get('path')){
                conteudo.set('path', null)
                conteudo.set('tipo', null)
                $('#file-selector').val(null);
            }
        },
        removePathCapa() {
            let conteudo = this.get('conteudo');                    
            if (conteudo.get('thumbnail')){
                conteudo.set('thumbnail', null);
                conteudo.set('thumbnailname', null);
                $('#file-selector-capa').val(null);
            }
        },
        // Aulas
        addAulas(){
            this.set('adicionarAula', "true");
        },
    }
});