import Component from '@ember/component';
import Ember from 'ember';
import moment from 'moment';

export default Component.extend({
  tagName: 'div',
  sortingKey: ['idx'],
  sortedAlternativas: Ember.computed.sort('questao.alternativas', 'sortingKey'),
  respostas: [],
  store: Ember.inject.service(),
  appstate: Ember.inject.service(),
  init() {
    this._super(...arguments);
    let that = this;
    let person_read = JSON.parse(localStorage.getItem('person_logged'));
    let person = this.get('store').peekRecord('pessoa', person_read.id);
    this.set('person', person);
    let questoes = this.get('sortedQuestoes').sortBy('idx', 'DimensionName');
    let idx_atual = this.get('questao').get('idx');
    let proximo, anterior;
    proximo = idx_atual + 1;
    anterior = idx_atual - 1;
    if (questoes.filterBy('idx', anterior).get('firstObject')) {
      this.set('idx_anterior', anterior);
    }
    if (questoes.filterBy('idx', proximo).get('firstObject')) {
      this.set('idx_proximo', proximo);
    }
    Ember.run.schedule('afterRender', function () {
      let temp = Math.round(new Date().getTime() / 1000);
      that.set('init_question_time', temp);
      that.renderResposta();
    });
  },
  player_entender() {
    document.getElementById('section_scroll').style.overflow = 'visible';

    // document.getElementById('video_feedback_'  + this.get('questao').get('idx')).style.display = 'flex';
    document.getElementById('video_feedback_' + this.get('questao').get('idx')).classList.add('content--feedback--is-show');
    let options_vimeo = {
      id: this.get('set_video_id'),
      autoplay: true,
      playsinline: false,
      title: true,
      width: 720,
      height: 429
    };
    let iframe1 = document.getElementById('video-aprender_' + this.get('questao').get('idx'));
    let player_entender = new Vimeo.Player(iframe1, options_vimeo);
    let set_video_data_id = this.get('set_video_data').get('id');
    let set_video_data = this.get('store').peekRecord('estado-video-alternativa', set_video_data_id);
    if (set_video_data) {
      if (set_video_data.get('tempoAssistido') < 100) player_entender.setCurrentTime(set_video_data.get('ultimoInstante')).then(function (inst) {}).catch(function (error) {});
    }
    let that = this;
    let questao = this.get('questao');
    let idx = parseInt(questao.get('idx'));
    this.set("video_player", player_entender);
    let saved_percent = 0;
    let save_free = true;
    player_entender.on('timeupdate', function (video_data) {
      if (100 * video_data.percent > saved_percent + 5) {
        let temp = Math.round(new Date().getTime() / 1000);
        set_video_data.set('timestamp', temp);
        saved_percent = 100 * video_data.percent;
        set_video_data.set('iniciou', true);
        if (set_video_data.get('tempoAssistido') < saved_percent) set_video_data.set('tempoAssistido', saved_percent);
        if (save_free) {
          save_free = false;
          //that.get('appstate').updateApp();
          set_video_data.save().then(() => {
            save_free = true;
          }).catch(() => {
            save_free = true;
          });
        }
      }
    });
    player_entender.on('ended', function () {
      document.getElementById('section_scroll').style.overflowX = 'hidden';
      document.getElementById('section_scroll').style.overflowY = 'auto';
      let maximum = that.get('sortedQuestoes').length;
      document.getElementById('video_feedback_' + idx).classList.remove('content--feedback--is-show');
      set_video_data.set('iniciou', true);
      set_video_data.set('tempoAssistido', 100);
      set_video_data.set('completou', true);
      if (save_free) {
        save_free = false;
        that.get('appstate').updateApp();
        set_video_data.save().then(() => {
          save_free = true;
        }).catch(() => {
          save_free = true;
        });
      }
      if (idx < maximum) {
        that.goquestao(that.get('idx_proximo'));
      } else {
        that.transit();
      }
    });
  },
  renderResposta(param) {
    this.set('naoRespondida', true);
    // mostrando qual selecao o usuario fez anteriormente
    let questao = this.get('questao');
    let respondida = param;
    let correta;
    let pessoa = this.get('person');
    questao.get('alternativas').forEach(alternativa => {
      let respostas = alternativa.get('respostas');
      let resposta;
      respostas.forEach(resp => {
        if (resp.get('pessoa').get('id') == pessoa.get('id')) resposta = resp;
      });
      if (resposta) {
        if (resposta.get('timestamp')) {
          if (!respondida) respondida = alternativa.get('id');
          this.set('set_video_id', alternativa.get('videoId'));
          this.set('set_video_data', alternativa.get('estadosVideoAlternativa').get('firstObject'));
        }
      }
      if (alternativa.get('correta')) correta = alternativa.get('id');
    });
    if (respondida) {
      // let button = document.getElementById('button_next_' + questao.get('id'));
      // if (button) {
      //     button.classList.add('quiz__nav-arrows--clickable');
      //     button.disabled = false;
      // }
      this.set('naoRespondida', false);
      this.set('enable_next', true);
      questao.get('alternativas').forEach(alternativa => {
        document.getElementById('option_icon_' + questao.get('id') + '_' + alternativa.get('id')).disabled = true;
      });

      document.getElementById('option_' + questao.get('id') + '_' + respondida).classList.add('quiz__answer--user');
      document.getElementById('option_' + questao.get('id') + '_' + respondida).classList.add('tooltip--is-visible');

      document.getElementById('option_' + questao.get('id') + '_' + correta).classList.add('quiz__answer--correct');
      document.getElementById('button_' + questao.get('id') + '_' + respondida).innerHTML = 'Explicação';
      document.getElementById('button_' + questao.get('id') + '_' + respondida).disabled = false;
      let elements = document.getElementsByClassName('quiz__btn-confirm_' + questao.get('id'));

      //for (let i = 0; i < elements.length; i++) { // forEach does not work for NodeList.... cute. I like this C-style approach much better. It's raw and beautiful.
      // elements[i].style.display = 'none';
      //}
      // document.getElementById("button_mob_" + this.get('questao.id') + "_" + respondida).style.display = 'block';

      document.getElementById("button_mob_" + this.get('questao.id') + "_" + respondida).classList.add('quiz__btn-confirm--nav--is-show');
      document.getElementById("button_mob_" + this.get('questao.id') + "_" + respondida).innerHTML = 'Explicação';

    } else {
      this.set('enable_next', false);
    }
    // document.getElementById('act_nav_' + section_id).classList.remove('activity-nav__tab--actual');
    // document.getElementById('act_nav_' + section_id).classList.add('activity-nav__tab--active');
  },
  actions: {
    changeQuestion(param) {
      // let elements = document.getElementsByClassName('content_render_quiz');
      // for (let i = 0; i < elements.length; i++) {
      //     elements[i].style.display = 'none';
      // }
      // document.getElementById('article_questao_' + param).style.display = 'block';
      this.goquestao(param);
    },
    selectAnswer(param1, param2, param3) {
      if (document.getElementById("button_mob_" + this.get('questao.id') + "_" + param1).classList.contains('quiz__btn-confirm--nav--is-show') == false) {
        this.set('set_video_id', param2);
        this.set('set_video_data', param3);
        let elements = document.getElementsByClassName('quiz__btn-confirm_' + this.get('questao.id'));

        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.remove('quiz__btn-confirm--nav--is-show');
        }

        document.getElementById("button_mob_" + this.get('questao.id') + "_" + param1).classList.add('quiz__btn-confirm--nav--is-show');

        if (this.get('questao').get('tipo') === 'UmaCorreta') {
          let resp = [{
            'id': param1
          }];
          this.set('respostas', resp);
        }
      }
    },
    confirmAnswer(alternativa_escolhida) {
      let ts = this.get('questoes_timing');
      let q_idx = this.get('questao.idx');
      let item;
      if (ts.length > 0) {
        ts.forEach(t => {
          if (t.idx == q_idx) {
            item = t;
          }
        });
      }
      let t_ini = 0;
      if (item) t_ini = item.timestamp;
      let final_date = Math.round(new Date().getTime() / 1000);
      let delta_time = 0;
      if (t_ini > 0) delta_time = final_date - t_ini;
      if (document.getElementById('button_' + this.get('questao').get('id') + '_' + alternativa_escolhida).innerHTML === 'Explicação') {
        this.set('respostas', [{
          'id': alternativa_escolhida
        }]);
        let set_video_data = this.get('store').peekRecord('alternativa', alternativa_escolhida).get('estadosVideoAlternativa').get('firstObject');
        this.set('set_video_data', set_video_data);
        this.player_entender();
      } else {
        document.getElementById('button_' + this.get('questao').get('id') + '_' + alternativa_escolhida).disabled = true;
        document.getElementById('button_' + this.get('questao').get('id') + '_' + alternativa_escolhida).innerHTML = 'Aguarde...';
        let person = this.get('person');
        let temp = Math.round(new Date().getTime() / 1000);
        let that = this;
        if (this.get('questao').get('tipo') === 'UmaCorreta') {
          this.get('questao').get('alternativas').forEach(alternativa => {
            if (alternativa.id === alternativa_escolhida) {
              let obj_resposta = this.get('store').createRecord('resposta', {
                'timestamp': temp,
                'pessoa': person,
                'alternativa': alternativa
              });
              obj_resposta.save().then(() => {
                that.get('appstate').updateApp();
                let set_video_data = this.get('store').peekRecord('alternativa', alternativa_escolhida).get('estadosVideoAlternativa').get('firstObject');
                if (set_video_data.get('tempoquestao') == 0 /*&& delta_time > 0*/ ) {
                  set_video_data.set('tempoquestao', delta_time);
                  let that = this;
                  set_video_data.save().then(function () {
                    that.set('set_video_data', set_video_data);
                    that.renderResposta(alternativa_escolhida);
                    that.player_entender();
                  });
                }
              }).catch(() => {
                obj_resposta.deleteRecord();
                document.getElementById('button_' + this.get('questao').get('id') + '_' + alternativa_escolhida).disabled = false;
                document.getElementById('button_' + this.get('questao').get('id') + '_' + alternativa_escolhida).innerHTML = 'Falha! Tente novamente';
              });
            }
          });
        }
      }
    },
    closeVideo(id) {
      document.getElementById('section_scroll').style.overflowX = 'hidden';
      document.getElementById('section_scroll').style.overflowY = 'auto';
      // document.getElementById('video_feedback_'  + id).style.display = 'none';
      document.getElementById('video_feedback_' + id).classList.remove('content--feedback--is-show');
      let player = this.get("video_player");
      player.destroy();
      // player.getPaused().then(function(paused) {
      //     if (!paused) {
      //         player.pause().then(function() {
      //             player.setCurrentTime(0).then(function(inst){}).catch(function(error){});
      //         }).catch(function(error) {});
      //     }
      //     else {
      //         // player.setCurrentTime(0).then(function(inst){}).catch(function(error){}); - this is bugged, if the video is paused then it will autoplay when setcurrenttime
      //     }
      // });
      let maximum = this.get('sortedQuestoes').length;
      let questao = this.get('questao');
      let idx = parseInt(questao.get('idx'));
      if (idx === maximum) {
        this.transit();
      }
      // document.getElementById('course-nav').style.zIndex = "1";

      // document.getElementById('course-nav').style.zIndex = "2";
    }
  }
});