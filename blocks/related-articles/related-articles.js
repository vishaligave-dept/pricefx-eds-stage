import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { environmentMode, formatDate, sortByDate, replaceBasePath } from '../../scripts/global-functions.js';
import { ARTICLE_INDEX_PATH, BASE_CONTENT_PATH } from '../../scripts/url-constants.js';
import { loadFragment } from '../fragment/fragment.js';
import ffetch from '../../scripts/ffetch.js';

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
    markup = `<p class="article-subtitle">${removeHyphenCategory}</p>`;
    return markup;
  }
  return null;
};

// Clean-up and Render Article Authors
const renderArticleAuthors = (article, authorDirectoryPath) => {
  const authorsArray = article.authors.split(',');
  const postDate = formatDate(article.articlePublishDate);
  let markup = '';
  let innerMarkup = '';

  // Formatting authorsParentPagePath
  let authorsParentPagePathFormatted = authorDirectoryPath;
  const isPublishEnvironment = environmentMode() === 'publish';

  // Append a slash only if the URL doesn't already end with it
  if (!authorsParentPagePathFormatted.endsWith('/')) {
    authorsParentPagePathFormatted += '/';
  }

  if (isPublishEnvironment) {
    authorsParentPagePathFormatted = replaceBasePath(
      isPublishEnvironment,
      authorsParentPagePathFormatted,
      BASE_CONTENT_PATH,
    );
  }

  authorsArray.forEach((author) => {
    if (author === '') {
      return;
    }

    const removePrefixAuthor = author.split('/')[1];
    const removeHyphenAuthor = removePrefixAuthor.replaceAll('-', ' ');
    let authorPageLink = '';

    if (!isPublishEnvironment) {
      authorPageLink = `${authorsParentPagePathFormatted}${removePrefixAuthor}.html`;
    } else {
      authorPageLink = `${authorsParentPagePathFormatted}${removePrefixAuthor}`;
    }

    innerMarkup +=
      authorsArray.indexOf(author) + 1 === authorsArray.length
        ? `<a class="article-author-link" href="${authorPageLink}">${removeHyphenAuthor}</a>`
        : `<a class="article-author-link" href="${authorPageLink}">${removeHyphenAuthor}</a> & `;
  });
  markup = `<p class="article-info">${article.author !== '' ? `By ${innerMarkup}` : ''} ${article.articlePublishDate !== '' ? `${article.author !== '' ? 'on' : ''} ${postDate}</p>` : ''}`;
  return markup;
};

function generateCardDom(article, authorDirectoryPath) {
  const { articlePublishDate, authors, category, image, imageAlt, title, path, readingTime } = article;

  // Build DOM
  const cardDOM = document.createRange().createContextualFragment(`
    <li class='card-item'>
      <div class='cards-card-image'>
        <picture>
            <img src='${image || ''}'  alt='${imageAlt || ''}'/>
        </picture>
      </div>
      <div class='cards-card-body'>
        ${
          category !== '' || title !== '' || authors !== '' || articlePublishDate !== ''
            ? `<div class="article-details">
            ${article.category !== '' ? renderArticleCategory(article) : ''}
            ${article.title !== '' ? `<h6 class="article-title">${article.title}</h6>` : ''}
          </div>`
            : ''
        }
        ${article.authors !== '' || article.articlePublishDate !== '' ? renderArticleAuthors(article, authorDirectoryPath) : ''}
        <div class='cards-card-cta'>
          <a class="article-link" href="${path}">Read Now</a>
          ${readingTime ? `<div class='cards-card-reading-time'>${readingTime} min read</div>` : ''}
        </div>
      </div>
    </li>
    `);
  return cardDOM;
}

function decorateTopArticles(topArticles) {
  // eslint-disable-next-line no-unused-vars
  const [col1, ...restArticle] = topArticles.children;
  const column2 = document.createElement('div');
  column2.classList.add('col-2');
  restArticle.forEach((item) => {
    column2.append(item);
  });
  topArticles.append(column2);
}

async function decorateBlogArticles(articlesJSON, block, props) {
  const { authorDirectoryPath, marketoFormPath, numOfArticles } = props;
  const queryStr = 'page=1';
  const searchParams = new URLSearchParams(queryStr);

  const articlesContainer = document.createElement('div');
  articlesContainer.classList.add('articles-container');
  const articleSection1 = document.createElement('div');
  articleSection1.classList.add('blog-articles-top-section');
  const articleSection2 = document.createElement('ul');
  articleSection2.classList.add('blog-articles-bottom-section');
  const marketoForm = document.createElement('div');
  marketoForm.classList.add('blog-marketo-form');
  articlesContainer.appendChild(articleSection1);
  articlesContainer.appendChild(marketoForm);
  articlesContainer.appendChild(articleSection2);
  block.append(articlesContainer);

  if (marketoFormPath && marketoFormPath.includes('/fragments/')) {
    const fragmentBlock = await loadFragment(marketoFormPath.replace('/content/pricefx/en', ''));
    while (fragmentBlock.firstElementChild) {
      marketoForm.append(fragmentBlock.firstElementChild);
    }
  }

  // Creates a div container to hold pagination
  const paginationContainer = document.createElement('div');
  paginationContainer.classList.add('pagination-wrapper');
  block.append(paginationContainer);

  // Render Blog Article Card
  const renderArticleCard = (articleDataList) => {
    let initialArticleData = articleDataList;
    const initialArticleCount = initialArticleData.length;
    if (Number(numOfArticles) !== '' && initialArticleCount > Number(numOfArticles)) {
      initialArticleData = articleDataList.slice(initialArticleData, numOfArticles);
    }
    const firstSetArticles = initialArticleData.slice(0, 5);
    const secondSetArticles = initialArticleData.slice(5);
    let markup1 = '';
    let markup2 = '';
    firstSetArticles.forEach((article, index) => {
      if (index === 0) {
        markup1 += `
        <div class="col-1">
          <div class="article-card">
            <div class="article-image"><picture><img src="${article.image}" alt="${article.imageAlt || article.title}"></picture></div>
            <div class="article-content">
              ${
                article.category !== '' ||
                article.title !== '' ||
                article.authors !== '' ||
                article.articlePublishDate !== ''
                  ? `<div class="article-details">
                  ${article.category !== '' ? renderArticleCategory(article) : ''}
                  ${article.title !== '' ? `<h2 class="article-title">${article.title}</h2>` : ''}
                </div>`
                  : ''
              }
              ${article.authors !== '' || article.articlePublishDate !== '' ? renderArticleAuthors(article, authorDirectoryPath) : ''}
              <div class="article-cta-container">
                <a class="article-link" href="${article.path}">Read Now</a>
                ${article.readingTime !== '' ? `<p class="article-readtime">${article.readingTime} min read</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
      } else {
        markup1 += `
        <div class="article-card">
          <div class="article-image"><picture><img src="${article.image}" alt="${article.imageAlt || article.title}"></picture></div>
          <div class="article-content">
            ${
              article.category !== '' ||
              article.title !== '' ||
              article.authors !== '' ||
              article.articlePublishDate !== ''
                ? `<div class="article-details">
                ${article.category !== '' ? renderArticleCategory(article) : ''}
                ${article.title !== '' ? `<h2 class="article-title">${article.title}</h2>` : ''}
              </div>`
                : ''
            }
            ${article.authors !== '' || article.articlePublishDate !== '' ? renderArticleAuthors(article, authorDirectoryPath) : ''}
            <div class="article-cta-container">
              <a class="article-link" href="${article.path}">Read Now</a>
              ${article.readingTime !== '' ? `<p class="article-readtime">${article.readingTime} min read</p>` : ''}
            </div>
          </div>
        </div>
        `;
      }
    });

    secondSetArticles.forEach((article) => {
      markup2 += `
        <li class="article-card">
          <div class="article-image"><picture><img src="${article.image}" alt="${article.imageAlt || article.title}"></picture></div>
          <div class="article-content">
            ${
              article.category !== '' ||
              article.title !== '' ||
              article.authors !== '' ||
              article.articlePublishDate !== ''
                ? `<div class="article-details">
                ${article.category !== '' ? renderArticleCategory(article) : ''}
                ${article.title !== '' ? `<h2 class="article-title">${article.title}</h2>` : ''}
              </div>`
                : ''
            }
            ${article.authors !== '' || article.articlePublishDate !== '' ? renderArticleAuthors(article, authorDirectoryPath) : ''}
            <div class="article-cta-container">
              <a class="article-link" href="${article.path}">Read Now</a>
              ${article.readingTime !== '' ? `<p class="article-readtime">${article.readingTime} min read</p>` : ''}
            </div>
          </div>
        </li>
      `;
    });
    articleSection1.innerHTML = markup1;
    articleSection2.innerHTML = markup2;
    decorateTopArticles(articleSection1);

    articlesContainer
      .querySelectorAll('img')
      .forEach((img) =>
        img
          .closest('picture')
          .replaceWith(
            createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 640px)', width: '594' }]),
          ),
      );
  };

  const appendBlogArticles = (articleJsonData) => {
    renderArticleCard(articleJsonData);
  };
  appendBlogArticles(articlesJSON);

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
    ${Number(numOfArticles) > articlesJSON.length ? '' : '<button class="pagination-prev hidden">Previous</button>'}
    <ul class="pagination-pages-list">
      ${renderPages(numOfArticles, articlesJSON, 1)}
    </ul>
    ${Number(numOfArticles) > articlesJSON.length ? '' : '<button class="pagination-next">Next</button>'}
  `;

  const paginationPageList = document.querySelector('.pagination-pages-list');
  const prevPageButton = document.querySelector('.pagination-prev');
  const nextPageButton = document.querySelector('.pagination-next');

  if (paginationPageList.children.length === 1) {
    paginationContainer.classList.add('hidden');
  } else {
    paginationContainer.classList.remove('hidden');
  }

  if (articlesJSON.length === 0) {
    articlesContainer.innerHTML = `
      <h4 class="no-articles">Sorry, there are no results based on these choices. Please update and try again.</h4>
    `;
    paginationContainer.classList.add('hidden');
  } else {
    appendBlogArticles(articlesJSON);
    paginationContainer.classList.remove('hidden');
    const currentPage = [...paginationPageList.children].find((page) => page.classList.contains('active-page'));
    paginationPageList.innerHTML = renderPages(numOfArticles, articlesJSON, Number(currentPage.textContent));
    if (paginationPageList.children.length <= 1) {
      paginationContainer.classList.add('hidden');
    } else {
      paginationContainer.classList.remove('hidden');
    }
  }

  // Append articles based on active page
  const appendNewActiveArticlePage = (startIndex, endIndex, currentPage, articlesJson) => {
    let newCurrentArticleData;
    if (Number(currentPage.textContent) * Number(numOfArticles) >= articlesJson.length) {
      newCurrentArticleData = articlesJson.slice(startIndex);
    } else {
      newCurrentArticleData = articlesJson.slice(startIndex, endIndex);
    }
    appendBlogArticles(newCurrentArticleData);
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
    paginationPageList.innerHTML = renderPages(numOfArticles, articlesJSON, Number(nextActivePage.textContent));

    handlePageClick(paginationPageList, nextActivePage.textContent);

    appendNewActiveArticlePage(
      Number(nextActivePage.textContent) * Number(numOfArticles) - Number(numOfArticles),
      Number(nextActivePage.textContent) * Number(numOfArticles),
      nextActivePage,
      articlesJSON,
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

      paginationPageList.innerHTML = renderPages(numOfArticles, articlesJSON, Number(target.textContent));

      handlePageClick(paginationPageList, target.textContent);

      appendNewActiveArticlePage(
        Number(target.textContent) * Number(numOfArticles) - Number(numOfArticles),
        Number(target.textContent) * Number(numOfArticles),
        target,
        articlesJSON,
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

  const updateStateFromUrlParams = () => {
    const getUrlParams = window.location.search;
    const loadedSearchParams = new URLSearchParams(getUrlParams);
    if (getUrlParams === '') {
      return;
    }

    if (loadedSearchParams.get('page') && loadedSearchParams.get('page') !== '1') {
      paginationPageList.innerHTML = renderPages(numOfArticles, articlesJSON, Number(loadedSearchParams.get('page')));
      const pageList = paginationPageList.querySelectorAll('.pagination-page');
      if (pageList.length > 1) {
        pageList.forEach((page) => {
          page.classList.remove('active-page');
          if (loadedSearchParams.get('page') === page.textContent) {
            page.classList.add('active-page');
          }
        });
      }

      const activePage = [...pageList].find((page) => page.classList.contains('active-page'));

      if (activePage.textContent > '1') {
        prevPageButton.classList.remove('hidden');
      } else {
        prevPageButton.classList.add('hidden');
      }

      if (activePage.textContent === pageList[pageList.length - 1].textContent) {
        nextPageButton.classList.add('hidden');
      } else {
        nextPageButton.classList.remove('hidden');
      }

      appendNewActiveArticlePage(
        Number(loadedSearchParams.get('page')) * Number(numOfArticles) - Number(numOfArticles),
        Number(loadedSearchParams.get('page')) * Number(numOfArticles),
        Number(loadedSearchParams.get('page')),
        articlesJSON,
      );
    }
  };
  updateStateFromUrlParams();
}

const filterBasedOnProp = (data = [], filterProps = [], filterValues = {}) =>
  data.filter(
    (item) =>
      filterProps.filter((prop) => {
        const filteredValue = filterValues[prop];
        return filteredValue?.filter((filterItem) => item[prop]?.includes(filterItem)).length > 0;
      }).length > 0,
  );

export default async function decorate(block) {
  const type = block.children[0]?.textContent.trim() || 'related';
  const title = block.children[1]?.textContent.trim();
  const titleEle = `<h2>${title}</h2>`;
  const columnLayout = block.children[2]?.textContent.trim() || 'three-column';
  let categoryTags = block.children[3]?.textContent.trim()?.split(',');
  const topicTags = block.children[4]?.textContent.trim()?.split(',');
  const authorTags = block.children[5]?.textContent.trim()?.split(',');
  const path = block.children[6]?.textContent.trim();
  const authorPath = block.children[7]?.textContent.trim();
  const numOfArticles = block.children[8]?.textContent.trim() || '13';
  const marketoFormPath = block.children[9]?.textContent.trim();

  const url = path || ARTICLE_INDEX_PATH;
  // Get Data
  const data = await ffetch(url).all();

  if (categoryTags.toString().length === 0) {
    categoryTags = getMetadata('category')?.split(',');
  }

  // filter by Category
  const filteryByCategory = filterBasedOnProp(data, ['category'], { category: categoryTags });

  // filter by other tags
  const filteryByTopics = filterBasedOnProp(filteryByCategory, ['topics'], { topics: topicTags });
  const filterByAuthors = filterBasedOnProp(filteryByTopics, ['authors'], { authors: authorTags });

  // Filter Current Article
  let filteredData = filterByAuthors.filter((article) => !article.path.includes(window.location.pathname));

  // Sorting Article by Date published
  filteredData = sortByDate(filteredData, 'articlePublishDate');

  const ul = document.createElement('ul');
  block.textContent = '';
  if (type === 'related') {
    block.classList.add(columnLayout, 'cards', 'aspect-ratio-16-9');
    block.innerHTML = titleEle;
    const relatedArticles = filteredData.slice(0, 8);
    relatedArticles?.forEach((article) => {
      ul.append(generateCardDom(article, authorPath));
      ul.querySelectorAll('img').forEach((img) =>
        img
          .closest('picture')
          .replaceWith(
            createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 640px)', width: '594' }]),
          ),
      );
      block.append(ul);
    });
  } else {
    block.classList.add('blog-articles');
    const props = {
      marketoFormPath,
      numOfArticles,
      authorDirectoryPath: authorPath,
    };

    decorateBlogArticles(filteredData, block, props);
  }
}
