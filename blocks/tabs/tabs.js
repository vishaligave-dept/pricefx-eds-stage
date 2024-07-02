import { toClassName } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

function resetMobileAccordion(block) {
  const mobileAccordion = block.querySelectorAll('.tabs-tab-mobile');
  mobileAccordion.forEach((button) => {
    const content = button.nextElementSibling;
    button.setAttribute('aria-expanded', false);
    content.style.visibility = '';
    content.style.maxHeight = '';
    content?.setAttribute('aria-hidden', true);
  });
}

async function processTab(tab, index, block, tablist) {
  if (index === 0) {
    if (tab.textContent) {
      block.classList.add(tab.textContent);
      tab.remove();
    }
    return;
  }

  const id = toClassName(tab.textContent);
  const tabpanel = block.children[index];

  if (tabpanel.querySelector('a')) {
    const link = tabpanel.querySelector('a').href;

    if (link.includes('/fragments/')) {
      const url = new URL(link);
      const fragmentPath = url.pathname;

      const fragmentBlock = await loadFragment(fragmentPath);
      if (fragmentBlock) {
        const lastChild = tabpanel.lastElementChild;
        lastChild.className = `tab-content-wrapper`;
        const fragmentChild = fragmentBlock.querySelector('.section');
        if (fragmentChild) {
          lastChild.innerHTML = fragmentChild.innerHTML;
        }
      }
    }
  }

  tabpanel.className = 'tabs-panel';
  tabpanel.id = `tabpanel-${id}`;
  tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
  tabpanel.setAttribute('role', 'tabpanel');
  tabpanel.setAttribute('aria-hidden', index !== 1);
  if (!hasWrapper(tabpanel.lastElementChild)) {
    tabpanel.lastElementChild.innerHTML = `<p>${tabpanel.lastElementChild.innerHTML}</p>`;
  }

  const button = document.createElement('button');
  button.className = 'tabs-tab';
  button.id = `tab-${id}`;
  button.innerHTML = tab.innerHTML;
  button.setAttribute('aria-controls', `tabpanel-${id}`);
  button.setAttribute('aria-selected', index === 1);
  button.setAttribute('role', 'tab');

  const mobileAccordion = document.createElement('button');
  mobileAccordion.className = 'tabs-tab-mobile';
  mobileAccordion.id = `tab-${id}`;
  mobileAccordion.innerHTML = tab.innerHTML;
  mobileAccordion.setAttribute('aria-expanded', false);
  const tabContent = tabpanel.querySelector('.tab-content-wrapper');
  tabContent?.setAttribute('aria-hidden', true);

  button.addEventListener('click', () => {
    block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
      panel.setAttribute('aria-hidden', true);
    });
    tablist.querySelectorAll('button').forEach((btn) => {
      btn.setAttribute('aria-selected', false);
    });
    tabpanel.setAttribute('aria-hidden', false);
    button.setAttribute('aria-selected', true);
  });

  // Mobile Accordion
  mobileAccordion.addEventListener('click', () => {
    if (window.innerWidth > 767) {
      return;
    }

    const content = mobileAccordion.nextElementSibling;
    if (mobileAccordion.getAttribute('aria-expanded') === 'true') {
      mobileAccordion.setAttribute('aria-expanded', false);
      content?.setAttribute('aria-hidden', true);
      content.style.visibility = 'hidden';
      content.style.maxHeight = '0px';
    } else {
      mobileAccordion.setAttribute('aria-expanded', true);
      content?.setAttribute('aria-hidden', false);
      content.style.visibility = 'visible';
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
  tablist.append(button);
  tabpanel.prepend(mobileAccordion);
  tab.remove();
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const tabs = Array.from(block.children).map((child) => child.firstElementChild);
  await tabs.reduce(async (previousPromise, tab, index) => {
    await previousPromise;
    return processTab(tab, index, block, tablist);
  }, Promise.resolve());

  block.prepend(tablist);

  window.addEventListener('resize', () => {
    if (window.innerWidth < 767) {
      return;
    }

    resetMobileAccordion(block);
  });
}
