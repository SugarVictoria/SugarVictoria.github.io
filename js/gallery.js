document.addEventListener('DOMContentLoaded', async () => {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid) {
    return;
  }

  try {
    const response = await fetch('data/gallery.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load gallery data.');
    }

    const data = await response.json();
    const images = Array.isArray(data.images) ? data.images : [];

    if (!images.length) {
      galleryGrid.innerHTML = '<p>No gallery images available yet.</p>';
      return;
    }

    galleryGrid.innerHTML = images
      .filter((item) => item && item.image)
      .map((item) => {
        const src = item.image.startsWith('/') ? item.image.slice(1) : item.image;
        const alt = item.alt || 'Sugar & Victoria gallery image';
        return `<img src="${src}" alt="${alt}" data-gallery-image>`;
      })
      .join('');
  } catch (error) {
    galleryGrid.innerHTML = '<p>Unable to load gallery right now. Please try again later.</p>';
    console.error(error);
  }
});
