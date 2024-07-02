import { loadScript } from '../../scripts/aem.js';
import { EMAIL, FACEBOOK, INSTAGRAM, LINKEDIN, TWITTER, YOUTUBE } from '../../scripts/constants.js';

function extractDomain(domain) {
  const regex = /^(?:https?:\/\/)?(?:www\.)?([^./]+)\.com/;
  const match = domain.match(regex);
  return match?.[1] || '';
}

function decorateSocialShare(block, config) {
  const wrapperElement = document.createElement('ul');
  wrapperElement.classList.add('a2a_kit', 'a2a_kit_size_32', 'a2a_default_style', 'social-share-buttons');

  Array.from(config).forEach((item) => {
    const listItem = document.createElement('li');
    const socialLink = document.createElement('a');
    socialLink.classList.add(`a2a_button_${item}`);
    socialLink.setAttribute('title', `Share on ${item}`);
    switch (item) {
      case 'facebook':
        socialLink.innerHTML = FACEBOOK;
        break;
      case 'twitter':
        socialLink.innerHTML = TWITTER;
        break;
      case 'linkedin':
        socialLink.innerHTML = LINKEDIN;
        break;
      case 'email':
        socialLink.innerHTML = EMAIL;
        break;
      default:
        break;
    }
    listItem.appendChild(socialLink);
    wrapperElement.appendChild(listItem);
  });

  loadScript('https://static.addtoany.com/menu/page.js', { async: true });
  block.appendChild(wrapperElement);
}

function decorateSocialFollow(block, config) {
  const wrapperElement = document.createElement('ul');
  wrapperElement.classList.add('social-follow');

  Array.from(config).forEach((link) => {
    const listItem = document.createElement('li');
    const domainName = extractDomain(link.textContent.trim()).toLowerCase();
    link.setAttribute('title', `Follow on ${domainName}`);
    link.target = '_blank';
    switch (domainName) {
      case 'facebook':
        link.innerHTML = FACEBOOK;
        break;
      case 'twitter':
        link.innerHTML = TWITTER;
        break;
      case 'linkedin':
        link.innerHTML = LINKEDIN;
        break;
      case 'instagram':
        link.innerHTML = INSTAGRAM;
        break;
      case 'youtube':
        link.innerHTML = YOUTUBE;
        break;
      default:
        break;
    }
    listItem.appendChild(link);
    wrapperElement.appendChild(listItem);
  });

  block.appendChild(wrapperElement);
}

export default async function decorate(block) {
  const [type] = block.children;
  const isLightTheme = block.children[7]?.querySelector('p')?.textContent.trim();

  if (isLightTheme === 'true') {
    block.classList.add('social-share-light-theme');
  }

  if (type?.textContent.trim() === 'share-buttons') {
    const config = block.children[6]?.querySelector('p')?.textContent?.split(',');
    block.textContent = '';
    if (config) {
      decorateSocialShare(block, config);
    }
  } else {
    const config = block.querySelectorAll('a');
    block.textContent = '';
    decorateSocialFollow(block, config);
  }
}
