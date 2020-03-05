import Controller from '@ember/controller';
import Ember from 'ember';
import moment from 'moment';

export default Controller.extend({
    modController: Ember.inject.controller('modulos'),
    appController: Ember.inject.controller('application'),
    store: Ember.inject.service(),
    appstate: Ember.inject.service(),
    run_service: Ember.observer('model.modulos', function() {
        //this.get('appstate').updateApp();
        this.set('sortedModel', this.get('model.modulos'));
    }),
    botao_destaque: Ember.computed('appstate.upState', function() {
        let up = this.get('appstate.upState');
        // let tran = this.get('appController.transited');        
        if (up > 1) { // up 2 ou 3 significa que existem dados
            let mod = this.get('appstate.lista_modulos');
            let that = this;
            if (mod) {
                // acha o modulo com maior timestamp
                let mod_idx = -1;
                let ts = 0;
                let mod_resp;
                mod.forEach(m=>{
                    if (m.timestamp >= ts) {
                        ts = m.timestamp;
                        mod_idx = m.id;
                        mod_resp = m;
                    } 
                });        
                let resp = this.get('store').peekRecord('modulo', mod_idx);        
                let cont = 'Continuar curso';
                if (mod_resp) {
                    if (mod_resp.percent === 0) cont = 'Iniciar curso';
                    else if (mod_resp.percent === 100) cont = 'Rever curso';
                }
                if (resp) {                    
                    Ember.run.once(function(){            
                        that.set('modulo_destaque', resp);
                        let now = moment();
                        // Corrigingo da diferenca de GMT manualmente
                        if (mod_resp) {
                            let acesso = moment(mod_resp.timestamp*1000 + 3*3600*1000);
                            let dias = now.startOf('day').diff(acesso.startOf('day'),'days');
                            if (mod_resp.timestamp < 0) {
                                that.set('ultimo_acesso', 'Aguarde...');
                            }
                            else if (mod_resp.percent == 0) {
                                that.set('ultimo_acesso', 'Você nunca acessou esse curso'); 
                            }
                            else if (dias == 0)
                            {
                                that.set('ultimo_acesso', 'Seu último acesso foi hoje');
                            }
                            else
                            {
                                if (dias == 1)
                                {
                                    that.set('ultimo_acesso', 'Seu último acesso foi ontem');
                                }
                                else
                                {
                                    that.set('ultimo_acesso', 'Seu último acesso foi há ' + dias + ' dias');
                                }
                            }
                        }
                        else that.set('ultimo_acesso', 'Você nunca acessou esse curso'); 
                        
                    });
                    return cont;
                }
                else {
                    Ember.run.once(async function(){
                        that.set('ultimo_acesso', 'Aguarde...');
                        let modulos = await that.get('model').get('modulos'); // ensures that the needed data is retrieved
                        let leituras = await that.get('model').get('leituras'); // ensures that the needed data is retrieved
                        let respostas = await that.get('model').get('respostas'); // ensures that the needed data is retrieved
                        let estadoVideos = await that.get('model').get('estadoVideos'); // ensures that the needed data is retrieved
                        //that.get('appstate').updateApp();
                    });
                }
            }
            else {
                return 'no mod';
            }
        }
        else {
            return 'no upState';
        }
    }),
    rootURL: Ember.computed('modController', function() {
        let ac = this.get('modController');
        return ac.get('rootURL');
    }),
    // moduloSaved: Ember.computed('modController.moduloSaved', function() {
    //     return this.get('modController.moduloSaved');
    // }),
    resetaCursos() {
        let modulos = this.get('model.modulos');
        let nao_ini = document.getElementById('not-initiated').checked;
        let anda = document.getElementById('on-going').checked;
        let concluidos = document.getElementById('completed').checked;
        let resp = [];
        modulos.forEach(mod=>{
            let idx = mod.get('id');
            let mod_data = this.get('appstate').getItem('modulos', idx);
            if (mod_data.percent === 0 && nao_ini) resp.push(mod);
            else if (mod_data.percent === 100 && concluidos) resp.push(mod);
            else if (mod_data.percent > 0 && mod_data.percent < 100 && anda) resp.push(mod);
        });
        this.set('sortedModel', resp); 
    },
    // sortingKey:['name'],
    // sortedModel: Ember.computed.sort('model.modulos', 'sortingKey'),
     actions: {
        ordenaCursos() {
            let modulos = this.get('sortedModel');
            let sortingkey = document.getElementById('sort_modulos').value;
            let resp;
            if (sortingkey === 'za') resp = modulos.sortBy('name', 'DimensionName').reverse();
            else if (sortingkey === 'enrolled') resp = modulos.sortBy('dataInscricao', 'DimensionName');
            else resp = modulos.sortBy('name', 'DimensionName');
            this.set('sortedModel', resp);
        },
        filtraCursos() {
            this.resetaCursos();
        },
        modSearch(key) {
            //avoid forbidden expression            
            if (key.code === 'IntlRo' || key.code === 'IntlBackslash' || key.code === 'Escape') {
                document.getElementById('search_input').value = '';
                this.set('read_str', '');
                this.resetaCursos();
            }
            else {
                let read_str = document.getElementById('search').value;
                this.resetaCursos();
                let sorted = this.get('sortedModel');
                if (read_str) {
                    read_str = read_str.toLowerCase();
                    let result = [];
                    let newp;
                    if (sorted.get('length') > 0) {
                        sorted.forEach((mod)=>{
                            newp = 1;                            
                            if (mod.get('name')) {
                                if (mod.get('name').toLowerCase().search(read_str) >= 0 && newp) {
                                    result.pushObject(mod);
                                    newp = 0;
                                }
                            }
                            // if (mod.get('descricao')) {
                            //     if (mod.get('descricao').toLowerCase().search(read_str) >= 0 && newp) {
                            //         result.pushObject(mod);
                            //         newp = 0;
                            //     }
                            // }                               
                        });
                    }
                    this.set('sortedModel', result);
                }
                else {
                    document.getElementById('search').value = '';
                    this.set('read_str', '');
                    this.resetaCursos();
                }
            }
        },
        exitModSearch() {
            document.getElementById('search').value = '';
            this.resetaCursos();
            this.set('read_str', '');
        },
        goToModulo(param) {
            this.transitionToRoute('modulos.modlist', param);
            // let moduloSaved = this.get('modController').get('moduloSaved');
            // let atividade_id = '';
            // let secao_id = '';
            // let path = 'modulos.modetails.ativdetails.secdetails';
            // if (moduloSaved.length > 0) {
            //     moduloSaved.forEach(mod => {
            //         if (mod.modulo_id == mod_id) {
            //             atividade_id = mod.atividade_id;
            //             secao_id = mod.section;
            //         }
            //     });
            //     if (atividade_id) {
            //         this.transitionToRoute(path, param, atividade_id, secao_id);
            //     }
            //     else {
            //         this.set('error_noti', 'Não há conteúdo neste módulo.');
            //         this.set('success_noti', '');
            //         this.set('title_noti', 'Sem conteúdo');
            //         document.getElementById('noti_modal').style.display = 'block';
            //     }
            // }
            // else {
            //     this.transitionToRoute('modulos.modetails', param);
            // }
        },
        logOut() {
            this.get('modController').logOut();
        },
        cancelNoti() {
            this.set('error_noti', '');
            this.set('success_noti', '');
            this.set('title_noti', '');
            document.getElementById('noti_modal').style.display = 'none';
        },
    },
    init: function () {
        this._super();
        this.get('botao_destaque');
    } 
});