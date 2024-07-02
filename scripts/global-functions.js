/**
 * Function to identify the AEM environment based on the URL.
 * @returns {string} Environment mode (author or publish)
 */
function environmentMode() {
  if (window.location.hostname.includes('adobeaemcloud')) {
    return 'author';
  }
  return 'publish';
}

/**
 * Function to return the formatted date by passing the Timestamp.
 * @returns {string} Formatted  Date string (September 22, 2024)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Function to sort the JSON By Date in Descending order.
 * @params {data} JSON Array
 * @params {prop} object property name
 * @returns {JSON}
 */
function sortByDate(data, prop) {
  return data.sort((a, b) => {
    const date1 = new Date(a[prop]).getTime();
    const date2 = new Date(b[prop]).getTime();
    return date2 - date1;
  });
}

/**
 * Function to remove the base path in the publish environment if present
 * @param {Boolean} isPublishEnvironment Checks if environment is Publish or Author
 * @param {string} pagePath Page path that needs the base content path taken out
 * @param {string} baseContentPath The part of the path that needs to be replaced
 */
const replaceBasePath = (isPublishEnvironment, pagePath, baseContentPath) => {
  if (isPublishEnvironment) {
    const newPagePath = pagePath.replace(baseContentPath, '');
    return newPagePath;
  }
  return null;
};

/**
 * Get the appropriate domain for a given environment.
 * @param {string} env - The environment identifier.
 * @returns {string} - The corresponding domain or an empty string for relative URLs.
 */
function getEnvironmentDomain(env) {
  switch (env) {
    case 'pricefx-eds':
      return 'publish-p131512-e1282665.adobeaemcloud.com';
    case 'pricefx-eds-qa':
      return 'publish-p131512-e1282669.adobeaemcloud.com';
    case 'pricefx-eds-stage':
      return 'publish-p131512-e1282667.adobeaemcloud.com';
    case 'pricefx-eds-prod':
      return 'publish-p131512-e1282666.adobeaemcloud.com';
    case 'pricefx.com':
    case 'preview.pricefx.com':
      return ''; // Return empty string for relative URL
    default:
      return '';
  }
}

/**
 * Determine if the domain should be prepended based on the URL path and its extension.
 * @param {string} url - The incoming URL or path.
 * @returns {boolean} - True if the domain should be prepended, false otherwise.
 */
function shouldPrependDomain(url) {
  const validExtensions = ['.mp3', '.zip', '.docx'];
  const startsWithContentDam = url.startsWith('/content/dam/pricefx');
  const hasValidExtension = validExtensions.some((ext) => {
    const regex = new RegExp(`${ext}(\\?|$)`);
    return regex.test(url);
  });

  return startsWithContentDam && hasValidExtension;
}

/**
 * Prepend the appropriate domain to the URL based on the environment.
 * @param {string} url - The incoming URL or path.
 * @param {string} env - The environment identifier.
 * @returns {string} - The URL with the domain prepended if necessary.
 */
function prependDomain(url, env) {
  // If environment is live or preview, return relative URL.
  if (env === 'pricefx.com' || env === 'preview.pricefx.com') {
    return url;
  }

  const domain = getEnvironmentDomain(env);
  return domain ? `https://${domain}${url}` : url;
}

/**
 * Get the environment identifier from the current environment URL.
 * @param {string} currentUrl - The current environment URL.
 * @returns {string} - The environment identifier.
 */
function getEnvironment() {
  const { hostname } = window.location;
  const envMap = {
    'pricefx-eds': 'pricefx-eds',
    'pricefx-eds-qa': 'pricefx-eds-qa',
    'pricefx-eds-stage': 'pricefx-eds-stage',
    'pricefx-eds-prod': 'pricefx-eds-prod',
    'www.pricefx.com': 'pricefx.com',
    'staging.pricefx.com': 'staging.pricefx.com',
  };

  const keys = Object.keys(envMap);
  const result = keys.find((key) => hostname.includes(`--${key}--`) || hostname.includes(key));

  // Check if the URL is external
  if (!result) {
    return null; // If the environment is not found in the hostname, return null
  }

  return result ? envMap[result] : 'pricefx.com'; // Default to live
}

/**
 * Replace the domain of the absolute URL with the appropriate domain based on the environment.
 * @param {string} url - The absolute URL.
 * @param {string} env - The environment identifier.
 * @returns {string} - The URL with the domain replaced if necessary, or null if not applicable.
 */
function replaceDomain(url, env) {
  const domain = getEnvironmentDomain(env);
  if (!domain) {
    return null; // Return null if the environment domain is not defined
  }
  const validExtensions = ['.mp3', '.zip', '.docx'];
  const hasValidExtension = validExtensions.some((ext) => {
    const regex = new RegExp(`${ext}(\\?|$)`);
    return regex.test(url);
  });
  if (domain && url.startsWith('https://') && hasValidExtension) {
    const { hostname } = new URL(url);
    return url.replace(hostname, domain);
  }
  return null; // Return null if the URL doesn't contain the environment domain or is not absolute
}

/**
 * Process the incoming URL and prepend the appropriate domain based on the environment.
 * @param {string} url - The incoming URL or path.
 * @returns {string} - The processed URL.
 */
function processUrl(url) {
  const env = getEnvironment();
  if (environmentMode() === 'publish' && env) {
    if (shouldPrependDomain(url)) {
      return prependDomain(url, env);
    }
    if (url.startsWith('/')) {
      // If the URL is relative, prepend domain
      return prependDomain(url, env);
    }
    // If the URL is absolute, replace domain
    const processedUrl = replaceDomain(url, env);
    return processedUrl !== null ? processedUrl : url;
  }
  return url;
}

/**
 * Calls the given once callback, when the given element is intersecting the viewport the first time.
 * @param {*} element element to observe
 * @param {*} callback callback to call
 */
function onceIntersecting(element, callback) {
  new IntersectionObserver(
    (entries, observer) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    },
    {
      threshold: 0.01,
    },
  ).observe(element);
}

// eslint-disable-next-line import/prefer-default-export
export { environmentMode, formatDate, sortByDate, replaceBasePath, processUrl, onceIntersecting };
