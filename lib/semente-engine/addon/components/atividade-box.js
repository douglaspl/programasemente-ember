import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    comp_run: Ember.computed('atividade', 'role', function() {
        let item = this.get('atividade');
        let ts1_tot, ts2_tot, ts3_tot, ts4_tot, ts5_tot; // , ts6_tot;
        if (this.get('role') === 'aluno') {
            let prog = item.get('firstObject');
            let maxt = 5; // maxt = 6;
            ts1_tot = Math.round(prog.get('ts1')/maxt);
            ts2_tot = Math.round(prog.get('ts2')/maxt);
            ts3_tot = Math.round(prog.get('ts3')/maxt);
            ts4_tot = Math.round(prog.get('ts4')/maxt);
            ts5_tot = Math.round(prog.get('ts5')/maxt);
            // ts6_tot = Math.round(prog.get('ts6')/maxt);
            this.set('ts1', Math.round(prog.get('ts1')) + "%");
            this.set('ts2', Math.round(prog.get('ts2')) + "%");
            this.set('ts3', Math.round(prog.get('ts3')) + "%");
            this.set('ts4', Math.round(prog.get('ts4')) + "%");
            this.set('ts5', Math.round(prog.get('ts5')) + "%");
            // this.set('ts6', Math.round(prog.get('ts6')) + "%");
        }
        else {
            ts1_tot = Math.round(item.get('ts1instituicao')/maxt);
            ts2_tot = Math.round(item.get('ts2instituicao')/maxt);
            ts3_tot = Math.round(item.get('ts3instituicao')/maxt);
            ts4_tot = Math.round(item.get('ts4instituicao')/maxt);
            ts5_tot = Math.round(item.get('ts5instituicao')/maxt);
            // ts6_tot = Math.round(item.get('ts6instituicao')/maxt);
            this.set('ts1', Math.round(item.get('ts1instituicao')) + "%");
            this.set('ts2', Math.round(item.get('ts2instituicao')) + "%");
            this.set('ts3', Math.round(item.get('ts3instituicao')) + "%");
            this.set('ts4', Math.round(item.get('ts4instituicao')) + "%");
            this.set('ts5', Math.round(item.get('ts5instituicao')) + "%");
            // this.set('ts6', Math.round(item.get('ts6instituicao')) + "%");
        }
        let t_abertura, t_quiz, t_teoria, t_video, t_atividade; //, t_ts6;
        if (ts1_tot < 3) {
            t_abertura = Ember.String.htmlSafe("width: 3%;");
        }
        else {
            t_abertura = Ember.String.htmlSafe("width: " + ts1_tot + "%;");
        }
        if (ts2_tot < 3) {
            t_video = Ember.String.htmlSafe("width: 3%;");
        }
        else {
            t_video = Ember.String.htmlSafe("width: "+ ts2_tot + "%;");
        }
        if (ts3_tot < 3) {
            t_quiz = Ember.String.htmlSafe("width: 3%;");
        }
        else {
            t_quiz = Ember.String.htmlSafe("width: "+ ts3_tot + "%;");
        }
        if (ts4_tot < 3) {
            t_teoria = Ember.String.htmlSafe("width: 3%;");
        }
        else {
            t_teoria = Ember.String.htmlSafe("width: "+ ts4_tot + "%;");
        }
        if (ts5_tot < 3) {
            t_atividade = Ember.String.htmlSafe("width: 3%;");
        }
        else {
            t_atividade = Ember.String.htmlSafe("width: "+ ts5_tot + "%;");
        }
        // if (ts6_tot < 3) {
        //     t_ts6 = Ember.String.htmlSafe("width: 3%;");
        // }
        // else {
        //     t_ts6 = Ember.String.htmlSafe("width: "+ ts6_tot + "%;");
        // }
        this.set('t_abertura', t_abertura);
        this.set('t_video', t_video);
        this.set('t_quiz', t_quiz);
        this.set('t_teoria', t_teoria);
        this.set('t_atividade', t_atividade);
        // this.set('t_ts6', t_ts6);
        return true;
    })
});