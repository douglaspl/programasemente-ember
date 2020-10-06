import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function () {
  // Define your engine's route map here
  this.route('index', {
    path: '/'
  });
  this.route('aulas', function() {
    this.route('content', { path: '/content/:aula_id' });
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
