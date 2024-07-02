import ffetch from '../../scripts/ffetch.js';
import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Generating Footer Navigation
 * @param {Array} childMenu
 */
function createMenuLink(childMenu) {
  const list = document.createElement('li');
  const [title, href, target] = childMenu?.title?.split('|') || [];
  const anochor = `<a href="${href ? href.trim() : ''}" target="${target ? target.trim() : ''}">${title.trim()}</a>`;
  list.innerHTML = anochor;
  return list;
}

/**
 * Toggle Mobile Navigation Accordions
 * @param {Element} navToggle The toggle that show/hide the mobile navigation
 */
function toggleMobileNavAccordion(navToggle) {
  if (window.innerWidth > 767) {
    return;
  }

  const navListContent = navToggle.nextElementSibling;
  const navScroll = navListContent.scrollHeight;

  if (!navListContent.style.maxHeight) {
    navListContent.style.visibility = 'visible';
    navListContent.style.maxHeight = `${navScroll}px`;
  } else if (navListContent.style.maxHeight === '0px') {
    navListContent.style.visibility = 'visible';
    navListContent.style.maxHeight = `${navScroll}px`;
  } else {
    navListContent.style.visibility = 'hidden';
    navListContent.style.maxHeight = '0px';
  }

  const ariaHiddenState = navListContent.attributes[1].value;
  const setAriaHidden = ariaHiddenState === 'true' ? 'false' : 'true';
  navListContent.setAttribute('aria-hidden', setAriaHidden);

  const ariaExpandedState = navToggle.attributes[1].value;
  const setAriaExpanded = ariaExpandedState === 'false' ? 'true' : 'false';
  navToggle.setAttribute('aria-expanded', setAriaExpanded);
}

// Rendering Brand Logo
async function decorateLogo(footer, logo) {
  const logoWrapper = document.createElement('div');
  logoWrapper.classList.add('footer-logo-wrapper');
  logoWrapper.innerHTML = `<a href="/" aria-label="Go to Pricefx Homepage"><span class="icon icon-${logo}"></span></a>`;
  decorateIcons(logoWrapper, '', 'Pricefx');
  footer.appendChild(logoWrapper);
}

// Decorating Footer Menu
async function decorateMenu(footer, menuItems) {
  const menuList = document.createElement('div');
  menuList.classList.add('footer-menu');

  Array.from(menuItems).forEach((item) => {
    const menuItem = document.createElement('div');
    menuItem.classList.add('footer-menu-item');

    menuItem.innerHTML = `<p class="footer-menu-title">${item?.title}</p>
    <button class="footer-menu-title-mobile" aria-expanded="false">${item?.title}
      <span class="accordion-icon"></span>
    </button>`;

    const menuTitle = menuItem.querySelector('button');

    menuTitle.addEventListener('click', () => {
      toggleMobileNavAccordion(menuTitle);
    });

    const menuElement = document.createElement('ul');
    menuElement.classList.add('footer-menu-list');
    menuElement.setAttribute('aria-hidden', false);

    item?.child?.forEach((childMenu) => {
      const list = createMenuLink(childMenu);
      menuElement.appendChild(list);
    });

    menuItem.appendChild(menuElement);
    menuList.appendChild(menuItem);
  });

  footer.appendChild(menuList);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerTheme = getMetadata('footertheme');
  block.textContent = '';
  let logo;

  if (footerTheme === 'white' || footerTheme === 'grey') {
    block.classList.add(`footer--${footerTheme}`);
    logo = 'pricefx-logo-dark';
  } else {
    logo = 'pricefx-logo-light';
  }

  // load footer fragment
  const footerPath = footerMeta.footer || '/footer';
  const fragment = await loadFragment(footerPath);

  // load Menus
  const menuData = await ffetch('/footer.json').all();
  const keys = ['Level 1', 'Level 2'];
  const menuItems = menuData.reduce((child, o) => {
    keys
      .map((k) => o[k])
      .filter(Boolean)
      .reduce(
        (r, value) => {
          let temp = (r.child ??= []).find((q) => q.title === value);
          if (!temp) {
            r.child.push((temp = { title: value }));
          }
          return temp;
        },
        { child },
      );
    return child;
  }, []);

  block.textContent = '';

  // decorate footer DOM
  const footerMenuSection = document.createElement('div');
  footerMenuSection.classList.add('footer-menu-wrapper');
  block.append(footerMenuSection);
  const copyrightSection = document.createElement('div');
  copyrightSection.classList.add('footer-copyright-section');
  const currentYear = new Date().getFullYear();

  while (fragment.firstElementChild) {
    copyrightSection.append(fragment.firstElementChild);
    const copyrightText = copyrightSection.querySelector('p');
    copyrightText.innerHTML = copyrightText.innerHTML.replace('{{currentYear}}', currentYear);
  }

  await decorateLogo(footerMenuSection, logo);
  await decorateMenu(footerMenuSection, menuItems);
  block.append(copyrightSection);

  // Resetting ADA attributes
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width:768px)').matches) {
      block.querySelectorAll('.footer-menu-title-mobile')?.forEach((ele) => {
        ele.setAttribute('aria-expanded', false);
        const navlist = ele.nextElementSibling;
        navlist.setAttribute('aria-hidden', false);
        navlist.style.maxHeight = '';
        navlist.style.visibility = '';
      });
    }
  });
}
