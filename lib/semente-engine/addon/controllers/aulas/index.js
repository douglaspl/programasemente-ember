import Controller from '@ember/controller';
import Ember from 'ember';
import ENV from '../../config/environment';

export default Controller.extend({
  adobeApiKey: ENV.adobeApiKey,
  role: JSON.parse(localStorage.getItem('person_logged')).role,
  pessoaId: JSON.parse(localStorage.getItem('person_logged')).id,
  parentController: Ember.inject.controller('aulas'),
  session: Ember.inject.service('session'),
  showHeader: Ember.run.schedule('afterRender', function () {
    $('body').removeClass('no-header');
  }),
  thisRoute: Ember.run('render', function () {
    if (window.location.pathname.includes('aulas')) {
      return 'aulas';
    }
  }),
  ordem: "0",
  selectedCompId: 0,
  store: Ember.inject.service(),
  pessoa: Ember.computed('model', function () {
    return this.get('store').peekRecord('pessoa', this.get('pessoaId') );
  }),
  termoAceito: Ember.computed('model', function(){
    let termoInst = this.get('pessoa').get('instituicao').get('statusTermoAceite');
    let termoPessoa = this.get('pessoa').get('termoAceite');
    if(termoInst == true && termoPessoa == false){

    setTimeout(() => {
      $('body').addClass('no-header');
    }, 200);

      this.send('termoAceite');
    }
  }),

  isProfAplicador: Ember.computed('model', function(){
    let pessoa = this.get('pessoa');
    let inst = this.get('pessoa').get('instituicao');
    if(pessoa.get('isAplicador')){
      let platAnos = pessoa.get('plataformaAnos');
      let platTurmas = pessoa.get('plataformaTurmas');
      let platTurmasID = pessoa.get('plataformaTurmas').map(id => id.get('id'));
      let platTurmasInst = inst.get('plataformaTurmas');
      platTurmasInst.forEach(pti => {
        platAnos.forEach(pa => {
          if(pti.get('plataformaAno').get('id') == pa.get('id')){
            if(!platTurmasID.includes(pti.get('id'))){
              platTurmas.push(pti);
            }
          }
        })
      })
      pessoa.save();
    }
  }),

  certificado: Ember.computed('model', function () {
    if(this.get('pessoa').get('role') != 'aluno') return false;

    let aulas = this.get('store').peekAll('aula');
    aulas = aulas.filterBy('plataformaAno.id', this.get('selectedAno').get('id'));
    if(aulas.length == 0) return false;

    let nrVideosAssistidos = this.get('pessoa').get('nrVideosAlunos');
    let tarefas = 0;
    if(this.get('selectedAno').get('idx') < 0){
      tarefas = this.get('pessoa').get('tarefas').content.length;
    }
    if (aulas.length <= nrVideosAssistidos || tarefas == aulas.length) {
      return true
    } else {
      return false
    }
  }),

  ejaAcessoMedio: Ember.computed('model', function () {
    let p = JSON.parse(localStorage.getItem('person_logged'));
    let pessoa = this.get('store').peekRecord('pessoa', p.id);
    if(pessoa.get('role') != 'aluno') return;
    if(!pessoa.get('ejaAcessoMedio')){
      $('body').addClass('no-header');
      document.getElementById('header_layout').style.zIndex = -1;
      this.send('ejaModal');
    }
  }),

  turmasDoAno: Ember.computed('selectedAno', function(){
    let turmasDoAno = this.get('store').query('plataforma-turma', {plataformaAnoId: this.get('selectedAno').get('id')});
    return turmasDoAno;
  }),

  competencias: Ember.computed('model', function(){
    return this.get('store').peekAll('comp');
  }),

  calendarios: Ember.computed('model', function(){
    return this.get('store').peekAll('calendario').toArray().sort(function(a, b){return b.get('id') - a.get('id')});
  }),

  segmentos: Ember.computed('model', function() {
    var pessoa = this.get('pessoa');
    var segmentos = this.get('model').mapBy('segmento').filter(seg => seg && seg.get('id')).filter((value, index, array) => array.mapBy('id').indexOf(value.get('id')) === index);
    if(pessoa.get('role') != 'admin'){
      var plataformaAnos = this.get('store').peekAll('plataforma-ano');

      if(pessoa.get('role') == 'instrutor'){
        plataformaAnos = pessoa.get('plataformaTurmas').mapBy('plataformaAno').filter((value, index, array) => array.mapBy('id').indexOf(value.get('id')) === index);
      }

      let instPlatAnoSisPortal = this.get('store').peekRecord('instituicao', this.get('pessoa').get('instituicao.id'))
        .get('instituicaoPlataformaAnoSistema')
        .filterBy('sistema.idx', 1);

      plataformaAnos = plataformaAnos.filter(pa => instPlatAnoSisPortal.filterBy('plataformaAno.id', pa.get('id'))[0] != null);
      
      let instPlatAnoSisS = this.get('store').peekRecord('instituicao', this.get('pessoa').get('instituicao.id'))
        .get('instituicaoPlataformaAnoSistema')
        .filterBy('sistema.idx', 2);
      
      plataformaAnos = plataformaAnos.filter(pa => instPlatAnoSisS.filterBy('plataformaAno.id', pa.get('id'))[0] == null || !instPlatAnoSisS.filterBy('plataformaAno.id', pa.get('id'))[0].get('isEssencial'));

      if(pessoa.get('role') == 'aluno'){
        plataformaAnos = pessoa.get('plataformaAnos');
      }
      segmentos = plataformaAnos.mapBy('segmento').filter(seg => seg && seg.get('id')).filter((value, index, array) => array.mapBy('id').indexOf(value.get('id')) === index);
    }
    return segmentos.sortBy('idx');
  }),

  selectedDependente: Ember.computed('model', function () {
    return this.get('parentController').get('selectedDependente')
  }),

  selectedSegmento: Ember.computed('model', function () {
    return this.get('segmentos').rejectBy('titulo', 'Adultos').get('firstObject') || this.get('segmentos.firstObject');
  }),

  plataformaAnos: Ember.computed('model', function () {
    var pessoa = this.get('pessoa');
    var segmento = this.get('selectedSegmento');
    var plataformaAnos = this.get('store').peekAll('plataforma-ano').filterBy('segmento.id', segmento.get('id'));
    if(pessoa.get('role') != 'admin'){
      if(pessoa.get('role') == 'instrutor'){
        plataformaAnos = pessoa.get('plataformaTurmas').mapBy('plataformaAno').filterBy('segmento.id', segmento.get('id')).filter((value, index, array) => array.mapBy('id').indexOf(value.get('id')) === index);
      }

      let instPlatAnoSisPortal = this.get('store').peekRecord('instituicao', this.get('pessoa').get('instituicao.id'))
        .get('instituicaoPlataformaAnoSistema')
        .filterBy('sistema.idx', 1);

      plataformaAnos = plataformaAnos.filter(pa => instPlatAnoSisPortal.filterBy('plataformaAno.id', pa.get('id'))[0] != null);
      
      let instPlatAnoSisS = this.get('store').peekRecord('instituicao', this.get('pessoa').get('instituicao.id'))
        .get('instituicaoPlataformaAnoSistema')
        .filterBy('sistema.idx', 2);
      
      plataformaAnos = plataformaAnos.filter(pa => instPlatAnoSisS.filterBy('plataformaAno.id', pa.get('id'))[0] == null || !instPlatAnoSisS.filterBy('plataformaAno.id', pa.get('id'))[0].get('isEssencial'));

      if(pessoa.get('role') == 'aluno'){
        plataformaAnos = pessoa.get('plataformaAnos');
      }
    }
    return plataformaAnos.sortBy('idx');
  }).property('selectedSegmento'),

  isBloco: Ember.computed('', function() {
    let that = this;
    Ember.run.schedule('afterRender', function() {
      that.send('isBloco');
    })
  }),

  selectedAno: Ember.computed('model', function () {
    return this.get('plataformaAnos.firstObject')
  }),

  platanoId: Ember.computed('model', function () {
    return this.get('plataformaAnos.firstObject').get('id')
  }),

  Ano: Ember.computed('model', function () {
    return this.get('plataformaAnos').get('firstObject')
  }),
  livros: Ember.computed('pessoa', function () {
    if(this.get('pessoa').get('role') == 'aluno'){
      return this.get('selectedAno').get('livros').filterBy('perfil', 'aluno');
    }
    return this.get('selectedAno').get('livros');
  }).property('selectedAno'),

  aulasFiltradas: Ember.computed('model', function () {
    let aulas = this.get('store').peekAll('aula')
    .filter(x => x.get('plataformaAno.id') == this.get('selectedAno.id'))
    .filter(x => x.get('titulo').toLowerCase().includes(this.get('search').toLowerCase()))
    .sortBy('idx');
    
    if(this.get('pessoa').get('role') != 'admin'){
      if(aulas.length > 0) {
        let instPlatAnoSisS = this.get('store').peekRecord('instituicao', this.get('pessoa').get('instituicao.id'))
              .get('instituicaoPlataformaAnoSistema')
              .filterBy('sistema.idx', 2)
              .filterBy('plataformaAno.id', this.get('selectedAno.id'))[0];
        if(instPlatAnoSisS != null){
          aulas = aulas.filter(x => x.get('isEssencial') == instPlatAnoSisS.get('isEssencial'));
        }
        else aulas = aulas.filter(x => x.get('isEssencial') == false);
      }
    }
    else {
      if(this.get('calendario') != null){
        aulas = aulas.filter(x => x.get('calendarios').map(y => y.get('id')).toArray().includes(this.get('calendario')));
      }
      else{
        let firstCalendario = this.get('calendarios').get('firstObject');
        aulas = aulas.filter(x => x.get('calendarios').map(y => y.get('id')).toArray().includes(firstCalendario.get('id')));
      }
    }

    if(this.get('selectedCompId') != 0){
      aulas = aulas.filter(x => x.get('comps').map(y => y.get('id')).toArray().includes(this.get('selectedCompId')));
    }

    if(this.get('selectedSituacao') != ''){
      if(this.get('selectedSituacao') == 'Não aplicada'){
        aulas = aulas.filter(x => x.get('aplicacoes').filterBy('aplicado', true).filter(x => (x.get('pessoaId') == this.get('pessoa.id')) | (x.get('pessoaId') == 0)).get('length') == 0);
      }
      else{
        let turmas = this.get('pessoa').get('plataformaTurmas').filterBy('plataformaAno.id',  this.get('selectedAno.id'));
        if(this.get('selectedSituacao') == 'Parcialmente aplicada'){
          aulas = aulas.filter(x => x.get('aplicacoes').filterBy('aplicado', true).filter(x => (x.get('pessoaId') == this.get('pessoa.id')) | (x.get('pessoaId') == 0)).get('length') < turmas.get('length'))
        }
        if(this.get('selectedSituacao') == 'Aplicada'){
          aulas = aulas.filter(x => x.get('aplicacoes').filterBy('aplicado', true).filter(x => (x.get('pessoaId') == this.get('pessoa.id')) | (x.get('pessoaId') == 0)).get('length') == turmas.get('length'))
        }
      }
    }

    if (this.get('ordem') == "0") return aulas.toArray();
    return aulas.toArray().reverse();
  }).property('selectedSegmento', 'selectedAno', 'search', 'ordem', 'calendario', 'selectedCompId', 'selectedSituacao'),


  noCards: false,

  hasNotification: true,
  notifications: Ember.computed('model', function (){
    var allNotifications = this.get('store').peekAll('notification');
    let p = JSON.parse(localStorage.getItem('person_logged'));
    let pessoa = this.get('store').peekRecord('pessoa', p.id);
    var pessoaNotifications = pessoa.get('pessoaNotifications');
    var list = [];
    allNotifications.forEach(n => {
      let pessoaNotificationsIds = pessoaNotifications.map(x => x.get('notification').get('id'));
      if(!pessoaNotificationsIds.includes(n.get('id'))) list.pushObject(n);
    })

    if(list.length > 0){
      this.set('hasNotification', true);
      document.getElementById('notification-counter').style.display = "block";
      if(list.length > 9) document.getElementById('notification-counter').innerText = "+";
      else document.getElementById('notification-counter').innerText = list.length;
    }

    return list;  
  }),

  qC() {
    setTimeout(() => {
      let qtde = document.querySelectorAll("[class*='media--card']").length;
      if (qtde === 0) {
        this.set('noCards', true);
      } else {
        this.set('noCards', false);
      }
    }, 1);
  },


  changedAulasFiltradas: Ember.observer('aulasFiltradas', function () {
    this.qC();
  }),

  search: '',
  actions: {
    refreshSelectedSegmento(segmento) {
      this.send('animateCardList');
      this.set('selectedSegmento', segmento);
      this.send('isBloco');

      this.set('selectedAno', this.get('plataformaAnos').get('firstObject'));
    },
    refreshSelectedSituacao(selectedSituacao) {
      this.set('selectedSituacao', selectedSituacao);
    },
    refreshSelectedAno(selectedAno) {
      this.set('selectedAno', selectedAno);
    },

    refreshSelectedBusca(id){
      this.set('selectedCompId', id);
    },

    refreshOrdem(ordem) {
      this.set('ordem', ordem);
    },
    
    refreshSelectedCalendario(calendario){
      this.set('calendario', calendario);
    },

    eraseText() {
      let btnTarget = document.getElementById("aulapesquisa");
      btnTarget.value = '';
    },
    animateCardList() {
      let currentList = document.querySelector('ul[class*="card-list"]');
      currentList.classList.remove('fadeIn');
      setTimeout(() => {
        currentList.classList.add('fadeIn')
      }, 1);
    },


    isBloco() {
      let segmento = this.get('selectedSegmento');
      if (segmento === 'Ensino Infantil' || segmento === 'Fundamental I') {
        this.set('isBloco', true);
      } else {
        this.set('isBloco', false);
      }
    },

    termoAceite() {
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      document.getElementById('termo_modal').classList.add('modal--is-show');
      document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
    },
    aceitarTermo(){
      let pessoa = this.get('store').peekRecord("pessoa", this.get('pessoaId'));
      pessoa.set('termoAceite', true);
      pessoa.save().then(() => {
        document.getElementsByTagName('body')[0].style.overflow = 'auto';
        document.getElementById('termo_modal').classList.remove('modal--is-show');
        document.getElementsByTagName('body')[0].classList.remove('overflow-hidden');
        $('body').removeClass('no-header');
      })
    },
    cancelTermo() {
      localStorage.clear();
      this.get('session').invalidate();
    },

    ejaModal(){
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      document.getElementById('eja_modal').classList.add('modal--is-show');
      document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
    },
    cancelEjaModal(){
      localStorage.clear();
      this.get('session').invalidate();
    },

    closeNotifications(){
      var card = document.getElementById('notificationCard');
      card.classList.remove('notification-animation-enter');
      card.classList.add('notification-animation-close');

      setTimeout(() => {
        this.set('hasNotification', false);
      }, 100);

      let notifications = this.get('notifications');
      let person = JSON.parse(localStorage.getItem('person_logged'));
      let pessoa = this.get('store').peekRecord('pessoa', person.id);

      notifications.forEach(n =>{
        var newPN = this.get('store').createRecord('pessoa-notification', {
          notification: n,
          pessoa: pessoa,
        });

        newPN.save();
      })
    },

    openPdfViewer(livro) {
      var adobeDCView = new AdobeDC.View({clientId: this.get('adobeApiKey'), divId: "adobe-dc-view", locale: "pt-BR"});
		  adobeDCView.previewFile({
			content:{location: {url: livro.get('url')}},
			metaData:{fileName: "Livro"}
		}, {showAnnotationTools: false, showDownloadPDF: false, showPrintPDF: false, embedMode: "LIGHT_BOX"});
    }
  },
  init: function () {
    this._super();
    this.set('selectedSituacao', '');
  },


});
