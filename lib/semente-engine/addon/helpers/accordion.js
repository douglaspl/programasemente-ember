import Ember from 'ember';

export function accordion(id) {
  // 0- unique || 1- multiple
  const visibilityType = 0;
  let accordionNodeList = document.getElementsByClassName('j-accordionNode');
  let target = document.getElementById('j-accordionContent' + id);

  if (visibilityType == 0) {
    for (let i = 0; i < accordionNodeList.length; i++)
      if (accordionNodeList[i].id != target.id)
        accordionNodeList[i].style.display = 'none';
  }

  let cta = document.getElementById('cta' + id);

  cta.classList.toggle('btn--is-toggle--on');

  target.style.display = target.style.display === 'none' ? 'inherit' : 'none';

  return;
}

export default Ember.Helper.helper(accordion);
