import Ember from 'ember';

export function toggle(target) {

  let el = document.getElementById(target);
  el.classList.toggle('hidden');

  document.getElementsByClassName('btn--is-toggle')[0].classList.toggle('btn--is-toggle--on'); //conseguiremos buscar o botão clicado?

  return;
}

export default Ember.Helper.helper(toggle);
