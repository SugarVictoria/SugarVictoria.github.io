document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('[data-visit-root]');
  if (!root) {
    return;
  }

  const address = document.querySelector('[data-visit-address]');
  const phoneLink = document.querySelector('[data-visit-phone-link]');
  const emailLink = document.querySelector('[data-visit-email-link]');
  const overview = document.querySelector('[data-visit-overview]');
  const instagramLink = document.querySelector('[data-visit-instagram-link]');
  const instagramHandle = document.querySelector('[data-visit-instagram-handle]');
  const hoursTable = document.querySelector('[data-visit-hours]');
  const mapFrame = document.querySelector('[data-visit-map]');

  try {
    const response = await fetch('data/visit.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load visit data.');
    }

    const data = await response.json();

    if (address && Array.isArray(data.address_lines) && data.address_lines.length) {
      address.innerHTML = data.address_lines.map((line) => String(line)).join('<br>');
    }

    if (phoneLink && data.phone) {
      const phone = String(data.phone).trim();
      phoneLink.textContent = phone;
      phoneLink.setAttribute('href', `tel:${phone.replace(/\s+/g, '')}`);
    }

    if (emailLink && data.email) {
      const email = String(data.email).trim();
      emailLink.textContent = email;
      emailLink.setAttribute('href', `mailto:${email}`);
    }

    if (overview && data.overview) {
      overview.textContent = String(data.overview);
    }

    if (instagramLink && data.instagram_url) {
      instagramLink.setAttribute('href', String(data.instagram_url));
    }

    if (instagramHandle && data.instagram_handle) {
      instagramHandle.textContent = String(data.instagram_handle);
    }

    if (hoursTable && Array.isArray(data.opening_hours) && data.opening_hours.length) {
      hoursTable.innerHTML = data.opening_hours
        .filter((entry) => entry && entry.day && entry.hours)
        .map((entry) => `<tr><td>${entry.day}</td><td>${entry.hours}</td></tr>`)
        .join('');
    }

    if (mapFrame && data.map_embed_url) {
      mapFrame.setAttribute('data-src', String(data.map_embed_url));
    }
  } catch (error) {
    console.error(error);
  }
});
