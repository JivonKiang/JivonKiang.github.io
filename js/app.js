// ===== Data Sources =====
const DATA_SOURCES = {
  papers: 'data/papers.json',
  databases: 'data/databases.json',
  hotspot: 'data/hotspot.json',
  categories: 'data/categories.json'
};

const CACHE_KEY = 'research_nav_cache';
const CACHE_KEY_VER = 'research_nav_cache_v2';   // 数据结构变更后换 key，避免旧缓存污染
const CACHE_TTL = 24 * 60 * 60 * 1000;

let appData = {};
let currentPage = 'dashboard';

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY_VER);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_TTL) return null;
    return cache.data;
  } catch { return null; }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY_VER, JSON.stringify({ data, timestamp: Date.now() }));
    localStorage.removeItem(CACHE_KEY); // 清理旧版缓存
  } catch {}
}

async function loadData() {
  const cached = getCache();
  if (cached) {
    appData = cached;
    updateSourceStatus('orcid', 'loaded');
    updateSourceStatus('hotspot', 'loaded');
    updateSourceStatus('tb', 'loaded');
    hideLoading();
    renderPage(currentPage);
    fetchAllData(true);
    return;
  }
  await fetchAllData(false);
}

function hideLoading() {
  const ov = document.getElementById('loading-overlay');
  if (ov) ov.style.display = 'none';
}

function showLoadError() {
  const ov = document.getElementById('loading-overlay');
  const err = document.getElementById('load-error');
  if (ov) ov.style.display = 'none';
  if (err) err.style.display = 'block';
}

async function fetchAllData(silent) {
  if (!silent) document.getElementById('loading-overlay').style.display = 'flex';

  const results = await Promise.allSettled([
    fetchJson(DATA_SOURCES.papers, 'orcid'),
    fetchJson(DATA_SOURCES.databases, 'tb'),
    fetchJson(DATA_SOURCES.hotspot, 'hotspot'),
    fetchJson(DATA_SOURCES.categories, 'hotspot')
  ]);

  const ok = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
  appData.papers = results[0].status === 'fulfilled' ? results[0].value : [];
  appData.databases = results[1].status === 'fulfilled' ? results[1].value : [];
  appData.hotspot = results[2].status === 'fulfilled' ? results[2].value : { routines: [] };
  appData.categories = results[3].status === 'fulfilled' ? results[3].value : [];

  if (ok === 0 && !silent) { showLoadError(); return; }

  setCache(appData);
  hideLoading();
  if (!silent) renderPage(currentPage);
}

async function fetchJson(url, sourceKey) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to load ${url}:`, err);
    updateSourceStatus(sourceKey, 'error');
    return null;
  }
}

function updateSourceStatus(key, status) {
  const el = document.getElementById(`source-${key}`);
  if (!el) return;
  el.className = `source-status ${status}`;
  const icons = { loaded: 'fa-check-circle', error: 'fa-exclamation-circle', loading: 'fa-circle-notch fa-spin' };
  const label = (el.textContent || key).trim() || key;   // 保留 HTML 里的中文标签
  el.innerHTML = `<i class="fas ${icons[status]}"></i> ${label}`;
}

function initRouter() {
  window.addEventListener('hashchange', () => route());
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('sidebar').classList.remove('open');
    });
  });
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  route();
}

function route() {
  const hash = window.location.hash.slice(1) || '/dashboard';
  const page = hash.replace('/', '') || 'dashboard';
  currentPage = page;
  // 高亮侧栏当前项（外部面板链接不参与）
  document.querySelectorAll('.nav-item[data-page]').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  renderPage(page);
  document.getElementById('last-updated').textContent = new Date().toLocaleDateString('zh-CN');
}

function renderPage(page) {
  const container = document.getElementById('page-content');
  if (!container) return;
  container.innerHTML = '';
  const err = document.getElementById('load-error');
  if (err) err.style.display = 'none';
  const renderers = {
    dashboard: () => window.renderDashboard && window.renderDashboard(container, appData),
    publications: () => window.renderPublications && window.renderPublications(container, appData),
    hotspot: () => window.renderHotspot && window.renderHotspot(container, appData),
    ideas: () => window.renderIdeas && window.renderIdeas(container, appData),
    toolkit: () => window.renderToolkit && window.renderToolkit(container, appData),
    databases: () => window.renderDatabases && window.renderDatabases(container, appData)
  };
  if (renderers[page]) renderers[page]();
  else container.innerHTML = '<div class="card"><h2>页面建设中</h2></div>';
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRouter();
  loadData();
});
