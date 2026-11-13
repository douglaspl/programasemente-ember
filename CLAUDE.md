# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## O que é este projeto

`semente-web-app` (internamente chamado de **"admin"**) é o **segundo front** da Semente Educação
(empresa brasileira de aprendizagem socioemocional para escolas). Sua existência se dá
**exclusivamente** para ser a área administrativa dos usuários do front principal, o
**"plataforma-s"** (repo irmão em `C:\Trabalho\_repositorios\plataforma-s` — consulte o
`.claude/CLAUDE.md` de lá para entender o domínio de negócio, modelo de dados de medição
socioemocional, competências/`comp`/`dominio` etc.).

Este front (admin) dá acesso a:
- **Gestão de usuários** — turmas, anos letivos, instituições, cadastro/edição em lote de pessoas
  (rotas `administracao`, `gerdata`, `gersistema`) — usado por **gestores de escola** e pelo
  **time Semente**.
- **Conteúdos** — aulas, módulos, materiais/biblioteca (rotas `aulas`, `modulos`, `conteudos`,
  `biblioteca`) — uso exclusivo do **time Semente**.
- **Marketing** — peças e materiais de divulgação (rota `marketing`) — uso exclusivo do
  **time Semente**.

Conforme observado no `CLAUDE.md` do `plataforma-s`: cada **usuário** pode ter até 2 `pessoa`s
associadas — uma para a plataforma-s e outra para este Admin — porque os dois sistemas têm bases de
identidade distintas. O papel **Gestor** na plataforma-s é o único perfil de escola com acesso a
este Admin; os demais perfis daqui (acesso mais amplo, a todas as áreas) são do time Semente.

É uma **aplicação Ember.js 2.16 legada** (pré-Octane: componentes clássicos,
`Ember.Object.extend()`, `DS.Model`, `.get()`/`.set()`), não Ember moderno — mais antiga que o
`plataforma-s` (que já está em Ember 3.28). Siga os padrões existentes ao editar — não introduza
classes/decorators estilo Octane nem componentes glimmer.

## Comandos

- `npm install` — instala as dependências
- `ember serve` — roda o servidor de desenvolvimento. Antes, adicione `127.0.0.1 porto.com` ao
  arquivo de hosts (`C:\Windows\System32\drivers\etc\hosts` no Windows) e acesse
  `http://porto.com:4200`. O app está fixado em `config/environment.js` para esperar esse host em
  `development`.
- `ember test` / `ember test --server` — roda a suíte de testes QUnit (via testem/Chrome headless)
- `ember build` — build de desenvolvimento; `ember build --environment production` — build de produção
- `ember generate <blueprint> <name>` — gera rotas/componentes/etc. (nota: a maior parte do código
  novo deve ser gerada *dentro de* `lib/semente-engine`, não em `app/` — ver Arquitetura abaixo)
- O lint é feito via `ember-cli-eslint` (roda junto com `ember test`/`ember serve`), configurado em
  `.eslintrc.js` (`eslint:recommended`, módulos ES2017, ambiente browser)

Não há scripts separados `npm run lint`/`npm test` definidos em `package.json` — use diretamente os
comandos `ember` acima.

## Arquitetura

Este app é dividido em uma casca fina (`app/`) e uma grande **Ember Engine embutida no repositório**
(`lib/semente-engine/`) que contém quase todas as rotas, controllers, templates e componentes reais.
Ao procurar onde uma funcionalidade está implementada, olhe primeiro na engine.

- `app/router.js` define apenas `login`, `autoregister` e `webapp`. A rota `webapp` monta a engine:
  `this.route('webapp', function() { this.mount('semente-engine', {path: '/'}); })`.
- `lib/semente-engine/addon/routes.js` define a árvore de rotas real da aplicação (aulas, modulos,
  conteudos, acompanhamento, administracao, gerdata, gersistema, marketing, biblioteca, profile,
  uploader, styleguide, etc.) — é aqui que está quase toda a funcionalidade voltada ao usuário.
- A engine é carregada de forma lazy (`lazyLoading: { enabled: true }` em
  `lib/semente-engine/index.js`) e compartilha os serviços `store` e `session` com o app hospedeiro
  (`dependencies.services` em `lib/semente-engine/addon/engine.js`).
- Os models (`app/models/*.js`), o adapter da API (`app/adapters/application.js`), os authenticators
  e os authorizers ficam no nível do **app hospedeiro** (compartilhados com a engine via DI), enquanto
  rotas/controllers/templates/componentes ficam na **engine**.
- `app/components`, `app/helpers` etc. no nível do hospedeiro estão praticamente vazios — a
  biblioteca real de componentes/helpers fica em `lib/semente-engine/addon/components` e
  `lib/semente-engine/addon/helpers`.

### Backend / API

- O backend é uma API ASP.NET separada (fora deste repositório), consumida via `DS.JSONAPIAdapter`
  (`app/adapters/application.js`). Os endpoints de cada ambiente são definidos em
  `config/environment.js` (`ENV.APP.host` / `ENV.APP.namespace`): produção/homolog apontam para
  `https://semente-api*.azurewebsites.net/api/v0`, desenvolvimento espera uma API local em
  `https://localhost:44300`.
- Nomes de models em português com plurais irregulares são registrados via `ember-inflector` em
  `app/adapters/application.js` (ex.: `instituicao` → `instituicoes`, `questao` → `questoes`).

### Autenticação

- Usa `ember-simple-auth` + `ember-simple-auth-token` (JWT).
- `app/authenticators/auth.js` sobrescreve o token authenticator para enviar as credenciais via POST
  form-encoded (`UserName`/`password`/`grant_type=password`/`KeepLogged`) em vez de JSON, contra o
  `serverTokenEndpoint` definido em `config/environment.js`.
- `app/authorizers/author.js` e `app/adapters/application.js` anexam de forma independente o header
  `Authorization: Bearer <token>` a partir de `session.data.authenticated.access_token`; o adapter
  também envia um header `pessoaid` lido de `localStorage.person_logged`. Mantenha os dois
  sincronizados caso a lógica de autenticação/sessão seja alterada.
- Rotas autenticadas usam `AuthenticatedRouteMixin`; `app/routes/application.js` redireciona com base
  na detecção de IE e no estado da sessão.
- As verificações de autorização/papel do usuário (admin, professor, aluno, etc.) são feitas via o
  atributo `pessoa.role` do model e o helper de template `compareRole`
  (`lib/semente-engine/addon/helpers/compareRole.js`), não por guardas no nível de rota — espere
  encontrar as verificações de papel embutidas em templates/componentes, e não nas rotas.

## Trabalhando neste codebase

- Este é Ember legado: use `import Ember from 'ember'`, `Ember.Object.extend()`/`Component.extend()`,
  `Ember.inject.service()`, `.get('prop')`/`.set('prop', v)`, `Ember.computed(...)`,
  `DS.Model.extend()` — não converta para classes nativas nem para decorators `@tracked`/`@action`.
- Os nomes de models e rotas do domínio estão em português (seguindo o domínio do negócio: `pessoa`,
  `turma`, `instituicao`, `aula`, `modulo`, `atividade`, `secao`, `matricula`, etc.) — mantenha o
  código novo consistente com essa nomenclatura em vez de traduzir para inglês.
- Ao adicionar uma nova rota/controller/template/componente, adicione em
  `lib/semente-engine/addon/` e registre a rota em `lib/semente-engine/addon/routes.js`, não em
  `app/`.
