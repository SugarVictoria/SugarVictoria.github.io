document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'sv_cookie_consent_v1';

  function safeGetConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.functional === 'boolean') {
        return parsed;
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  function saveConsent(functionalEnabled) {
    const payload = {
      functional: Boolean(functionalEnabled),
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error(error);
    }

    return payload;
  }

  function loadFunctionalEmbeds() {
    document.querySelectorAll('iframe[data-cookie-category="functional"][data-src]').forEach((frame) => {
      if (!frame.getAttribute('src')) {
        frame.setAttribute('src', frame.getAttribute('data-src'));
      }
    });

    document.querySelectorAll('[data-map-consent]').forEach((panel) => {
      panel.hidden = true;
    });
  }

  function unloadFunctionalEmbeds() {
    document.querySelectorAll('iframe[data-cookie-category="functional"][data-src]').forEach((frame) => {
      frame.removeAttribute('src');
    });

    document.querySelectorAll('[data-map-consent]').forEach((panel) => {
      panel.hidden = false;
    });
  }

  function applyConsent(consent) {
    if (consent && consent.functional) {
      loadFunctionalEmbeds();
    } else {
      unloadFunctionalEmbeds();
    }
  }

  function closeBanner() {
    const existing = document.querySelector('[data-cookie-banner]');
    if (existing) {
      existing.remove();
    }
  }

  function showBanner() {
    closeBanner();

    const banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('data-cookie-banner', '');
    banner.setAttribute('aria-label', 'Cookie preferences');

    banner.innerHTML = `
      <h2>Cookie Preferences</h2>
      <p>We only use essential storage by default. Optional functional cookies are used to load embeds like Google Maps.</p>
      <div class="cookie-banner-actions">
        <button class="cookie-banner-btn accept" type="button" data-cookie-accept>Accept functional cookies</button>
        <button class="cookie-banner-btn reject" type="button" data-cookie-reject>Reject optional cookies</button>
        <a class="cookie-banner-btn reject" href="cookies.html">Read cookie policy</a>
      </div>
    `;

    document.body.appendChild(banner);

    const acceptButton = banner.querySelector('[data-cookie-accept]');
    const rejectButton = banner.querySelector('[data-cookie-reject]');

    if (acceptButton) {
      acceptButton.addEventListener('click', () => {
        const consent = saveConsent(true);
        applyConsent(consent);
        closeBanner();
      });
    }

    if (rejectButton) {
      rejectButton.addEventListener('click', () => {
        const consent = saveConsent(false);
        applyConsent(consent);
        closeBanner();
      });
    }
  }

  function openSettings() {
    showBanner();
  }

  const currentConsent = safeGetConsent();
  applyConsent(currentConsent);

  if (!currentConsent) {
    showBanner();
  }

  document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
    button.addEventListener('click', openSettings);
  });

  document.querySelectorAll('[data-cookie-accept-functional]').forEach((button) => {
    button.addEventListener('click', () => {
      const consent = saveConsent(true);
      applyConsent(consent);
      closeBanner();
    });
  });
});
