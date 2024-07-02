// Set cookie value
const setCookie = (cookieValue) => {
  document.cookie = cookieValue;
};

// Get existing cookie by name
const getCookie = (cookieName) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${cookieName}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return value;
};

// Generate a random token to use as cookie consent ID
const generateToken = (tokenLength) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < tokenLength; i += 1) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
};

// Handle reject all cookie
const handleRejectCta = (blockParent, block, cookieID, cookieExpDate) => {
  blockParent.remove(block);
  const rejectCookieValue = `cookieyes-consent=consentid:${cookieID},consent:no,action:yes,necessary:yes,functional:no,analytics:no,performance:no,advertisement:no; path=/; expires=${cookieExpDate}; samesite=strict`;
  setCookie(rejectCookieValue);
};

// Handle accept all cookie
const handleAcceptCta = (blockParent, block, cookieID, cookieExpDate) => {
  blockParent.remove(block);
  const acceptCookieValue = `cookieyes-consent=consentid:${cookieID},consent:yes,action:yes,necessary:yes,functional:yes,analytics:yes,performance:yes,advertisement:yes; path=/; expires=${cookieExpDate}; samesite=strict`;
  setCookie(acceptCookieValue);
};

export default async function decorate(block) {
  const [cookieBannerText, rejectCtaLabel, acceptCtaLabel] = block.children;
  block.textContent = '';

  let generatedCookieId;
  let cookieExpDate;
  const bodyEl = document.querySelector('body');
  const cookieBannerContainer = document.querySelector('.cookie-banner-container');
  const blockParent = block.parentElement;

  // Move cookie banner to the beginning of <body>
  setTimeout(() => {
    if (cookieBannerContainer) {
      bodyEl.prepend(cookieBannerContainer);
    }
  }, 200);

  // Create clost CTA element
  const closeCta = document.createElement('button');
  closeCta.classList.add('cookie-banner__close-cta');
  closeCta.setAttribute('aria-label', 'Close cookie banner');
  const closeCtaIcon = document.createElement('span');
  closeCtaIcon.classList.add('close-icon');
  closeCta.append(closeCtaIcon);
  block.append(closeCta);

  closeCta.addEventListener('click', () => {
    handleRejectCta(blockParent, block, generatedCookieId, cookieExpDate);
  });

  // Create content container element
  const contentContainer = cookieBannerText.children[0];
  contentContainer.classList.add('cookie-banner__content');
  block.append(contentContainer);

  // Create CTA container element
  const ctaContainer = document.createElement('div');
  ctaContainer.classList.add('cookie-banner__cta-container');
  block.append(ctaContainer);

  // Create reject CTA element
  const rejectCta = document.createElement('button');
  rejectCta.classList.add('cookie-banner__reject-cta');
  rejectCta.textContent = rejectCtaLabel.textContent.trim();
  ctaContainer.append(rejectCta);

  rejectCta.addEventListener('click', () => {
    handleRejectCta(blockParent, block, generatedCookieId, cookieExpDate);
  });

  // Create accept CTA element
  const acceptCta = document.createElement('button');
  acceptCta.classList.add('cookie-banner__accept-cta');
  acceptCta.textContent = acceptCtaLabel.textContent.trim();
  ctaContainer.append(acceptCta);
  acceptCta.addEventListener('click', () => {
    handleAcceptCta(blockParent, block, generatedCookieId, cookieExpDate);
  });

  // Create cookie on initial load
  if (document.cookie.indexOf('cookieyes-consent') === -1) {
    // Generate cookie ID and set initial cookie value
    const cookieConsentId = generateToken(43);
    generatedCookieId = cookieConsentId;

    // Generate cookie exp time to 1 year from current date
    const aYearFromNow = new Date();
    aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);
    cookieExpDate = aYearFromNow;

    // Set initial cookie value with generated ID and exp date
    const initialCookieValue = `cookieyes-consent=consentid:${cookieConsentId},consent:no,action:,necessary:yes,functional:no,analytics:no,performance:no,advertisement:no; path=/; expires=${aYearFromNow}; samesite=strict`;

    setCookie(initialCookieValue);
    blockParent.append(block);
  } else {
    const cookieValue = getCookie('cookieyes-consent');
    const hasActionValue = cookieValue.includes('action:yes' || 'action:no');
    if (hasActionValue) {
      blockParent.remove(block);
    } else {
      blockParent.append(block);
    }
  }
}
