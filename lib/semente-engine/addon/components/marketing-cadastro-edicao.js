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
           this.set('showProcessing', true);
            const reader = new FileReader();
            const file = event.target.files[0];
            let imageData;
            var mkt = this.get('model');
            reader.onload = (e) => {
                imageData = e.target.result;
                this.send('ResizeImage', [file, imageData, mkt]);
                this.set('showProcessing', false);
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
       
        Upload: function (event) {
            this.set('errorFile', false);
            const files = event.target.files;
            let imageData;
            var arquivos = this.get('model.arquivos');
            let that = this;
            for (var i = 0, file; file = files[i]; i++) {
                that.set('uploadingFile', true);
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
                                that.set('uploadingFile', false);
                            } else{
                                setTimeout(() => {
                                    that.set('uploadingFile', false);
                                    that.set('errorFile', true);    
                                }, 10);
                                
                            }
                        }
                    };
                })(file, this.get('store'));
                if (file) reader.readAsDataURL(file); //file to base64
            }
            this.set('errorMsg', '');
        },
        refreshSelectedArea(selectedAreaId) {
            this.send('removeErrorTag');
            let selectedArea = this.get('store').peekRecord('area-marketing', selectedAreaId);
            this.get('model').set('area', selectedArea);
            this.set('errorMsg', '');
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
            this.set('missingFile', false);
            this.set('missingCover', false);
            // verifica "em brancos"
            let inputs = document.getElementsByClassName('j-validate');
            let list = Array.from(inputs);
            list.forEach(input => {
                if (input.value == '') {
                    input.closest('.form-group__container').querySelector('.form__msg').classList.add("form__msg--is-show");
                    this.set('errorMsg', 'Parece que algum campo não foi preenchido, por favor revise')
                    } else {
                        // verifica "se tem arquivo"
                        let arquivos = item.get('arquivos');
                        if (arquivos.get('length') == 0) {
                            setTimeout(() => {
                                this.set('missingFile', true);
                            }, 10);
                            this.set('errorMsg', 'Por favor, insira pelo menos um arquivo no item');
                        } else {
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
                                            
                                        });
                                    })
                                }).catch(function (error) {
                                    this.set('errorMsg', 'Ocorreu um erro. Por favor, tente novamente em instantes.')
                                });
                            } else {
                                // erro, falta uma capa pro item de marketing!
                                setTimeout(() => {
                                    this.set('missingCover', true);
                                }, 10);
                                this.set('errorMsg', 'Por favor, escolha uma capa para o item')
                            }
                        }
                    }

            })
            
            
        },

        removeErrorTag() {
            let target = event.target;
            target.closest('.form-group__container').querySelector('.form__msg').classList.remove("form__msg--is-show");
            if (target.value != '') {
                this.set('errorMsg', '');
            }
        }

    },
    init: function () {
        this._super();
    },
});