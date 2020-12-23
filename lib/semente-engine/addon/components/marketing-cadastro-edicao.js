import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),
    areas: Ember.computed('model', function () {
        return this.get('store').peekAll('area-marketing')
    }),
    thumbnail: function () {
        if (this.get('model.arquivos')) {
            this.get('model.arquivos').forEach(a => {
                if (!a.get('arquivo').includes('base64')) {
                    a.set('thumb', a.get('url').replace(new RegExp("." + a.get('tipo') + '$'), '.png'));
                }
            });
        }
    }.observes('model.arquivos', 'areas').on('init'),

    actions: {
        Upload: function (event) {
            const reader = new FileReader();
            const files = event.target.files;
            const file = files[files.length - 1];

            let imageData;
            var arquivos = this.get('model.arquivos');
            reader.onload = (e) => {
                imageData = e.target.result;
                var newArquivo = this.get('store').createRecord('arquivo', {
                    arquivo: imageData,
                    name: file.name,
                })
                newArquivo.set('tipo', file.type.split('/')[1].replace('+xml', '').replace('postscript', 'ai'))
                newArquivo.set('thumb', imageData);
                arquivos.pushObject(newArquivo);
            };

            if (file) {
                reader.readAsDataURL(file); //file to base64
            }
        },
        refreshSelectedArea(selectedAreaId) {
            let selectedArea = this.get('store').peekRecord('area-marketing', selectedAreaId)
            this.get('model').set('area', selectedArea);
        },
        removeArquivo(arquivo) {
            this.get('model.arquivos').removeObject(arquivo);
            arquivo.save();
        },
        saveItem(item) {
            let arquivos = item.get('arquivos');
            let that = this;
            item.save().then(function (item) { // marketing/{id}
                arquivos.forEach(arquivo => {
                    arquivo.set('marketing', item);
                    arquivo.save().then(function () {
                        that.transitTo();
                    }).catch(function (error) { }); // arquivo/{id}
                })
            }).catch(function (error) { });
            // arquivos.invoke('save');
        },
    },
    init: function () {
        this._super();
    },
});