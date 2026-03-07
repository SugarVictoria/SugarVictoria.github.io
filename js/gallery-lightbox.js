// Opens clicked gallery images in a full-screen lightbox.
document.addEventListener('DOMContentLoaded', () => {
  const galleryRoot = document.querySelector('.gallery-grid');
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const closeButton = document.querySelector('[data-lightbox-close]');

  if (!galleryRoot || !lightbox || !lightboxImage || !closeButton) {
    return;
  }

  galleryRoot.addEventListener('click', (event) => {
    const image = event.target.closest('[data-gallery-image]');
    if (!image) {
      return;
    }

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
});
