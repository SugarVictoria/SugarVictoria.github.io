// Simple auto-rotating carousel for the homepage featured images.
document.addEventListener('DOMContentLoaded', () => {
  const carousels = Array.from(document.querySelectorAll('[data-carousel]'));
  if (!carousels.length) {
    return;
  }

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) {
      return;
    }

    const prevButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    let currentIndex = 0;

    function totalSlides() {
      return track.children.length;
    }

    function updateButtons() {
      const hasMultiple = totalSlides() > 1;

      if (prevButton) {
        prevButton.hidden = !hasMultiple;
      }

      if (nextButton) {
        nextButton.hidden = !hasMultiple;
      }
    }

    function updateCarousel() {
      const total = totalSlides();
      if (!total) {
        track.style.transform = 'translateX(0%)';
        updateButtons();
        return;
      }

      if (currentIndex >= total) {
        currentIndex = 0;
      }

      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateButtons();
    }

    function nextSlide() {
      const total = totalSlides();
      if (total <= 1) {
        updateButtons();
        return;
      }

      currentIndex = (currentIndex + 1) % total;
      updateCarousel();
    }

    function prevSlide() {
      const total = totalSlides();
      if (total <= 1) {
        updateButtons();
        return;
      }

      currentIndex = (currentIndex - 1 + total) % total;
      updateCarousel();
    }

    if (!carousel.dataset.carouselBound) {
      nextButton?.addEventListener('click', nextSlide);
      prevButton?.addEventListener('click', prevSlide);
      carousel.dataset.carouselBound = 'true';
    }

    if (!carousel.dataset.carouselAutoRotate) {
      setInterval(nextSlide, 5000);
      carousel.dataset.carouselAutoRotate = 'true';
    }

    updateCarousel();
  });
});
