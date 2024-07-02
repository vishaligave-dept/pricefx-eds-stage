import { environmentMode } from '../../scripts/global-functions.js';

export default function decorate(block) {
  const [link, target] = block.children;
  const { href } = link.querySelector('a') || '';
  const isTarget = target.textContent.trim();
  const image = block.parentElement.previousSibling.querySelector('picture');
  if (image && href) {
    const { parentElement } = image;
    const anchor = document.createElement('a');
    anchor.classList.add('image-link');
    anchor.href = href;
    anchor.target = isTarget === 'true' ? '_blank' : '';
    anchor.append(image);
    parentElement.append(anchor);
  }

  block.textContent = '';

  if (environmentMode() === 'publish') {
    block.parentElement.remove();
  }
}
