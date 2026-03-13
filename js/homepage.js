document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('[data-homepage-root]');
  if (!root) {
    return;
  }

  const homeTrack = document.querySelector('[data-home-carousel-track]');
  const cakesTrack = document.querySelector('[data-cakes-carousel-track]');
  const homeTitle = document.querySelector('[data-home-carousel-title]');
  const homeLead = document.querySelector('[data-home-carousel-lead]');
  const cakesTitle = document.querySelector('[data-cakes-carousel-title]');
  const cakesLead = document.querySelector('[data-cakes-carousel-lead]');
  const orderButton = document.querySelector('[data-cakes-order-btn]');

  if (!homeTrack || !cakesTrack) {
    return;
  }

  function normalizePath(path) {
    if (!path || typeof path !== 'string') {
      return '';
    }

    return path.startsWith('/') ? path.slice(1) : path;
  }

  function setText(element, value) {
    if (element && value) {
      element.textContent = value;
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSlides(track, slides) {
    const validSlides = slides.filter((slide) => slide && slide.image);

    if (!validSlides.length) {
      return;
    }

    track.innerHTML = validSlides
      .map((slide) => {
        const src = normalizePath(slide.image);
        const alt = escapeHtml(slide.alt || 'Sugar & Victoria gallery image');
        const caption = slide.caption ? `<figcaption class="slide-caption">${escapeHtml(slide.caption)}</figcaption>` : '';

        return `
          <figure class="slide">
            <img src="${src}" alt="${alt}" loading="lazy" decoding="async">
            ${caption}
          </figure>
        `;
      })
      .join('');
  }

  try {
    const homepageResponse = await fetch('data/homepage.json', { cache: 'no-store' });

    if (!homepageResponse.ok) {
      throw new Error('Unable to load homepage carousel data.');
    }

    const homepageData = await homepageResponse.json();

    const homeCarousel = homepageData.home_carousel || {};
    const cakesCarousel = homepageData.cakes_carousel || {};

    setText(homeTitle, homeCarousel.title);
    setText(homeLead, homeCarousel.lead);
    setText(cakesTitle, cakesCarousel.title);
    setText(cakesLead, cakesCarousel.lead);

    if (orderButton) {
      if (cakesCarousel.order_button_label) {
        orderButton.textContent = cakesCarousel.order_button_label;
      }

      if (cakesCarousel.order_button_url) {
        orderButton.setAttribute('href', cakesCarousel.order_button_url);
      }
    }

    const homeSlides = Array.isArray(homeCarousel.slides) ? homeCarousel.slides : [];
    const cakesSlides = Array.isArray(cakesCarousel.slides) ? cakesCarousel.slides : [];

    renderSlides(homeTrack, homeSlides);
    renderSlides(cakesTrack, cakesSlides);
  } catch (error) {
    console.error(error);
  }
});
