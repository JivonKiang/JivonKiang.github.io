window.renderHotspot = function(container, data) {
  const hotspot = data.hotspot || {};
  const routines = hotspot.routines || [];
  let categories = [];
  try { categories = eval(hotspot.categories_js || '[]'); } catch { categories = []; }

  container.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <span style="font-weight:500;">分类:</span>
        <button class="btn btn-primary btn-sm" data-cat="" onclick="filterRoutines('')">全部</button>
        ${categories.map(c => `
          <button class="btn btn-ghost btn-sm" data-cat="${c.nm}" onclick="filterRoutines('${c.nm}')"
            style="border-color:${c.cl};color:${c.cl};">${c.nm}</button>
        `).join('')}
      </div>
      <div style="margin-top:12px;display:flex;gap:12px;align-items:center;">
        <span style="font-weight:500;">排序:</span>
        <select id="routine-sort" onchange="sortRoutines()" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
          <option value="score">综合评分</option>
          <option value="hotness">热度</option>
          <option value="innovation">创新性</option>
          <option value="difficulty_write">写作难度(低→高)</option>
        </select>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" id="routine-easy" onchange="filterRoutines(window.currentCat)">
          <span>只看写作难度≤3</span>
        </label>
      </div>
    </div>

    <div id="routine-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px;"></div>
  `;

  window._routines = routines;
  window._categories = categories;
  window.currentCat = '';
  filterRoutines('');
};

function calcRoutineScore(r) {
  return (r.hotness || 0) * 0.3 + (r.innovation || 0) * 0.3 + (6 - (r.difficulty_write || 3)) * 0.2 + (6 - (r.difficulty_pub || 3)) * 0.2;
}

window.filterRoutines = function(cat) {
  window.currentCat = cat;
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.classList.toggle('btn-primary', btn.dataset.cat === cat);
    btn.classList.toggle('btn-ghost', btn.dataset.cat !== cat);
  });
  sortRoutines();
};

window.sortRoutines = function() {
  const routines = (window._routines || []).filter(r => {
    if (window.currentCat && r.category !== window.currentCat) return false;
    const easyOnly = document.getElementById('routine-easy')?.checked;
    if (easyOnly && (r.difficulty_write || 5) > 3) return false;
    return true;
  });

  const sortBy = document.getElementById('routine-sort')?.value || 'score';
  if (sortBy === 'score') {
    routines.sort((a, b) => calcRoutineScore(b) - calcRoutineScore(a));
  } else {
    routines.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }

  const grid = document.getElementById('routine-grid');
  if (!grid) return;

  const catColors = {};
  (window._categories || []).forEach(c => { catColors[c.nm] = c.cl; });

  grid.innerHTML = routines.map(r => {
    const score = calcRoutineScore(r);
    const topJournals = (r.journals || []).slice(0, 3);
    return `
      <div class="card" style="display:flex;flex-direction:column;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <h3 style="font-size:1rem;font-weight:600;">${r.name}</h3>
          <span class="badge" style="background:${(catColors[r.category] || '#666') + '20'};color:${catColors[r.category] || '#666'};">${r.category}</span>
        </div>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;flex:1;">${r.core || ''}</p>

        <div style="margin-bottom:12px;">
          ${[['热度', r.hotness], ['创新性', r.innovation], ['写作难度', r.difficulty_write], ['发表难度', r.difficulty_pub]].map(([label, val]) => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:0.75rem;width:60px;color:var(--text-muted);">${label}</span>
              <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                <div style="width:${(val || 0) * 20}%;height:100%;background:${label.includes('难度') ? '#dc2626' : '#059669'};border-radius:3px;"></div>
              </div>
              <span style="font-size:0.75rem;width:20px;text-align:right;">${val || 0}</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-bottom:8px;">
          <span style="font-size:0.75rem;color:var(--text-muted);">适用数据库:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
            ${(r.databases || []).map(d => `<span class="badge badge-gray" style="font-size:0.7rem;">${d}</span>`).join('')}
          </div>
        </div>

        ${topJournals.length > 0 ? `
          <div style="border-top:1px solid var(--border);padding-top:8px;">
            <span style="font-size:0.75rem;color:var(--text-muted);">推荐期刊:</span>
            ${topJournals.map(j => `
              <div style="font-size:0.8rem;margin-top:2px;">
                ${j.name} <span style="color:var(--text-muted);">IF=${j.if} ${j.cas}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
};
