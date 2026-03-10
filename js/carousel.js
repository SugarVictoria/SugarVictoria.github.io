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

    const slides = Array.from(track.children);
    const prevButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');

    if (!slides.length) {
      prevButton?.setAttribute('hidden', 'hidden');
      nextButton?.setAttribute('hidden', 'hidden');
      return;
    }

    let currentIndex = 0;

    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarousel();
    }

    nextButton?.addEventListener('click', nextSlide);
    prevButton?.addEventListener('click', prevSlide);

    if (slides.length > 1) {
      setInterval(nextSlide, 5000);
    }
  });
});
