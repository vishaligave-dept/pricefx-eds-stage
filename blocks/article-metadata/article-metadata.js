import { getMetadata } from '../../scripts/aem.js';
import { environmentMode } from '../../scripts/global-functions.js';
import { BASE_CONTENT_PATH } from '../../scripts/url-constants.js';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  let dayWithSuffix;
  if (day === 1 || day === 21 || day === 31) {
    dayWithSuffix = `${day}st`;
  } else if (day === 2 || day === 22) {
    dayWithSuffix = `${day}nd`;
  } else if (day === 3 || day === 23) {
    dayWithSuffix = `${day}rd`;
  } else {
    dayWithSuffix = `${day}th`;
  }
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${dayWithSuffix}, ${year}`;
};

const formatDateFromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const getAuthorPageLink = (authorName) => `${authorName.replace(/\s+/g, '-').toLowerCase()}`;

export default async function decorate(block) {
  const container = document.createElement('div');
  container.classList.add('article-metadata-container');

  const articleAuthors = getMetadata('authors');
  const articlePostDate = getMetadata('publishdate');
  const articleReadTime = getMetadata('readingtime');
  const articleUpdatedDate = getMetadata('published-time');

  let authorsParentPagePath = '';
  if (block.children.length > 0) {
    const [firstChild] = block.children;
    authorsParentPagePath = firstChild.textContent.trim();
  }

  block.textContent = '';

  let authorsParentPagePathFormatted = authorsParentPagePath;
  const isPublishEnvironment = environmentMode() === 'publish';

  if (!isPublishEnvironment && !authorsParentPagePathFormatted.endsWith('/')) {
    authorsParentPagePathFormatted += '/';
  } else {
    authorsParentPagePathFormatted = authorsParentPagePathFormatted.replace(BASE_CONTENT_PATH, '');
  }

  const postDate = formatDate(articlePostDate);
  const updatedDate = formatDateFromTimestamp(articleUpdatedDate);

  const authors = articleAuthors
    .split(',')
    .map((authorTag) => {
      const authorName = authorTag
        .split('/')
        .pop()
        .split('-')
        .map((word) => toTitleCase(word))
        .join(' ');
      const authorLink = document.createElement('a');
      const authorPageLink = !isPublishEnvironment
        ? `${authorsParentPagePathFormatted}${getAuthorPageLink(authorName)}.html`
        : `/learning-center/writer/${getAuthorPageLink(authorName)}`;
      authorLink.href = authorPageLink;
      authorLink.textContent = authorName;
      return authorLink.outerHTML;
    })
    .join(' & ');

  const postDateElement = document.createElement('div');
  postDateElement.textContent = `${postDate} (Updated ${updatedDate})${articleReadTime ? ` | ${articleReadTime} min. read` : ''}`;
  const authorsElement = document.createElement('div');
  authorsElement.innerHTML = `By ${authors}`;

  container.appendChild(postDateElement);
  if (articleAuthors) {
    container.appendChild(authorsElement);
  }
  block.appendChild(container);
}
