import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
    session: Ember.inject.service(),
    store: Ember.inject.service(),
    appController: Ember.inject.controller('application'),
    role: Ember.computed('appController', function() {
        let ac = this.get('appController');
        return ac.get('role');
    }),
    oneInst: Ember.computed('model', function() {
        let inst = this.get('model');
        if (this.get('role') === 'admin') {
            return false;
        }
        else {
            let that = this;
            Ember.run.once(function(){
                that.set('inst_selected', inst);
                that.set('pessoas_selected', inst.get('pessoas'));
            });
            return true;
        }
    }),
    setSelected(inst) {
        let inst_selected;
        let instit = this.get('model');
        instit.forEach(function(element) {
            if (element.id === inst) {
                inst_selected = element;
            }
        });
        this.set('inst_selected', inst_selected);
    },
    actions: {
        selectInst() {
            this.set('inst_selected', false);
            let inst = document.getElementById('select_inst').value;
            this.setSelected(inst);
        },
        selectPeriod() {
            let period_selected = document.getElementById('select_period').value;
        },
        toggleAccordion(param) {
            if (document.getElementById('acc_' + param).style.maxHeight !== "0px") {
                document.getElementById('acc_' + param).style.maxHeight = "0px";
            }
            else {
                document.getElementById('acc_' + param).style.maxHeight = document.getElementById('acc_' + param).scrollHeight + "px";
            }
        },
        logOut() {
            localStorage.clear();  
            this.get('session').invalidate();
        }
    }
})