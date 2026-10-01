// Extrai a mensagem de um erro do ember-data vindo da API (BadRequest("...") do Web API chega como
// errors[0].detail = '{"Message":"..."}'); se não der, devolve a mensagem padrão
export default function mensagemDeErroApi(erro, padrao) {
    let detalhe = erro && erro.errors && erro.errors[0] && erro.errors[0].detail;
    if (!detalhe) return padrao;
    try {
        let corpo = typeof detalhe === 'string' ? JSON.parse(detalhe) : detalhe;
        return (corpo && (corpo.Message || corpo.message)) || padrao;
    } catch (e) {
        return typeof detalhe === 'string' ? detalhe : padrao;
    }
}
