import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
    // Erros da API em JSON simples ({ mensagem, codigo } ou { Message }) chegam ao Ember Data 2.16
    // como "[object Object]"; aqui viram um erro JSON:API com a mensagem em `detail`, que
    // utils/mensagem-erro-api já sabe ler. Payloads JSON:API (com `errors`) seguem como antes.
    normalizeErrorResponse(status, headers, payload) {
        if (payload && typeof payload === 'object' && !payload.errors) {
            let mensagem = payload.mensagem || payload.Mensagem || payload.message || payload.Message;
            if (typeof mensagem === 'string' && mensagem.trim()) {
                return [{
                    status: `${status}`,
                    title: 'The backend responded with an error',
                    detail: mensagem,
                    code: payload.codigo || payload.Codigo
                }];
            }
        }
        return this._super(...arguments);
    }
});
