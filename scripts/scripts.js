/* eslint-disable import/no-cycle */
import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
} from './aem.js';
import { environmentMode } from './global-functions.js';
import { loadFragment } from '../blocks/fragment/fragment.js';
import addPageSchema from './schema.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * create an element.
 * @param {string} tagName the tag for the element
 * @param {string|Array<string>} classes classes to apply
 * @param {object} props properties to apply
 * @param {string|Element} html content to add
 * @returns the element
 */
export function createElement(tagName, classes, props, html) {
  const elem = document.createElement(tagName);
  if (classes) {
    const classesArr = typeof classes === 'string' ? [classes] : classes;
    elem.classList.add(...classesArr);
  }
  if (props) {
    Object.keys(props).forEach((propName) => {
      elem.setAttribute(propName, props[propName]);
    });
  }

  if (html) {
    const appendEl = (el) => {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        elem.append(el);
      } else {
        elem.insertAdjacentHTML('beforeend', el);
      }
    };

    if (Array.isArray(html)) {
      html.forEach(appendEl);
    } else {
      appendEl(html);
    }
  }

  return elem;
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Decorates links within the specified container element by setting their "target" attribute to "_blank" either if it is external domain.
 * or the texcontent having {{_blank}}
 * @param {HTMLElement} main - The main container element to search for and decorate links.
 */
export function decorateExternalLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) {
      return;
    }

    if (a.hostname !== window.location.hostname || a.textContent.includes('{{_blank}}')) {
      a.target = '_blank';
      a.title = a.title.replace('{{_blank}}', '');
      a.textContent = a.textContent.replace('{{_blank}}', '');
      a.setAttribute('aria-label', `${a.textContent} opens in a new tab`);
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * links to a /modals/ path  are automatically transformed into a modal.
 * @param {Element} element
 */
function autolinkModals(element) {
  element.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');

    if (origin && origin.href && origin.href.includes('/modal/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal({ fragmentUrl: origin.href });
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

async function updateMetadata() {
  document.title = `${document.title || ''} | Pricefx`;

  const ogTitleMeta = document.head.querySelector('meta[property="og:title"]');
  const twitterTitleMeta = document.head.querySelector('meta[name="twitter:title"]');

  if (ogTitleMeta) {
    ogTitleMeta.content = document.title;
  }

  if (twitterTitleMeta) {
    twitterTitleMeta.content = document.title;
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateExternalLinks(main);
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * at.js implementation
 */

function initATJS(path, config) {
  window.targetGlobalSettings = config;
  return new Promise((resolve) => {
    import(path).then(resolve);
  });
}

function onDecoratedElement(fn) {
  // Apply propositions to all already decorated blocks/sections
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn();
  }

  const observer = new MutationObserver((mutations) => {
    if (
      mutations.some(
        (m) =>
          m.target.tagName === 'BODY' ||
          m.target.dataset.sectionStatus === 'loaded' ||
          m.target.dataset.blockStatus === 'loaded',
      )
    ) {
      fn();
    }
  });
  // Watch sections and blocks being decorated async
  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-block-status', 'data-section-status'],
  });
  // Watch anything else added to the body
  observer.observe(document.querySelector('body'), {
    childList: true,
  });
}

function toCssSelector(selector) {
  return selector.replace(
    /(\.\S+)?:eq\((\d+)\)/g,
    (_, clss, i) => `:nth-child(${Number(i) + 1}${clss ? ` of ${clss})` : ''}`,
  );
}

async function getElementForOffer(offer) {
  const selector = offer.cssSelector || toCssSelector(offer.selector);
  return document.querySelector(selector);
}

async function getElementForMetric(metric) {
  const selector = toCssSelector(metric.selector);
  return document.querySelector(selector);
}

async function getAndApplyOffers() {
  const response = await window.adobe.target.getOffers({
    request: {
      execute: {
        pageLoad: {},
      },
    },
  });
  const { options = [], metrics = [] } = response.execute.pageLoad;
  onDecoratedElement(() => {
    window.adobe.target.applyOffers({
      response,
    });
    // keeping track of offers that were already applied
    // eslint-disable-next-line no-return-assign
    options.forEach((o) => (o.content = o.content.filter((c) => !getElementForOffer(c))));
    // keeping track of metrics that were already applied
    metrics
      .map((m, i) => (getElementForMetric(m) ? i : -1))
      .filter((i) => i >= 0)
      .reverse()
      .map((i) => metrics.splice(i, 1));
  });
}

let atjsPromise = Promise.resolve();
if (getMetadata('target')) {
  atjsPromise = initATJS('./at.js', {
    clientCode: 'pricefx',
    serverDomain: 'pricefx.tt.omtrdc.net',
    imsOrgId: '3C5070676047F8E80A495CC2@AdobeOrg',
    bodyHidingEnabled: false,
    cookieDomain: window.location.hostname,
    pageLoadEnabled: false,
    secureOnly: true,
    viewsEnabled: false,
    withWebGLRenderer: false,
  });
  document.addEventListener('at-library-loaded', () => getAndApplyOffers());
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  await updateMetadata();
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }

  if (main) {
    decorateMain(main);
    // wait for atjs to finish loading
    await atjsPromise;
    // show the LCP block in a dedicated frame to reduce TBT
    await new Promise((resolve) => {
      window.requestAnimationFrame(async () => {
        await waitForLCP(LCP_BLOCKS);
        resolve();
      });
    });
  }
}

async function loadCookieBanner() {
  const cookieFragmentPath = '/fragments/cookie-banner';
  const cookieFragment = await loadFragment(cookieFragmentPath);
  return cookieFragment;
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) {
    element.scrollIntoView();
  }

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  const bodyEl = document.querySelector('body');
  const cookieFrag = await loadCookieBanner();
  if (cookieFrag) {
    bodyEl.prepend(cookieFrag.firstElementChild);
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
  // Load on Publish Mode
  if (environmentMode() === 'publish') {
    addPageSchema();
  }
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
