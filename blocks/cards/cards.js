import { createOptimizedPicture } from '../../scripts/aem.js';

function decorateCTA(cta, ctaTarget, isClickable) {
  const link = cta.querySelector('a');
  if (link && isClickable?.textContent.trim() !== 'true') {
    if (link.textContent.trim()) {
      const label = link.textContent.trim();
      link.title = label;
    }
    if (ctaTarget.textContent.trim() === 'true') {
      link.target = '_blank';
    }
    return cta.firstElementChild.firstElementChild;
  }
  cta.innerHTML = `<p>${link.textContent.trim()}</p>`;
  return cta;
}

function generateCardDom(props, block) {
  const [imageContainer, cardTopContent, eyebrow, title, description, cta, ctaTarget, isClickable] = props;
  const picture = imageContainer.querySelector('picture');
  const cardImPricing = block.classList.contains('card-im-pricing');

  // Build DOM
  if (isClickable?.textContent.trim() === 'true') {
    const link = cta.querySelector('a');
    const cardDOM = `
          <a class="cards-card-link" href="${link ? link.href : '#'}" target="${ctaTarget.textContent.trim() === 'true' ? '_blank' : ''}">
          ${cardImPricing ? `<div class='cards-card-top-content'>${cardTopContent.innerHTML}</div>` : `<div class='cards-card-image'>${picture ? picture.outerHTML : ''}</div>`}
          <div class='cards-card-body'>
              ${eyebrow?.textContent.trim() !== '' ? `<div class='cards-card-eyebrow'>${eyebrow.textContent.trim().toUpperCase()}</div>` : ``}
              ${title?.children.length > 0 ? `<div class='cards-card-title'><h6>${title.textContent.trim()}</h6></div>` : ``}
              ${description?.children.length > 0 ? `<div class='cards-card-description'>${description.innerHTML}</div>` : ``}
              ${cta.textContent.trim() ? `<div class='cards-card-cta'>${decorateCTA(cta, ctaTarget, isClickable).outerHTML}</div>` : ``}
          </div>
        </a>
    `;
    return cardDOM;
  }
  const cardDOM = `
      ${cardImPricing ? `<div class='cards-card-top-content'>${cardTopContent.innerHTML}</div>` : `<div class='cards-card-image'>${picture ? picture.outerHTML : ''}</div>`}
        <div class='cards-card-body'>
            ${eyebrow?.textContent.trim() !== '' ? `<div class='cards-card-eyebrow'>${eyebrow.textContent.trim().toUpperCase()}</div>` : ``}
            ${title?.children.length > 0 ? `<div class='cards-card-title'><h6>${title.textContent.trim()}</h6></div>` : ``}
            ${description?.children.length > 0 ? `<div class='cards-card-description'>${description.innerHTML}</div>` : ``}
            ${cta.textContent.trim() ? `<div class='cards-card-cta'>${decorateCTA(cta, ctaTarget).outerHTML}</div>` : ``}
        </div>
    `;
  return cardDOM;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    [...row.attributes].forEach(({ nodeName, nodeValue }) => {
      li.setAttribute(nodeName, nodeValue);
    });
    // Adding Style options
    if (index < 3) {
      if (row.textContent.trim()) {
        let className = '';
        if (index === 2) {
          className = row.textContent.trim().split(',');
          Array.from(className).forEach((name) => {
            block.classList.add(name);
          });
        } else {
          className = row.textContent.trim();
          block.classList.add(className);
        }
      }
      return;
    }
    li.innerHTML = generateCardDom(row.children, block);
    ul.append(li);
  });

  ul.querySelectorAll('img').forEach((img) =>
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])),
  );

  const cardEyebrow = ul.querySelectorAll('.cards-card-eyebrow');
  const cardTitle = ul.querySelectorAll('.cards-card-title');
  const cardDescription = ul.querySelectorAll('.cards-card-description');
  const cardTopContent = ul.querySelectorAll('.cards-card-top-content');

  // Adjust Inner Element Height Variation
  const cardInnerHeight = (innerElement) => {
    setTimeout(() => {
      if (innerElement.length > 0) {
        let maxHeight = 0;
        innerElement.forEach((element) => {
          const height = element.offsetHeight;
          maxHeight = Math.max(maxHeight, height);
        });
        if (maxHeight !== 0) {
          innerElement.forEach((element) => {
            element.style.height = `${maxHeight}px`;
          });
        }
      }
    }, 150); // Delay to ensure proper recalculation after content changes
  };

  const defaultCardInnerHeight = (innerElement) => {
    innerElement.forEach((element) => {
      element.style.height = 'auto';
    });
  };

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      cardInnerHeight(cardEyebrow);
      cardInnerHeight(cardTitle);
      cardInnerHeight(cardDescription);
      cardInnerHeight(cardTopContent);
    } else {
      defaultCardInnerHeight(cardEyebrow);
      defaultCardInnerHeight(cardTitle);
      defaultCardInnerHeight(cardDescription);
      defaultCardInnerHeight(cardTopContent);
    }
  });

  // Initial call to adjust heights
  if (window.innerWidth >= 768) {
    cardInnerHeight(cardEyebrow);
    cardInnerHeight(cardTitle);
    cardInnerHeight(cardDescription);
    cardInnerHeight(cardTopContent);
  }

  block.textContent = '';
  block.append(ul);
}
