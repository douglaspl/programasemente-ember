import Ember from 'ember';
import Component from '@ember/component';
import ENV from '../config/environment';


Ember.LinkComponent.reopen({
  activeClass: 'tabs__tab--is-active'
});

export default Component.extend({
  adobeApiKey: ENV.adobeApiKey,
  didInsertElement() {
    this._super(...arguments);
    this.set('clickOutsideHandler', this.handleOutsideClick.bind(this));
    document.addEventListener('click', this.clickOutsideHandler);
  },

  willDestroyElement() {
    this._super(...arguments);
    document.removeEventListener('click', this.clickOutsideHandler);
  },

  handleOutsideClick(event) {
    // Assume que você tem uma maneira de acessar o submenu, por exemplo, usando this.element.querySelector('.submenu')
    let submenu = document.querySelector('.l-user-header__avatarWrapper__menuMobile');
    let target = event.target;
    let triggerer = document.querySelector('.l-user-header__avatarWrapper-nameWrapper');
    //debugger;
    if (submenu) {
      if (!triggerer.contains(target)) {
        // Código para fechar o submenu aqui, por exemplo, ajustando uma propriedade que controla sua visibilidade
        this.set('submenuOpen', null);
      }
    }
  },




  adobeApiKey: ENV.adobeApiKey,
  store: Ember.inject.service(),
  tagName: '',
  router: Ember.inject.service('-routing'),
  session: Ember.inject.service('session'),
  submenuOpen: false,
  optionsOpen: false,

  showCounter: false,
  hasNewNotification: false,
  hasOldNotification: false,
  notifications: Ember.computed('model', function () {
    var allNotifications = this.get('store').peekAll('notification');
    let p = JSON.parse(localStorage.getItem('person_logged'));
    let pessoa = this.get('store').peekRecord('pessoa', p.id);
    var pessoaNotifications = pessoa.get('pessoaNotifications');

    var newNotifications = [];
    var oldNotifications = [];
    allNotifications.forEach(n => {
      let pessoaNotificationsIds = pessoaNotifications.map(x => x.get('notification').get('id'));
      if (!pessoaNotificationsIds.includes(n.get('id'))) newNotifications.pushObject(n);
      else {
        var pn = pessoaNotifications.filterBy('notification.id', n.get('id')).get('firstObject');
        oldNotifications.pushObject(pn)
      }

    })
    this.set('newNotifications', newNotifications);
    this.set('oldNotifications', oldNotifications);
    if (newNotifications.length > 0) this.set('hasNewNotification', true);
    if (oldNotifications.length > 0) this.set('hasOldNotification', true);
  }),


  toogleModal(target) {
    var el = document.getElementById(target);
    $(el).toggleClass('modal--is-show');
    $('body').toggleClass('overflow-hidden');
  },

  instituicao: Ember.computed('', function () {
    return this.get('pessoa').get('instituicao');
  }),

  isAplicador: Ember.computed('', function () {
    return this.get('pessoa').get('isAplicador');
  }),

  isEja: Ember.computed('', function () {
    return this.get('pessoa').get('isEja');
  }),

  
  init() {
    this._super(...arguments);
    let showtoggle = this.get('showToggle');
    this.set('showToggle', showtoggle);
  },

  idxPlatAnosMedio: [10, 11, 12],
  isAlunoMedio: Ember.computed('pessoa', function () {
    let pessoa = this.get('pessoa');

    if (!pessoa) return false;
    if (pessoa.get('role') != "aluno") return false;

    let pessoaPlatAno = pessoa.get('plataformaAnos').get('firstObject');
    if (this.idxPlatAnosMedio.includes(pessoaPlatAno.get('idx'))) return true;
    return false;
  }),

  actions: {
    invalidateSession() {
      localStorage.clear();
      this.get('session').invalidate();
    },
    toggleAvatarModal() {
      this.toogleModal('change_image_modal');
    },

    openNotificationMenu() {
      this.set('notificationMenu', true);
      document.getElementById('notification-counter').style.display = "none";
    },

    closeNotificationMenu() {
      let container = document.getElementById('notification-container');
      container.classList.add('fadeOutRight');
      setTimeout(() => {
        this.set('notificationMenu', false);
        container.classList.remove('fadeOutRight');
      }, 100);

      let notifications = this.get('newNotifications');
      let person = JSON.parse(localStorage.getItem('person_logged'));
      let pessoa = this.get('store').peekRecord('pessoa', person.id);

      notifications.forEach(n => {
        var newPN = this.get('store').createRecord('pessoa-notification', {
          notification: n,
          pessoa: pessoa,
        });
        newPN.save();
      })
    },

    menuTogle() {
      if (this.get('submenuOpen')) {
        this.set('submenuOpen', false)
        setTimeout(() => {
          let chevron = document.getElementsByClassName('l-user-header__avatarWrapper-chevron')[0];
          chevron.classList.remove('l-user-header__avatarWrapper-chevron-is--rotated');
        }, 100);
      } else {
        this.set('submenuOpen', true);
        setTimeout(() => {
          let subMenu = document.getElementById("subMenu");
          let chevron = document.getElementsByClassName('l-user-header__avatarWrapper-chevron')[0];
          subMenu.style.maxHeight = '14rem';
          chevron.classList.add('l-user-header__avatarWrapper-chevron-is--rotated');
        }, 100);
        
        setTimeout(() => {
          let content = document.getElementById("content");
          content.style.opacity = 1;
        }, 300);
      }
    },

    optionsTogle() {
      if (this.get('optionsOpen')) {
        this.set('optionsOpen', false);
      } else {
        this.set('optionsOpen', true);
      }
    },

    invalidateSession: function () {
      localStorage.clear();
      this.get('session').invalidate();
    },

    openPdfViewer(livroUrl) {
      var adobeDCView = new AdobeDC.View({clientId: this.get('adobeApiKey'), divId: "adobe-dc-view", locale: "pt-BR"});
		  adobeDCView.previewFile({
        content:{location: {url: livroUrl}},
        metaData:{fileName: "Livro"}
      }, {showAnnotationTools: false, showDownloadPDF: false, showPrintPDF: false, embedMode: "LIGHT_BOX"});
    },
  }
});
