// Extrai, de forma defensiva, a mensagem pt-BR de um erro devolvido pela API .NET
// (ex.: 400 de ciclo na hierarquia de instituições), venha ele de um save do Ember Data
// (AdapterError) ou de um $.ajax (xhr). Devolve null quando não há mensagem útil,
// para o chamador decidir o texto genérico.
const TITULO_PADRAO_EMBER = 'The backend responded with an error';

function textoValido(v) {
  if (typeof v !== 'string') return null;
  let t = v.trim();
  if (!t || t.indexOf('[object') === 0 || t === TITULO_PADRAO_EMBER) return null;
  return t;
}

function mensagemDoPayload(payload) {
  if (!payload) return null;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      return textoValido(payload);
    }
    if (typeof payload === 'string') return textoValido(payload);
  }
  if (typeof payload !== 'object') return null;
  if (payload.errors && payload.errors.length) {
    let e0 = payload.errors[0] || {};
    let m = textoValido(e0.detail) || textoValido(e0.title);
    if (m) return m;
  }
  return textoValido(payload.mensagem) || textoValido(payload.Mensagem) ||
    textoValido(payload.message) || textoValido(payload.Message) || null;
}

export default function mensagemErroApi(erro) {
  if (!erro) return null;
  try {
    // xhr ($.ajax)
    let m = mensagemDoPayload(erro.responseJSON) || mensagemDoPayload(erro.responseText);
    if (m) return m;
    // AdapterError do Ember Data: errors[0].detail (JSON:API ou payload texto)
    if (erro.errors && erro.errors.length) {
      m = mensagemDoPayload({ errors: erro.errors });
      if (m) return m;
    }
    // Payload JSON não JSON:API: o Ember Data 2.16 só o preserva dentro de `message`
    // ("Ember Data Request ... returned a 400\nPayload (application/json)\n{...}")
    if (typeof erro.message === 'string') {
      let idx = erro.message.indexOf('\n', erro.message.indexOf('Payload ('));
      if (erro.message.indexOf('Payload (') >= 0 && idx >= 0) {
        m = mensagemDoPayload(erro.message.substring(idx + 1));
        if (m) return m;
      }
      if (erro.message.indexOf('Ember Data Request') !== 0) return textoValido(erro.message);
    }
  } catch (e) {
    return null;
  }
  return null;
}
