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

const ARCHIVE_API_URL = 'https://script.google.com/macros/s/AKfycbym6iSXDlWyEDJ0UAof6qPgcrSK8UoYXAtek9VxLkOkg7wwni2c6t4q635s_hCxTHmz/exec?mode=archive';

const REACTIONS_API_URL =
  'https://script.google.com/macros/s/AKfycbym6iSXDlWyEDJ0UAof6qPgcrSK8UoYXAtek9VxLkOkg7wwni2c6t4q635s_hCxTHmz/exec?mode=reactions';

async function loadPosts() {
  try {
    const response = await fetch(POSTS_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    const posts = result.posts || [];

    renderPostsToPanel('all', posts, true);
    renderPostsToPanel('post', posts.filter(post => post.tabType === 'Post'), false);
    renderPostsToPanel('notice', posts.filter(post => post.tabType === 'Notice'), false);
    renderPostsToPanel('stream', posts.filter(post => post.tabType === 'Stream'), false);

  } catch (error) {
    console.error('Posts load failed:', error);
  }
}

let reactionsData = [];

const REACTION_EMOJIS = ['🩷', '👀', '✨', '💦', '👍', '🙏', '🤣', '😭', '🥺', '😱', '🔥', '💤'];

async function loadReactions() {
  try {
    const response = await fetch(REACTIONS_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    reactionsData = result.reactions || [];

  } catch (error) {
    console.error('Reactions load failed:', error);
  }
}

function renderPostsToPanel(panelId, posts, usePinned = false) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  panel.innerHTML = '';

  if (!posts.length) {
    panel.innerHTML = '<div class="empty">投稿はまだありません。</div>';
    return;
  }

  if (usePinned) {
    const pinnedPost = posts.find(post => post.pinned === true);
    const normalPosts = posts.filter(post => post.pinned !== true);

    if (pinnedPost) {
      panel.appendChild(createPostCard(pinnedPost, true));
    }

    normalPosts.forEach(post => {
      panel.appendChild(createPostCard(post, false));
    });

    return;
  }

  posts.forEach(post => {
    panel.appendChild(createPostCard(post, false));
  });
}

function createPostCard(post, isPinned = false) {
  const article = document.createElement('article');
  article.className = isPinned ? 'card pinned-card' : 'card';

  const noticeLabel = getNoticeLabel(post);
  const streamLabel = getStreamLabel(post);
  const imagesHtml = getPostImagesHtml(post);
  const reactionsHtml = getReactionsHtml(post);

  article.innerHTML = `
    ${isPinned ? '<div class="pinned-label">📌</div>' : ''}
    ${noticeLabel}
    ${streamLabel}
    <div class="card-meta">${getPostDateHtml(post)}</div>
    <div class="card-body">${escapeHtml(post.content || '')}</div>
    ${imagesHtml}
    ${reactionsHtml}
  `;

  return article;
}

function getReactionsHtml(post) {
  const postId = post.postId;
  if (!postId) return '';

  return `
    <div class="reactions">
      ${REACTION_EMOJIS.map(emoji => {
        const count = reactionsData.filter(reaction =>
          reaction.postId === postId && reaction.emoji === emoji
        ).length;

        return `
          <button class="reaction-button" type="button" data-post-id="${escapeHtml(postId)}" data-emoji="${emoji}">
            <span>${emoji}</span>
            <span>${count}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function getNoticeLabel(post) {
  if (post.tabType !== 'Notice') {
    return '';
  }

  const label = post.noticeStatus || post.customNoticeLabel;

  if (!label) {
    return '';
  }

  return `
    <div class="notice-badge notice-${label}">
      ${escapeHtml(label)}
    </div>
  `;
}

function getStreamLabel(post) {
  if (post.tabType !== 'Stream') {
    return '';
  }

  let streamLabel = '';
  let statusLabel = '';

  if (
  post.streamType === 'Twitch' ||
  (post.streamType === 'YouTube' && ['Live', 'ライブ', 'YouTube Live'].includes(post.streamContentType))
) {
    if (post.streamStatus) {
      statusLabel = `
        <div class="stream-status stream-status-${post.streamStatus}">
          ${escapeHtml(post.streamStatus)}
        </div>
      `;
    }
  }

  if (post.streamType === 'Twitch') {
    streamLabel = '🟣 Twitch';
  }

  if (post.streamType === 'YouTube') {
    switch (post.streamContentType) {
      case 'Live':
        streamLabel = '🔴 YouTube Live';
        break;

      case '動画':
        streamLabel = '🎬 YouTube 動画';
        break;

      case 'Shorts':
        streamLabel = '📱 YouTube Shorts';
        break;

      default:
        streamLabel = '🔴 YouTube';
    }
  }

  return `
    <div class="stream-label-group">
      ${statusLabel}
      <div class="stream-badge">
        ${streamLabel}
      </div>
    </div>
  `;
}

function getPostImagesHtml(post) {
  const images = [post.imageUrl1, post.imageUrl2]
    .filter(url => url && String(url).startsWith('http'));

  if (images.length === 0) {
    return '';
  }

  return `
    <div class="post-images">
      ${images.map(url => `
        <button class="post-image-button" type="button">
          <img
            class="${post.imageSavePolicy === 'NG' ? 'protected-image' : ''}"
            src="${escapeHtml(url)}?tr=f-webp"
            data-full="${escapeHtml(url)}"
            data-save-policy="${escapeHtml(post.imageSavePolicy || 'NG')}"
            alt="投稿画像"
            loading="lazy"
          >
        </button>
      `).join('')}
    </div>
  `;
}

function getPostDateHtml(post) {
  const created = formatDate(post.createdAt);
  const updated = formatDate(post.updatedAt);

  if (!created) {
    return '';
  }

  if (!updated || isSameMinute(post.createdAt, post.updatedAt)) {
    return created;
  }

  return `${created}（✎ ${updated}）`;
}

function isSameMinute(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);

  if (isNaN(a.getTime()) || isNaN(b.getTime())) {
    return true;
  }

  a.setSeconds(0, 0);
  b.setSeconds(0, 0);

  return a.getTime() === b.getTime();
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

async function loadArchivePosts() {
  try {
    const response = await fetch(ARCHIVE_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    renderPostsToPanel('archive', result.posts || [], false);

  } catch (error) {
    console.error('Archive load failed:', error);
  }
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');

  if (!lightbox || !lightboxImage || !lightboxClose) {
    return;
  }

  document.addEventListener('click', event => {
    const image = event.target.closest('.post-images img');

    if (!image) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    lightboxImage.src = image.dataset.full || image.src;
    lightboxImage.dataset.savePolicy = image.dataset.savePolicy || 'NG';
    lightbox.classList.add('active');
  });

  lightbox.addEventListener('click', event => {
    if (event.target !== lightbox) {
      return;
    }

    lightbox.classList.remove('active');
    lightboxImage.src = '';
  });

  lightboxClose.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();

    lightbox.classList.remove('active');
    lightboxImage.src = '';
  });
}

function initImageProtection() {
  document.addEventListener('contextmenu', event => {
    const image = event.target.closest('.post-images img, #lightbox-image');

    if (image && image.dataset.savePolicy === 'NG') {
      event.preventDefault();
    }
  });

  document.addEventListener('dragstart', event => {
    const image = event.target.closest('.post-images img, #lightbox-image');

    if (image && image.dataset.savePolicy === 'NG') {
      event.preventDefault();
    }
  });
}

loadReactions().then(() => {
  loadPosts();
  loadArchivePosts();
});

initLightbox();
initImageProtection();
