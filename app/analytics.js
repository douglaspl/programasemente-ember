import EmberRouter from '@ember/routing/router';

EmberRouter.reopen({
  notifyGoogleAnalytics: function () {
    console.log('>_Google Analytics: ' + this.get('url'));
    if (typeof ga != 'function') {
      return;
    }
    return ga('send', 'pageview', {
      'page': this.get('url'),
      'title': this.get('url')
    });
  }.on('didTransition')
});
