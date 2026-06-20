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
  const imagesHtml = getPostImagesHtml(post);

  article.innerHTML = `
    ${isPinned ? '<div class="pinned-label">📌</div>' : ''}
    ${noticeLabel}
    ${streamLabel}
    <div class="card-meta">${post.postId || ''} / ${formatDate(post.createdAt)}</div>
    <div class="card-body">${escapeHtml(post.content || '')}</div>
    ${imagesHtml}
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

function getStreamLabel(post) {
  if (post.tabType !== 'Stream') {
    return '';
  }

  let label = '';

  if (post.streamType === 'Twitch') {
    label = '🟣 Twitch';
  }

  if (post.streamType === 'YouTube') {
    switch (post.streamContentType) {
      case 'Live':
        label = '🔴 YouTube Live';
        break;

      case '動画':
        label = '🎬 YouTube 動画';
        break;

      case 'Shorts':
        label = '📱 YouTube Shorts';
        break;

      default:
        label = '🔴 YouTube';
    }
  }

  if (!label) {
    return '';
  }

  return `
    <div class="stream-badge">
      ${label}
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
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
          <img src="${escapeHtml(url)}" alt="投稿画像" loading="lazy">
        </a>
      `).join('')}
    </div>
  `;
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
