import Ember from 'ember';

export default Ember.Component.extend({
    tagName: '',
    store: Ember.inject.service(),
    areas: Ember.computed('model', function () {
        return this.get('store').peekAll('area-marketing')
    }),
    image: ['png', 'jpg', 'jpeg'],
    capa: Ember.computed('model', function () {
        debugger;
        let files = this.get('model.arquivos');
        let image = this.get('image');
        if (files.get('length') > 0) {
            let verify = files.mapBy('tipo').some(t => image.includes(t));
            if (verify){
                let capa = files.filter(f => image.includes(f.get('tipo'))).get('firstObject');
                this.get('model').set('capa', capa.get('url'));
                this.get('model').set('capaName', capa.get('name'));
                return capa
            }
        }
    }).property('model.arquivos.[]'),

    actions: {
        Upload: function (event) {
            const files = event.target.files;
            let imageData;
            var arquivos = this.get('model.arquivos');
            for (var i = 0, file; file = files[i]; i++) {
                const reader = new FileReader();
                reader.onload = (function (f, store) {
                    return function (e) {
                        if (!arquivos.mapBy('name').includes(f.name)){
                            imageData = e.target.result;
                            var newArquivo = store.createRecord('arquivo', {
                                url: imageData,
                                name: f.name,
                            })
                            newArquivo.set('tipo', f.type.split('/')[1].replace('+xml', '').replace('postscript', 'ai'))
                            arquivos.pushObject(newArquivo);
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
            if (arquivo.get('id') != null) arquivo.save(); // remove do banco (desvincula) e da Azure
        },
        saveItem(item) {
            let arquivos = item.get('arquivos');
            let capa = this.get('capa');
            let that = this;
            // salva item de mkt
            if (capa){
                item.save().then(function () { 
                    debugger;
                    arquivos.forEach(arquivo => {
                        debugger;
                        // salva arquivos de mkt
                        arquivo.save().then(function () {
                            debugger;
                            that.transitTo();
                        }).catch(function (error) {
                            debugger;
                        });
                    })
                }).catch(function (error) {
                    debugger;
                });
            } else {
                // erro, falta uma capa pro item de marketing!
                debugger;
            }
        },
    },
    init: function () {
        this._super();
    },
});