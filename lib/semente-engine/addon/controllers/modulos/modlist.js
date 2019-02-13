import Controller from '@ember/controller';

export default Controller.extend({
  appstate: Ember.inject.service(),
  button_enter: Ember.computed('model', 'appstate.upState', function () {
    if (this.get('appstate.upState') === 0) this.get('appstate').updateApp();
    if (window.innerWidth > 900) window.scroll(0, 0);
    let data = this.get('appstate').getItem('modulos', this.get('model.id'));
    if (data) {
      if (data.percent === 0) return 'Iniciar';
      else if (data.percent === 100) return 'Rever';
      else return 'Continuar';
    } else return 'Falha';
  }),
  moduloPercent: Ember.computed('model', 'appstate.upState', function () {
    if (this.get('appstate.upState') === 0) this.get('appstate').updateApp();
    let data = this.get('appstate').getItem('modulos', this.get('model.id'));
    // Ember.run.once(function() {
    if (data) return data.percent.toFixed(0) + "%";
    else return '0'
    // });
  }),
  moduloPercentStyle: Ember.computed('model', 'appstate.upState', function () {
    if (this.get('appstate.upState') === 0) this.get('appstate').updateApp();
    let data = this.get('appstate').getItem('modulos', this.get('model.id'));
    if (data) {
      return new Ember.String.htmlSafe("width: " + data.percent.toFixed(0) + "%;");
    } else {
      return new Ember.String.htmlSafe("width: 0%;");
    }
  }),
  actions: {
    goAtividade() {
      // curso selecionado
      let course = this.get('appstate').getItem('modulos', this.get('model').get('id'));

      if (course) {
        let courseProgress = course.percent;
        let courseClasses = course.atividades;

        // curso não iniciado ou finalizado
        if (courseProgress == 0 || courseProgress == 100) {
          this.transitionToRoute('modulos.modetails.ativdetails.secdetails', this.get('model'),
            courseClasses[0].id,
            courseClasses[0].secoes[0].id
          );
        }
        // curso em andamento
        else {
          // procura a próxima aula em andamento
          let nextClass = courseClasses.find(function (i) {
            if (i.percent != 100) return i;
          });

          // tem próxima aula
          if (nextClass) {
            // verifica a próxima lição em andamento
            let nextLesson = nextClass.secoes.find(function (i) {
              if (i.conteudo.percent != 100) return i;
            });

            // tem próxima lição
            if (nextLesson) {
              // conteúdo do tipo: quiz
              if (nextLesson.conteudo.type == 'quiz') {
                // verifica a próxima questão do quiz
                let nextQuestion = nextLesson.conteudo.questoes.find(function (i) {
                  if (i.respondida != true) return i;
                });

                this.transitionToRoute('modulos.modetails.ativdetails.secdetails',
                  this.get('model'),
                  nextClass.id,
                  nextLesson.id, {
                    queryParams: {
                      questao: nextQuestion.idx
                    }
                  }
                );
              }
              // conteúdo do tipo: html || vídeo
              else {
                this.transitionToRoute('modulos.modetails.ativdetails.secdetails',
                  this.get('model'),
                  nextClass.id,
                  nextLesson.id
                );
              }
            }
          }
        }
      }
    },
    goAtividadeC(id) {
      // aula selecionada
      let thisClass = this.get('appstate').getItem('atividades', id);

      // aula não iniciada ou finalizada
      if (thisClass.percent == 0 || thisClass.percent == 100) {
        this.transitionToRoute('modulos.modetails.ativdetails.secdetails',
          this.get('model'),
          id,
          thisClass.secoes[0].id
        );
      }
      // aula em progresso 
      else {
        // verifica a próxima lição em andamento
        let thisNextLesson = thisClass.secoes.find(function (i) {
          if (i.conteudo.percent != 100) return i;
        });

        // conteúdo do tipo: quiz
        if (thisNextLesson.conteudo.type == 'quiz') {
          // verifica a próxima questão do quiz
          let thisNextQuestion = thisNextLesson.conteudo.questoes.find(function (i) {
            if (i.respondida != true) return i;
          });

          this.transitionToRoute('modulos.modetails.ativdetails.secdetails',
            this.get('model'),
            id,
            thisNextLesson.id, {
              queryParams: {
                questao: thisNextQuestion.idx
              }
            }
          );
        }
        // conteúdo do tipo: html || vídeo
        else {
          this.transitionToRoute('modulos.modetails.ativdetails.secdetails',
            this.get('model'),
            id,
            thisNextLesson.id
          );
        }
      }
    },
    goToModulos() {
      this.transitionToRoute('modulos');
    },
  }
});
