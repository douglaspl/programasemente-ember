import Ember from 'ember';
import moment from 'moment';

// This service will call asynchronously the API to retrieve data which are not inside the model, like events and user details, alarms and alerts
export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  upState: 0, // upState 0 e 1 significa sem dados ainda
  updateApp() {
    let person = JSON.parse(localStorage.getItem('person_logged'));
    let person_id = person.id;
    let pessoa = this.get('store').peekRecord('pessoa', person_id);
    if (pessoa) {
      let modulos = pessoa.get('modulos');
      let leituras = pessoa.get('leituras');
      let respostas = pessoa.get('respostas');
      let estadoVideos = pessoa.get('estadoVideos');
      let estadoVideosAlternativas = pessoa.get('estadoVideosAlternativas');
      if (modulos) {
        let lista_modulos = [];
        let lista_atividades = [];
        let lista_conteudos = [];
        let lista_questoes = [];
        let lista_secoes = [];
        let obj_app = {
          'total': 0,
          'completed': 0,
          'percent': 0,
          'last_three': [],
          'timestamp': -1,
          'modulos_completos': 0,
          'modulos': [],
          'duracao': 0,
          'ultimo_modulo': 0,
          'totalcomp': 0
        };
        modulos.forEach(mod => {
          let obj_mod = {
            'id': mod.get('id'),
            'total': 0,
            'completed': 0,
            'percent': 100,
            'timestamp': -1,
            'atividades': [],
            'atividades_completas': 0,
            'duracao': 0,
            'ultima_atividade': 0,
            'totalcomp': 0
          };
          if (mod.get('atividades').get('length') > 0) {
            mod.get('atividades').forEach(ativ => {
              if (obj_mod['ultima_atividade'] == 0 && ativ.get('idx') == 1) obj_mod['ultima_atividade'] = ativ.get('id');
              let obj_ativ = {
                'id': ativ.get('id'),
                'idx': ativ.get('idx'),
                'total': 0,
                'completed': 0,
                'percent': 0,
                'timestamp': -1,
                'secoes': [],
                'secoes_completas': 0,
                'duracao': 0,
                'ultima_secao': 0,
                'totalcomp': 0
              };
              let nr_sec_contam = 0;
              if (ativ.get('secoes').get('length') > 0) {
                ativ.get('secoes').forEach(secao => {
                  if (obj_ativ['ultima_secao'] == 0 && secao.get('idx') == 1) obj_ativ['ultima_secao'] = secao.get('id');
                  let obj_secao = {
                    'id': secao.get('id'),
                    'idx': secao.get('idx'),
                    'nome': secao.get('nome'),
                    'nao_conta_progresso_atividade': 0,
                    'ultima_questao': 0
                  };
                  if (secao.get('naoContaProgressoAtividade')) {
                    obj_secao['nao_conta_progresso_atividade'] = 1;
                  }
                  if (secao.get('conteudos').get('length') > 0) {
                    let cont = secao.get('conteudos').get('firstObject');
                    let obj_cont = {
                      'id': cont.get('id'),
                      'idx': cont.get('idx'),
                      'aproveitamento': 0,
                      'timestamp': -1,
                      'total': 0,
                      'percent': 0,
                      'questoes': [],
                      'ultima_questao': 1,
                      'duracao': 0,
                      'respondidas': 0,
                      'ultima_respondida': 0
                    };
                    if (cont.get('html').get('texto')) {
                      let leitura_resp;
                      if (leituras) {
                        if (leituras.get('length') > 0) {
                          leituras.forEach(leit => {
                            if (leit.get('html').get('id') == cont.get('html').get('id')) leitura_resp = leit;
                          })
                        }
                      }
                      obj_cont['type'] = 'html';
                      obj_cont['type_id'] = cont.get('html').get('id');
                      obj_cont['timestamp'] = 0;
                      obj_cont['percent'] = 0;
                      obj_cont['total'] = 100;
                      obj_cont['duracao'] = 10;
                      if (leitura_resp) {
                        obj_cont['timestamp'] = leitura_resp.get('timestamp');
                        obj_cont['percent'] = leitura_resp.get('scroll');
                        leitura_resp.get('timestamp');
                        leitura_resp.get('data.timestamp');
                      }
                    }
                    if (cont.get('video').get('videoId')) {
                      let video_resp;
                      if (estadoVideos) {
                        if (estadoVideos.get('length') > 0) {
                          estadoVideos.forEach(evideo => {
                            if (evideo.get('video').get('id') === cont.get('video').get('id')) video_resp = evideo;
                          })
                        }
                      }
                      obj_cont['type'] = 'video';
                      obj_cont['type_id'] = cont.get('video').get('id');
                      obj_cont['timestamp'] = 0;
                      obj_cont['percent'] = 0;
                      obj_cont['total'] = 100;
                      obj_cont['duracao'] = 5;
                      if (video_resp) {
                        obj_cont['timestamp'] = video_resp.get('timestamp');
                        obj_cont['percent'] = video_resp.get('tempoAssistido');
                      }
                    }
                    if (cont.get('quiz').get('questoes')) {
                      obj_cont['type'] = 'quiz';
                      obj_cont['type_id'] = cont.get('quiz').get('id');
                      let total_questoes_resp = 0;
                      let total_questoes_acertou = 0;
                      cont.get('quiz').get('questoes').forEach(questao => {
                        let obj_questao = {
                          'id': questao.get('id'),
                          'idx': questao.get('idx'),
                          'timestamp': 0,
                          'respondida': false,
                          'respostas': [],
                          'acertou': 0,
                          'visfeedback': 0,
                          'qtdefeedback': 0,
                          'tempoquestao': 0,
                          'tempoquestaoalias': '-'
                        };
                        let respondida = false;
                        let acertou = 0;
                        questao.get('alternativas').forEach(alternativa => {
                          let resposta;
                          if (respostas) {
                            if (respostas.get('length') > 0) {
                              respostas.forEach(resp => {
                                if (resp.get('alternativa').get('id') === alternativa.get('id')) resposta = resp;
                              })
                            }
                          }
                          let videoAlt;
                          if (estadoVideosAlternativas) {
                            if (estadoVideosAlternativas.get('length') > 0) {
                              estadoVideosAlternativas.forEach(evideo => {
                                if (evideo.get('alternativa').get('id') === alternativa.get('id')) videoAlt = evideo;
                              })
                            }
                          }
                          if (videoAlt) {
                            if (videoAlt.get('tempoAssistido') > obj_questao['visfeedback']) obj_questao['visfeedback'] = videoAlt.get('tempoAssistido').toFixed(0);
                            if (videoAlt.get('visualizacoes') > obj_questao['qtdefeedback']) obj_questao['qtdefeedback'] = videoAlt.get('visualizacoes');
                            if (videoAlt.get('tempoquestao') > obj_questao['tempoquestao']) {
                              obj_questao['tempoquestao'] = videoAlt.get('tempoquestao');
                              let tq = parseFloat(obj_questao['tempoquestao']);
                              let min = Math.floor(tq / 60);
                              let sec = Math.round(tq - (min * 60));
                              obj_questao['tempoquestaoalias'] = min + ' min ' + sec + ' seg';
                            }
                          }
                          if (alternativa.get('correta') && resposta) {
                            respondida = true;
                            acertou = 1;
                          } else if (resposta) {
                            respondida = true;
                          }
                          if (resposta) {
                            obj_questao['respostas'].push({
                              'id': alternativa.get('id')
                            });
                            if (obj_questao['timestamp'] < resposta.get('timestamp')) {
                              obj_questao['timestamp'] = resposta.get('timestamp');
                            }
                          }
                        });
                        if (respondida && questao.idx > obj_cont['ultima_respondida']) obj_cont['ultima_respondida'] = questao.idx;
                        obj_questao['respondida'] = respondida;
                        obj_questao['acertou'] = acertou;
                        if (respondida) {
                          total_questoes_resp = total_questoes_resp + 1;
                          if (acertou) total_questoes_acertou = total_questoes_acertou + 1;
                        }
                        if (respondida) obj_cont['respondidas'] = obj_cont['respondidas'] + 1;
                        obj_cont['questoes'].push(obj_questao);
                        if (obj_cont['timestamp'] < obj_questao['timestamp']) {
                          obj_cont['timestamp'] = obj_questao['timestamp'];
                          obj_cont['ultima_questao'] = obj_questao['idx'];
                        }
                      });
                      if (cont.get('quiz').get('questoes').get('length') > 0) {
                        obj_cont['total'] = cont.get('quiz').get('questoes').get('length');
                        obj_cont['duracao'] = 2 * cont.get('quiz').get('questoes').get('length');
                        obj_cont['percent'] = 100 * (total_questoes_resp / obj_cont['total']);
                        if (obj_cont['total'] > 0) obj_cont['aproveitamento'] = 100 * (total_questoes_acertou / obj_cont['total']);
                      } else {
                        obj_cont['total'] = 0;
                        obj_cont['percent'] = 0;
                        obj_cont['duracao'] = 0;
                      }
                    }
                    obj_secao['conteudo'] = obj_cont;
                    lista_conteudos.push(obj_cont);
                  }
                  obj_ativ['secoes'].push(obj_secao);
                  lista_secoes.push(obj_secao);
                  if (obj_secao['nao_conta_progresso_atividade'] === 0) {
                    nr_sec_contam = nr_sec_contam + 1;
                    obj_ativ['totalcomp'] = obj_ativ['totalcomp'] + obj_secao.conteudo.percent;
                  }
                  if (obj_secao.conteudo.percent === 100) obj_ativ['secoes_completas'] = obj_ativ['secoes_completas'] + 1;
                  if (obj_ativ['timestamp'] < obj_secao.conteudo.timestamp) {
                    obj_ativ['timestamp'] = obj_secao.conteudo.timestamp;
                    if (obj_secao.conteudo.percent > 0) obj_ativ['ultima_secao'] = obj_secao['id'];
                  }
                  obj_ativ['total'] = obj_ativ['total'] + obj_secao.conteudo.total;
                  obj_ativ['duracao'] = obj_secao.conteudo.duracao + obj_ativ['duracao'];
                })
              } else {
                obj_ativ['timestamp'] = -1;
              }
              if (nr_sec_contam > 0) {
                obj_ativ['percent'] = obj_ativ['totalcomp'] / nr_sec_contam;
                if (obj_ativ['percent'] >= 99.5) obj_ativ['completed'] = 1;
              } else {
                obj_ativ['percent'] = 100;
                obj_ativ['completed'] = 1;
              }
              lista_atividades.push(obj_ativ);
              obj_mod['atividades'].push(obj_ativ);
              obj_mod['totalcomp'] = obj_mod['totalcomp'] + obj_ativ['percent'];
              if (obj_ativ['secoes_completas'] === obj_ativ['secoes'].length) obj_mod['atividades_completas'] = obj_mod['atividades_completas'] + 1;
              if (obj_mod['timestamp'] < obj_ativ['timestamp']) {
                obj_mod['timestamp'] = obj_ativ['timestamp'];
                obj_mod['ultima_atividade'] = obj_ativ['id'];
              }
              obj_mod['total'] = obj_mod['total'] + obj_ativ['total'];
              obj_mod['duracao'] = obj_mod['duracao'] + obj_ativ['duracao'];
            })
          } else {
            obj_mod['timestamp'] = -1;
          }
          if (obj_mod['atividades'].length) obj_mod['percent'] = obj_mod['totalcomp'] / obj_mod['atividades'].length;
          if (obj_mod['percent'] >= 99.5) obj_mod['completed'] = 1;
          lista_modulos.push(obj_mod);
          obj_app['modulos'].push(obj_mod);
          obj_app['totalcomp'] = obj_app['totalcomp'] + obj_mod['percent'];
          obj_app['total'] = obj_mod['total'] + obj_app['total'];
          if (obj_mod['atividades_completas'] === obj_mod['atividades'].length) obj_app['modulos_completos'] = obj_app['modulos_completos'] + 1;
          if (obj_app['total'] > 0) obj_app['percent'] = 100 * (obj_app['completed'] / obj_app['total']);
          if (obj_app['timestamp'] < obj_mod['timestamp']) {
            obj_app['timestamp'] = obj_mod['timestamp'];
            obj_app['ultimo_modulo'] = obj_mod['id'];
          }
          obj_app['duracao'] = obj_app['duracao'] + obj_mod['duracao'];
        });
        obj_app['percent'] = obj_app['totalcomp'] / obj_app['modulos'].length;
        if (obj_app['percent'] > 99.5) obj_app['completed'] = 1;
        this.set('lista_modulos', lista_modulos);
        this.set('lista_atividades', lista_atividades);
        this.set('lista_secoes', lista_secoes);
        this.set('lista_conteudos', lista_conteudos);
        this.set('lista_questoes', lista_questoes);
        this.set('obj_app', obj_app);
        if (this.get('upState') === 2) this.set('upState', 3);
        else this.set('upState', 2);
      } else {
        if (this.get('upState') === 0) this.set('upState', 1);
        else this.set('upState', 0);
      }
    } else {
      if (this.get('upState') === 0) this.set('upState', 1);
      else this.set('upState', 0);
    }
  },
  getItem(type, id) {
    let resp, lista;
    if (type === 'modulos') lista = this.get('lista_modulos');
    else if (type === 'atividades') lista = this.get('lista_atividades');
    else if (type === 'conteudos') lista = this.get('lista_conteudos');
    else if (type === 'questoes') lista = this.get('lista_questoes');
    else if (type === 'secoes') lista = this.get('lista_secoes');
    if (lista) {
      lista.forEach(item => {
        if (id === item.id) {
          resp = item;
        }
      })
    }
    return resp;
  },
  async calculateProgress(pessoa, modulos) {
    let pessoa_state = {
      'pessoa': pessoa,
      'matriculado': false,
      'modulos': [],
      'cadastrado': '20/12/2013'
    };
    let matriculas = await pessoa.get('matriculas');
    if (matriculas) {
      let timest = 9530181914;
      matriculas.forEach(mat => {
        if (mat.get('dataInscricao') < timest) timest = mat.get('dataInscricao');
      });
      if (timest != 9530181914) pessoa_state['cadastrado'] = moment(timest, 'X').format('DD/MM/YYYY');
    }
    let leituras = await pessoa.get('leituras');
    let respostas = await pessoa.get('respostas');
    let estadoVideos = await pessoa.get('estadoVideos');
    let estadoVideosAlternativas = await pessoa.get('estadoVideosAlternativas');
    if (modulos) {
      pessoa_state['matriculado'] = true;
      // course real percentual progress
      let progressoRealValue;
      //let modulosCounter = 0;
      modulos.forEach(mod => {
        let modId = mod.get('id');
        if (matriculas) {
          let matModId;
          matriculas.forEach(mat => {
            matModId = mat.get('moduloId');
            if (matModId == modId) {
              progressoRealValue = mat.get('progresso').toFixed(0) + '% ';
            }
          });
        }
        let obj_mod = {
          'id': mod.get('id'),
          'name': mod.get('name'),
          'total': 0,
          'completed': 0,
          'percent': 0,
          'percent_alias': '0%',
          'timestamp': -1,
          'atividades': [],
          'duracao': 0,
          'progressPercentReal': progressoRealValue
        };
        if (mod.get('atividades').get('length') > 0) {
          mod.get('atividades').forEach(ativ => {
            let obj_ativ = {
              'id': ativ.get('id'),
              'name': ativ.get('name'),
              'idx': ativ.get('idx'),
              'total': 0,
              'completed': 0,
              'percent': 0,
              'timestamp': -1,
              'secoes': [],
              'secoes_completas': 0,
              'duracao': 0,
              'ultima_secao': 0
            };
            if (ativ.get('secoes').get('length') > 0) {
              ativ.get('secoes').forEach(secao => {
                let obj_secao = {
                  'id': secao.get('id'),
                  'idx': secao.get('idx'),
                  'nome': secao.get('nome')
                };
                if (secao.get('conteudos').get('length') > 0) {
                  let cont = secao.get('conteudos').get('firstObject');
                  let obj_cont = {
                    'id': cont.get('id'),
                    'idx': cont.get('idx'),
                    'aproveitamento': 0,
                    'timestamp': -1,
                    'total': 0,
                    'percent': 0,
                    'questoes': [],
                    'ultima_questao': 0,
                    'duracao': 0,
                    'respondidas': 0
                  };
                  if (cont.get('html').get('texto')) {
                    let leitura_resp;
                    if (leituras) {
                      if (leituras.get('length') > 0) {
                        leituras.forEach(leit => {
                          if (leit.get('html').get('id') == cont.get('html').get('id')) leitura_resp = leit;
                        })
                      }
                    }
                    obj_cont['type'] = 'html';
                    obj_cont['type_id'] = cont.get('html').get('id');
                    obj_cont['timestamp'] = 0;
                    obj_cont['percent'] = 0;
                    obj_cont['total'] = 100;
                    obj_cont['duracao'] = 10;
                    if (leitura_resp) {
                      obj_cont['timestamp'] = leitura_resp.get('timestamp');
                      obj_cont['percent'] = leitura_resp.get('scroll');
                    }
                  }
                  if (cont.get('video').get('videoId')) {
                    let video_resp;
                    if (estadoVideos) {
                      if (estadoVideos.get('length') > 0) {
                        estadoVideos.forEach(evideo => {
                          if (evideo.get('video').get('id') === cont.get('video').get('id')) video_resp = evideo;
                        })
                      }
                    }
                    obj_cont['type'] = 'video';
                    obj_cont['type_id'] = cont.get('video').get('id');
                    obj_cont['timestamp'] = 0;
                    obj_cont['percent'] = 0;
                    obj_cont['total'] = 100;
                    obj_cont['duracao'] = 5;
                    if (video_resp) {
                      obj_cont['timestamp'] = video_resp.get('timestamp');
                      obj_cont['percent'] = video_resp.get('tempoAssistido');
                    }
                  }
                  if (cont.get('quiz').get('questoes')) {
                    obj_cont['type'] = 'quiz';
                    obj_cont['type_id'] = cont.get('quiz').get('id');
                    let total_questoes_resp = 0;
                    let total_questoes_acertou = 0;
                    cont.get('quiz').get('questoes').forEach(questao => {
                      let obj_questao = {
                        'id': questao.get('id'),
                        'idx': questao.get('idx'),
                        'timestamp': 0,
                        'respondida': false,
                        'respostas': [],
                        'acertou': 0,
                        'visfeedback': 0,
                        'qtdefeedback': 0,
                        'tempoquestao': 0,
                        'tempoquestaoalias': '-'
                      };
                      let respondida = false;
                      let acertou = 0;
                      questao.get('alternativas').forEach(alternativa => {
                        let resposta;
                        if (respostas) {
                          if (respostas.get('length') > 0) {
                            respostas.forEach(resp => {
                              if (resp.get('alternativa').get('id') === alternativa.get('id')) resposta = resp;
                            })
                          }
                        }
                        let videoAlt;
                        if (estadoVideosAlternativas) {
                          if (estadoVideosAlternativas.get('length') > 0) {
                            estadoVideosAlternativas.forEach(evideo => {
                              if (evideo.get('alternativa').get('id') === alternativa.get('id')) videoAlt = evideo;
                            })
                          }
                        }
                        if (videoAlt) {
                          if (videoAlt.get('tempoAssistido') > obj_questao['visfeedback']) obj_questao['visfeedback'] = videoAlt.get('tempoAssistido').toFixed(0);
                          if (videoAlt.get('visualizacoes') > obj_questao['qtdefeedback']) obj_questao['qtdefeedback'] = videoAlt.get('visualizacoes');
                          if (videoAlt.get('tempoquestao') > obj_questao['tempoquestao']) {
                            obj_questao['tempoquestao'] = videoAlt.get('tempoquestao');
                            let tq = parseFloat(obj_questao['tempoquestao']);
                            let min = Math.floor(tq / 60);
                            let sec = Math.round(tq - (min * 60));
                            obj_questao['tempoquestaoalias'] = min + ' min ' + sec + ' seg';
                          }
                        }
                        if (alternativa.get('correta') && resposta) {
                          respondida = true;
                          acertou = 1;
                        } else if (resposta) {
                          respondida = true;
                        }
                        if (resposta) {
                          obj_questao['respostas'].push({
                            'id': alternativa.get('id')
                          });
                          if (obj_questao['timestamp'] < resposta.get('timestamp')) {
                            obj_questao['timestamp'] = resposta.get('timestamp');
                          }
                        }
                      });
                      if (respondida && questao.idx > obj_cont['ultima_respondida']) obj_cont['ultima_respondida'] = questao.idx;
                      obj_questao['respondida'] = respondida;
                      obj_questao['acertou'] = acertou;
                      if (respondida) {
                        total_questoes_resp = total_questoes_resp + 1;
                        if (acertou) total_questoes_acertou = total_questoes_acertou + 1;
                      }
                      if (respondida) obj_cont['respondidas'] = obj_cont['respondidas'] + 1;
                      obj_cont['questoes'].push(obj_questao);
                      if (obj_cont['timestamp'] < obj_questao['timestamp']) obj_cont['timestamp'] = obj_questao['timestamp'];
                    });
                    if (cont.get('quiz').get('questoes').get('length') > 0) {
                      obj_cont['total'] = cont.get('quiz').get('questoes').get('length');
                      obj_cont['duracao'] = 2 * cont.get('quiz').get('questoes').get('length');
                      obj_cont['percent'] = 100 * (total_questoes_resp / obj_cont['total']);
                      if (obj_cont['total'] > 0) obj_cont['aproveitamento'] = 100 * (total_questoes_acertou / obj_cont['total']);
                    } else {
                      obj_cont['total'] = 0;
                      obj_cont['percent'] = 0;
                      obj_cont['duracao'] = 0;
                    }
                  }
                  obj_secao['conteudo'] = obj_cont;
                }
                if (obj_ativ['secoes'].length > 0) obj_ativ['percent'] = ((obj_ativ.secoes.length * obj_ativ['percent']) + obj_secao.conteudo.percent) / (obj_ativ.secoes.length + 1);
                else if (obj_secao.conteudo.percent > 0) obj_ativ['percent'] = obj_secao.conteudo.percent;
                obj_ativ['secoes'].push(obj_secao);
                if (obj_secao.conteudo.percent === 100) obj_ativ['secoes_completas'] = obj_ativ['secoes_completas'] + 1;
                if (obj_ativ['timestamp'] < obj_secao.conteudo.timestamp) {
                  obj_ativ['timestamp'] = obj_secao.conteudo.timestamp;
                  if (obj_secao.conteudo.percent > 0) obj_ativ['ultima_secao'] = obj_secao['id'];
                }
                obj_ativ['completed'] = obj_ativ['completed'] + obj_secao.conteudo.completed;
                obj_ativ['total'] = obj_ativ['total'] + obj_secao.conteudo.total;
                obj_ativ['duracao'] = obj_secao.conteudo.duracao + obj_ativ['duracao'];
              })
            }
            obj_mod['atividades'].push(obj_ativ);
            let nr_ativ = obj_mod['atividades'].length;

            if (nr_ativ > 0) obj_mod['percent'] = ((nr_ativ - 1) * obj_mod['percent'] + obj_ativ['percent']) / nr_ativ;
            else obj_mod['percent'] = 100;
            if (obj_ativ['secoes_completas'] === obj_ativ['secoes'].length) obj_mod['atividades_completas'] = obj_mod['atividades_completas'] + 1;
            if (obj_mod['timestamp'] < obj_ativ['timestamp']) {
              obj_mod['timestamp'] = obj_ativ['timestamp'];
              obj_mod['ultima_atividade'] = obj_ativ['id'];
            }
            obj_mod['total'] = obj_mod['total'] + obj_ativ['total'];
            obj_mod['completed'] = obj_mod['completed'] + obj_ativ['completed'];
            obj_mod['duracao'] = obj_mod['duracao'] + obj_ativ['duracao'];
            obj_mod['percent_alias'] = Math.round(obj_mod['percent']) + '%';
          });
        }
        pessoa_state['modulos'].push(obj_mod);
        //modulosCounter++;
      });
    }
    return pessoa_state;
  },
});
