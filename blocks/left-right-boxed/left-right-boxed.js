import { createOptimizedPicture } from '../../scripts/aem.js';
import { decorateEmbed } from '../embed/embed.js';

export default async function decorate(block) {
  const boxedContainer = document.createElement('div');
  boxedContainer.classList.add('boxed-main-container');
  const boxedLeftContainer = document.createElement('div');
  boxedLeftContainer.classList.add('boxed-left-container');
  const boxedRightContainer = document.createElement('div');
  const boxedLeftContainerInner = document.createElement('div');
  boxedLeftContainerInner.classList.add('boxed-content-container');

  const [
    variation,
    imagetoLeft,
    imageContainer,
    videoPlaceHolder,
    videoUrl,
    videoOverlay,
    videoPopup,
    eyebrow,
    description,
    imgReverse,
  ] = block.children;

  const variationImagetoLeft = imagetoLeft.firstElementChild?.textContent || 'false';
  if (variationImagetoLeft === 'true') {
    boxedContainer.classList.add('boxed-content-right');
  }
  const variationOption = variation?.textContent.trim();
  if (variationOption === 'videoVariation') {
    const boxedRightContainerInner = document.createElement('div');
    boxedRightContainerInner.classList.add('embed');
    const placeholder = videoPlaceHolder;
    const link = videoUrl;
    const overlayText = videoOverlay;
    const isPopup = videoPopup;
    boxedRightContainer.textContent = '';
    if (link.textContent !== '') {
      if (window.matchMedia('(min-width:986px)').matches && placeholder.querySelector('img') !== null) {
        boxedRightContainerInner.setAttribute('style', `background-image:url(${placeholder.querySelector('img').src})`);
      }
      boxedRightContainerInner.append(placeholder);
      boxedRightContainerInner.append(link);
      boxedRightContainerInner.append(overlayText);
      boxedRightContainerInner.append(isPopup);

      decorateEmbed(boxedRightContainerInner);
      boxedRightContainer.append(boxedRightContainerInner);
    }
  } else {
    const boxedImageContainer = document.createElement('div');
    boxedImageContainer.classList.add('boxed-image-container');
    const boxedImage = imageContainer;
    if (boxedImage !== undefined && window.matchMedia('(min-width:986px)').matches) {
      if (boxedImage?.querySelector('img') !== null) {
        boxedImageContainer.setAttribute('style', `background-image:url(${boxedImage.querySelector('img').src})`);
      }
      boxedImageContainer.append(boxedImage);
      boxedRightContainer.textContent = '';
      boxedRightContainer.append(boxedImageContainer);
    }
  }
  boxedRightContainer.classList.add('boxed-right-container');
  if (eyebrow.textContent.trim() !== '') {
    const boxedEyebrowText = document.createElement('span');
    boxedEyebrowText.classList.add('eyebrow-text');
    boxedEyebrowText.append(eyebrow);
    boxedLeftContainerInner.append(boxedEyebrowText);
  }

  if (description.textContent.trim() !== '') {
    boxedLeftContainerInner.append(description || '');
  }

  if (imgReverse.textContent.trim() === 'true') {
    boxedContainer.classList.add('boxed-mobile-reverse');
  }

  boxedLeftContainer.append(boxedLeftContainerInner);

  boxedRightContainer
    .querySelectorAll('img')
    .forEach((img) =>
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])),
    );

  boxedContainer.append(boxedLeftContainer);
  boxedContainer.append(boxedRightContainer);
  block.textContent = '';
  block.append(boxedContainer);
}
