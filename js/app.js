// ===== Data Sources =====
const DATA_SOURCES = {
  papers: 'https://raw.githubusercontent.com/JivonKiang/orcid-profile-fanjiang/main/data/papers.json',
  network: 'https://raw.githubusercontent.com/JivonKiang/orcid-profile-fanjiang/main/data/network.json',
  timeline: 'https://raw.githubusercontent.com/JivonKiang/orcid-profile-fanjiang/main/data/timeline.json',
  databases: 'https://raw.githubusercontent.com/JivonKiang/orcid-profile-fanjiang/main/data/databases.json',
  hotspot: 'https://raw.githubusercontent.com/JivonKiang/medical-bibliometrics-hotspot/main/data.json'
};

const CACHE_KEY = 'research_nav_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;

let appData = {};
let currentPage = 'dashboard';

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_TTL) return null;
    return cache.data;
  } catch { return null; }
}

function setCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
}

async function loadData() {
  const cached = getCache();
  if (cached) {
    appData = cached;
    updateSourceStatus('orcid', 'loaded');
    updateSourceStatus('hotspot', 'loaded');
    updateSourceStatus('tb', 'loaded');
    document.getElementById('loading-overlay').style.display = 'none';
    renderPage(currentPage);
    fetchAllData(true);
    return;
  }
  await fetchAllData(false);
}

async function fetchAllData(silent) {
  if (!silent) document.getElementById('loading-overlay').style.display = 'flex';

  const results = await Promise.allSettled([
    fetchJson(DATA_SOURCES.papers, 'orcid'),
    fetchJson(DATA_SOURCES.network, 'orcid'),
    fetchJson(DATA_SOURCES.timeline, 'orcid'),
    fetchJson(DATA_SOURCES.databases, 'orcid'),
    fetchJson(DATA_SOURCES.hotspot, 'hotspot')
  ]);

  appData.papers = results[0].status === 'fulfilled' ? results[0].value : [];
  appData.network = results[1].status === 'fulfilled' ? results[1].value : {};
  appData.timeline = results[2].status === 'fulfilled' ? results[2].value : [];
  appData.databases = results[3].status === 'fulfilled' ? results[3].value : [];
  appData.hotspot = results[4].status === 'fulfilled' ? results[4].value : { routines: [], categories_js: '' };

  setCache(appData);
  if (!silent) {
    document.getElementById('loading-overlay').style.display = 'none';
    renderPage(currentPage);
  }
}

async function fetchJson(url, sourceKey) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    updateSourceStatus(sourceKey, 'loaded');
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
  el.innerHTML = `<i class="fas ${icons[status]}"></i> ${key.toUpperCase()}`;
}

function initRouter() {
  window.addEventListener('hashchange', () => route());
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
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
  renderPage(page);
  document.getElementById('last-updated').textContent = new Date().toLocaleDateString('zh-CN');
}

function renderPage(page) {
  const container = document.getElementById('page-content');
  container.innerHTML = '';
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
