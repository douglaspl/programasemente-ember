import Ember from 'ember';
import Util from 'ember-cli-pagination/util';
import PageItems from 'ember-cli-pagination/lib/page-items';
import Validate from 'ember-cli-pagination/validate';
import layout from '../templates/components/page-numbers';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['pagination'],
  layout,
  currentPage: Ember.computed.alias("content.page"),
  totalPages: Ember.computed.alias("content.content.meta.page.last-page"),
  hasPages: Ember.computed.gt('totalPages', 1),
  watchInvalidPage: Ember.observer("content", function() {
    const c = this.get('content');
    if (c && c.on) {
      c.on('invalidPage', (e) => {
        this.sendAction('invalidPageAction',e);
      });
    }
  }),
  // watchInvalidPage: Ember.observer("currentPage", "totalPages", function() {
  //   const page = Number(this.get("currentPage"));
  //   const totalPages = Number(this.get("totalPages"));
  //   if (page > totalPages) {
  //     this.sendAction('invalidPageAction',e);
  //   }
  // }),
  truncatePages: true,
  numPagesToShow: 10,

  validate: function() {
    if (Util.isBlank(this.get('currentPage'))) {
      Validate.internalError("no currentPage for page-numbers");
    }
    if (Util.isBlank(this.get('totalPages'))) {
      Validate.internalError('no totalPages for page-numbers');
    }
  },

  pageItemsObj: Ember.computed(function() {
    let result = PageItems.create({
      parent: this
    });

    Ember.defineProperty(result, 'currentPage', Ember.computed.alias("parent.currentPage"));
    Ember.defineProperty(result, 'totalPages', Ember.computed.alias("parent.totalPages"));
    Ember.defineProperty(result, 'truncatePages', Ember.computed.alias("parent.truncatePages"));
    Ember.defineProperty(result, 'numPagesToShow', Ember.computed.alias("parent.numPagesToShow"));
    Ember.defineProperty(result, 'showFL', Ember.computed.alias("parent.showFL"));

    return result;
  }),

  pageItems: Ember.computed("pageItemsObj.pageItems","pageItemsObj", function() {
    this.validate();
    return this.get("pageItemsObj.pageItems");
  }),

  canStepForward: Ember.computed("currentPage", "totalPages", function() {
    const page = Number(this.get("currentPage"));
    const totalPages = Number(this.get("totalPages"));
    return page < totalPages;
  }),

  canStepBackward: Ember.computed("currentPage", function() {
    const page = Number(this.get("currentPage"));
    return page > 1;
  }),

  actions: {
    pageClicked: function(number) {
      Util.log("PageNumbers#pageClicked number " + number);
      this.set("currentPage", number);
      this.sendAction('action',number);
    },
    incrementPage: function(num) {
      const currentPage = Number(this.get("currentPage")),
           totalPages = Number(this.get("totalPages"));

      if(currentPage === totalPages && num === 1) { return false; }
      if(currentPage <= 1 && num === -1) { return false; }
      this.incrementProperty('currentPage', num);

      const newPage = this.get('currentPage');
      this.sendAction('action',newPage);
    },
    clickPage() {
      document.getElementById('pagination_input').value = '';
    },
    outPage() {
      document.getElementById('pagination_input').value = this.get('currentPage') + ' de ' + this.get('totalPages');
    },
    gotoPage(key) {
      let page_tgt = document.getElementById('pagination_input').value;
      if (key.key === 'Enter') {        
        if (page_tgt <= this.get('totalPages') && page_tgt > 0) {
          this.set("currentPage", page_tgt);
          this.sendAction('action', page_tgt);
        }
        else {
          document.getElementById('pagination_input').value = this.get('currentPage') + ' de ' + this.get('totalPages');
        }
      }
      else if ( key.key == 1 || key.key == 2 || key.key == 3 || key.key == 4 || key.key == 5 || key.key == 6 || key.key == 7 || key.key == 8 || key.key == 9 || key.key == 0 || key.key == 'Backspace') {
        if (isNaN(page_tgt)) document.getElementById('pagination_input').value = '';
      }
      else {
        document.getElementById('pagination_input').value = '';
      }
    }
  }
});