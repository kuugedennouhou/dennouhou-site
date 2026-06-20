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

    const xLink = document.querySelector('[data-social="x"]');
    const twitchLink = document.querySelector('[data-social="twitch"]');
    const youtubeLink = document.querySelector('[data-social="youtube"]');

    if (xLink && config.xUrl) {
      xLink.href = config.xUrl;
    }

    if (twitchLink && config.twitchUrl) {
      twitchLink.href = config.twitchUrl;
    }

    if (youtubeLink && config.youtubeUrl) {
      youtubeLink.href = config.youtubeUrl;
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

    const about = result.about;

    const setHtml = (id, html, fallback = '<p>調整中</p>') => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = html || fallback;
      }
    };

    setHtml('about-links', about.linksHtml);
    setHtml('about-profile', about.profileHtml);
    setHtml('about-hashtags', about.hashtagsHtml);
    setHtml('about-activities', about.activitiesHtml);
    setHtml('about-contact', about.contactHtml);
    setHtml('about-rule', about.ruleHtml);
    setHtml('about-faq', about.faqHtml);
    setHtml('about-privacy-policy', about.privacyPolicyHtml);

  } catch (error) {
    console.error('About load failed:', error);
  }
}

loadAbout();

const POSTS_API_URL = 'https://script.google.com/macros/s/AKfycbym6iSXDlWyEDJ0UAof6qPgcrSK8UoYXAtek9VxLkOkg7wwni2c6t4q635s_hCxTHmz/exec?mode=posts';

async function loadPosts() {
  try {
    const response = await fetch(POSTS_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    const allPanel = document.getElementById('all');
    if (!allPanel) return;

    allPanel.innerHTML = '';

    result.posts.forEach(post => {
      const article = document.createElement('article');
      article.className = 'card';

      article.innerHTML = `
        <div class="card-meta">${post.postId || ''} / ${formatDate(post.createdAt)}</div>
        <div class="card-body">${escapeHtml(post.content || '')}</div>
      `;

      allPanel.appendChild(article);
    });

  } catch (error) {
    console.error('Posts load failed:', error);
  }
}

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

loadPosts();

async function loadPosts() {
  try {
    const response = await fetch(POSTS_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    const allPanel = document.getElementById('all');
    if (!allPanel) return;

    allPanel.innerHTML = '';

    const posts = result.posts || [];
    const pinnedPost = posts.find(post => post.pinned === true);
    const normalPosts = posts.filter(post => post.pinned !== true);

    if (pinnedPost) {
      allPanel.appendChild(createPostCard(pinnedPost, true));
    }

    normalPosts.forEach(post => {
      allPanel.appendChild(createPostCard(post, false));
    });

  } catch (error) {
    console.error('Posts load failed:', error);
  }
}

function createPostCard(post, isPinned = false) {
  const article = document.createElement('article');
  article.className = isPinned ? 'card pinned-card' : 'card';

const noticeLabel = getNoticeLabel(post);
const streamLabel = getStreamLabel(post);  

article.innerHTML = `
  ${isPinned ? '<div class="pinned-label">📌</div>' : ''}
  ${noticeLabel}
  ${streamLabel}
  <div class="card-meta">${post.postId || ''} / ${formatDate(post.createdAt)}</div>
  <div class="card-body">${escapeHtml(post.content || '')}</div>
`;

  return article;
}

function getNoticeLabel(post) {
  if (post.tabType !== 'Notice') {
    return '';
  }

  const label = post.noticeStatus || post.customNoticeLabel;

  if (!label) {
    return '';
  }

  return `<div class="notice-badge">${escapeHtml(label)}</div>`;
}
