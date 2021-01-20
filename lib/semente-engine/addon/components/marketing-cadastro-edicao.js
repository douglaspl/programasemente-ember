import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    areas: Ember.computed('model', function () {
        return this.get('store').peekAll('area-marketing')
    }),
    image: ['png', 'jpg', 'jpeg'],
    capa: Ember.computed('model', function () {
        // debugger;
        if (this.get('model.capa')) return this.get('model.capa');
        let files = this.get('model.arquivos');
        let image = this.get('image');
        let verify;
        if (files.get('length') > 0) {
            verify = files.mapBy('tipo').some(t => image.includes(t));
            if (verify){
                let capa = files.filter(f => image.includes(f.get('tipo'))).get('firstObject');
                this.get('model').set('capa', capa.get('url'));
                this.get('model').set('capaName', capa.get('name'));
                return capa;
            } 
        }
    }).property('model.arquivos.[]', 'model.capa', 'model.capaName'),

    actions: {
        UploadCapa: function(event) {
            $("#message-processing-capa").text("Processando...");
            const reader = new FileReader();
            const file = event.target.files[0];
            let imageData;
            var mkt = this.get('model');
            reader.onload = (e) => {
                imageData = e.target.result;
                this.send('ResizeImage', [file, imageData, mkt]);
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
                let mkt = params[2];
                mkt.set('capa', base64resized);
                mkt.set('capaName', params[0].name);
            }
        },
        removePathCapa() {
            var mkt = this.get('model');
            if (mkt.get('capa')){
                mkt.set('capa', null);
                mkt.set('capaName', null);
                $('#file-selector-capa').val(null);
            }
        },
        voltar() {
            this.transitTo();
        },
        Upload: function (event) {
            const files = event.target.files;
            let imageData;
            var arquivos = this.get('model.arquivos');
            for (var i = 0, file; file = files[i]; i++) {
                $("#message-processing").text("Processando...");
                const reader = new FileReader();
                reader.onload = (function (f, store) {
                    return function (e) {
                        if (!arquivos.mapBy('name').includes(f.name)){
                            imageData = e.target.result;
                            if (f.size < 6000000){
                                var newArquivo = store.createRecord('arquivo', {
                                    url: imageData,
                                    name: f.name,
                                })
                                newArquivo.set('tipo', f.type.split('/')[1].replace('+xml', '').replace('postscript', 'ai'))
                                arquivos.pushObject(newArquivo);
                                $("#message-processing").text("");
                            } else{
                                $('#file-selector').val(null);
                                $("#message-processing").text("O arquivo deve ter no máximo 6MB.");
                            }
                        }
                    };
                })(file, this.get('store'));
                if (file) reader.readAsDataURL(file); //file to base64
            }
        },
        refreshSelectedArea(selectedAreaId) {
            let selectedArea = this.get('store').peekRecord('area-marketing', selectedAreaId);
            this.get('model').set('area', selectedArea);
        },
        removeArquivo(arquivo) {
            this.get('model.arquivos').removeObject(arquivo);
            if (this.get('model.capaName') == arquivo.get('name')) {
                this.set('model.capa', null);
                this.set('model.capaName', null);
            }
            if (arquivo.get('id') != null) arquivo.save(); // remove do banco (desvincula) e da Azure
        },
        saveItem(item) {
            let arquivos = item.get('arquivos');
            let capa = this.get('capa');
            let that = this;
            // salva item de mkt
            if (capa){
                item.save().then(function () { 
                    arquivos.forEach(arquivo => {
                        // salva arquivos de mkt
                        arquivo.save().then(function () {
                            that.transitTo();
                        }).catch(function (error) {
                            // debugger;
                        });
                    })
                }).catch(function (error) {
                    // debugger;
                });
            } else {
                // erro, falta uma capa pro item de marketing!
                // debugger;
            }
        },
    },
    init: function () {
        this._super();
    },
});