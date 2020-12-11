# programasemente-ember

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd semente-web-app`
* `npm install`

## Running / Development

* In windows, config your c:/windows/system32/drivers/etc/hosts file adding the following line: 127.0.0.1 porto.com
* `ember serve`
* Visit your app at [http://porto.com:4200](http://porto.com:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

### Publish to Heroku

Instrucoes em (http://www.programwitherik.com/deploy-your-ember-application-to-heroku/)

(UPDATE: 22/10/2018)- Utilizando agora outro buildpack porque aparentemente este do link acima não está mais deployando com sucesso no Heroku. O que está sendo utilizado agora é este: https://github.com/heroku/heroku-buildpack-emberjs

* Instalar ferramentas Heroku: https://devcenter.heroku.com/articles/heroku-cli#download-and-install (1vez)
* Usar Login Semente para o Heroku: douglas.linhares@sementeuniversidades.com.br (Semente123@)
* Setar o remoto heroku para o git:  heroku git:remote -a protected-brushlands-26383 (1vez)
* Configurar ambiente de desenvolvimento: heroku config:set EMBER_ENV=development (1vez)
* Push: git push heroku master  (Sempre que for publicar)
