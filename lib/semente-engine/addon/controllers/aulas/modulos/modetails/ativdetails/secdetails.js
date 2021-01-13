import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
    queryParams: ['questao', 'videoini'],
    questao: null,
    videoini: null,
    sortingKey:['idx'],
    sortedConteudos: Ember.computed.sort('model.conteudos', 'sortingKey'),
    appController: Ember.inject.controller('application'),
    modController: Ember.inject.controller('aulas.modulos'),
    mdetController: Ember.inject.controller('aulas.modulos.modetails'),
    adetController: Ember.inject.controller('aulas.modulos.modetails.ativdetails'),
    appstate: Ember.inject.service(),
    upState: Ember.computed('appstate.upState', function() {
        let res = this.get('appstate.upState');
        return res;
    }),
    intervalId: null,
    questoes_timing: [],
    renderQuestao: Ember.observer('questao', function() {
        let intervalId = this.get('intervalId');
        if (intervalId){
            window.clearInterval(intervalId);
            this.set('intervalId', null);
        }
        if (this.get('questao')){
            intervalId = setInterval(() => {
                let url = window.location.href;
                let stringQuestao = 'modulos/modetails/';
                let checkLocation = url.indexOf(stringQuestao);
                if (checkLocation < 1){
                    window.clearInterval(intervalId);
                    this.set('intervalId', null);
                    return
                }
                let questao = this.get('questao');
                let questoes = this.get('model').get('conteudos').get('firstObject').get('quiz').get('questoes');
                let questaoAtual;
                questoes.forEach((q) => {
                    if (q.get('idx') == questao){
                        questaoAtual = q
                    }
                })
                let estadoQuestao = questaoAtual.get('estadosQuestao').get('firstObject');
                estadoQuestao.save()

            }, 1000);
            this.set('intervalId', intervalId);
        }
        let q = this.get('questao');
        let that = this;
        if (q) {
            let temp = Math.round(new Date().getTime()/1000);
            let timing = this.get('questoes_timing');
            let edit;
            if (timing.length > 0) {
                timing.forEach(t=>{
                    if (t.id == q) {
                        t.timestamp = temp;
                        edit = true;
                    }
                });
            }
            if (!edit) timing.push({'idx': q, 'timestamp': temp});
            Ember.run.schedule('afterRender', function() { 
                setTimeout(function(){
                    let elements = document.getElementsByClassName('course-nav__node');
                    for (let i = 0; i < elements.length; i++) { 
                        elements[i].classList.remove('course-nav__node--is-current');
                        // elements[i].classList.add('activity-nav__tab--actual');
                    }
                    let active = document.getElementById('li_conteudo_' + that.get('model').get('id') + '_' + that.get('model').get('conteudos').get('firstObject').get('id') + "_" + q);
                    if (active) active.classList.add('course-nav__node--is-current'); 
                },100);
            });
        }
        else {
            Ember.run.schedule('afterRender', function() { 
                setTimeout(function(){
                    let elements = document.getElementsByClassName('course-nav__node');
                    for (let i = 0; i < elements.length; i++) { 
                        elements[i].classList.remove('course-nav__node--is-current');
                        // elements[i].classList.add('activity-nav__tab--actual');
                    }
                },100);
            });
        }
    }),
    setPosition: Ember.observer('model', 'appController.transited', function() {
        let intervalId = this.get('intervalId');
        if (intervalId){
            window.clearInterval(intervalId);
            this.set('intervalId', null);
        }
        if (this.get('questao')){
            intervalId = setInterval(() => {
                let url = window.location.href;
                let stringQuestao = 'modulos/modetails/';
                let checkLocation = url.indexOf(stringQuestao);
                if (checkLocation < 1){
                    window.clearInterval(intervalId);
                    this.set('intervalId', null);
                    return
                }
                let questao = this.get('questao');
                let questoes = this.get('model').get('conteudos').get('firstObject').get('quiz').get('questoes');
                let questaoAtual;
                questoes.forEach((q) => {
                    if (q.get('idx') == questao){
                        questaoAtual = q
                    }
                })
                let estadoQuestao = questaoAtual.get('estadosQuestao').get('firstObject');
                estadoQuestao.save()

            }, 1000);
            this.set('intervalId', intervalId);
        }
        //this.get('appstate').updateApp();
        let section = this.get('model'); 
        let tran = this.get('appController.transited');
        if (section.get('id')) {      
            Ember.run.schedule('afterRender', function() {                
                setTimeout(function(){
                    let scroller = document.getElementById('section_scroll');
                    if (scroller && window.innerWidth > 900 && scroller.scroll) {
                        scroller.scroll(0,0);
                    }
                    let elements = document.getElementsByClassName('course-nav__node');
                    for (let i = 0; i < elements.length; i++) { 
                        elements[i].classList.remove('course-nav__node--is-active');
                        // elements[i].classList.add('activity-nav__tab--actual');
                    }
                    section.get('conteudos').forEach(conteudo=>{
                        let active = document.getElementById('li_conteudo_' + section.get('id') + '_' + conteudo.get('id'));
                        if (active) { 
                            active.classList.add('course-nav__node--is-active');
                            if (window.innerWidth > 900) active.scrollIntoView({behavior: "smooth"});
                        }
                    });            
                }, 100);

            });
        }
    }),
    actions: {
        scrollAction: function() {
            let heightMain = document.getElementById('main_output').clientHeight;
            let scrollHeight = document.getElementById('main_output').scrollHeight;
            let topScroll = document.getElementById('main_output').scrollTop;
            if (scrollHeight > heightMain + 50) { // there's more than 100px to scroll down
                if (scrollHeight - topScroll <= (heightMain + 10)) { // full way down
                    this.savePosition(100);
                }
                else if (topScroll > (heightMain/2)) { // halfway
                }
            }
        },
        expandDesk() {
            this.set('reset_desk', true);
            document.getElementById('left_col').style.display = 'none';
            // document.getElementById('col_main').style.maxWidth = '95%';
            document.getElementById('top_intro').style.marginTop = '70px';
            document.getElementById('top_header').style.backgroundColor = '#4266a0';
            document.getElementById('top_exit').style.backgroundColor = '#4266a0';
            document.getElementById('a_top_exit').style.color = 'white';
            document.getElementById('top_navbar').style.height= '60px';
        },
        resetDesk() {
            this.set('reset_desk', false);
            document.getElementById('left_col').style.display = '';
            document.getElementById('col_main').style.maxWidth = '';
            document.getElementById('top_intro').style.marginTop = '';
            document.getElementById('top_header').style.backgroundColor = '';
            document.getElementById('top_exit').style.backgroundColor = '';
            document.getElementById('a_top_exit').style.color = '';
            document.getElementById('top_navbar').style.height= '';
        },
        expandMob() {
            this.set('reset_mob', true);
            document.getElementById('top_intro').style.display = 'none';
            document.getElementById('top-navbar-mobile').style.display = 'none';
            document.getElementById('main_output').style.height = '100vh';
            // document.getElementById('ativ-bottom-controller').style.bottom = '70px';
            document.getElementById('main_output').style.marginTop = '0px';
            document.getElementById('content-main').style.paddingTop = '0px';
        },
        resetMob() {
            this.set('reset_mob', false);
            document.getElementById('top_intro').style.display = '';
            document.getElementById('top-navbar-mobile').style.display = '';
            // document.getElementById('ativ-bottom-controller').style.bottom = '';
            document.getElementById('main_output').style.height = '';
            document.getElementById('content-main').style.paddingTop = '';
            document.getElementById('main_output').style.marginTop = '';
        },
        decreaseFont() {
            let fontsize = document.getElementById('main_output').style.fontSize;
            let number = parseInt(fontsize.split("px")[0]);
            if (number > 10) {
                number = number - 2;
            }
            document.getElementById('main_output').style.fontSize  = number + 'px';
        },
        increaseFont() {
            let fontsize = document.getElementById('main_output').style.fontSize;
            let number = parseInt(fontsize.split("px")[0]);
            if (number < 90) {
                number = number + 2;
            }
            document.getElementById('main_output').style.fontSize  = number + 'px';
        },
        goTransition() {
            let section = this.get('model');
            let comTransicao = section.data.comTransicao;
            if (comTransicao){
                this.transitionToRoute('aulas.modulos.modetails.ativdetails.transitions',
                this.get('model').get('atividade').get('modulo').get('id'), 
                this.get('model').get('atividade').get('id'),
                this.get('model').get('id')); 
            }else{
                let atividade = this.get('model').get('atividade');
                let idx = section.get('idx');
                let next_section = atividade.get('secoes').filterBy('idx', idx + 1).get('firstObject');
                let id = next_section.id;

                this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails',
                    this.get('model').get('atividade').get('modulo').get('id'), 
                    this.get('model').get('atividade').get('id'),
                    id);
            }
            
        },
        goNext() {
            var intervalId = this.get('intervalId');
            if (intervalId){
                window.clearInterval(intervalId);
                this.set('intervalId', null);
            }
            this.transitionToRoute('aulas.modulos.modetails.ativdetails.transitions',
                this.get('model').get('atividade').get('modulo').get('id'), 
                this.get('model').get('atividade').get('id'),
                this.get('model').get('id')); 
            // let section = this.get('model');
            // let atividade = this.get('model').get('atividade');
            // let idx = section.get('idx');
            // let next_section = atividade.get('secoes').filterBy('idx', idx + 1).get('firstObject');
            // let id = next_section.id;

            // this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails',
            //     this.get('model').get('atividade').get('modulo').get('id'), 
            //     this.get('model').get('atividade').get('id'),
            //     id);
        },
        goQuestao(idx) {
            this.transitionToRoute('aulas.modulos.modetails.ativdetails.secdetails',
                this.get('model'), { queryParams: { questao: idx }}); 
        }        
    }
    
});