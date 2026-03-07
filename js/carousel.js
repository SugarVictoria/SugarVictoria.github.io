// Simple auto-rotating carousel for the homepage featured images.
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return;
  }

  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(track.children);
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');

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

  setInterval(nextSlide, 5000);
});
