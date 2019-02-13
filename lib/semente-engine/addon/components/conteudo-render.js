import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
  store: Ember.inject.service(),
  tagName: 'div',
  sortingKey: ['idx'],
  appstate: Ember.inject.service(),
  sortedQuestoes: Ember.computed.sort('quiz.questoes', 'sortingKey'),
  respostas: [],
  questaoAtiva: 0,
  init() {
    this._super(...arguments);
    let that = this;
    let atividade_id = this.get('model').get('atividade').get('id');
    let atividade = this.get('store').peekRecord('atividade', atividade_id);
    let secoes = atividade.get('secoes').sortBy('idx', 'DimensionName');
    let idx_atual = this.get('model').get('idx');
    let proximo, id_proximo, nome_proximo;
    proximo = idx_atual + 1;
    if (secoes.filterBy('idx', proximo).get('firstObject')) {
      id_proximo = secoes.filterBy('idx', proximo).get('firstObject').get('id');
      nome_proximo = secoes.filterBy('idx', proximo).get('firstObject').get('nome');
      this.set('id_proximo', id_proximo);
      this.set('nome_proximo', nome_proximo);
    }
    let idx_aula = this.get('model').get('atividade').get('idx');
    let next_aula_idx = parseInt(idx_aula) + 1;
    let id_aula_proxima, nome_aula_proxima;
    let modulo = atividade.get('modulo');
    let all_aulas = modulo.get('atividades');

    if (all_aulas.filterBy('idx', next_aula_idx)[0]) {
      id_aula_proxima = all_aulas.filterBy('idx', next_aula_idx).get('firstObject').get('id');
      nome_aula_proxima = all_aulas.filterBy('idx', next_aula_idx).get('firstObject').get('name');
      this.set('id_aula_proxima', id_aula_proxima);
      this.set('nome_aula_proxima', nome_aula_proxima);
      let proxima_aula = this.get('store').peekRecord('atividade', id_aula_proxima);
      let id_primeira_secao_proxima_aula = proxima_aula.get('secoes').filterBy('idx', 1).get('firstObject').get('id');
      this.set('id_primeira_secao_proxima_aula', id_primeira_secao_proxima_aula);
    }
    Ember.run.schedule('afterRender', function () {

      if (that.get('video.videoId')) {
        that.playVideo();
      } else if (that.get('html.texto')) {
        that.saveHtml();
      } else if (that.get('quiz.questoes')) {
        let q;
        if (that.get('questao')) q = that.get('questao');
        that.checkQuiz(q);
      }

    });
  },
  load_questao: Ember.observer('questao', function () {
    this.checkQuiz(this.get('questao'));
  }),

  saveHtml() {
    let person_read = JSON.parse(localStorage.getItem('person_logged'));
    let html_leitura_ar = this.get('html').get('leituras');
    let html_leitura_id;
    html_leitura_ar.forEach(leitura => {
      if (leitura.get('pessoa').get('id') == person_read.id) html_leitura_id = leitura.get('id');
    });
    let html_leitura = this.get('store').peekRecord('leitura', html_leitura_id);
    let temp = Math.round(new Date().getTime() / 1000);
    html_leitura.set('timestamp', temp);
    html_leitura.set('scroll', 100);
    this.get('appstate').updateApp();
    html_leitura.save().then(() => {}).catch();
  },
  playVideo() {
    let person_read = JSON.parse(localStorage.getItem('person_logged'));
    let ide = this.get('ide');
    let video_estado_ar = this.get('video').get('estadosVideo');
    let video_estado_id;
    video_estado_ar.forEach(estado => {
      if (estado.get('pessoa').get('id') == person_read.id) {

        video_estado_id = estado.get('id');
      }
    });
    let video_estado = this.get('store').peekRecord('estado-video', video_estado_id);
    // let vdwidth = document.getElementById('main_output').offsetWidth;
    let vdwidth = 760;
    let vdheight = 429;
    // let vdheight = Math.round(vdwidth/1.77);
    let options_vimeo = {
      id: this.get('video.videoId'),
      autoplay: true,
      playsinline: false,
      title: true,
      width: vdwidth,
      height: vdheight
    };
    let iframe1 = document.querySelector('#video_content_section_' + ide);
    let player_section = new Vimeo.Player(iframe1, options_vimeo);
    if (video_estado.get('ultimoInstante')) {
      if (!this.get('videoini') && video_estado.get('tempoAssistido') < 100) player_section.setCurrentTime(video_estado.get('ultimoInstante')).then(function (inst) {}).catch(function (error) {});
    }
    let saved_percent = 0;
    let save_free = true;
    let that = this;
    player_section.on('timeupdate', function (video_data) {
      if (100 * video_data.percent > saved_percent + 5) {
        let temp = Math.round(new Date().getTime() / 1000);
        video_estado.set('timestamp', temp);
        saved_percent = 100 * video_data.percent;
        video_estado.set('iniciou', true);
        video_estado.set('ultimoInstante', video_data.seconds);
        if (video_estado.get('tempoAssistido') < saved_percent) video_estado.set('tempoAssistido', saved_percent);
        if (save_free) {
          save_free = false;
          that.get('appstate').updateApp();
          video_estado.save()
            .then(() => {
              save_free = true;
            }).catch(() => {
              save_free = true;
            });
        }
      }
    });
    player_section.on('ended', function () {
      document.getElementById('course-nav').style.zIndex = "1";
      video_estado.set('iniciou', true);
      video_estado.set('tempoAssistido', 100);
      video_estado.set('completou', true);
      // ######################################### old
      //that.get('appstate').updateApp();
      /*
      video_estado.save()
        .then((response) => {
          console.log('sucesso');
          console.log(response);
          // that.transit();
        }).catch((error) => {
          console.log('erro');
          console.log(error);
        });
      */
      // #########################################
      function setProperBottom(target) {
        let connetionAlert = document.getElementById('snackbarConnection');

        if (connetionAlert.classList.contains('alert--is-show')) target.style.bottom = '96px';

        /*if (allOpenAlerts.length >= 1) {
          // Pega altura da tela
          let windowHeight = window.innerHeight;

          ///////////////
          // SOBRE O ULTIMO ALERTA MOSTRADO NA TELA
          ///////////////

          // Pega o último alerta da lista
          let lastAlert = allOpenAlerts[allOpenAlerts.length - 1];
          // Pega o offset em relação ao topo do último alerta da lista
          let lastAlertoffsetTop = parseInt(lastAlert.offsetTop);
          // Pega a altura do último alerta da lista
          let lastAlertHeight = parseInt(lastAlert.clientHeight);
          // Recupera margin bottom do último alerta da lista
          let lastAlertMarginBottom = parseInt(window.getComputedStyle(target).getPropertyValue('margin-bottom'));

          ///////////////
          // SOBRE O PRÓXIMO ALERTA A SER MOSTRADA
          ///////////////

          // Pega altura do novo alerta (ainda não renderizado).
          // Primeiro alerta fica com bottom um pouco menor que o do segundo em diante.
          let tAlertHeight = parseInt(target.clientHeight);
          // Calcula bottom do ultimo alerta no array de alertas
          let lastAlertBottom = windowHeight - lastAlertoffsetTop - lastAlertHeight - lastAlertMarginBottom;
          // Calcula novo bottom
          let tAlertNewBottom = lastAlertBottom + (2 * lastAlertMarginBottom) + tAlertHeight;
          // Aplica novo bottom
          target.style.bottom = tAlertNewBottom + "px";
        }*/
      }

      function videoStateSave(callback, nTimes) {
        console.log('>_videoStateSave()');
        const alertRetrying = document.getElementById('conteudoRenderErrorRetrying');
        const alertRetry = document.getElementById('conteudoRenderErrorRetry');

        return callback()
          .catch(function (reason) {
            if (nTimes-- > 0) {
              alertRetry.classList.remove('alert--is-show');
              alertRetrying.classList.add('alert--is-show');

              setProperBottom(alertRetrying);

              let retryCounter = document.getElementById('retryCounter');
              var countdown = 10;

              var i = setInterval(function () {
                countdown--;
                retryCounter.innerHTML = countdown;
                if (countdown === 0) {
                  clearInterval(i);
                  return videoStateSave(callback, nTimes);
                }
              }, 1000);

            } else {
              video_estado.set('tempoAssistido', 0);
              video_estado.set('completou', false);
              alertRetrying.classList.remove('alert--is-show');
              alertRetry.classList.add('alert--is-show');

              setProperBottom(alertRetry);

              throw reason;
            }
          });
      }

      videoStateSave(function () {
        return video_estado.save()
          .then(() => {
            that.get('appstate').updateApp();
            that.transit();
          });
      }, 1);
    });
  },
  videoStateRetry() {
    console.log('>_videoStateRetry()');
    let person_read = JSON.parse(localStorage.getItem('person_logged'));
    let video_estado_ar = this.get('video').get('estadosVideo');
    let video_estado_id;
    video_estado_ar.forEach(estado => {
      if (estado.get('pessoa').get('id') == person_read.id) {
        video_estado_id = estado.get('id');
      }
    });
    let video_estado = this.get('store').peekRecord('estado-video', video_estado_id);

    let that = this;

    document.getElementById('course-nav').style.zIndex = "1";
    video_estado.set('iniciou', true);
    video_estado.set('tempoAssistido', 100);
    video_estado.set('completou', true);

    function setProperBottom(target) {
      let connetionAlert = document.getElementById('snackbarConnection');

      if (connetionAlert.classList.contains('alert--is-show')) target.style.bottom = '96px';

      /*
      let allOpenAlerts = document.getElementsByClassName('alert--is-show');

      if (allOpenAlerts.length >= 1) {
        // Pega altura da tela
        let windowHeight = window.innerHeight;

        ///////////////
        // SOBRE O ULTIMO ALERTA MOSTRADO NA TELA
        ///////////////

        // Pega o último alerta da lista
        let lastAlert = allOpenAlerts[allOpenAlerts.length - 1];
        // Pega o offset em relação ao topo do último alerta da lista
        let lastAlertoffsetTop = parseInt(lastAlert.offsetTop);
        // Pega a altura do último alerta da lista
        let lastAlertHeight = parseInt(lastAlert.clientHeight);
        // Recupera margin bottom do último alerta da lista
        let lastAlertMarginBottom = parseInt(window.getComputedStyle(target).getPropertyValue('margin-bottom'));

        ///////////////
        // SOBRE O PRÓXIMO ALERTA A SER MOSTRADA
        ///////////////

        // Pega altura do novo alerta (ainda não renderizado).
        // Primeiro alerta fica com bottom um pouco menor que o do segundo em diante.
        let tAlertHeight = parseInt(target.clientHeight);
        // Calcula bottom do ultimo alerta no array de alertas
        let lastAlertBottom = windowHeight - lastAlertoffsetTop - lastAlertHeight - lastAlertMarginBottom;
        // Calcula novo bottom
        let tAlertNewBottom = lastAlertBottom + (2 * lastAlertMarginBottom) + tAlertHeight;
        // Aplica novo bottom
        target.style.bottom = tAlertNewBottom + "px";
      }
      */
    }

    function videoStateSave(callback, nTimes) {
      console.log('>_videoStateSave()');
      const alertRetrying = document.getElementById('conteudoRenderErrorRetrying');
      const alertRetry = document.getElementById('conteudoRenderErrorRetry');

      return callback()
        .catch(function (reason) {
          if (nTimes-- > 0) {

            setProperBottom(alertRetrying);

            alertRetry.classList.remove('alert--is-show');
            alertRetrying.classList.add('alert--is-show');
            let retryCounter = document.getElementById('retryCounter');
            var countdown = 10;

            var i = setInterval(function () {
              countdown--;
              retryCounter.innerHTML = countdown;
              if (countdown === 0) {
                clearInterval(i);
                return videoStateSave(callback, nTimes);
              }
            }, 1000);

          } else {
            video_estado.set('tempoAssistido', 0);
            video_estado.set('completou', false);
            alertRetrying.classList.remove('alert--is-show');
            alertRetry.classList.add('alert--is-show');

            setProperBottom(alertRetry);

            throw reason;
          }
        });
    }

    videoStateSave(function () {
      return video_estado.save()
        .then(() => {
          that.get('appstate').updateApp();
          that.transit();
        });
    }, 1);
  },
  checkQuiz(param) {
    let conteudo = this.get('appstate').getItem('conteudos', this.get('ide'));
    if (conteudo.id) {
      if (conteudo.questoes) {
        let idx = 1;
        let time = 0;
        conteudo.questoes.forEach(questao => {
          if (questao.timestamp > time) {
            time = questao.timestamp;
            idx = questao.idx;
          }
        })
        if (param)
          if (param > 0) idx = param;
        let elements = document.getElementsByClassName('content_render_quiz');
        for (let i = 0; i < elements.length; i++) {
          elements[i].style.display = 'none';
        }
        document.getElementById('article_questao_' + idx).style.display = 'block';
      }
    }
  },
  actions: {
    goNext() {
      this.gonext(this.get('id_proximo'));
    },
    goQuestao(idx) {
      this.goquestao(idx);
    }
  }
});
