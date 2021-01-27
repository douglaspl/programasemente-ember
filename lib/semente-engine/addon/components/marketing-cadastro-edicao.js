import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Component.extend({
    tagName: '',
    envnmt: ENV.APP,
    session: Ember.inject.service('session'),
    salvarbutton: Ember.computed('model', function () {
        if (this.editando) return 'Salvar edição';
        else return 'Cadastrar item';
    }).property('alterar_savebutton'),
    store: Ember.inject.service(),
    areas: Ember.computed('model', function () {
        return this.get('store').peekAll('area-marketing')
    }),
    image: ['image/png', 'image/jpeg'],
    capa: Ember.computed('model', function () {
        let files = this.get('model.arquivos');
        let image = this.get('image');
        if (files.get('length') > 0) {
            let verify = files.mapBy('tipo').some(t => image.includes(t));
            if (verify){
                let capa = files.filter(f => image.includes(f.get('tipo'))).get('firstObject');                              
                this.send('ResizeImage', capa.get('url'), this.get('model'));
            } 
        }
        if (this.get('model.capa') != null) return this.get('model.capa');
    }).property('model.arquivos.[]','model.capa', 'model.capaName'),
    
    sendFile(arquivo){
        let tok = this.get('session.data').authenticated.access_token;
        let temp = 'Bearer ';
        let userToken = temp.concat(tok);
        let final_url = this.get('envnmt.host') + '/' + this.get('envnmt.namespace') + '/arquivos/upload';
        let path = arquivo.get('marketing.area.name') + "/" + arquivo.get('marketing.titulo');
        let that = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", final_url);
            xhr.responseType = 'json';
            xhr.onreadystatechange = handler;
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=x1x2y3y4z5z6');
            xhr.setRequestHeader('Authorization', userToken);
            xhr.setRequestHeader('filename', arquivo.get('name'));
            xhr.setRequestHeader('path', path);
            xhr.setRequestHeader('container', "marketing");
            xhr.send(arquivo.get('url'));

            function handler() {
                if (this.readyState === this.DONE) {
                    if (this.status === 200 || this.status === 204) {
                        arquivo.set('url', this.response.data.attributes["url"]);
                        resolve(this.response);
                    } else if (this.status === 404) {
                        reject('Server not found');
                    } else if (this.status >= 400) {
                    reject(new Error(this.response.error));
                    } else {
                    reject(new Error('Failure from server call: [' + this.status + ']'));
                    }
                }
            }
        });
    },
    actions: {
        UploadCapa: function(event) {
            this.set('showProcessing', true);
            $("#message-processing-capa").text("Processando...");
            const file = event.target.files[0];
            this.send('ResizeImage', file, this.get('model'));
            $("#message-processing-capa").text("");
            this.set('showProcessing', false);
        },
        ResizeImage: function(file, marketing) {
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
                marketing.set('capa', base64resized);
                marketing.set('capaName', file.name);
            }
        },
        removePathCapa() {
            if (this.get('model.capa')){
                this.get('model').set('capa', null);
                this.get('model').set('capaName', null);
            }
        },
       
        Upload: function (event) {
            this.set('errorFile', false);
            const files = event.target.files;
            var arquivos = this.get('model.arquivos');
            for (var i = 0, file; file = files[i]; i++) {
                this.set('uploadingFile', true);
                if (!arquivos.mapBy('name').includes(file.name)){
                    arquivos.pushObject(
                        this.get('store').createRecord('arquivo', {
                            url: file,
                            name: file.name,
                            tipo: file.type
                        })
                    );
                    this.set('uploadingFile', false);
                }
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
                this.get('model').set('capa', null);
                this.get('model').set('capaName', null);
            }
            if (arquivo.get('id') != null) arquivo.save(); //desvincula arquivo de marketing
        },
        saveItem(item) {
            this.set('missingFile', false);
            this.set('missingCover', false);
            let capa = this.get('capa');
            let that = this;
            let arquivos = item.get('arquivos');
            // verifica "em brancos"
            let inputs = document.getElementsByClassName('j-validate');
            let list = Array.from(inputs);
            list.forEach(input => {
                if (input.value == '') {
                    input.closest('.form-group__container').querySelector('.form__msg').classList.add("form__msg--is-show");
                    this.set('errorMsg', 'Parece que algum campo não foi preenchido, por favor revise')
                } else {
                    // verifica "se tem arquivo"
                    if (arquivos.get('length') == 0) {
                        setTimeout(() => {
                            this.set('missingFile', true);
                        }, 10);
                        this.set('errorMsg', 'Por favor, insira pelo menos um arquivo no item');
                    }
                }
            });

            if (capa && arquivos.get('length') > 0){
                this.set('salvarbutton','Aguarde...');
                let contador = 0;
                item.save().then(function () { 

                    arquivos.forEach(arquivo => {
                        that.sendFile(arquivo).then(function(){

                            arquivo.save().then(function () {
                                contador++;
                                if (contador == arquivos.get('length')){
                                    that.transitTo(item.get('area.id'));
                                }
                            }).catch(function (error) {
                                that.set('alterar_savebutton','Salvar');
                                that.set('errorMsg', 'Ocorreu um erro ao enviar o arquivo.');
                            });

                        }).catch(function (error) {
                            that.set('alterar_savebutton','Salvar');
                            that.set('errorMsg', 'Ocorreu um erro ao enviar o arquivo.');
                        });
                    })
                                        
                }).catch(function (error) {
                    that.set('alterar_savebutton','Salvar');
                    that.set('errorMsg', 'Ocorreu um erro. Por favor, tente novamente em instantes.')
                });
            } else {
                setTimeout(() => {
                    this.set('missingCover', true);
                }, 10);
                this.set('errorMsg', 'Por favor, escolha uma capa para o item')
            }
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