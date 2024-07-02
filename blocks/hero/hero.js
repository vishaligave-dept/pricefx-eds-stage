import { decorateEmbed } from '../embed/embed.js';
import { loadFragment } from '../fragment/fragment.js';
import { environmentMode, replaceBasePath } from '../../scripts/global-functions.js';
import { BASE_CONTENT_PATH } from '../../scripts/url-constants.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

async function loadStats(statsData, heroLeftContainerInner) {
  if (statsData.querySelector('a')) {
    const link = statsData.querySelector('a').href;
    if (link.includes('/fragments/')) {
      const url = new URL(link);
      const fragmentPath = url.pathname;
      const fragmentBlock = await loadFragment(fragmentPath);
      if (fragmentBlock) {
        const lastChild = statsData.lastElementChild;
        lastChild.className = `hero-stats-content`;
        const fragmentChild = fragmentBlock.querySelector('.section.stats-container .stats-wrapper');
        if (fragmentChild) {
          heroLeftContainerInner.append(fragmentChild);
        }
      }
    }
  }
}

export default async function decorate(block) {
  const heroContainer = document.createElement('div');
  heroContainer.classList.add('hero-main-container');
  const heroLeftContainer = document.createElement('div');
  heroLeftContainer.classList.add('hero-left-container');
  const heroRightContainer = document.createElement('div');
  const heroLeftContainerInner = document.createElement('div');
  heroLeftContainerInner.classList.add('hero-content');
  const [
    variation,
    imageContainer,
    videoPlaceHolder,
    videoUrl,
    videoOverlay,
    videoPopup,
    heroHeight,
    eyebrow,
    description,
    button1,
    target1,
    button2,
    target2,
    button3,
    target3,
    stats,
  ] = block.children;

  const variationOption = variation?.textContent.trim();
  if (variationOption === 'noVariation') {
    heroContainer.classList.add('hero-no-bg-image');
    heroRightContainer.textContent = '';
  } else if (variationOption === 'videoVariation') {
    heroContainer.classList.add('hero-video');
    const heroRightContainerInner = document.createElement('div');
    heroRightContainerInner.classList.add('embed');
    const placeholder = videoPlaceHolder;
    const link = videoUrl;
    const overlayText = videoOverlay;
    const isPopup = videoPopup;
    heroRightContainer.textContent = '';
    if (link.textContent !== '') {
      heroRightContainerInner.append(placeholder);
      heroRightContainerInner.append(link);
      heroRightContainerInner.append(overlayText);
      heroRightContainerInner.append(isPopup);
      decorateEmbed(heroRightContainerInner);
      heroRightContainer.append(heroRightContainerInner);
    }
  } else {
    const heroImageContainer = document.createElement('div');
    heroImageContainer.classList.add('hero-image-container');
    const heroImage = imageContainer;
    if (heroImage !== undefined && window.matchMedia('(min-width:986px)').matches) {
      if (heroImage?.querySelector('img') !== null) {
        const imageUrl = heroImage?.querySelector('img').src;
        heroImageContainer.setAttribute('style', `background-image:url(${imageUrl})`);
      }
      heroImageContainer.append(heroImage);
      heroRightContainer.textContent = '';
      heroRightContainer.append(heroImageContainer);
    }
  }
  heroRightContainer.classList.add('hero-right-container');
  if (heroHeight.textContent.trim() !== '') {
    heroContainer.classList.add(heroHeight.textContent.trim() || 'hero-primary-height');
  }

  if (eyebrow.textContent.trim() !== '') {
    const heroPreHeader = document.createElement('span');
    heroPreHeader.classList.add('eyebrow-text');
    heroPreHeader.append(eyebrow);
    heroLeftContainerInner.append(heroPreHeader);
  }

  if (description.textContent.trim() !== '') {
    description?.classList.add('hero-content-container');
    heroLeftContainerInner.append(description || '');
  }
  const isPublishEnvironment = environmentMode() === 'publish';

  if (button1.textContent.trim() !== '') {
    const button1Link = button1.querySelector('a');
    if (button1Link !== null) {
      if (target1 === true) {
        button1Link.querySelector('a').target = '_blank';
      }
      button1Link.href = replaceBasePath(isPublishEnvironment, button1Link.href, BASE_CONTENT_PATH);
      heroLeftContainerInner.append(button1.firstElementChild);
    }
  }
  if (button2.textContent.trim() !== '') {
    const button2Link = button2.querySelector('a');
    if (button2Link !== null) {
      if (target2 === true) {
        button2Link.querySelector('a').target = '_blank';
      }
      button2Link.href = replaceBasePath(isPublishEnvironment, button2Link.href, BASE_CONTENT_PATH);
      heroLeftContainerInner.append(button2.firstElementChild);
    }
  }
  if (button3.textContent.trim() !== '') {
    const button3Link = button3.querySelector('a');
    if (button3Link !== null) {
      if (target3 === true) {
        button3Link.querySelector('a').target = '_blank';
      }
      button3Link.href = replaceBasePath(isPublishEnvironment, button3Link.href, BASE_CONTENT_PATH);
      heroLeftContainerInner.append(button3.firstElementChild);
    }
  }

  if (stats !== '') {
    const statsData = stats.firstElementChild;
    loadStats(statsData, heroLeftContainerInner);
  }
  heroLeftContainer.append(heroLeftContainerInner);

  heroRightContainer
    .querySelectorAll('img')
    .forEach((img) =>
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])),
    );

  heroContainer.append(heroLeftContainer);
  heroContainer.append(heroRightContainer);
  block.textContent = '';
  block.append(heroContainer);
}
