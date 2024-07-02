import { onceIntersecting } from '../../scripts/global-functions.js';

// Render badges based on authored field
const renderBadges = (badges) => {
  const fragment = document.createDocumentFragment();
  badges.forEach((badge) => {
    const badgeContainer = document.createElement('div');
    badgeContainer.classList.add('badge__container');
    const badgeLink = document.createElement('a');
    badgeLink.title = badge.textContent;
    badgeLink.href = 'https://www.g2.com/products/pricefx/reviews?utm_source=rewards-badge';
    const badgeImg = document.createElement('img');
    badgeImg.decoding = 'async';
    badgeImg.alt = badge.textContent;
    badgeImg.dataset.src = badge.href;
    badgeImg.src = badge.href;
    badgeImg.loading = 'lazy'; // Add lazy loading for images
    badgeImg.classList.add('badge__icon');
    badgeLink.appendChild(badgeImg);
    badgeContainer.appendChild(badgeLink);
    fragment.appendChild(badgeContainer);
  });
  return fragment;
};

const setMaxWidthMinHeight = (el, width, height) => {
  if (width) {
    el.style.maxWidth = `${width + 36}px`;
  }
  if (height) {
    el.style.minHeight = `${height}px`;
  }
};

const appendIframe = (container, src, height) => {
  const iframeEl = document.createElement('iframe');
  iframeEl.src = src;
  iframeEl.setAttribute('frameborder', '0');
  setMaxWidthMinHeight(iframeEl, null, height);
  container.appendChild(iframeEl);
};

// Render iframes based on authored field
const renderIframes = (iframes, height, width) => {
  const checkForFalseSource = (iframes[0].textContent.trim().match(/https:/g) || []).length;
  const iframesArray = checkForFalseSource > 1 ? Array.from(iframes).slice(1) : Array.from(iframes);
  const fragment = document.createDocumentFragment();
  if (iframesArray.length === 3) {
    // Creating left column and children elements
    const leftColumn = document.createElement('div');
    leftColumn.classList.add('iframe__left-column');
    setMaxWidthMinHeight(leftColumn, width);
    const iframeContainerOne = document.createElement('div');
    iframeContainerOne.classList.add('iframe__container');
    setMaxWidthMinHeight(iframeContainerOne, width);
    onceIntersecting(iframeContainerOne, () =>
      appendIframe(iframeContainerOne, iframesArray[0].textContent.trim(), height),
    );
    leftColumn.appendChild(iframeContainerOne);

    const iframeContainerTwo = document.createElement('div');
    iframeContainerTwo.classList.add('iframe__container');
    setMaxWidthMinHeight(iframeContainerTwo, width, height);
    onceIntersecting(iframeContainerTwo, () =>
      appendIframe(iframeContainerTwo, iframesArray[1].textContent.trim(), height),
    );
    leftColumn.appendChild(iframeContainerTwo);
    fragment.appendChild(leftColumn);

    // Creating right column and children elements
    const rightColumn = document.createElement('div');
    rightColumn.classList.add('iframe__right-column');
    setMaxWidthMinHeight(rightColumn, width);
    const iframeContainerThree = document.createElement('div');
    iframeContainerThree.classList.add('iframe__container');
    setMaxWidthMinHeight(iframeContainerThree, width, height);
    onceIntersecting(iframeContainerThree, () =>
      appendIframe(iframeContainerThree, iframesArray[2].textContent.trim(), height),
    );
    rightColumn.appendChild(iframeContainerThree);
    fragment.appendChild(rightColumn);
  } else {
    iframesArray.forEach((iframe) => {
      const iframeSource = iframe.textContent.trim();
      const iframeContainer = document.createElement('div');
      iframeContainer.classList.add('iframe__container');
      setMaxWidthMinHeight(iframeContainer, width, height);
      onceIntersecting(iframeContainer, () => appendIframe(iframeContainer, iframeSource, height));
      fragment.appendChild(iframeContainer);
    });
  }
  return fragment;
};

export default function decorate(block) {
  const [badgeLinks, iframeLinks, widthElement, heightElement] = block.children;
  const badgeItems = badgeLinks.querySelectorAll('a');
  const iframeItems = iframeLinks.querySelectorAll('p');
  const height = Number(heightElement.textContent);
  const width = Number(widthElement.textContent);
  block.textContent = '';

  // Create badge wrapper element and render individual badges
  if (badgeLinks.textContent.trim() !== '') {
    const badgeWrapper = document.createElement('div');
    badgeWrapper.classList.add('badge__wrapper');
    badgeWrapper.append(renderBadges(badgeItems));
    block.append(badgeWrapper);
  }

  // Create iFrame wrapper element and render individual iFrames
  if (iframeLinks.textContent.trim() !== '') {
    const iframeWrapper = document.createElement('div');
    iframeWrapper.classList.add('iframe__wrapper');

    // Add custom class for 3 iframes
    if (iframeItems.length === 3) {
      iframeWrapper.classList.add('iframe__wrapper--three-iframes');
    }

    // Add custom class if badges are present
    if (badgeLinks.textContent.trim() !== '') {
      iframeWrapper.classList.add('frame__wrapper--with-badge');
    }

    iframeWrapper.append(renderIframes(iframeItems, height, width));
    block.append(iframeWrapper);
  }
}
