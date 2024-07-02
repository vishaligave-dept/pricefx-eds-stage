import { QUOTES } from '../../scripts/constants.js';

export default async function decorate(block) {
  const quoteContainer = document.createElement('div');
  quoteContainer.classList.add('quote-main-container');

  const quoteLeftContainer = document.createElement('div');
  quoteLeftContainer.classList.add('quote-left-container');

  const quoteRightContainer = document.createElement('div');
  const quoteRightContainerInner = document.createElement('div');
  quoteRightContainerInner.classList.add('quote-content');

  quoteRightContainer.classList.add('quote-right-container');
  quoteRightContainer.appendChild(quoteRightContainerInner);

  // eslint-disable-next-line no-unused-vars

  [...block.children].forEach((row, index) => {
    if (index === 1) {
      const quoteIcon = document.createElement('div');
      quoteIcon.className = 'quote-icon';
      quoteIcon.innerHTML = QUOTES;

      const quoteEl = document.createElement('p');
      quoteEl.classList.add('quote-text');
      quoteEl.append(row.firstElementChild);

      quoteIcon.appendChild(quoteEl);

      quoteRightContainerInner.appendChild(quoteIcon);
    } else if (index === 2) {
      const imageLogo = row.firstElementChild.querySelector('picture img');
      if (imageLogo) {
        const quoteLogo = document.createElement('div');
        quoteLogo.classList.add('quote-logo');
        quoteLogo.appendChild(imageLogo.parentElement);
        quoteRightContainerInner.appendChild(quoteLogo);
      }
    } else if (index === 3) {
      const authorEl = document.createElement('div');
      authorEl.classList.add('author');
      authorEl.innerHTML = row.firstElementChild.innerHTML;
      quoteRightContainerInner.appendChild(authorEl);
    } else if (index === 0) {
      const quoteImage = row.firstElementChild.querySelector('picture img');
      if (quoteImage) {
        quoteImage.classList.add('quote-image-container');
        if (quoteImage) {
          quoteLeftContainer.appendChild(quoteImage.parentElement);
        }
      } else {
        quoteLeftContainer.className = 'quote-no-image-container';
        quoteRightContainer.classList.add('quote-no-left-container');
      }
    }
  });

  quoteContainer.append(quoteLeftContainer);
  quoteContainer.append(quoteRightContainer);
  block.textContent = '';
  block.append(quoteContainer);
}
