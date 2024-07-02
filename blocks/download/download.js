import { processUrl } from '../../scripts/global-functions.js';

export default function decorate(block) {
  const [imageDiv, altTextDiv, assetLinkDiv, targetDiv, alignmentDiv] = [...block.children];
  const downloadDiv = document.createElement('div');
  downloadDiv.classList.add('download-container');

  const target = targetDiv.querySelector('p') ? targetDiv.querySelector('p').textContent.trim() : 'false';
  if (alignmentDiv?.querySelector('p')) {
    const alignment = alignmentDiv.querySelector('p').textContent;
    downloadDiv.classList.add(alignment);
  }

  let assetLink = null;
  let fileName = null;

  if (assetLinkDiv.querySelector('img')) {
    assetLink = assetLinkDiv.querySelector('img').src;
  } else if (assetLinkDiv.querySelector('a')) {
    assetLink = assetLinkDiv.querySelector('a').href;
  }

  const image = imageDiv.querySelector('img');
  if (altTextDiv.querySelector('p')) {
    const altText = altTextDiv.querySelector('p').textContent;
    image.setAttribute('alt', altText);
  }

  if (assetLink) {
    const lastSlashIndex = assetLink.lastIndexOf('/');
    fileName = assetLink.substring(lastSlashIndex + 1);
    const assetPath = processUrl(assetLink);

    const linkTag = document.createElement('a');
    linkTag.href = assetPath;
    if (target !== 'false') {
      linkTag.target = '__blank';
    } else {
      linkTag.download = fileName;
    }
    linkTag.appendChild(image);
    linkTag.setAttribute('tabIndex', 0);
    linkTag.setAttribute('role', 'button');
    linkTag.setAttribute('aria-label', `Download ${fileName}`);
    downloadDiv.appendChild(linkTag);
  }
  block.innerHTML = '';
  block.appendChild(downloadDiv);
}
