import { loadFragment } from '../fragment/fragment.js';
import { LEFTCHEVRON, RIGHTCHEVRON } from '../../scripts/constants.js';

const isCarouselQuoteDesktopBreakpoint = window.matchMedia('(min-width: 768px)');

// Set carousel slides position next to one another
const setSlidesPosition = (slides, width, isCarouselImage) => {
  slides.forEach((slide, index) => {
    if (!isCarouselImage) {
      slide.style.left = `${width * index}px`;
    } else {
      slide.style.left = `${(width + 20) * index}px`;
    }
  });
};

// Handles moving slides to new postion
const handleMoveSlide = (track, currentSlide, targetSlide) => {
  track.style.transform = `translateX(-${targetSlide.style.left})`;
  currentSlide.classList.remove('current-slide');
  currentSlide.setAttribute('aria-hidden', 'true');
  targetSlide.classList.add('current-slide');
  targetSlide.setAttribute('aria-hidden', 'false');
};

// Updates carousel navigation indicator state
const updateIndicatorState = (currentIndicator, targetIndicator) => {
  currentIndicator.classList.remove('active-slide');
  targetIndicator.classList.add('active-slide');
};

// Updates carousel CTAs state
const updateCarouselCtaState = (slides, prevCta, nextCta, targetIndex) => {
  if (targetIndex === 0) {
    prevCta.classList.add('hidden');
    nextCta.classList.remove('hidden');
  } else if (targetIndex === slides.length - 1) {
    prevCta.classList.remove('hidden');
    nextCta.classList.add('hidden');
  } else {
    prevCta.classList.remove('hidden');
    nextCta.classList.remove('hidden');
  }
};

// Get the max height of the carousel slides
const getMaxHeight = (slides, carousel, slideContentClass, isCarouselImage) => {
  const slideHeightArray = [];
  slides.forEach((slide) => {
    const slideContent = slide.querySelector(slideContentClass);
    if (!slideContent) {
      return;
    }

    const slideHeight = slideContent.getBoundingClientRect().height;
    slideHeightArray.push(slideHeight);
    const maxHeight = Math.max(...slideHeightArray);
    if (!isCarouselImage) {
      carousel.style.height = `${maxHeight}px`;
    } else {
      carousel.style.height = `${maxHeight + 30}px`;
    }
  });
};

// Get the max height of the images in carousel and set that height to all image container
const setCarouselImageHeight = (slideImageContainers, slideImages) => {
  const slideImageHeightArray = [];
  setTimeout(() => {
    slideImages.forEach((slideImage) => {
      const slideImageHeight = slideImage.offsetHeight;
      slideImageHeightArray.push(slideImageHeight);
    });
    const maxImageHeight = Math.max(...slideImageHeightArray);
    slideImageContainers.forEach((container) => {
      container.style.height = `${maxImageHeight}px`;
    });
  }, 50);
};

// load Carousel Fragment
const processCarousel = async (carouselFrag) => {
  const carouselFragPath = carouselFrag.querySelector('a').href;
  const url = new URL(carouselFragPath);
  const fragmentPath = url.pathname;
  const fragment = await loadFragment(fragmentPath);
  return fragment;
};

export default async function decorate(block) {
  const [carouselTitle, carouselDescription, carouselSlideFrag, isAutoSlide] = block.children;
  block.innerHTML = '';
  const enableAutoSlider = isAutoSlide.textContent.trim();
  if (carouselSlideFrag.textContent.trim() === '') {
    return;
  }

  // Create container to hold Carousel Title and Description
  const carouselDetails = document.createElement('div');
  carouselDetails.classList.add('carousel-details');
  block.append(carouselDetails);

  // Create Title element
  const title = document.createElement('h2');
  title.classList.add('carousel-title');
  title.textContent = carouselTitle.textContent.trim();
  carouselDetails.append(title);

  // Create Descritpion element
  const description = carouselDescription.firstElementChild;
  description.classList.add('carousel-description');
  carouselDetails.append(description);

  // Create container to hold the Carousel
  const carouselContentContainer = document.createElement('div');
  carouselContentContainer.classList.add('carousel-content-container');
  const carouselContent = document.createElement('div');
  carouselContent.classList.add('carousel-content');
  carouselContentContainer.append(carouselContent);
  block.append(carouselContentContainer);

  // Create container to hold all the carousel slides from Fragment
  const carouselTrackContainer = document.createElement('div');
  carouselTrackContainer.classList.add('carousel-track-container');
  carouselContent.append(carouselTrackContainer);
  carouselTrackContainer.append((await processCarousel(carouselSlideFrag)).firstElementChild);
  const carouselTrack = carouselTrackContainer.firstChild;
  carouselTrack.classList.add('carousel-track');
  const carouselSlides = Array.from(carouselTrack.children);
  carouselSlides.forEach((slide) => {
    slide.classList.add('carousel-slide');
    const slideImages = slide.querySelectorAll('.carousel .columns-img-col img');
    slideImages.forEach((image) => {
      image.setAttribute('loading', 'eager');
    });
    if (carouselSlides.indexOf(slide) > 0) {
      slide.setAttribute('aria-hidden', 'true');
    } else {
      slide.classList.add('current-slide');
      slide.setAttribute('aria-hidden', 'false');
    }
  });

  // Indicate whether it's a Carousel Quote or Carousel Image
  if (carouselContent.querySelector('.quote')) {
    block.setAttribute('data-carousel-type', 'carousel-quote');
  } else {
    block.setAttribute('data-carousel-type', 'carousel-image');
  }

  // Checks if Carousel only has 1 slide, then append custom class for styling
  if (carouselSlides.length === 1) {
    block.classList.add('single-slide');
  }

  const slideImages = document.querySelectorAll('.carousel .columns-img-col img');
  const slideImageContainers = document.querySelectorAll('.carousel .columns-img-col');

  setTimeout(() => {
    const slideWidth = carouselSlides[0].getBoundingClientRect().width;
    if (block.getAttribute('data-carousel-type') === 'carousel-quote') {
      setSlidesPosition(carouselSlides, slideWidth, false);
      getMaxHeight(carouselSlides, carouselContent, '.quote-main-container', false);
    } else {
      setSlidesPosition(carouselSlides, slideWidth, true);
      getMaxHeight(carouselSlides, carouselContent, '.columns', true);
      setCarouselImageHeight(slideImageContainers, slideImages);
    }
  }, 150);

  // Assigns carousel content height dynamically
  window.addEventListener('resize', () => {
    if (!isCarouselQuoteDesktopBreakpoint.matches && block.getAttribute('data-carousel-type') === 'carousel-quote') {
      const slideWidth = carouselSlides[0].getBoundingClientRect().width;
      setSlidesPosition(carouselSlides, slideWidth, false);
      getMaxHeight(carouselSlides, carouselContent, '.quote-main-container', false);
    } else if (
      isCarouselQuoteDesktopBreakpoint.matches &&
      block.getAttribute('data-carousel-type') === 'carousel-quote'
    ) {
      const slideWidth = carouselSlides[0].getBoundingClientRect().width;
      setSlidesPosition(carouselSlides, slideWidth, false);
      getMaxHeight(carouselSlides, carouselContent, '.quote-main-container', false);
    } else if (block.getAttribute('data-carousel-type') === 'carousel-image') {
      const slideWidth = carouselSlides[0].getBoundingClientRect().width;
      setSlidesPosition(carouselSlides, slideWidth, true);
      getMaxHeight(carouselSlides, carouselContent, '.columns div', true);
      const slideHeight = carouselContent.getBoundingClientRect().height;
      carouselContent.style.height = `${slideHeight + 30}px`;
      setCarouselImageHeight(slideImageContainers, slideImages);
    }
  });

  // Create Carousel Prev and Next CTAs
  const carouselPrevCtaContainer = document.createElement('div');
  carouselPrevCtaContainer.classList.add('carousel-prev-cta-container');
  const carouselPrevCta = document.createElement('button');
  carouselPrevCta.classList.add('carousel-prev-cta', 'hidden');
  carouselPrevCta.setAttribute('aria-label', 'Previous Slide');
  carouselPrevCta.innerHTML = LEFTCHEVRON;
  carouselPrevCtaContainer.append(carouselPrevCta);
  carouselContent.insertAdjacentElement('afterbegin', carouselPrevCtaContainer);

  const carouselNextCtaContainer = document.createElement('div');
  carouselNextCtaContainer.classList.add('carousel-next-cta-container');
  const carouselNextCta = document.createElement('button');
  carouselNextCta.classList.add('carousel-next-cta');
  carouselNextCta.setAttribute('aria-label', 'Next Slide');
  carouselNextCta.innerHTML = RIGHTCHEVRON;
  carouselNextCtaContainer.append(carouselNextCta);
  carouselContent.insertAdjacentElement('beforeend', carouselNextCtaContainer);

  // Create container to hold the Carousel Navigation
  const carouselNavigation = document.createElement('div');
  carouselNavigation.classList.add('carousel-navigation');
  carouselContentContainer.append(carouselNavigation);

  const renderCarouselIndicator = () => {
    let markup = '';
    carouselSlides.forEach((slide, i) => {
      if (carouselSlides.indexOf(slide) === 0) {
        markup += `
          <button class="carousel-indicator active-slide" id="carousel-indicator-${i + 1}"><span class="sr-only">Slide ${i + 1} of ${carouselSlides.length}</span></button>
        `;
      } else {
        markup += `
          <button class="carousel-indicator" id="carousel-indicator-${i + 1}"><span class="sr-only">Slide ${i + 1} of ${carouselSlides.length}</span></button>
        `;
      }
    });
    return markup;
  };
  carouselNavigation.innerHTML = renderCarouselIndicator();

  // Event Listeners Calls
  carouselPrevCta.addEventListener('click', () => {
    const currentSlide = carouselTrack.querySelector('.current-slide');
    const prevSlide = currentSlide.previousElementSibling;
    const currentIndicator = carouselNavigation.querySelector('.active-slide');
    const prevIndicator = currentIndicator.previousElementSibling;
    const prevIndex = carouselSlides.findIndex((slide) => slide === prevSlide);
    handleMoveSlide(carouselTrack, currentSlide, prevSlide);
    updateIndicatorState(currentIndicator, prevIndicator);
    updateCarouselCtaState(carouselSlides, carouselPrevCta, carouselNextCta, prevIndex);
  });

  carouselNextCta.addEventListener('click', () => {
    const currentSlide = carouselTrack.querySelector('.current-slide');
    const nextSlide = currentSlide.nextElementSibling;
    const currentIndicator = carouselNavigation.querySelector('.active-slide');
    const nextIndicator = currentIndicator.nextElementSibling;
    const nextIndex = carouselSlides.findIndex((slide) => slide === nextSlide);
    handleMoveSlide(carouselTrack, currentSlide, nextSlide);
    updateIndicatorState(currentIndicator, nextIndicator);
    updateCarouselCtaState(carouselSlides, carouselPrevCta, carouselNextCta, nextIndex);
  });

  const carouselIndicators = Array.from(carouselNavigation.children);
  carouselNavigation.addEventListener('click', (e) => {
    const targetIndicator = e.target.closest('button');
    if (!targetIndicator) {
      return;
    }

    const currentSlide = carouselTrack.querySelector('.current-slide');
    const currentIndicator = carouselNavigation.querySelector('.active-slide');
    const targetIndex = carouselIndicators.findIndex((indicator) => indicator === targetIndicator);
    const targetSlide = carouselSlides[targetIndex];

    handleMoveSlide(carouselTrack, currentSlide, targetSlide);
    updateIndicatorState(currentIndicator, targetIndicator);
    updateCarouselCtaState(carouselSlides, carouselPrevCta, carouselNextCta, targetIndex);
  });

  if (enableAutoSlider !== 'false' && carouselSlides.length > 1) {
    setInterval(() => {
      const currentSlide = carouselTrack.querySelector('.current-slide');
      const currentIndex = carouselSlides.findIndex((slide) => slide === currentSlide);
      if (currentIndex === 0) {
        carouselNextCta.click();
      } else if (currentIndex === carouselSlides.length - 1) {
        carouselIndicators[0].click();
      } else {
        carouselNextCta.click();
      }
    }, 10000);
  }
}
