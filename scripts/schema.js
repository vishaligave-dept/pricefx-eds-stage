import { getMetadata } from './aem.js';

const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export default function addPageSchema() {
  if (document.querySelector('head > script[type="application/ld+json"]')) {
    return;
  }

  const path = window.location.pathname;
  const type = getMetadata('template') || (path === '/' ? 'homepage' : '');
  try {
    const pricefxRootURL = 'https://www.pricefx.com/';
    const pricefxLogoURL = 'https://www.pricefx.com/icons/pricefx-logo-dark.svg';

    const pageURL = document.querySelector("link[rel='canonical']")?.href || window.location.href;
    const h1 = document.querySelector('main h1');
    const schemaTitle = h1 ? h1.textContent : getMetadata('og:title');

    // Authors Name and details
    const authorNameArray = getMetadata('authors').split(',');
    const authorURL = document.querySelectorAll('.article-metadata a');
    const authorsDetails = [];

    authorNameArray.forEach((author, index) => {
      if (author === '') {
        return;
      }

      const removePrefixAuthor = author.split('/')[1];
      const removeHyphenAuthor = removePrefixAuthor.replaceAll('-', ' ');
      let url = '';
      if (authorURL.length > 0) {
        url = authorURL[index].href;
      } else {
        url = path.includes(removePrefixAuthor) ? window.location.href : pricefxRootURL;
      }
      const authorObject = {
        '@type': 'Person',
        name: removeHyphenAuthor
          .split(' ')
          .map((word) => toTitleCase(word))
          .join(' '),
        url,
      };
      authorsDetails.push(authorObject);
    });

    const heroImage = document.querySelector('.hero img');
    const schemaImage = heroImage
      ? heroImage.src
      : getMetadata('thumbnail') || getMetadata('og:image') || pricefxLogoURL;

    const schema = document.createElement('script');
    schema.setAttribute('type', 'application/ld+json');

    const logo = {
      '@type': 'ImageObject',
      url: pricefxLogoURL,
    };

    const brandSameAs = [
      'https://www.facebook.com/pricefxteam/',
      'https://x.com/Price_fx',
      'https://www.linkedin.com/company/3145506/admin/',
      'https://www.youtube.com/channel/UC6EtgsU9MKMXu88Y992iAYQ',
    ];

    let schemaInfo = null;

    if (type === 'homepage') {
      const homepageName = 'Pricefx';
      schemaInfo = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            additionalType: 'Organization',
            description: getMetadata('description'),
            name: homepageName,
            sameAs: [...brandSameAs],
            url: pricefxRootURL,
            logo: {
              ...logo,
            },
          },
          {
            '@type': 'WebSite',
            name: homepageName,
            url: pricefxRootURL,
            potentialAction: {
              '@type': 'SearchAction',
              'query-input': 'required name=search_term_string',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${pricefxRootURL}search?q={search_term_string}`,
              },
            },
          },
        ],
      };
    } else if (type === 'article') {
      schemaInfo = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: schemaTitle,
        image: {
          '@type': 'ImageObject',
          url: schemaImage,
          width: 1000,
          height: 585,
        },
        datePublished: getMetadata('published-time'),
        dateModified: getMetadata('modified-time'),
        author: authorsDetails,
        publisher: {
          '@type': 'Organization',
          name: 'Pricefx',
          logo: {
            ...logo,
          },
        },
      };
    } else {
      schemaInfo = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            name: schemaTitle,
            description: getMetadata('description'),
            url: pageURL,
            image: {
              '@type': 'ImageObject',
              representativeOfPage: 'True',
              url: schemaImage,
            },
            author: {
              '@type': 'Organization',
              name: 'Pricefx',
              url: pricefxRootURL,
              sameAs: brandSameAs,
              logo,
            },
          },
        ],
      };
    }

    if (schemaInfo) {
      schema.appendChild(document.createTextNode(JSON.stringify(schemaInfo, null, 2)));

      document.querySelector('head').appendChild(schema);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
}
