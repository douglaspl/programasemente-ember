import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    tagName: 'div',
    classNames: ['progress'],
    prog_widthCalc: Ember.computed('data', function() {
        let result = this.get('data.progressototal');
        if (!result) result = 0;
        let string;
        if (result === -1) {
            result = 0;
            string = Ember.String.htmlSafe('background-color: black; color: white; width: 100%;'); // BG black - no progress was loaded
        }
        else if (result === 0) {
            string = Ember.String.htmlSafe("width: 100%; background-color:dimgrey; color: white;"); // BG gray - progresses loaded, zero activities initiated
        }
        else if (result <= 10){
            string = Ember.String.htmlSafe("width: 13%;"); // no progress bar with smaller widths than 13%
        }
        else {
            string = Ember.String.htmlSafe("width: " + result + "%;");
        }
        let that = this;
        Ember.run.once(function() {
            that.set('prog_style', string);
        });
        return result;
    })
});