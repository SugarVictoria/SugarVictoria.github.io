document.addEventListener('DOMContentLoaded', async () => {
  const newsRoot = document.querySelector('[data-news-root]');
  const newsList = document.querySelector('[data-news-list]');

  if (!newsRoot || !newsList) {
    return;
  }

  try {
    const response = await fetch('data/news.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load news data.');
    }

    const data = await response.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];

    if (!posts.length) {
      newsList.innerHTML = '<p>No updates posted yet.</p>';
      return;
    }

    const latest = posts
      .filter((post) => post && post.title && post.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    newsList.innerHTML = latest
      .map((post) => {
        const dateLabel = new Date(post.date).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        return `
          <article class="card">
            <h3>${post.title}</h3>
            <p><strong>${post.type || 'News'}:</strong> ${dateLabel}</p>
            <p>${post.summary || ''}</p>
          </article>
        `;
      })
      .join('');
  } catch (error) {
    newsList.innerHTML = '<p>Unable to load updates right now.</p>';
    console.error(error);
  }
});
