const SITE_CONFIG_API_URL = 'https://script.google.com/macros/s/AKfycbym6iSXDlWyEDJ0UAof6qPgcrSK8UoYXAtek9VxLkOkg7wwni2c6t4q635s_hCxTHmz/exec?mode=siteConfig';

let siteConfig = {};

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

const validTabs = ['about', 'schedule', 'all', 'post', 'notice', 'stream', 'archive'];

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

    siteConfig = config;

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

const WEEKLY_SCHEDULE_API_URL =
  'https://script.google.com/macros/s/AKfycbym6iSXDlWyEDJ0UAof6qPgcrSK8UoYXAtek9VxLkOkg7wwni2c6t4q635s_hCxTHmz/exec?mode=weeklySchedule';

const MONTHLY_SCHEDULE_API_URL =
  'https://script.google.com/macros/s/AKfycbym6iSXDlWyEDJ0UAof6qPgcrSK8UoYXAtek9VxLkOkg7wwni2c6t4q635s_hCxTHmz/exec?mode=monthlySchedule';

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

async function loadWeeklySchedule() {
  try {
    const response = await fetch(WEEKLY_SCHEDULE_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    renderWeeklySchedule(result.posts || []);

  } catch (error) {
    console.error('Weekly schedule load failed:', error);
  }
}

async function loadMonthlySchedule() {
  try {
    const response = await fetch(MONTHLY_SCHEDULE_API_URL);
    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    renderMonthlySchedule(result.posts || []);

  } catch (error) {
    console.error('Monthly schedule load failed:', error);
  }
}

function renderWeeklySchedule(posts) {
  const container = document.getElementById('weekly-schedule');

  if (!container) {
    return;
  }

  if (!posts.length) {
    container.innerHTML = '<div class="empty">配信予定はまだありません。</div>';
    return;
  }

  container.innerHTML = `
    <div class="weekly-schedule-list">
      ${posts.map(post => `
        <div
          class="weekly-schedule-item schedule-detail-trigger"
          data-detail-platform="${escapeHtml(getSchedulePlatformLabel(post))}"
          data-detail-date="${escapeHtml(formatScheduleDetailDate(post.streamStartAt))}"
          data-detail-content="${escapeHtml(post.content || '')}"
        >
          <div class="weekly-schedule-date">
            ${escapeHtml(formatWeeklyDate(post.streamStartAt))}
          </div>

          <div class="weekly-schedule-main">
            <span class="weekly-schedule-time">
              ${escapeHtml(formatWeeklyTime(post.streamStartAt))}
            </span>
            <span class="weekly-schedule-platform">
              ${escapeHtml(getSchedulePlatformLabel(post))}
            </span>
            <span class="weekly-schedule-content">
              ${escapeHtml(post.content || '')}
            </span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMonthlySchedule(posts) {
  const container = document.getElementById('monthly-schedule');

  if (!container) {
    return;
  }

  if (!posts.length) {
    container.innerHTML = '<div class="empty">表示できる予定・履歴はまだありません。</div>';
    return;
  }

  const targetDate = new Date(posts[0].streamStartAt);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const days = buildMonthlyCalendarDays(year, month, posts);

  container.innerHTML = `
    <div class="monthly-calendar">
      <div class="monthly-calendar-header">
        ${year}/${String(month + 1).padStart(2, '0')}
      </div>

      <div class="monthly-calendar-weekdays">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      <div class="monthly-calendar-grid">
        ${days.map(day => renderMonthlyCalendarCell(day)).join('')}
      </div>
    </div>
  `;
}

function buildMonthlyCalendarDays(year, month, posts) {
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const startDay = firstDate.getDay();

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= lastDate.getDate(); day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayPosts = posts
      .filter(post => getDateKey(post.streamStartAt) === dateKey)
      .sort((a, b) => new Date(a.streamStartAt) - new Date(b.streamStartAt));

    days.push({
      day,
      posts: dayPosts
    });
  }

  return days;
}

function renderMonthlyCalendarCell(dayData) {
  if (!dayData) {
    return `<div class="monthly-calendar-cell empty-cell"></div>`;
  }

  const visiblePosts = dayData.posts.slice(0, 2);
  const hasMore = dayData.posts.length > 2;
  const detailListHtml = createMonthlyDetailListHtml(dayData);

  return `
    <div
      class="monthly-calendar-cell ${dayData.posts.length ? 'schedule-detail-trigger' : ''}"
      data-detail-list="${escapeHtml(detailListHtml)}"
    >
      <div class="monthly-calendar-day">${dayData.day}</div>

      <div class="monthly-calendar-events">
        ${visiblePosts.map(post => `
          <div class="monthly-calendar-event">
            ${escapeHtml(getMonthlyIcon(post))} ${escapeHtml(formatWeeklyTime(post.streamStartAt))}～
          </div>
        `).join('')}

        ${hasMore ? '<div class="monthly-calendar-more">More</div>' : ''}
      </div>
    </div>
  `;
}

function createMonthlyDetailListHtml(dayData) {
  if (!dayData.posts.length) {
    return '';
  }

  const firstPost = dayData.posts[0];

  return `
    <div class="schedule-popup-date">
      ${escapeHtml(formatWeeklyDate(firstPost.streamStartAt))}
    </div>

    ${dayData.posts.map(post => `
      <div class="schedule-popup-entry">
        <div class="schedule-popup-platform">
          ${escapeHtml(getMonthlyPlatformLabel(post))}
        </div>
        <div class="schedule-popup-time">
          ${escapeHtml(formatWeeklyTime(post.streamStartAt))}～
        </div>
        <div class="schedule-popup-content">
          ${escapeHtml(post.content || '')}
        </div>
      </div>
    `).join('<div class="schedule-popup-separator"></div>')}
  `;
}

function getDateKey(value) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getMonthlyIcon(post) {
  const label = getMonthlyPlatformLabel(post);
  return label.split(' ')[0] || '';
}

function formatScheduleDetailDate(value) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getMonthlyPlatformLabel(post) {
  if (post.streamType === 'Twitch') {
    return '🟣 Twitch';
  }

  if (post.streamType === 'YouTube') {
    switch (post.streamContentType) {
      case 'Live':
        return '🔴 Live';

      case '動画':
        return '🎬 Video';

      case 'Shorts':
        return '📱 Shorts';

      default:
        return '🔴 YouTube';
    }
  }

  return '';
}

function formatWeeklyDate(value) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return '';
  }

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return date.toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit'
  }) + ` ${weekdays[date.getDay()]}`;
}

function formatWeeklyTime(value) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getSchedulePlatformLabel(post) {
  if (post.streamType === 'Twitch') {
    return '🟣 Twitch';
  }

  if (post.streamType === 'YouTube') {
    switch (post.streamContentType) {
      case 'Live':
        return '🔴 Live';

      case '動画':
        return '🎬 Video';

      case 'Shorts':
        return '📱 Shorts';

      default:
        return '🔴 YouTube';
    }
  }

  return '';
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
  const contentHtml = getPostContentHtml(post);
  const imagesHtml = getPostImagesHtml(post);
  const reactionsHtml = getReactionsHtml(post);

  article.innerHTML = `
    ${isPinned ? '<div class="pinned-label">📌</div>' : ''}
    ${noticeLabel}
    ${streamLabel}
    <div class="card-meta">${getPostDateHtml(post)}</div>
    ${contentHtml}
    ${imagesHtml}
    ${reactionsHtml}
  `;

  return article;
}

function getPostContentHtml(post) {
  const baseContent = post.content || '';
  const streamDateText = getStreamDateText(post);
  const twitchLinkHtml = getTwitchLinkHtml(post);

  const content = streamDateText
    ? `${streamDateText}\n${baseContent}`
    : baseContent;

  const limit = 200;

  const fullHtml = `${linkify(escapeHtml(content))}${twitchLinkHtml}`;

  if (content.length <= limit) {
    return `<div class="card-body">${fullHtml}</div>`;
  }

  const shortContent = content.slice(0, limit);
  const shortHtml = `${linkify(escapeHtml(shortContent))}...${twitchLinkHtml}`;

  return `<div class="card-body"><span class="content-short">${shortHtml}</span><span class="content-full" hidden>${fullHtml}</span></div>
  <button class="read-more-button" type="button">続きを読む</button>`;
}

function getStreamDateText(post) {
  if (!post.streamStartAt) {
    return '';
  }

  const date = new Date(post.streamStartAt);

  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) + '～';
}

function getTwitchLinkHtml(post) {
  if (post.streamType !== 'Twitch') {
    return '';
  }

  if (!siteConfig.twitchUrl) {
    return '';
  }

  return ` <a
      class="stream-text-link"
      href="${siteConfig.twitchUrl}"
      target="_blank"
      rel="noopener noreferrer"
    >twitch.tv</a>`;
}

function getReactionsHtml(post) {
  const postId = post.postId;
  if (!postId) return '';

  const userId = getUserId();
  
  const counts = {};

  REACTION_EMOJIS.forEach(emoji => {
    counts[emoji] = reactionsData.filter(reaction =>
      reaction.postId === postId && reaction.emoji === emoji
    ).length;
  });

  const activeEmojis = REACTION_EMOJIS.filter(emoji => counts[emoji] > 0);

  const reactionButtonsHtml = activeEmojis.length
    ? activeEmojis.map(emoji => `
        <button class="reaction-button ${reactionsData.some(reaction => reaction.postId === postId && reaction.userId === userId && reaction.emoji === emoji) ? 'reacted' : ''}" type="button" data-post-id="${escapeHtml(postId)}" data-emoji="${emoji}">
          <span class="reaction-emoji">${emoji}</span>
          <span class="reaction-count">${counts[emoji]}</span>
        </button>
      `).join('')
    : `
        <button class="reaction-button reaction-heart-empty" type="button" data-post-id="${escapeHtml(postId)}" data-emoji="🩷">
          <span class="reaction-emoji">🩷</span>
        </button>
      `;

  return `
    <div class="reactions">
      ${reactionButtonsHtml}

      <button class="reaction-plus-button" type="button" data-post-id="${escapeHtml(postId)}">
        <i class="fa-solid fa-plus"></i>
      </button>
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

  if (post.streamStatus) {
    statusLabel = `
      <div class="stream-status stream-status-${post.streamStatus}">
        ${escapeHtml(post.streamStatus)}
      </div>
    `;
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
        streamLabel = '🎬 YouTube Video';
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

function linkify(text) {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

function getUserId() {
  let userId = localStorage.getItem('userId');

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);
  }

  return userId;
}

async function addReaction(postId, emoji) {
  try {
    const response = await fetch(POSTS_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'addReaction',
        postId,
        userId: getUserId(),
        emoji
      })
    });

    const result = await response.json();

    if (result.status !== 'success') {
      return;
    }

    await loadReactions();
    await loadPosts();
    await loadArchivePosts();

  } catch (error) {
    console.error('Add reaction failed:', error);
  }
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

function initReactionPicker() {
  const picker = document.getElementById('reaction-picker');

  if (!picker) {
    return;
  }

  document.addEventListener('click', event => {
    const plusButton = event.target.closest('.reaction-plus-button');

    if (!plusButton) {
      picker.classList.remove('active');
      return;
    }

    event.stopPropagation();

    picker.innerHTML = REACTION_EMOJIS.map(emoji => `
      <button
        type="button"
        class="reaction-picker-button"
        data-post-id="${plusButton.dataset.postId}"
        data-emoji="${emoji}"
      >
        ${emoji}
      </button>
    `).join('');

    const rect = plusButton.getBoundingClientRect();

    const pickerWidth = 200;
    const pickerHeight = 150;
    const margin = 8;

    let left = rect.left;
    let top = rect.bottom + margin;

    if (window.innerHeight - rect.bottom < pickerHeight + margin) {
      top = rect.top - pickerHeight - margin;
    }

    if (left + pickerWidth > window.innerWidth) {
      left = window.innerWidth - pickerWidth - margin;
    }

    if (left < margin) {
      left = margin;
    }

    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;

    picker.classList.add('active');
  });
  
  picker.addEventListener('click', async event => {
    const button = event.target.closest('.reaction-picker-button');

    if (!button) {
      return;
    }

    const postId = button.dataset.postId;
    const emoji = button.dataset.emoji;

    picker.classList.remove('active');

    await addReaction(postId, emoji);
  });
  
  window.addEventListener('scroll', () => {
    picker.classList.remove('active');
  });
}  

function initReactionButtons() {
  document.addEventListener('click', async event => {
    const button = event.target.closest('.reaction-button');

    if (!button) {
      return;
    }

    const postId = button.dataset.postId;
    const emoji = button.dataset.emoji;

    await addReaction(postId, emoji);
  });
}

function initReadMore() {
  document.addEventListener('click', event => {
    const button = event.target.closest('.read-more-button');

    if (!button) {
      return;
    }

    const card = button.closest('.card');

    const shortContent = card.querySelector('.content-short');
    const fullContent = card.querySelector('.content-full');

    if (!shortContent || !fullContent) {
      return;
    }

    const isExpanded = !fullContent.hidden;

    if (isExpanded) {
      fullContent.hidden = true;
      shortContent.hidden = false;
      button.textContent = '続きを読む';
    } else {
      fullContent.hidden = false;
      shortContent.hidden = true;
      button.textContent = '閉じる';
    }
  });
}

function initSchedulePopup() {
  const popup = document.getElementById('schedule-popup');

  if (!popup) {
    return;
  }

  let activeScheduleTarget = null;

  document.addEventListener('pointerenter', event => {
    if (window.matchMedia('(hover: none)').matches) {
      return;
    }

    const target = event.target.closest('.schedule-detail-trigger');

    if (!target) {
      return;
    }

    showSchedulePopup(target, event);
  }, true);

  document.addEventListener('pointerleave', event => {
    if (window.matchMedia('(hover: none)').matches) {
      return;
    }

    const target = event.target.closest('.schedule-detail-trigger');

    if (!target) {
      return;
    }

    popup.classList.remove('active');
  }, true);

  document.addEventListener('click', event => {
    const target = event.target.closest('.schedule-detail-trigger');

    if (!target) {
      popup.classList.remove('active');
      activeScheduleTarget = null;
      return;
    }

    if (!window.matchMedia('(hover: none)').matches) {
      return;
    }

    if (activeScheduleTarget === target) {
      popup.classList.remove('active');
      activeScheduleTarget = null;
      return;
    }

    showSchedulePopup(target, event);
    activeScheduleTarget = target;
  });
}

function initScheduleSwitch() {
  const buttons = document.querySelectorAll('.schedule-switch-button');
  const weeklyPanel = document.getElementById('weekly-schedule-panel');
  const monthlyPanel = document.getElementById('monthly-schedule-panel');

  if (!buttons.length || !weeklyPanel || !monthlyPanel) {
    return;
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.scheduleView;

      buttons.forEach(item => {
        item.classList.toggle('active', item === button);
      });

      weeklyPanel.classList.toggle('active', view === 'weekly');
      monthlyPanel.classList.toggle('active', view === 'monthly');
    });
  });
}

function showSchedulePopup(target, event) {
  const popup = document.getElementById('schedule-popup');

  if (!popup) {
    return;
  }

  if (target.dataset.detailList) {
    popup.innerHTML = target.dataset.detailList;
  } else {
    popup.innerHTML =
      `<div class="schedule-popup-platform">${target.dataset.detailPlatform}</div>` +
      `<div class="schedule-popup-date">${target.dataset.detailDate}</div>` +
      `<div class="schedule-popup-content">${target.dataset.detailContent}</div>`;
  }

  popup.classList.add('active');

  const rect = popup.getBoundingClientRect();
  const margin = 12;

  let left = event.clientX + 16;
  let top = event.clientY + 16;

  if (left + rect.width > window.innerWidth - margin) {
    left = window.innerWidth - rect.width - margin;
  }

  if (top + rect.height > window.innerHeight - margin) {
    top = event.clientY - rect.height - 16;
  }

  if (left < margin) {
    left = margin;
  }

  if (top < margin) {
    top = margin;
  }

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

loadReactions();
loadPosts();
loadArchivePosts();
loadWeeklySchedule();
loadMonthlySchedule();

initLightbox();
initImageProtection();
initReactionPicker();
initReactionButtons();
initReadMore();
initSchedulePopup();
initScheduleSwitch();
