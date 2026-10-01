import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
    // Conteúdos > Agrupar: modulo.save({ adapterOptions: { atividades } }) envia as atividades e seções
    // junto com o módulo, como o atributo "atividades", para o controller de módulos da API tratar
    serialize(snapshot) {
        let json = this._super(...arguments);
        let atividades = snapshot.adapterOptions && snapshot.adapterOptions.atividades;
        if (atividades) {
            json.data.attributes = json.data.attributes || {};
            json.data.attributes[this.keyForAttribute('atividades')] = atividades.map(atividade => this._chavesApi(atividade));
        }
        return json;
    },

    // Aplica às chaves internas o mesmo formato dos demais atributos (ex.: videoId -> video-id)
    _chavesApi(valor) {
        if (Array.isArray(valor)) return valor.map(item => this._chavesApi(item));
        if (!valor || typeof valor !== 'object') return valor;
        let convertido = {};
        Object.keys(valor).forEach(chave => { convertido[this.keyForAttribute(chave)] = this._chavesApi(valor[chave]); });
        return convertido;
    }
});
