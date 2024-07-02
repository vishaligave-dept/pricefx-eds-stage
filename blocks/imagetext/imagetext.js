import { createOptimizedPicture } from '../../scripts/aem.js';

function addElementsToContainer(container, elements) {
  const tempContainer = document.createElement('div');
  tempContainer.classList.add('content');
  elements.forEach((element, index) => {
    element.classList.add(`index-${index}`);
    tempContainer.appendChild(element);
  });
  container.appendChild(tempContainer);
}

export default async function decorate(block) {
  let elementsInContainer = [];

  let enableIcon = false;

  let buttonDisable = false;

  const imagetext = document.createElement('div');
  imagetext.classList.add('imagetext-container');

  const imagetextContainer = document.createElement('div');
  imagetextContainer.classList.add('imagetext-main-container');

  const imagetextLeftContainer = document.createElement('div');
  imagetextLeftContainer.classList.add('imagetext-left-container');

  const imagetextRightContainer = document.createElement('div');
  imagetextRightContainer.classList.add('imagetext-right-container');

  const imagetextAction = document.createElement('div');
  imagetextAction.classList.add('imagetext-action');

  const supportContainer = document.createElement('div');
  supportContainer.classList.add('support-container');

  const container = document.createElement('div');
  container.classList.add('container');

  const leftContainer = document.createElement('div');
  leftContainer.classList.add('left-container');

  const rightContainer = document.createElement('div');
  rightContainer.classList.add('right-container');

  const leftInnerContainer = document.createElement('div');
  leftInnerContainer.classList.add('inner-left-container');

  const rightInnerContainer = document.createElement('div');
  rightInnerContainer.classList.add('inner-right-container');

  const button = document.createElement('a');

  [...block.children].forEach((row, index) => {
    if (index === 0) {
      /* Description */
      const imagetextEl = document.createElement('p');
      imagetextEl.classList.add('imagetext-text');

      if (row.firstElementChild.textContent !== '') {
        imagetextEl.textContent = row.firstElementChild?.textContent;
      }

      imagetext.appendChild(imagetextEl);
    } else if (index === 1) {
      /* Left Container image */
      const bannerImage = row.firstElementChild?.querySelector('picture');
      bannerImage?.classList.add('banner-image');
      if (bannerImage) {
        const image = document.createElement('div');
        image.classList.add('banner-container');
        if (window.matchMedia('(min-width:986px)').matches && bannerImage.querySelector('img') !== null) {
          image.setAttribute('style', `background-image:url(${bannerImage.querySelector('img').src})`);
        }
        image.appendChild(bannerImage);
        imagetextLeftContainer.appendChild(image);
      }
    } else if (index === 2) {
      /* Enable icon for Action Text */

      if (row.firstElementChild.textContent !== '') {
        enableIcon = row.firstElementChild?.textContent;
      }
    } else if (index === 3) {
      /* Action Text */

      const action = row.firstElementChild;

      if (action.childNodes.length > 0) {
        action.childNodes.forEach((node) => {
          if (node.nodeType === 1 && node.tagName === 'P') {
            node.classList.add('icon-text');

            const newParagraph = document.createElement('p');
            newParagraph.classList.add('imagetext-para');
            newParagraph.appendChild(node.firstChild);

            if (enableIcon === 'true') {
              const icon = document.createElement('div');
              icon.classList.add('imagetext-icon');
              icon.appendChild(newParagraph);

              node.insertBefore(icon, node.firstChild);
            } else {
              node.insertBefore(newParagraph, node.firstChild);
            }
          }
        });
      }

      imagetextAction.appendChild(action);

      imagetextRightContainer.appendChild(imagetextAction);
    } else if (index === 4) {
      if (row.textContent.trim() !== '') {
        button.append(row.firstElementChild);
      } else {
        buttonDisable = true;
      }
    } else if (index === 5) {
      if (row.textContent.trim() === 'true' && buttonDisable === false) {
        button.target = '_blank';
      }
      if (buttonDisable === false) {
        imagetextAction.appendChild(button);
      }
    } else if (index === 6) {
      /* Support Title */
      const line = document.createElement('div');
      line.classList.add('cross-line');
      supportContainer.appendChild(line);

      const content = document.createElement('div');
      content.classList.add('suggestion-title');
      content.innerHTML = row.firstElementChild.innerHTML;

      supportContainer.appendChild(content);
    } else if (index >= 7) {
      if (index >= 7 && index <= 9) {
        elementsInContainer.push(row);
        if (index === 9) {
          addElementsToContainer(leftInnerContainer, elementsInContainer);
          elementsInContainer = [];
        }
      }
      if (index >= 10 && index <= 12) {
        elementsInContainer.push(row);
        if (index === 12) {
          addElementsToContainer(rightInnerContainer, elementsInContainer);
          elementsInContainer = [];
        }
      }
      if (index >= 13 && index <= 15) {
        elementsInContainer.push(row);
        if (index === 15) {
          addElementsToContainer(leftInnerContainer, elementsInContainer);
          elementsInContainer = [];
        }
      }
      if (index >= 16 && index <= 18) {
        elementsInContainer.push(row);
        if (index === 18) {
          addElementsToContainer(rightInnerContainer, elementsInContainer);
          elementsInContainer = [];
        }
      }
    }

    leftContainer.appendChild(leftInnerContainer);
    rightContainer.appendChild(rightInnerContainer);
  });

  container.appendChild(leftContainer);
  container.appendChild(rightContainer);

  supportContainer.appendChild(container);

  imagetextRightContainer.appendChild(supportContainer);

  imagetextLeftContainer
    .querySelectorAll('img')
    .forEach((img) =>
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])),
    );

  imagetextContainer.appendChild(imagetextLeftContainer);
  imagetextContainer.appendChild(imagetextRightContainer);

  imagetext.appendChild(imagetextContainer);
  block.textContent = '';
  block.append(imagetext);
}
