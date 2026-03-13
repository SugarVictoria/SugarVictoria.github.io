document.addEventListener('DOMContentLoaded', async () => {
  const newsList = document.querySelector('[data-news-list]');
  const tickerTrack = document.querySelector('[data-news-ticker-track]');

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function todayString() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  let posts = [];

  try {
    const response = await fetch('data/news.json', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.posts)) {
        posts = data.posts;
      }
    }
  } catch (error) {
    console.error(error);
  }

  // --- Ticker: today's posts only ---
  if (tickerTrack) {
    const today = todayString();
    const todayPosts = posts.filter((p) => p && p.title && p.date && p.date.startsWith(today));

    let items;
    if (todayPosts.length) {
      items = todayPosts.map((p) => {
        const label = p.type ? `${escapeHtml(p.type)}: ` : '';
        const summary = p.summary ? ` \u2014 ${escapeHtml(p.summary)}` : '';
        return `<span class="news-ticker-item">${label}${escapeHtml(p.title)}${summary}</span>`;
      });
    } else {
      // Preserve the static ticker text from HTML when no data is available.
      items = Array.from(tickerTrack.querySelectorAll('.news-ticker-item')).map((item) => item.outerHTML);
    }

    // Duplicate for seamless infinite scroll
    const html = items.join('');
    tickerTrack.innerHTML = html + html;
  }

  // --- News section: latest 3 posts ---
  if (!newsList) {
    return;
  }

  if (!posts.length) {
    // Keep server-rendered fallback cards crawlable and visible.
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
        day: 'numeric',
      });

      const linkLine = post.link_url
        ? `<p class="news-card-cta"><a href="${escapeHtml(post.link_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.link_label || post.link_url)}</a></p>`
        : '';

      return `
        <article class="card">
          <h3>${escapeHtml(post.title)}</h3>
          <p><strong>${escapeHtml(post.type || 'News')}:</strong> ${dateLabel}</p>
          <p>${escapeHtml(post.summary || '')}</p>
          ${linkLine}
        </article>
      `;
    })
    .join('');
});

