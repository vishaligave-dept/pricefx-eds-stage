import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import { LEFTCHEVRON, RIGHTCHEVRON } from '../../scripts/constants.js';

const isDesktop = window.matchMedia('(min-width: 986px)');

/**
 * Reset Filter Accordions to Default State
 * @param {Element} filterToggle The CTA that show/hide the Filter Category
 */
const resetFilterAccordions = (filterToggle) => {
  const filterContent = filterToggle.nextElementSibling;
  const filterOptions = filterContent.querySelectorAll('input');
  const filterHasChecked = [...filterOptions].some((input) => !input.id.includes('all') && input.checked);
  const contentScroll = filterContent.scrollHeight;

  if (filterHasChecked) {
    filterContent.style.visibility = 'visible';
    filterContent.style.maxHeight = `${contentScroll}px`;

    filterContent.setAttribute('aria-hidden', 'false');
    filterToggle.setAttribute('aria-expanded', 'true');
  } else {
    filterContent.style.visibility = 'hidden';
    filterContent.style.maxHeight = '0px';

    filterContent.setAttribute('aria-hidden', 'true');
    filterToggle.setAttribute('aria-expanded', 'false');
  }
};

/**
 * Toggle Filter Accordions
 * @param {Element} toggle The CTA that show/hide the Filter Category
 */
const toggleFilterAccordion = (toggle) => {
  const content = toggle.nextElementSibling;
  const contentScroll = content.scrollHeight;

  if (!content.style.maxHeight) {
    content.style.visibility = 'hidden';
    content.style.maxHeight = '0px';
  } else if (content.style.maxHeight === '0px') {
    content.style.visibility = 'visible';
    content.style.maxHeight = `${contentScroll}px`;
  } else {
    content.style.visibility = 'hidden';
    content.style.maxHeight = '0px';
  }

  const ariaHiddenState = content.attributes[3].value;
  const setAriaHidden = ariaHiddenState === 'true' ? 'false' : 'true';
  content.setAttribute('aria-hidden', setAriaHidden);

  const ariaExpandedState = toggle.attributes[3].value;
  const setAriaExpanded = ariaExpandedState === 'false' ? 'true' : 'false';
  toggle.setAttribute('aria-expanded', setAriaExpanded);
};

/**
 * Toggle Filter Sidebar
 * @param {Element} filterMenuToggle The CTA that show/hide the Filter Menu
 * @param {Element} filterMenu The element container for the Filter
 */
const toggleFilterMenu = (filterMenuToggle, filterMenu, contentWrapper) => {
  const filterMenuToggleAriaExpanded = filterMenuToggle.attributes[3].value;
  const setfilterMenuToggleAriaExpanded = filterMenuToggleAriaExpanded === 'false' ? 'true' : 'false';
  filterMenuToggle.setAttribute('aria-expanded', setfilterMenuToggleAriaExpanded);

  if (filterMenuToggleAriaExpanded === 'false') {
    filterMenu.classList.toggle('hidden', false);
    contentWrapper.classList.toggle('partner-showcase-content--full-width', false);
    filterMenu.focus();
    filterMenuToggle.innerHTML = `<span class="filter-icon"></span><span class="toggle-label">Hide Filters</span>`;
  } else {
    filterMenu.blur();
    filterMenuToggle.innerHTML = `<span class="filter-icon"></span><span class="toggle-label">Show Filter</span>`;
    const filterAccordions = document.querySelectorAll('.ps-filter-category-toggle');
    filterAccordions.forEach((accordion) => {
      resetFilterAccordions(accordion);
    });
    setTimeout(() => {
      filterMenu.classList.toggle('hidden', true);
    }, '300');
    contentWrapper.classList.toggle('partner-showcase-content--full-width', true);
  }

  const filterMenuAriaHidden = filterMenu.attributes[3].value;
  const setFilterMenuAriaHidden = filterMenuAriaHidden === 'false' ? 'true' : 'false';
  filterMenu.setAttribute('aria-hidden', setFilterMenuAriaHidden);
};

// Close Mobile Navigation on ESC Key
const closeMobileFilterOnEscape = (e) => {
  if (e.code === 'Escape' && !isDesktop.matches) {
    const filterMenuToggle = document.getElementById('ps-filter-menu-toggle');
    const filterMenu = document.getElementById('ps-filter-menu');
    if (filterMenuToggle.getAttribute('aria-expanded') === 'true') {
      filterMenuToggle.setAttribute('aria-expanded', 'false');
      filterMenu.setAttribute('aria-hidden', 'true');
      const filterAccordions = document.querySelectorAll('.ps-filter-category-toggle');
      filterAccordions.forEach((accordion) => {
        resetFilterAccordions(accordion);
      });
    }
  }
};
window.addEventListener('keydown', closeMobileFilterOnEscape);

const updateBrowserUrl = (searchParams, key, value) => {
  searchParams.set(key, value);
  const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState(null, '', newRelativePathQuery);
};

/**
 * Decorates Learning Center on DOM
 * @param {Element} block The Learning Center block element
 */
export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);

  // Extract block configuration details
  const numberOfPartners = blockConfig.numberofpartners;
  const sortBy = blockConfig.sortby;
  const cardCtaLabel = blockConfig.cardctalabel;
  const filterOneTitle = blockConfig.filteronetitle;
  const filterOneMultiSelect = blockConfig.filteronemultiselect;
  const filterOneTags = blockConfig.filteronetags;
  const filterTwoTitle = blockConfig.filtertwotitle;
  const filterTwoMultiSelect = blockConfig.filtertwomultiselect;
  const filterTwoTags = blockConfig.filtertwotags;
  const filterThreeTitle = blockConfig.filterthreetitle;
  const filterThreeMultiSelect = blockConfig.filterthreemultiselect;
  const filterThreeTags = blockConfig.filterthreetags;
  const filterFourTitle = blockConfig.filterfourtitle;
  const filterFourMultiSelect = blockConfig.filterfourmultiselect;
  const filterFourTags = blockConfig.filterfourtags;

  block.innerHTML = '';

  // Fetch Partners content from JSON endpoint
  const url = '/partners-index.json';
  const partnersData = await ffetch(url).all();

  // Go through JSON data and replace all instance of '&amp;' to facilitate handling of data in filters
  const processPartnerData = JSON.parse(JSON.stringify(partnersData).replaceAll('&amp;', '&'));

  const defaultSortedPartners = processPartnerData.sort((a, b) => a.title.localeCompare(b.title));
  let currentPartnersData = [...defaultSortedPartners];

  const queryStr = 'page=1&sortBy=asc-title';
  const searchParams = new URLSearchParams(queryStr);

  // Creates a div container to hold the Filter Menu Toggle
  const filterControls = document.createElement('div');
  filterControls.classList.add('ps-filter-controls');
  block.append(filterControls);

  // Creates a div container for flex-box styling use
  const flexContainer = document.createElement('div');
  flexContainer.classList.add('flex-container');
  block.append(flexContainer);

  // Creates a div container for the actual Filter Menu
  const filter = document.createElement('div');
  filter.classList.add('ps-filter-wrapper');
  filter.id = 'ps-filter-menu';
  filter.setAttribute('aria-labelledby', 'ps-filter-menu-toggle');
  filter.setAttribute('aria-hidden', 'false');
  flexContainer.append(filter);

  // Creates a div container to hold Partner Cards
  const partnerShowcaseContent = document.createElement('div');
  partnerShowcaseContent.classList.add('partner-showcase-content');
  const partnersContainer = document.createElement('ul');
  partnersContainer.classList.add('ps-partners-container');
  flexContainer.append(partnerShowcaseContent);
  partnerShowcaseContent.append(partnersContainer);

  // Creates a div container to hold pagination
  const paginationContainer = document.createElement('div');
  paginationContainer.classList.add('pagination-wrapper');
  partnerShowcaseContent.append(paginationContainer);

  filterControls.innerHTML = `
    <button class="ps-filter-menu-toggle" id="ps-filter-menu-toggle" aria-controls="ps-filter-menu" aria-expanded="true"><span class="filter-icon"></span><span class="toggle-label">Hide Filters</span></button>
  `;

  // Click event for Filter Menu Toggle
  const filterMenuToggle = document.querySelector('.ps-filter-menu-toggle');
  filterMenuToggle.addEventListener('click', () => {
    toggleFilterMenu(filterMenuToggle, filter, partnerShowcaseContent);
  });

  // Close Filter Menu when clicking outside of it on Mobile
  document.addEventListener('click', (e) => {
    if (!isDesktop.matches && filterMenuToggle.getAttribute('aria-expanded') === 'true') {
      if (e.target === flexContainer) {
        filterMenuToggle.click();
      }
    }
  });

  // Watch for screen size change and switch between Desktop and Mobile Filter
  window.addEventListener('resize', () => {
    if (!isDesktop.matches && filterMenuToggle.getAttribute('aria-expanded') === 'true') {
      filterMenuToggle.setAttribute('aria-expanded', 'false');
      filterMenuToggle.setAttribute('aria-label', 'Toggle Filter Menu');
      filter.setAttribute('aria-hidden', 'true');
    } else if (isDesktop.matches && filterMenuToggle.getAttribute('aria-expanded') === 'false') {
      filterMenuToggle.click();
    }
  });
  if (!isDesktop.matches && filterMenuToggle.getAttribute('aria-expanded') === 'true') {
    filterMenuToggle.setAttribute('aria-expanded', 'false');
    filterMenuToggle.setAttribute('aria-label', 'Toggle Filter Menu');
    filter.setAttribute('aria-hidden', 'true');
  }

  // Render Filter Categories
  const renderFilterCategory = (
    filterNum,
    filterCategoryLabel,
    filterIsMultiSelect,
    filterCategoryOptions,
    filterCategoryName,
    isHidden,
  ) => {
    const optionsArray = filterCategoryOptions.split(',');
    let filterOptionsMarkup = '';
    optionsArray.forEach((option) => {
      const optionSplit = option.split('/')[2];
      const optionReplaceHypen = optionSplit.includes('-') ? optionSplit.replaceAll('-', ' ') : optionSplit;
      const optionTextTransform =
        optionReplaceHypen.length <= 4 ? optionReplaceHypen.toUpperCase() : optionReplaceHypen;
      if (filterIsMultiSelect === 'false') {
        filterOptionsMarkup += `
          <li class="ps-filter-category-item">
            <input type="radio" id="filter-${optionSplit.includes('&') ? `${filterCategoryName}-${optionSplit}` : `${filterCategoryName}-${optionSplit}`}" name="filter-${filterCategoryName}" value="${optionSplit.includes('&') ? optionSplit : optionSplit}" data-filter-category="filter-${filterCategoryName}" />
            <label for="filter-${optionSplit.includes('&') ? `${filterCategoryName}-${optionSplit}` : `${filterCategoryName}-${optionSplit}`}">${optionTextTransform}</label>
          </li>
        `;
      } else {
        filterOptionsMarkup += `
          <li class="ps-filter-category-item">
            <input type="checkbox" id="filter-${optionSplit.includes('&') ? `${filterCategoryName}-${optionSplit}` : `${filterCategoryName}-${optionSplit}`}" name="${optionSplit}" value="${optionSplit.includes('&') ? optionSplit : optionSplit}" data-filter-category="filter-${filterCategoryName}" />
            <label for="filter-${optionSplit.includes('&') ? `${filterCategoryName}-${optionSplit}` : `${filterCategoryName}-${optionSplit}`}">${optionTextTransform}</label>
          </li>
        `;
      }
    });

    const markup = `
      <div class="ps-filter-category">
        <button class="ps-filter-category-toggle" id="ps-filter-category-${filterNum}-toggle" aria-controls="ps-filter-category-${filterNum}-content" aria-expanded=${isHidden === true ? 'false' : 'true'}>${filterCategoryLabel}<span class="accordion-icon"></span></button>
        <ul class="ps-filter-category-content" id="ps-filter-category-${filterNum}-content" aria-labelledby="ps-filter-category-${filterNum}-toggle" aria-hidden=${isHidden}>
          ${
            filterIsMultiSelect === 'false'
              ? `<li class="ps-filter-category-item">
                <input type="radio" id="filter-all-${filterCategoryName}" name="filter-${filterCategoryName}" value="filter-all-${filterCategoryName}" data-filter-category="filter-${filterCategoryName}" checked />
                <label for="filter-all-${filterCategoryName}">All</label>
              </li>`
              : ``
          }
            ${filterOptionsMarkup}
        </ul>
      </div>
    `;
    return markup;
  };

  filter.innerHTML = `
    ${
      sortBy !== ''
        ? `
      <div class="ps-sort-content-wrapper">
        <label for="ps-sort-content" class="sr-only">Short by</label>
        <select name="ps-sort-content" id="ps-sort-content">
          ${
            sortBy.includes('date')
              ? `
            <optgroup label="Date">
              ${sortBy.includes('dateNewOld') ? `<option value="desc-date">Sort by: Date (New → Old)</option>` : ''}
              ${sortBy.includes('dateOldNew') ? `<option value="asc-date">Sort by: Date (Old → New)</option>` : ''}
            </optgroup>
          `
              : ''
          }
          ${
            sortBy.includes('title')
              ? `
            <optgroup label="Title">
              ${sortBy.includes('titleAZ') ? `<option value="asc-title" selected>Sort by: Title (A → Z)</option>` : ''}
              ${sortBy.includes('titleZA') ? `<option value="desc-title">Sort by: Title (Z → A)</option>` : ''}
            </optgroup>
          `
              : ''
          }
        </select>
      </div>
    `
        : ''
    }
    ${renderFilterCategory(1, filterOneTitle, filterOneMultiSelect, filterOneTags, 'geography', false)}
    ${renderFilterCategory(2, filterTwoTitle, filterTwoMultiSelect, filterTwoTags, 'industry', true)}
    ${renderFilterCategory(3, filterThreeTitle, filterThreeMultiSelect, filterThreeTags, 'type', true)}
    ${renderFilterCategory(4, filterFourTitle, filterFourMultiSelect, filterFourTags, 'speciality', true)}
  `;

  // Set initial max-height for Filter Categories to create smooth accordion transition
  const filterContents = document.querySelectorAll('.ps-filter-category-content');
  filterContents.forEach((content) => {
    if ([...filterContents].indexOf(content) > 0) {
      content.style.visibility = 'hidden';
      content.style.maxHeight = '0';
    } else {
      content.style.visibility = 'visible';
      content.style.maxHeight = '300px';
    }
  });

  // Click event for Filter Accordions
  const filterAccordionToggles = document.querySelectorAll('.ps-filter-category-toggle');
  filterAccordionToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggleFilterAccordion(toggle);
    });
  });

  // Clean-up and Partner Category
  const renderPartnerCategory = (partner) => {
    if (partner.category !== '') {
      const categoriesArray = partner.category.split(',');
      const firstCategory = categoriesArray.find((category) => category.includes('partner-type'));
      let markup = '';
      const removePrefixCategory = firstCategory.split('/')[2];
      const replaceHyphenCategory = removePrefixCategory.replaceAll('-', ' ');
      const replaceAmpCategory = replaceHyphenCategory.includes('&amp;')
        ? replaceHyphenCategory.replace('&amp;', '&')
        : replaceHyphenCategory;
      markup = `<p class="partner-categories-item">${replaceAmpCategory}</p>`;
      return markup;
    }
    return '';
  };

  // Render Partner Card
  const renderPartnerCard = (partnersDataList) => {
    let initialPartnerData = partnersDataList;
    const initialPartnerCount = initialPartnerData.length;
    if (Number(numberOfPartners) !== '' && initialPartnerCount > Number(numberOfPartners)) {
      initialPartnerData = partnersDataList.slice(defaultSortedPartners, numberOfPartners);
    }
    let markup = '';
    initialPartnerData.forEach((partner) => {
      markup += `
        <li class="partner-card">
          <div class="partner-image">
            <picture>
              <img src="${partner.image || ''}" alt="${partner.imageAlt || partner.title}">
            </picture>
          </div>
          <div class="partner-card-content">
            ${
              partner.category !== ''
                ? `
              <div class="partner-categories">
                ${renderPartnerCategory(partner)}
              </div>
            `
                : ''
            }
            <div class="partner-cta-container">
              <a class="partner-link" href="${partner.path}">${cardCtaLabel === '' ? 'Learn More' : cardCtaLabel}</a>
            </div>
          </div>
        </li>
      `;
    });
    return markup;
  };

  const appendPartnerShowcasePartners = (partnersJsonData) => {
    partnersContainer.innerHTML = renderPartnerCard(partnersJsonData);
    partnersContainer
      .querySelectorAll('img')
      .forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false)));
  };
  appendPartnerShowcasePartners(defaultSortedPartners);

  // Render pagination pages
  const renderPages = (partnerPerPage, partnersList, currentPage) => {
    const totalPartners = partnersList.length;
    const totalPageNumber = Math.ceil(totalPartners / partnerPerPage);
    const firstPageMarkup = `<li class="pagination-page" id="page-1"><button>1</button></li>`;
    const lastPageMarkup = `<li class="pagination-page" id="page-${totalPageNumber}"><button>${totalPageNumber}</button></li>`;
    let paginationMarkup = '';
    let middlePageMarkup = '';

    if (totalPageNumber <= 1) {
      return firstPageMarkup;
    }
    const center = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    const filteredCenter = center.filter((p) => p > 1 && p < totalPageNumber);
    const includeThreeLeft = currentPage === 5;
    const includeThreeRight = currentPage === totalPageNumber - 4;
    const includeLeftDots = currentPage > 5;
    const includeRightDots = currentPage < totalPageNumber - 4;

    if (includeThreeLeft) {
      filteredCenter.unshift(2);
    }
    if (includeThreeRight) {
      filteredCenter.push(totalPageNumber - 1);
    }

    if (includeLeftDots) {
      filteredCenter.unshift('...');
    }
    if (includeRightDots) {
      filteredCenter.push('...');
    }

    filteredCenter.forEach((centerPage) => {
      if (centerPage === '...') {
        middlePageMarkup += `
          <li class="pagination-ellipses"><span>${centerPage}</span></li>
        `;
      } else {
        middlePageMarkup += `
          <li class="pagination-page" id="page-${centerPage}"><button>${centerPage}</button></li>
        `;
      }
    });
    paginationMarkup = firstPageMarkup + middlePageMarkup + lastPageMarkup;
    return paginationMarkup;
  };

  paginationContainer.innerHTML = `
    ${Number(numberOfPartners) > defaultSortedPartners.length ? '' : `<button class="pagination-prev" aria-label="Previous Page">${LEFTCHEVRON}</button>`}
    <ul class="pagination-pages-list">
      ${renderPages(numberOfPartners, defaultSortedPartners, 1)}
    </ul>
    ${Number(numberOfPartners) > defaultSortedPartners.length ? '' : `<button class="pagination-next" aria-label="Nexst Page">${RIGHTCHEVRON}</button>`}
  `;

  const paginationPageList = document.querySelector('.pagination-pages-list');
  const prevPageButton = document.querySelector('.pagination-prev');
  const nextPageButton = document.querySelector('.pagination-next');

  if (paginationPageList.children.length === 1) {
    paginationContainer.classList.add('hidden');
  } else {
    paginationContainer.classList.remove('hidden');
  }

  if (window.location.search !== '') {
    const currentUrlParam = new URLSearchParams(window.location.search);
    const pageNum = currentUrlParam.get('page');
    if (Number(pageNum) > 1) {
      prevPageButton.classList.remove('hidden');
      paginationPageList.children[0].classList.remove('active-page');
    } else {
      prevPageButton.classList.add('hidden');
      paginationPageList.children[0].classList.add('active-page');
    }
  } else {
    prevPageButton.classList.add('hidden');
    paginationPageList.children[0].classList.add('active-page');
  }

  // Defining some variables for filter, sort and search logic
  const sortByEl = document.getElementById('ps-sort-content');
  let currentFilteredPartners;
  let currentSortedPartners;
  const selectedFiltersArray = [];
  const selectedFilters = {
    'filter-geography': [],
    'filter-industry': [],
    'filter-type': [],
    'filter-speciality': [],
  };

  // Updates the URL Params based on selected filters
  const updateFiltersUrlParams = () => {
    if (selectedFilters['filter-geography'].length > 0) {
      updateBrowserUrl(searchParams, 'filter-geography', selectedFilters['filter-geography'][0]);
    }
    if (selectedFilters['filter-industry'].length > 0) {
      updateBrowserUrl(searchParams, 'filter-industry', selectedFilters['filter-industry'][0]);
    }
    if (selectedFilters['filter-type'].length > 0) {
      updateBrowserUrl(searchParams, 'filter-type', selectedFilters['filter-type'][0]);
    }
    if (selectedFilters['filter-speciality'].length > 0) {
      const valuesString = selectedFilters['filter-speciality'].toString();
      updateBrowserUrl(searchParams, 'filter-speciality', valuesString);
    }
  };

  // Partner Showcase Sort By logic
  const handleSort = (sortByValue, partnersDataList) => {
    let partnersJson = partnersDataList;
    if (sortByValue === 'desc-date') {
      partnersJson = partnersJson.sort((a, b) => new Date(b.lastPublished) - new Date(a.lastPublished));
      appendPartnerShowcasePartners(partnersJson);
    } else if (sortByValue === 'asc-date') {
      partnersJson = partnersJson.sort((a, b) => new Date(a.lastPublished) - new Date(b.lastPublished));
      appendPartnerShowcasePartners(partnersJson);
    } else if (sortByValue === 'asc-title') {
      partnersJson = partnersJson.sort((a, b) => a.title.localeCompare(b.title));
      appendPartnerShowcasePartners(partnersJson);
    } else {
      partnersJson = partnersJson.sort((a, b) => b.title.localeCompare(a.title));
      appendPartnerShowcasePartners(partnersJson);
    }

    currentSortedPartners = partnersJson;
    currentPartnersData = partnersJson;

    if (partnersJson.length === 0) {
      partnersContainer.innerHTML = `
        <h4 class="no-partners">Sorry, there are no results based on these choices. Please update and try again.</h4>
      `;
      paginationContainer.classList.add('hidden');
      updateBrowserUrl(searchParams, 'page', 1);
    } else {
      paginationContainer.classList.remove('hidden');
      const currentPage = paginationPageList.children[0];
      paginationPageList.innerHTML = renderPages(
        numberOfPartners,
        currentSortedPartners,
        Number(currentPage.textContent),
      );
      paginationPageList.children[0].classList.add('active-page');
      nextPageButton.classList.remove('hidden');
      if (paginationPageList.children.length <= 1) {
        paginationContainer.classList.add('hidden');
      } else {
        paginationContainer.classList.remove('hidden');
      }
    }

    if (selectedFiltersArray.length > 0) {
      currentPartnersData = partnersJson;
    }
  };

  sortByEl.addEventListener('change', (e) => {
    let sortedPartners = [...defaultSortedPartners];
    const selectedFiltersValues = Object.values(selectedFilters);
    selectedFiltersValues.forEach((filterValue) => {
      if (filterValue[0] !== undefined) {
        selectedFiltersArray.push(filterValue[0]);
      }
    });

    if (selectedFiltersArray.length > 0) {
      sortedPartners = currentFilteredPartners;
      currentPartnersData = currentFilteredPartners;
      handleSort(e.target.value, currentFilteredPartners);
    } else {
      handleSort(e.target.value, sortedPartners);
    }

    if (paginationPageList.children[0].className.includes('active-page')) {
      prevPageButton.classList.add('hidden');
    }
    updateBrowserUrl(searchParams, 'page', 1);
    updateBrowserUrl(searchParams, 'sortBy', e.target.value);
  });

  // Partner Showcase Filter logic
  const updateSelectedFilters = (state, key, value) => {
    if (state === true && value.includes('all')) {
      selectedFilters[key].pop();
      searchParams.delete(key);
    } else if (state === true && key !== 'filter-speciality') {
      selectedFilters[key].pop();
      selectedFilters[key].push(value);
      updateFiltersUrlParams();
    } else if (state === true && !selectedFilters[key].includes(value)) {
      selectedFilters[key].push(value);
      updateFiltersUrlParams();
    } else if (state === false && selectedFilters[key].includes(value)) {
      selectedFilters[key].splice(selectedFilters[key].indexOf(value), 1);
      searchParams.delete(key);
    }
    const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newRelativePathQuery);
    return selectedFilters;
  };

  const handleFilter = (filters, partnersDataList) => {
    let partnersJson = partnersDataList;

    if (filters['filter-geography'].length > 0) {
      partnersJson = partnersJson.filter((partner) => partner.topics.includes(filters['filter-geography']));
    }

    if (filters['filter-industry'].length > 0) {
      partnersJson = partnersJson.filter((partner) => partner.topics.includes(filters['filter-industry']));
    }

    if (filters['filter-type'].length > 0) {
      partnersJson = partnersJson.filter((partner) => partner.category.includes(filters['filter-type']));
    }

    if (filters['filter-speciality'].length > 1 && Array.isArray(filters['filter-speciality'])) {
      partnersJson = partnersJson.filter((partner) =>
        filters['filter-speciality'].some((filterValue) => partner.topics.includes(filterValue)),
      );
    } else {
      partnersJson = partnersJson.filter((partner) => partner.topics.includes(filters['filter-speciality']));
    }

    currentFilteredPartners = partnersJson;
    currentPartnersData = partnersJson;

    if (partnersJson.length === 0) {
      partnersContainer.innerHTML = `
        <h4 class="no-partners">Sorry, there are no results based on these choices. Please update and try again.</h4>
      `;
      paginationContainer.classList.add('hidden');
      updateBrowserUrl(searchParams, 'page', 1);
    } else {
      appendPartnerShowcasePartners(partnersJson);
      paginationContainer.classList.remove('hidden');
      const currentPage = paginationPageList.children[0];
      paginationPageList.innerHTML = renderPages(
        numberOfPartners,
        currentFilteredPartners,
        Number(currentPage.textContent),
      );
      paginationPageList.children[0].classList.add('active-page');
      nextPageButton.classList.remove('hidden');
      if (paginationPageList.children.length <= 1) {
        paginationContainer.classList.add('hidden');
      } else {
        paginationContainer.classList.remove('hidden');
      }
    }

    if (sortByEl.value !== '') {
      currentPartnersData = partnersJson;
    }
  };

  const allFilterOptions = document.querySelectorAll('.ps-filter-category-item input');
  allFilterOptions.forEach((filterOption) => {
    filterOption.addEventListener('click', () => {
      updateSelectedFilters(filterOption.checked, filterOption.dataset.filterCategory, filterOption.value);
      let filteredPartners = [...defaultSortedPartners];

      if (sortByEl.value === 'asc-title') {
        currentPartnersData = filteredPartners;
        handleFilter(selectedFilters, filteredPartners);
      } else {
        filteredPartners = currentSortedPartners;
        currentPartnersData = currentSortedPartners;
        handleFilter(selectedFilters, currentSortedPartners);
      }

      updateBrowserUrl(searchParams, 'page', 1);

      if (paginationPageList.children[0].className.includes('active-page')) {
        prevPageButton.classList.add('hidden');
      }
    });
  });

  // Append partners based on active page
  const appendNewActivePartnerPage = (startIndex, endIndex, currentPage, partnersJson) => {
    let newCurrentPartnersData;
    if (Number(currentPage.textContent) * Number(numberOfPartners) >= partnersJson.length) {
      newCurrentPartnersData = partnersJson.slice(startIndex);
    } else {
      newCurrentPartnersData = partnersJson.slice(startIndex, endIndex);
    }
    appendPartnerShowcasePartners(newCurrentPartnersData);
  };

  const handlePageClick = (paginations, activePage) => {
    const newPageList = paginations.querySelectorAll('.pagination-page');
    newPageList.forEach((newPage) => {
      newPage.classList.remove('active-page');
      if (activePage === newPage.textContent) {
        newPage.classList.add('active-page');
      }
    });

    if (activePage > '1') {
      prevPageButton.classList.remove('hidden');
    } else {
      prevPageButton.classList.add('hidden');
    }

    if (activePage === paginations.lastChild.textContent) {
      nextPageButton.classList.add('hidden');
    } else {
      nextPageButton.classList.remove('hidden');
    }
  };

  const handlePaginationNav = (paginations, nextActivePage) => {
    [...paginations.children].forEach((page) => page.classList.remove('active-page'));
    nextActivePage.classList.add('active-page');
    paginationPageList.innerHTML = renderPages(
      numberOfPartners,
      currentPartnersData,
      Number(nextActivePage.textContent),
    );

    handlePageClick(paginationPageList, nextActivePage.textContent);

    appendNewActivePartnerPage(
      Number(nextActivePage.textContent) * Number(numberOfPartners) - Number(numberOfPartners),
      Number(nextActivePage.textContent) * Number(numberOfPartners),
      nextActivePage,
      currentPartnersData,
    );

    updateBrowserUrl(searchParams, 'page', nextActivePage.textContent);
  };

  paginationContainer.addEventListener('click', (e) => {
    if (e.target && e.target.nodeName === 'BUTTON' && e.target.className === '') {
      const { target } = e;
      const targetPageContainer = target.parentElement.parentElement;
      [...targetPageContainer.children].forEach((page) => page.classList.remove('active-page'));
      target.parentElement.classList.add('active-page');

      paginationPageList.innerHTML = renderPages(numberOfPartners, currentPartnersData, Number(target.textContent));

      handlePageClick(paginationPageList, target.textContent);

      appendNewActivePartnerPage(
        Number(target.textContent) * Number(numberOfPartners) - Number(numberOfPartners),
        Number(target.textContent) * Number(numberOfPartners),
        target,
        currentPartnersData,
      );

      updateBrowserUrl(searchParams, 'page', target.textContent);
    }
  });

  nextPageButton.addEventListener('click', () => {
    const paginationList = nextPageButton.previousElementSibling;
    const activePage = [...paginationList.children].find((page) => page.classList.contains('active-page'));
    const nextActivePage = activePage.nextElementSibling;
    handlePaginationNav(paginationList, nextActivePage);
  });

  prevPageButton.addEventListener('click', () => {
    const paginationList = prevPageButton.nextElementSibling;
    const activePage = [...paginationList.children].find((page) => page.classList.contains('active-page'));
    const nextActivePage = activePage.previousElementSibling;
    handlePaginationNav(paginationList, nextActivePage);
  });

  // Set up page state on load based on URL Params
  const updateStateFromUrlParams = (partnersJson) => {
    const getUrlParams = window.location.search;
    const loadedSearchParams = new URLSearchParams(getUrlParams);
    const partnersOnLoad = partnersJson;
    if (getUrlParams === '') {
      return;
    }

    if (loadedSearchParams.get('sortBy') !== 'asc-title') {
      sortByEl.value = loadedSearchParams.get('sortBy');
      handleSort(loadedSearchParams.get('sortBy'), partnersOnLoad);
      searchParams.set('sortBy', loadedSearchParams.get('sortBy'));
    }

    if (
      loadedSearchParams.get('filter-geography') !== null ||
      loadedSearchParams.get('filter-industry') !== null ||
      loadedSearchParams.get('filter-type') !== null ||
      loadedSearchParams.get('filter-speciality') !== null
    ) {
      let filterSpeciality = [];
      if (loadedSearchParams.get('filter-geography') !== null) {
        selectedFilters['filter-geography'].push(loadedSearchParams.get('filter-geography'));
      }
      if (loadedSearchParams.get('filter-industry') !== null) {
        selectedFilters['filter-industry'].push(loadedSearchParams.get('filter-industry'));
      }
      if (loadedSearchParams.get('filter-type') !== null) {
        selectedFilters['filter-type'].push(loadedSearchParams.get('filter-type'));
      }
      if (loadedSearchParams.get('filter-speciality') !== null) {
        filterSpeciality = loadedSearchParams.get('filter-speciality').includes(',')
          ? loadedSearchParams.get('filter-speciality').split(',')
          : loadedSearchParams.get('filter-speciality');
        if (Array.isArray(filterSpeciality)) {
          filterSpeciality.forEach((specialityItem) => selectedFilters['filter-speciality'].push(specialityItem));
        } else {
          selectedFilters['filter-speciality'].push(filterSpeciality);
        }
      }

      const loadedFilters = {
        'filter-geography':
          loadedSearchParams.get('filter-geography') !== null ? [loadedSearchParams.get('filter-geography')] : [],
        'filter-industry':
          loadedSearchParams.get('filter-industry') !== null ? [loadedSearchParams.get('filter-industry')] : [],
        'filter-type': loadedSearchParams.get('filter-type') !== null ? [loadedSearchParams.get('filter-type')] : [],
        'filter-speciality': filterSpeciality,
      };
      const filterValuesArray = [];
      const loadedFilterValues = Object.values(loadedFilters);
      loadedFilterValues.forEach((filterValue) => {
        if (filterValue.length === 1) {
          filterValuesArray.push(filterValue[0]);
        } else if (filterValue.length > 1 && Array.isArray(filterValue)) {
          filterValue.forEach((value) => filterValuesArray.push(value));
        } else {
          filterValuesArray.push(filterValue);
        }
      });
      allFilterOptions.forEach((filterOption) => {
        if (filterValuesArray.includes(filterOption.value)) {
          filterOption.checked = true;
          handleFilter(loadedFilters, partnersOnLoad);
        }
      });
    }

    if (loadedSearchParams.get('page') !== '1') {
      paginationPageList.innerHTML = renderPages(
        numberOfPartners,
        currentPartnersData,
        Number(loadedSearchParams.get('page')),
      );
      const pageList = paginationPageList.querySelectorAll('.pagination-page');
      if (pageList.length > 1) {
        pageList.forEach((page) => {
          page.classList.remove('active-page');
          if (loadedSearchParams.get('page') === page.textContent) {
            page.classList.add('active-page');
          }
        });
      }
      if (paginationPageList.lastElementChild.classList.contains('active-page')) {
        nextPageButton.classList.add('hidden');
      }
      appendNewActivePartnerPage(
        Number(loadedSearchParams.get('page')) * Number(numberOfPartners) - Number(numberOfPartners),
        Number(loadedSearchParams.get('page')) * Number(numberOfPartners),
        Number(loadedSearchParams.get('page')),
        currentPartnersData,
      );
    }
  };
  updateStateFromUrlParams(defaultSortedPartners);
}
