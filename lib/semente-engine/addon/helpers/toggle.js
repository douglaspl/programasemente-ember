import Ember from 'ember';

export function toggle(target) {

  console.log(target);
  console.log("douglas");

  let el = document.getElementById(target);
  el.classList.toggle('d--none');

  document.getElementsByClassName('btn--is-toggle')[0].classList.toggle('btn--is-toggle--on'); //conseguiremos buscar o botão clicado?

  return;
}

export default Ember.Helper.helper(toggle);
