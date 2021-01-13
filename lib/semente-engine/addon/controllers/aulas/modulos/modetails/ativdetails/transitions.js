import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  notStudent: Ember.computed('model', function () {
    let str = localStorage.getItem('person_logged');
    if (str) {
      str = JSON.parse(str);
      if (str.role !== 'aluno') {
        return true;
      } else {
        return false;
      }
    }
  }),

  nomeAluno: Ember.computed(function () {
    
    let hoje = new Date();
    let stealthId = JSON.parse(localStorage.getItem('person_logged')).id + "_" + moment(hoje).format('DDMMYHHmm');
    return stealthId;
  }),

  ModuloIdx: Ember.computed('model', function () {
    let moduloid = this.get('model').get('atividade').get('modulo').get('id');
    return moduloid;
  }),
  appstate: Ember.inject.service(),
  store: Ember.inject.service(),
  appController: Ember.inject.controller('application'),
  count_action() {
    this.set('counting', true);
    let that = this;
    let x = setInterval(function () {
      let countdown = that.get('countdown') - 1;
      if (countdown === -1) {
        that.set('countdown', countdown);
        that.getOut();
        clearInterval(x);
        that.set('counting', false);
      } else if (countdown < -1) {
        clearInterval(x);
        that.set('counting', false);
      } else that.set('countdown', countdown);
    }, 1000);
    this.set('active_counter', x);
  },
  getOut() {
    document.getElementById('course-nav').style.zIndex = "2";
    let next_atividade = this.get('next_atividade');
    let proximaQuiz, proximaSecao;
    let path = window.location.pathname;
    let atividade = this.get('model').get('atividade');
    let idx = this.get('model').get('idx');
    let ultimaObrigatoria = atividade.get('secoes').filterBy('idx', idx).get('firstObject').get('ultimaObrigatoria');
    let ultimaDaAula = this.get('model').get('atividade').get('modulo').get('atividades').filterBy('idx', this.get('model').get('atividade').get('idx') + 1).get('firstObject');
    let diaAtual = new Date();
    let stringdiaAtividade = next_atividade.data.dia;
    let dataNextAtividade = new Date(stringdiaAtividade);

    if (!ultimaObrigatoria) {
      proximaSecao = atividade.get('secoes').filterBy('idx', idx + 1).get('firstObject');
      proximaQuiz = proximaSecao.get('conteudos').get('firstObject').get('quiz').get('questoes');
    }



    if (path.search('transition') > 1) {
      // verifica se tem próxima seção
      if (ultimaObrigatoria) {
        // próxima seção é a última obrigatória
        if (ultimaDaAula) {
          if (dataNextAtividade < diaAtual) {
            this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails',
              atividade.get('modulo').get('id'),
              atividade.get('modulo').get('atividades').filterBy('idx', this.get('model').get('atividade').get('idx') + 1).get('firstObject'),
              atividade.get('modulo').get('atividades').filterBy('idx', this.get('model').get('atividade').get('idx') + 1).get('firstObject').get('secoes').filterBy('idx', 1).get('firstObject').get('id')
            );
          } else {
            this.transitionToRoute('aulas.modulos.modlist', this.get('model').get('atividade').get('modulo').get('id'))
          }

        } else {
          //this.transitionToRoute('modulos');
          this.transitionToRoute('aulas.modulos.modlist', atividade.get('modulo').get('id'));
        }
      } else {
        if (proximaSecao) {
          // tem próxima seção
          if (proximaQuiz) {
            // próxima seção é quiz
            this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails',
              atividade.get('modulo').get('id'),
              atividade.get('id'),
              proximaSecao, {
                queryParams: {
                  questao: 1
                }
              });
          } else {
            // próxima seção não é a última da aula
            this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails', proximaSecao);
          }
        }
      }
    }
    /*
        if (path.search('transition') > 1) {
          if (tgt_last && !tgt_ativ) this.transitionToRoute('modulos');
          else if (tgt) this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails', tgt);
          else if (tgt_ativ) {
            if (this.get('next_section_quiz')) this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails', tgt_ativ.get('modulo').get('id'), tgt_ativ.get('id'), this.get('next_ativsec_id'), {
              queryParams: {
                questao: 1
              }
            });
            else this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails', tgt_ativ.get('modulo').get('id'), tgt_ativ.get('id'), this.get('next_ativsec_id'));
          }
        }*/
  },
  proximaSecao: Ember.observer("model", "appController.transited", function () {
    let tis = this.get('appController.transited');
    this.set('countdown', 20);
    if (this.get('counting') === true);
    else this.count_action();
    let section = this.get('model');
    let atividade = this.get('model').get('atividade');
    let modulo = atividade.get('modulo');
    let idx = section.get('idx');
    let next_section = atividade.get('secoes').filterBy('idx', idx + 1).get('firstObject');

    if (next_section) {
      this.set('next_section', next_section);
      this.set('next_section_id', next_section.id);
      if (next_section.get('conteudos').get('firstObject').get('quiz').get('id')) this.set('next_section_quiz', true);
    } else {
      this.set('next_section', '');
    }
    if (section.get('conteudos').get('firstObject').get('video').get('id')) {
      this.set('rever_video', true);
      this.set('rever_quiz', false);
    } else {
      this.set('rever_video', false);
      this.set('rever_quiz', true);
    }
    let idxA = atividade.get('idx');
    let next_atividade = modulo.get('atividades').filterBy('idx', idxA + 1).get('firstObject');
    if (next_atividade) {
      this.set('next_atividade', next_atividade);
      this.set('next_atividade_id', next_atividade.id);
      let diaAtual = new Date();
      let stringdiaAtividade = next_atividade.data.dia;
      let dataNextAtividade = new Date(stringdiaAtividade);
      if (dataNextAtividade < diaAtual) this.set('next_atividade_liberada', true);

      let liberada = next_atividade.get('liberada');
      this.set('liberada', liberada);
      let nextClass = this.get('appstate').getItem('atividades', next_atividade.get('id'));
      let nextSection = nextClass.secoes.find(element => element.conteudo.percent != 100);
      let next_ativsec_id;
      if (nextSection) {
        next_ativsec_id = nextSection.id;
      } else {
        nextSection = nextClass.secoes.find(element => element.idx == 1);
        next_ativsec_id = nextSection.id;
      }
      this.set('next_ativsec_id', next_ativsec_id);
    } else {
      this.set('next_atividade', '');
    }
  }),
  init: function () {
    this._super();
    this.get('proximaSecao');
  },
  actions: {
    reverVideo() {
      // verificar existência!!! console.err
      document.getElementById('course-nav').style.zIndex = "2";
      // -------------------------------------
      let model = this.get('model');
      this.set('countdown', 20);
      clearInterval(this.get('active_counter'));
      this.set('counting', false);
      this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails', model, {
        queryParams: {
          videoini: true
        }
      });
    },
    goNext(param1, param2, param3) {
      document.getElementById('course-nav').style.zIndex = "2";
      let model = this.get('model');
      this.set('countdown', -5);
      clearInterval(this.get('active_counter'));
      this.set('counting', false);
      if (param3 === 'section') {
        if (param2) this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails',
          model.get('atividade').get('modulo').get('id'),
          model.get('atividade').get('id'),
          param1, {
            queryParams: {
              questao: 1
            }
          });
        else this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails',
          model.get('atividade').get('modulo').get('id'),
          model.get('atividade').get('id'),
          param1);
      } else if (param3 === 'atividade') {
        this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails', model.get('atividade').get('modulo').get('id'), param1, param2);
      } else if (param3 == 'modulo') {
        //this.transitionToRoute('modulos');
        this.transitionToRoute('aulas.modulos.modlist', model.get('modulo').get('id'));
      }
    },
    goBack() {
      document.getElementById('course-nav').style.zIndex = "2";
      let model = this.get('model');
      this.set('countdown', -5);
      clearInterval(this.get('active_counter'));
      this.set('counting', false);
      this.transitionToRoute('aulas.modulos.modlist', model.get('atividade').get('modulo').get('id'))
    }
  }
});
