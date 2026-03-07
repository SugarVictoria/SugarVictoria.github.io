document.addEventListener('DOMContentLoaded', async () => {
  const menuRoot = document.querySelector('[data-menu-root]');
  if (!menuRoot) {
    return;
  }

  try {
    const response = await fetch('data/menu.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load menu data.');
    }

    const data = await response.json();
    const sections = Array.isArray(data.sections) ? data.sections : [];

    if (!sections.length) {
      menuRoot.innerHTML = '<p>No menu sections available yet.</p>';
      return;
    }

    menuRoot.innerHTML = sections
      .filter((section) => section && Array.isArray(section.items))
      .map((section) => {
        const sectionId = section.id || section.title?.toLowerCase().replace(/\s+/g, '-') || 'menu-section';
        const sectionTitle = section.title || 'Menu Section';

        const cards = section.items
          .filter((item) => item && item.name)
          .map((item) => {
            const description = item.description || '';
            const price = item.price || '';
            return `
              <article class="card reveal">
                <h3>${item.name}</h3>
                <p>${description}</p>
                <p class="price">${price}</p>
              </article>
            `;
          })
          .join('');

        return `
          <section class="section" id="${sectionId}">
            <h2 class="section-title">${sectionTitle}</h2>
            <div class="grid grid-3">
              ${cards}
            </div>
          </section>
        `;
      })
      .join('');
  } catch (error) {
    menuRoot.innerHTML = '<p>Unable to load the menu right now. Please try again later.</p>';
    console.error(error);
  }
});
