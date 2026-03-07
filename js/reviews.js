// Loads reviews from JSON and renders a randomized carousel with a full-list toggle.
document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('[data-reviews-root]');
  if (!root) {
    return;
  }

  const track = root.querySelector('[data-reviews-track]');
  const dots = root.querySelector('[data-reviews-dots]');
  const prevButton = root.querySelector('[data-reviews-prev]');
  const nextButton = root.querySelector('[data-reviews-next]');
  const toggleButton = root.querySelector('[data-toggle-all]');
  const allReviewsContainer = root.querySelector('[data-all-reviews]');
  const sortControls = root.querySelector('[data-sort-controls]');
  const sortSelect = root.querySelector('[data-reviews-sort]');
  const reviewCount = root.querySelector('[data-review-count]');
  const carousel = root.querySelector('[data-reviews-carousel]');
  const isFileProtocol = window.location.protocol === 'file:';

  if (!track || !dots || !prevButton || !nextButton || !toggleButton || !allReviewsContainer || !sortControls || !sortSelect || !reviewCount || !carousel) {
    return;
  }

  let currentIndex = 0;
  let autoRotateId = null;

  function formatDate(dateString) {
    if (!dateString) {
      return 'Date not provided';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Date not provided';
    }

    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function stars(rating) {
    const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
    return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shuffleArray(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function createReviewMarkup(review) {
    const visitType = review.visit_type ? `<p class="review-meta">Visit type: ${escapeHtml(review.visit_type)}</p>` : '';

    return `
      <h2>${escapeHtml(review.title || 'Guest Review')}</h2>
      <p class="review-stars" aria-label="${Number(review.rating) || 0} out of 5 stars">${stars(review.rating)}</p>
      <p>${escapeHtml(review.text || '')}</p>
      <p class="review-meta"><strong>${escapeHtml(review.author || 'Anonymous')}</strong></p>
      <p class="review-meta">${escapeHtml(review.source || 'Guest')} | ${formatDate(review.date)}</p>
      ${visitType}
    `;
  }

  function renderAllReviews(reviews) {
    allReviewsContainer.innerHTML = '';
    reviews.forEach((review, index) => {
      const card = document.createElement('article');
      const delayClass = index % 4 === 0 ? '' : ` delay-${Math.min(index % 4, 3)}`;
      card.className = `card review-card reveal${delayClass}`;
      card.innerHTML = createReviewMarkup(review);
      allReviewsContainer.appendChild(card);
    });
  }

  function reviewDateValue(review) {
    if (!review || !review.date) {
      return null;
    }

    const timestamp = new Date(review.date).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  function sortReviews(reviews, mode) {
    const sorted = [...reviews];

    sorted.sort((a, b) => {
      const aDate = reviewDateValue(a);
      const bDate = reviewDateValue(b);
      const aRating = Number(a.rating) || 0;
      const bRating = Number(b.rating) || 0;

      if (mode === 'highest') {
        if (bRating !== aRating) {
          return bRating - aRating;
        }
      } else if (mode === 'lowest') {
        if (aRating !== bRating) {
          return aRating - bRating;
        }
      } else if (mode === 'oldest') {
        if (aDate === null && bDate !== null) {
          return 1;
        }
        if (aDate !== null && bDate === null) {
          return -1;
        }
        if (aDate !== null && bDate !== null && aDate !== bDate) {
          return aDate - bDate;
        }
      } else {
        // Default to newest first.
        if (aDate === null && bDate !== null) {
          return 1;
        }
        if (aDate !== null && bDate === null) {
          return -1;
        }
        if (aDate !== null && bDate !== null && aDate !== bDate) {
          return bDate - aDate;
        }
      }

      return (a.author || '').localeCompare(b.author || '');
    });

    return sorted;
  }

  function renderCarouselSlides(reviews) {
    track.innerHTML = '';
    dots.innerHTML = '';

    reviews.forEach((review, index) => {
      const slide = document.createElement('article');
      slide.className = 'review-slide';
      slide.innerHTML = createReviewMarkup(review);
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'review-dot';
      dot.setAttribute('aria-label', `Go to review ${index + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
        restartAutoRotate(reviews.length);
      });
      dots.appendChild(dot);
    });
  }

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    const allDots = dots.querySelectorAll('.review-dot');
    allDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function restartAutoRotate(totalSlides) {
    if (autoRotateId) {
      clearInterval(autoRotateId);
    }

    if (totalSlides <= 1) {
      return;
    }

    autoRotateId = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    }, 5500);
  }

  async function loadReviewsData() {
    // Try likely JSON locations so the page works in more hosting setups.
    const candidates = ['reviews.json', './reviews.json', '/reviews.json', '../reviews.json'];

    for (const path of candidates) {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        if (data && Array.isArray(data.reviews)) {
          return data;
        }
      } catch (error) {
        // Keep trying fallback paths.
      }
    }

    throw new Error('Unable to load reviews.json');
  }

  try {
    const data = await loadReviewsData();
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    const allReviewsBase = [...reviews];

    if (!reviews.length) {
      root.innerHTML = '<p class="card">No reviews available right now.</p>';
      return;
    }

    reviewCount.textContent = `${reviews.length} reviews available`;

    // Randomize once per page load so the spotlight feels fresh each visit.
    const shuffledReviews = shuffleArray(reviews);
    const carouselReviews = shuffledReviews.slice(0, Math.min(8, shuffledReviews.length));

    renderCarouselSlides(carouselReviews);
    renderAllReviews(sortReviews(allReviewsBase, sortSelect.value));

    currentIndex = 0;
    updateCarousel();
    restartAutoRotate(carouselReviews.length);

    prevButton.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + carouselReviews.length) % carouselReviews.length;
      updateCarousel();
      restartAutoRotate(carouselReviews.length);
    });

    nextButton.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % carouselReviews.length;
      updateCarousel();
      restartAutoRotate(carouselReviews.length);
    });

    toggleButton.addEventListener('click', () => {
      const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;
      toggleButton.setAttribute('aria-expanded', String(nextState));
      toggleButton.textContent = nextState ? 'Hide all reviews' : 'View all reviews';
      sortControls.hidden = !nextState;
      allReviewsContainer.hidden = !nextState;
    });

    sortSelect.addEventListener('change', () => {
      const sortedReviews = sortReviews(allReviewsBase, sortSelect.value);
      renderAllReviews(sortedReviews);
    });

    carousel.addEventListener('mouseenter', () => {
      if (autoRotateId) {
        clearInterval(autoRotateId);
      }
    });

    carousel.addEventListener('mouseleave', () => {
      restartAutoRotate(carouselReviews.length);
    });
  } catch (error) {
    if (isFileProtocol) {
      root.innerHTML = '<p class="card">Reviews could not load in file preview. Run a local server (for example: <code>python -m http.server 5500</code>) and open <code>http://localhost:5500/reviews.html</code>.</p>';
      return;
    }

    root.innerHTML = '<p class="card">Reviews are currently unavailable. Please check back soon.</p>';
  }
});
