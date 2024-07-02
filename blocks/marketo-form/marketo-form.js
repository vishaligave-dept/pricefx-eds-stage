import { loadScript } from '../../scripts/aem.js';
import { environmentMode, replaceBasePath } from '../../scripts/global-functions.js';
import { BASE_CONTENT_PATH } from '../../scripts/url-constants.js';

const formatFormLabel = (label) => {
  const removeLabelAsterix = label.textContent.includes('*') ? label.textContent.slice(1) : label.textContent;
  const removeLabelColon = removeLabelAsterix.includes(':')
    ? removeLabelAsterix.substring(0, removeLabelAsterix.length - 1)
    : removeLabelAsterix;

  return removeLabelColon;
};

const embedMarketoForm = (marketoId, formId, successUrl, isHideLabels, block, formElement) => {
  if (marketoId && formId) {
    const mktoScriptTag = loadScript('//lp.pricefx.com/js/forms2/js/forms2.min.js');
    mktoScriptTag.then(() => {
      if (successUrl) {
        window.MktoForms2.loadForm('//lp.pricefx.com', marketoId, formId, (form) => {
          // Add hide form labels class if boolean is true
          const allFormLabels = formElement.querySelectorAll('label');
          if (isHideLabels === 'true') {
            block.classList.add('form-hide-labels');
            allFormLabels.forEach((label) => {
              const parentEl = label.parentElement;
              const inputTextEl = parentEl.querySelector('input[type="text"]');
              const inputEmailEl = parentEl.querySelector('input[type="email"]');
              const inputTelEl = parentEl.querySelector('input[type="tel"]');
              const textareaEl = parentEl.querySelector('textarea');
              const selectEl = parentEl.querySelector('select');
              if (inputTextEl) {
                const formattedLabel = formatFormLabel(label);
                inputTextEl.setAttribute('placeholder', formattedLabel);
              }
              if (inputEmailEl) {
                const formattedLabel = formatFormLabel(label);
                inputEmailEl.setAttribute('placeholder', formattedLabel);
              }
              if (inputTelEl) {
                const formattedLabel = formatFormLabel(label);
                inputTelEl.setAttribute('placeholder', formattedLabel);
              }
              if (textareaEl) {
                const formattedLabel = formatFormLabel(label);
                textareaEl.setAttribute('placeholder', formattedLabel);
              }
              if (selectEl) {
                const formattedLabel = formatFormLabel(label);
                selectEl.children[0].textContent = formattedLabel;
              }
            });
          } else {
            block.classList.remove('form-hide-labels');
            allFormLabels.forEach((label) => {
              const parentEl = label.parentElement;
              if (parentEl.classList.contains('mktoRequiredField')) {
                const asterix = '<span class="form-asterix">*</span>';
                label.insertAdjacentHTML('beforeend', asterix);
              }
            });
          }

          // Add an onSuccess handler
          // eslint-disable-next-line no-unused-vars
          form.onSuccess((values, followUpUrl) => {
            const isPublishEnvironment = environmentMode() === 'publish';
            let newSuccessUrl;
            // Take the lead to a different page on successful submit,
            // ignoring the form's configured followUpUrl
            if (isPublishEnvironment) {
              if (successUrl !== '') {
                newSuccessUrl = replaceBasePath(isPublishEnvironment, successUrl, BASE_CONTENT_PATH);
              } else {
                newSuccessUrl = '/';
              }
            } else if (successUrl !== '') {
              newSuccessUrl = successUrl;
            } else {
              newSuccessUrl = '/';
            }
            window.location.href = newSuccessUrl;

            // Return false to prevent the submission handler continuing with its own processing
            return false;
          });
        });
      } else {
        window.MktoForms2.loadForm('//lp.pricefx.com', marketoId, formId);
      }
    });
  }
};

export default function decorate(block) {
  const [formTitle, formDescription, marketoFormId, marketoSuccessUrl, twoColumnsView, hideFormLabels] = block.children;
  block.innerHTML = '';

  const title = formTitle.textContent.trim();
  const description = formDescription.textContent.trim();
  const formId = marketoFormId.textContent.trim();
  const successUrl = marketoSuccessUrl.querySelector('a').href;
  const marketoId = '289-DOX-852';
  const isTwoColumns = twoColumnsView.textContent.trim();
  const hideLabels = hideFormLabels.textContent.trim();

  if (formId && marketoId) {
    // Create the form element
    const formElement = document.createElement('form');
    formElement.id = `mktoForm_${formId}`;

    if (title !== '' || description !== '') {
      const formInfoWrapper = document.createElement('div');
      formInfoWrapper.classList.add('form-info-wrapper');

      // Create and append form title (if available)
      if (title !== '') {
        const titleElement = document.createElement('h2');
        titleElement.classList.add('form-title');
        titleElement.textContent = title;
        formInfoWrapper.append(titleElement);
        block.append(formInfoWrapper);
      }

      // Create and append form description (if available)
      if (description !== '') {
        const descriptionElement = formDescription.firstElementChild;
        descriptionElement.classList.add('form-description');
        formInfoWrapper.append(descriptionElement);

        if (descriptionElement.children.length > 1) {
          descriptionElement.children[0].classList.add('form-description--highlight');
        }
      }
    }

    // Add 2 columns view class if boolean is true
    if (isTwoColumns === 'true') {
      block.classList.add('form-two-columns');
    } else {
      block.classList.remove('form-two-columns');
    }

    // Append the form element
    block.append(formElement);

    // Set up an observer to embed the Marketo form when block is in view
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        // Embed the Marketo form
        embedMarketoForm(marketoId, formId, successUrl, hideLabels, block, formElement);
        observer.disconnect();
      }
    });

    // Start observing the block
    observer.observe(block);
  }
}
