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
