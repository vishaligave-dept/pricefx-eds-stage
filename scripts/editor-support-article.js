/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable import/prefer-default-export */

function getTokenValue() {
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i);
    if (key.startsWith('adobeid_ims_access_token')) {
      const sessionData = sessionStorage.getItem(key);
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        if (parsedData.tokenValue) {
          return parsedData.tokenValue;
        }
      }
    }
  }
  // eslint-disable-next-line no-console
  console.error('Token not found in session storage.');
  return null;
}

function postReadTime(readingTime, contentPath) {
  const tokenValue = getTokenValue();
  if (!tokenValue) {
    return;
  }
  const postData = {
    connections: [
      {
        name: 'aemconnection',
        protocol: 'xwalk',
        uri: window.location.origin,
      },
    ],
    target: {
      resource: `urn:aemconnection:${contentPath.replace(window.location.origin, '').replace(/\.html(\?.*)?$/, '')}/jcr:content`,
      type: 'component',
      prop: '',
    },
    patch: [
      {
        op: 'replace',
        path: '/readingtime',
        value: readingTime.toString(),
      },
    ],
  };

  fetch('https://universal-editor-service.experiencecloud.live/patch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenValue}`,
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      // eslint-disable-next-line no-console
      console.log('Success:', data);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
    });
}

export function processArticleReadingTime() {
  const main = document.querySelector('main');
  if (!main) {
    // eslint-disable-next-line no-console
    console.error('Main content not found.');
    return;
  }

  const articleText = main.innerText;
  const wordsArray = articleText.split(' ');
  const wordCount = wordsArray.length;
  const wordsPerMinute = 250;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  const contentPath = window.location.href;
  postReadTime(readTime, contentPath);
}
