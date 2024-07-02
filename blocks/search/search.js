import ffetch from '../../scripts/ffetch.js';
import { createOptimizedPicture } from '../../scripts/aem.js';
import { SEARCH_INDEX_PATH } from '../../scripts/url-constants.js';
import { formatDate, sortByDate } from '../../scripts/global-functions.js';

// Clean-up and Render Article Category
const renderArticleCategory = (article) => {
  const categoriesArray = article.category.split(',');
  if (categoriesArray.length !== 0) {
    const firstCategory = categoriesArray.find((category) => category.includes('/'));
    let markup = '';
    const removePrefixCategory = firstCategory.split('/')[1];
    const removeHyphenCategory =
      removePrefixCategory !== 'e-books' && removePrefixCategory !== 'c-suite'
        ? removePrefixCategory.replaceAll('-', ' ')
        : removePrefixCategory;
    markup = `<h6 class="article-subtitle">${removeHyphenCategory}</h6>`;
    return markup;
  }
  return null;
};

export default async function decorate(block) {
  // Fetch Search content from JSON endpoint
  const searchData = await ffetch(SEARCH_INDEX_PATH).all();
  let currentSearchJSON = [];

  const [placeholderText, numberOfResults, resultTitle, noResultTitle] = block.children;
  const pageView = Number(numberOfResults.textContent.trim() || '10');
  block.textContent = '';

  // Creates a div container to hold the Search Fom & Title
  const searchFormWrapper = document.createElement('div');
  searchFormWrapper.classList.add('search-form-wrapper');
  let resultTitleString = resultTitle.textContent.trim().replace('{{keyword}}', '<span class="search-term"></span>');
  resultTitleString = resultTitleString.replace('{{count}}', '<span class="search-count"></span>');
  searchFormWrapper.innerHTML = `
    <div class="search-result-text hidden"><h3>${resultTitleString}</h3></div>
    <form class="search-form">
        <label for="search-input" class="sr-only">Search</label>
        <input type="text" name="search" id="search-input" placeholder="${placeholderText.textContent.trim()}" />
        <div class="search-suggestion"></div>
        <button type="submit" aria-label="Submit search"></button>
    </form>`;
  block.append(searchFormWrapper);

  // Creates a div container to hold the Search Results
  const resultWrapper = document.createElement('div');
  resultWrapper.classList.add('search-result-wrapper');
  block.append(resultWrapper);

  const queryStr = 'page=1';
  const searchParams = new URLSearchParams(queryStr);

  // Creates a div container to hold pagination
  const paginationContainer = document.createElement('div');
  paginationContainer.classList.add('pagination-wrapper', 'hidden');
  block.append(paginationContainer);

  // Render pagination pages
  const renderPages = (articlePerPage, articleList, currentPage) => {
    const totalArticles = articleList.length;
    const totalPageNumber = Math.ceil(totalArticles / articlePerPage);
    const firstPageMarkup = `<li class="pagination-page active-page" id="page-1"><button>1</button></li>`;
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
    <button class="pagination-prev hidden">Previous</button>
    <ul class="pagination-pages-list"></ul>
    <button class="pagination-next">Next</button>
  `;

  const paginationPageList = block.querySelector('.pagination-pages-list');
  const prevPageButton = block.querySelector('.pagination-prev');
  const nextPageButton = block.querySelector('.pagination-next');

  // Render Search Results
  const renderSearchResults = (newSearchJson) => {
    let markup = '';
    newSearchJson.forEach((list) => {
      const { category, description, image, imageAlt, lastPublished, path, title } = list;
      markup += `
        <div class="search-results-item">
            <a class="search-results-item-link" href="${path}">
                ${image ? `<div class="search-results-item-image"><picture><img src="${image}" alt="${imageAlt}"/></picture></div>` : ``}
                <div class="search-results-item-content">
                    ${category !== '' ? `${renderArticleCategory(list)}` : ''}
                    ${title ? `<h4>${title}</h6>` : ''}
                    ${description ? `<div class="search-results-item-description">${description}</div>` : ''}
                    ${lastPublished ? `<p class="search-results-item-publish-date" >${formatDate(lastPublished)}</p>` : ''}
                </div>
            </a>
        </div>
        `;
    });

    resultWrapper.innerHTML = markup;
    resultWrapper
      .querySelectorAll('img')
      .forEach((img) =>
        img
          .closest('picture')
          .replaceWith(
            createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 640px)', width: '594' }]),
          ),
      );
  };

  // Append articles based on active page
  const appendNewSearchPage = (startIndex, endIndex, currentPage, articlesJson) => {
    let newCurrentArticleData;
    if (Number(currentPage.textContent) * Number(pageView) >= articlesJson.length) {
      newCurrentArticleData = articlesJson.slice(startIndex);
    } else {
      newCurrentArticleData = articlesJson.slice(startIndex, endIndex);
    }
    renderSearchResults(newCurrentArticleData);
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
    paginationPageList.innerHTML = renderPages(pageView, currentSearchJSON, Number(nextActivePage.textContent));

    handlePageClick(paginationPageList, nextActivePage.textContent);

    appendNewSearchPage(
      Number(nextActivePage.textContent) * pageView - pageView,
      Number(nextActivePage.textContent) * pageView,
      nextActivePage,
      currentSearchJSON,
    );

    searchParams.set('page', nextActivePage.textContent);
    const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newRelativePathQuery);
  };

  paginationContainer.addEventListener('click', (e) => {
    if (e.target && e.target.nodeName === 'BUTTON' && e.target.className === '') {
      const { target } = e;
      const targetPageContainer = target.parentElement.parentElement;
      [...targetPageContainer.children].forEach((page) => page.classList.remove('active-page'));
      target.parentElement.classList.add('active-page');

      paginationPageList.innerHTML = renderPages(pageView, currentSearchJSON, Number(target.textContent));

      handlePageClick(paginationPageList, target.textContent);

      appendNewSearchPage(
        Number(target.textContent) * pageView - pageView,
        Number(target.textContent) * pageView,
        target,
        currentSearchJSON,
      );

      searchParams.set('page', target.textContent);
      const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.pushState(null, '', newRelativePathQuery);
    }
  });

  nextPageButton?.addEventListener('click', () => {
    const paginationList = nextPageButton.previousElementSibling;
    const activePage = [...paginationList.children].find((page) => page.classList.contains('active-page'));
    const nextActivePage = activePage.nextElementSibling;
    handlePaginationNav(paginationList, nextActivePage);
  });

  prevPageButton?.addEventListener('click', () => {
    const paginationList = prevPageButton.nextElementSibling;
    const activePage = [...paginationList.children].find((page) => page.classList.contains('active-page'));
    const nextActivePage = activePage.previousElementSibling;
    handlePaginationNav(paginationList, nextActivePage);
  });

  // Search logic
  const handleSearch = (query, loadPage) => {
    let searchJson = searchData;
    const searchString = query.toLowerCase();
    searchJson = searchJson.filter(
      (result) =>
        result.topics.toLowerCase().includes(searchString) ||
        result.title.toLowerCase().includes(searchString) ||
        result.description.toLowerCase().includes(searchString) ||
        result['cq-tags'].toLowerCase().includes(searchString),
    );
    currentSearchJSON = sortByDate(searchJson, 'lastPublished');

    block.querySelector('.search-result-text').classList.remove('hidden');
    const count = block.querySelector('.search-count');
    count.innerHTML = currentSearchJSON.length;

    const searchTerm = block.querySelector('.search-term');
    searchTerm.innerHTML = `'${query}'`;

    if (currentSearchJSON.length === 0) {
      resultWrapper.innerHTML = `<h4 class="search-no-results">${noResultTitle.textContent.trim()}</h4>`;
      paginationContainer.classList.add('pagination-wrapper', 'hidden');
      return;
    }

    paginationContainer.classList.remove('hidden');

    if (loadPage && loadPage !== '1') {
      paginationPageList.innerHTML = renderPages(pageView, currentSearchJSON, Number(loadPage));
      const pageList = paginationPageList.querySelectorAll('.pagination-page');
      if (pageList.length > 1) {
        pageList.forEach((page) => {
          page.classList.remove('active-page');
          if (loadPage === page.textContent) {
            page.classList.add('active-page');
          }
        });
      }
      handlePageClick(paginationPageList, loadPage);
      appendNewSearchPage(
        Number(loadPage) * pageView - pageView,
        Number(loadPage) * pageView,
        Number(loadPage),
        currentSearchJSON,
      );
    } else {
      appendNewSearchPage(0, pageView, '', currentSearchJSON);

      paginationPageList.innerHTML = renderPages(pageView, currentSearchJSON, 1);
      if (paginationPageList.children.length <= 1) {
        paginationContainer.classList.add('hidden');
      } else {
        paginationContainer.classList.remove('hidden');
      }
    }
  };

  // Search Form Event Listener
  const searchForm = block.querySelector('.search-form');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = Object.fromEntries(formData).search;

    handleSearch(value, '1');

    if (value !== null) {
      searchParams.set('q', value);
      searchParams.set('page', '1');
    } else {
      searchParams.delete('q');
      searchParams.delete('page');
    }
    const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, '', newRelativePathQuery);
    handlePageClick(paginationPageList, '1');
  });

  const updateStateFromUrlParams = () => {
    const getUrlParams = window.location.search;
    const loadedSearchParams = new URLSearchParams(getUrlParams);
    if (getUrlParams === '') {
      return;
    }

    const query = loadedSearchParams.get('q');
    const loadPage = loadedSearchParams.get('page');

    if (query !== null) {
      const searchInput = searchFormWrapper.querySelector('#search-input');
      searchInput.setAttribute('value', query);
      searchInput.value = query;
      handleSearch(query, loadPage);
      searchParams.set('q', query);
    }
  };
  updateStateFromUrlParams();
}
