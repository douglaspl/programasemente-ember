import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function () {
  // Define your engine's route map here
  this.route('index', {
    path: '/'
  });
  this.route('profile', function() {
    this.route('review', { path: '/review/:pessoa_id' });
    this.route('index', { path: '/:pessoa_id'});
  });
  this.route('aulas', function() {
    this.route('content', { path: '/content/:aula_id' });
    this.route('bibliotecaindex', { path: '/bibliotecaindex' });
    this.route('acompanhamento', function() {
      this.route('plataforma', { path: '/' });
      this.route('ead', { path: '/ead' });
      this.route('persondetails', {
        path: '/persondetails/:pessoa_id'
      }, function () {});
    });
    this.route('index', { path: '/'});
  });
  this.route('conteudos', function() {
    this.route('create', { path: '/create/' });
    this.route('edit', { path: '/edit/:conteudo_id' });
    this.route('index', { path: '/'});
  });
  this.route('marketing', function() {
    this.route('create', { path: '/create/' });
    this.route('filter', { path: '/filter/' });
    this.route('edit', { path: '/edit/:marketing_id' });
    this.route('index', { path: '/'});
  });
  this.route('modulos', function () {
    this.route('modlist', {
      path: '/modlist/:modulo_id'
    }, function () {});
    this.route('modetails', {
      path: '/modetails/:modulo_id'
    }, function () {
      this.route('ativdetails', {
        path: '/:atividade_id'
      }, function () {
        this.route('secdetails', {
          path: '/:secao_id'
        }, function () {});
        this.route('transitions', {
          path: '/transitions/:secao_id'
        }, function () {});
      });
    });
  });
  this.route('biblioteca', {
    path: '/biblioteca'
  });
  this.route('administracao', function () {
    this.route('admdata', {
      path: '/admdata'
    }, function () {});
    this.route('persondetails', {
      path: '/persondetails/:pessoa_id'
    }, function () {});
    this.route('moddata', function () {});
  });
  this.route('gersistema', function () {
    this.route('gerdata', function () {});
  });
  this.route('uploader');
  // !for styleguide propouse only
  this.route('styleguide');
  // /for styleguide propouse only
});
