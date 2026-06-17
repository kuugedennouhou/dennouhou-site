const SITE_CONFIG_API_URL = 'https://script.google.com/macros/s/AKfycbym6iSXDlWyEDJ0UAof6qPgcrSK8UoYXAtek9VxLkOkg7wwni2c6t4q635s_hCxTHmz/exec?mode=siteConfig';

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

const validTabs = ['about', 'all', 'post', 'notice', 'stream', 'archive'];

function getCurrentTab() {
  const hash = location.hash.replace('#', '');
  return validTabs.includes(hash) ? hash : 'all';
}

function activateTab(tabName) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === tabName);
  });
}

function moveToHash(tabName) {
  if (location.hash !== `#${tabName}`) {
    history.pushState(null, '', `#${tabName}`);
  }

  activateTab(tabName);
}

async function loadSiteConfig() {
  try {
    const response = await fetch(SITE_CONFIG_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      console.error(result.message);
      return;
    }

    const config = result.siteConfig;

    const siteTitle = document.querySelector('.site-title');
    const siteSubtitle = document.querySelector('.site-subtitle');

    document.title = config.siteTitle || '空華電脳幇';

    if (siteTitle) {
      siteTitle.textContent = config.siteTitle || '空華電脳幇';
    }

    if (siteSubtitle) {
      siteSubtitle.innerHTML = config.bioHtml || '';
    }

    if (config.maintenanceMode === true) {
      document.body.innerHTML = `
        <main class="site">
          <section class="card">
            <h1 class="site-title">メンテナンス中</h1>
            <p class="site-subtitle">${config.maintenanceMessage || '現在メンテナンス中です。'}</p>
          </section>
        </main>
      `;
    }
  } catch (error) {
    console.error('Site_Config load failed:', error);
  }
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    moveToHash(tab.dataset.tab);
  });
});

window.addEventListener('hashchange', () => {
  activateTab(getCurrentTab());
});

document.querySelectorAll('.accordion-button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.accordion-item');
    item.classList.toggle('open');
  });
});

activateTab(getCurrentTab());
loadSiteConfig();

const ABOUT_API_URL = 'https://script.google.com/macros/s/AKfycbym6iSXDlWyEDJ0UAof6qPgcrSK8UoYXAtek9VxLkOkg7wwni2c6t4q635s_hCxTHmz/exec?mode=about';

async function loadAbout() {
  try {
    const response = await fetch(ABOUT_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    console.log('About Loaded', result.about);

  } catch (error) {
    console.error('About load failed:', error);
  }
}

loadAbout();
