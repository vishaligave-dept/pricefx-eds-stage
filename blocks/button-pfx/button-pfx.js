export default async function decorate(block) {
  const [link, target, type] = block.children;
  const targetValue = target.textContent.trim() === 'true' ? '_blank' : '_self';

  if (type.textContent.trim() === 'left-arrow') {
    block.classList.add('left-arrow');
  } else if (type.textContent.trim() === 'right-arrow') {
    block.classList.add('right-arrow');
  }

  if (link.textContent.trim() !== '') {
    const buttonEl = document.querySelector('a');
    buttonEl.setAttribute('target', targetValue);
  }

  if (target.textContent.trim() !== '') {
    target.classList.add('hidden');
  }

  if (type.textContent.trim() !== '') {
    type.classList.add('hidden');
  }
}
