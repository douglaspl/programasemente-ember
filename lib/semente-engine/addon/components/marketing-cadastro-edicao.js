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
    image: ['png', 'jpg', 'jpeg'],
    capa: Ember.computed('model', function () {
        if (this.get('model.capa') != null) return this.get('model.capa');
        let files = this.get('model.arquivos');
        let image = this.get('image');
        if (files.get('length') > 0) {
            let verify = files.mapBy('tipo').some(t => image.includes(t));
            if (verify){
                let capa = files.filter(f => image.includes(f.get('tipo'))).get('firstObject');                              
                this.send('ResizeImage', capa.get('url'), this.get('model'));
            } 
        }
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
                that.set('percentage', " " + 100*(this.readyState/this.DONE) + " %");
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
            $("#message-processing-capa").text("Processando...");
            const file = event.target.files[0];
            this.send('ResizeImage', file, this.get('model'));
            $("#message-processing-capa").text("");
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
        voltar() {
            this.transitTo("");
        },
        Upload: function (event) {
            const files = event.target.files;
            var arquivos = this.get('model.arquivos');
            for (var i = 0, file; file = files[i]; i++) {
                $("#message-processing").text("Processando...");
                if (!arquivos.mapBy('name').includes(file.name)){
                    arquivos.pushObject(
                        this.get('store').createRecord('arquivo', {
                            url: file,
                            name: file.name,
                            tipo: file.type.split('/')[1].replace('+xml', '').replace('postscript', 'ai')
                        })
                    );
                    $("#message-processing").text("");
                }
            }
        },
        refreshSelectedArea(selectedAreaId) {
            let selectedArea = this.get('store').peekRecord('area-marketing', selectedAreaId);
            this.get('model').set('area', selectedArea);
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
            let arquivos = item.get('arquivos');
            let capa = this.get('capa');
            let that = this;
            if (capa){
                this.set('salvarbutton','Aguarde...');
                item.save().then(function () { 
                    arquivos.forEach(arquivo => {
                        // salva arquivos de mkt
                        that.sendFile(arquivo).then(function(){
                            arquivo.save().then(function () {
                                that.transitTo(arquivo.get('marketing.area.id'));
                            }).catch(function (error) {
                                that.set('alterar_savebutton','Salvar');
                            });

                        }).catch(function (error) {
                            that.set('alterar_savebutton','Salvar');
                        });
                    })
                }).catch(function (error) {
                    that.set('alterar_savebutton','Salvar');
                });
            } else {
                // erro, falta uma capa pro item de marketing!
            }
        },
    },
    init: function () {
        this._super();
    },
});