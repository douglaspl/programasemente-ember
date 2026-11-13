import Ember from 'ember';

// O que a pessoa logada (não admin) pode ver/fazer além do fluxo padrão de gestor:
// - escopo de conteúdos próprios: GET conteudos-proprios/gestao/escopo
//   ({ isAdmin, podeCriar, habilitado, instituicoes: [{ id, nome, paiId, nivel }] | null,
//      plataformaAnos: [{ id, nome, idx, segmentoId, segmentoNome }] | null })
// - árvore da própria instituição: GET instituicao-arvore/{instituicao_id}
//   ({ habilitado, raizId, nos: [{ id, nome, paiId, nivel, isEscola, temFilhas }] })
// Cada GET é feito uma vez por pessoa (cache pelo id do person_logged; troca de pessoa
// descarta o cache). As promises nunca rejeitam: em erro, a pessoa fica sem os acessos extras.
function pessoaLogada() {
  try {
    return JSON.parse(localStorage.getItem('person_logged')) || null;
  } catch (e) {
    return null;
  }
}

function campo(obj, nome) {
  if (!obj) return undefined;
  if (obj[nome] !== undefined) return obj[nome];
  return obj[nome.charAt(0).toUpperCase() + nome.slice(1)];
}

function normalizarNos(lista) {
  return (lista || []).map(no => ({
    id: String(campo(no, 'id')),
    nome: campo(no, 'nome') || '',
    paiId: campo(no, 'paiId') == null ? null : String(campo(no, 'paiId')),
    nivel: parseInt(campo(no, 'nivel'), 10) || 0
  }));
}

function normalizarAnos(lista) {
  return (lista || []).map(ano => ({
    id: String(campo(ano, 'id')),
    nome: campo(ano, 'nome') || '',
    idx: campo(ano, 'idx'),
    segmentoId: campo(ano, 'segmentoId') == null ? null : String(campo(ano, 'segmentoId')),
    segmentoNome: campo(ano, 'segmentoNome') || ''
  }));
}

export default Ember.Service.extend({
  store: Ember.inject.service(),

  // null enquanto não carregou
  escopoConteudos: null, // { podeCriar, instituicoes: [{ id, nome, paiId, nivel }], plataformaAnos: [...] }
  arvoreInstituicoes: null, // [{ id, nome, paiId, nivel }] com a raiz (nivel 0) no topo

  _pessoaId: null,
  _escopoPromise: null,
  _arvorePromise: null,

  podeCriarConteudos: Ember.computed('escopoConteudos', function () {
    return !!(this.get('escopoConteudos') && this.get('escopoConteudos').podeCriar);
  }),

  temInstituicoesFilhas: Ember.computed('arvoreInstituicoes', function () {
    return (this.get('arvoreInstituicoes') || []).length > 1;
  }),

  _verificarPessoa() {
    let pessoa = pessoaLogada();
    let id = pessoa ? String(pessoa.id) : null;
    if (id !== this._pessoaId) {
      this._pessoaId = id;
      this._escopoPromise = null;
      this._arvorePromise = null;
      this.setProperties({ escopoConteudos: null, arvoreInstituicoes: null });
    }
    return pessoa;
  },

  _get(caminho) {
    let adapter = this.get('store').adapterFor('application');
    let headers = adapter.get('headers') || {};
    let url = adapter.get('host') + '/' + adapter.get('namespace') + '/' + caminho;
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        headers: {
          'Accept': 'application/json',
          'Authorization': headers['Authorization'],
          'pessoaid': headers['pessoaid']
        }
      }).then(resolve, reject);
    });
  },

  // Resolve { podeCriar, instituicoes, plataformaAnos }
  carregarEscopoConteudos() {
    let pessoa = this._verificarPessoa();
    if (!pessoa) return Ember.RSVP.resolve({ podeCriar: false, instituicoes: [], plataformaAnos: [] });
    if (!this._escopoPromise) {
      let pessoaId = this._pessoaId;
      this._escopoPromise = this._get('conteudos-proprios/gestao/escopo').then(resp => {
        return {
          podeCriar: campo(resp, 'podeCriar') === true,
          instituicoes: normalizarNos(campo(resp, 'instituicoes')),
          plataformaAnos: normalizarAnos(campo(resp, 'plataformaAnos'))
        };
      }, () => {
        // erro: sem acesso extra (e permite tentar de novo depois)
        if (this._pessoaId === pessoaId) this._escopoPromise = null;
        return { podeCriar: false, instituicoes: [], plataformaAnos: [], erro: true };
      }).then(escopo => {
        if (this._pessoaId === pessoaId && !this.get('isDestroyed') && !escopo.erro) this.set('escopoConteudos', escopo);
        return escopo;
      });
    }
    return this._escopoPromise;
  },

  // Resolve a lista de nós (raiz no topo); [] em erro
  carregarArvoreInstituicoes() {
    let pessoa = this._verificarPessoa();
    if (!pessoa || !pessoa.instituicao_id) return Ember.RSVP.resolve([]);
    if (!this._arvorePromise) {
      let pessoaId = this._pessoaId;
      this._arvorePromise = this._get('instituicao-arvore/' + encodeURIComponent(pessoa.instituicao_id)).then(resp => {
        return { nos: normalizarNos(campo(resp, 'nos')) };
      }, () => {
        if (this._pessoaId === pessoaId) this._arvorePromise = null;
        return { nos: [], erro: true };
      }).then(resultado => {
        if (this._pessoaId === pessoaId && !this.get('isDestroyed') && !resultado.erro) this.set('arvoreInstituicoes', resultado.nos);
        return resultado.nos;
      });
    }
    return this._arvorePromise;
  }
});
