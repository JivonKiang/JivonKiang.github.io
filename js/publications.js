window.renderPublications = function(container, data) {
  const papers = data.papers || [];

  const catCounts = {};
  papers.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const categories = Object.keys(catCounts);

  const yearCounts = {};
  papers.forEach(p => { yearCounts[p.year] = (yearCounts[p.year] || 0) + 1; });
  const years = Object.keys(yearCounts).sort();

  container.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <span style="font-weight:500;">筛选:</span>
        <select id="pub-filter-cat" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
          <option value="">全部领域</option>
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select id="pub-filter-year" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
          <option value="">全部年份</option>
          ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
        </select>
        <input type="text" id="pub-search" placeholder="搜索标题/期刊..." style="padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);flex:1;min-width:200px;">
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <div class="card">
        <div class="card-title">研究领域分布</div>
        <canvas id="pub-chart-cat"></canvas>
      </div>
      <div class="card">
        <div class="card-title">发表趋势</div>
        <canvas id="pub-chart-year"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-title">论文列表 (${papers.length}篇)</div>
      <div id="pub-list"></div>
    </div>
  `;

  setTimeout(() => {
    renderPubCharts(catCounts, yearCounts);
    renderPubList(papers);
  }, 100);

  document.getElementById('pub-filter-cat').addEventListener('change', () => filterPapers(papers));
  document.getElementById('pub-filter-year').addEventListener('change', () => filterPapers(papers));
  document.getElementById('pub-search').addEventListener('input', () => filterPapers(papers));
};

function renderPubCharts(catCounts, yearCounts) {
  const catCtx = document.getElementById('pub-chart-cat');
  if (catCtx) {
    new Chart(catCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(catCounts),
        datasets: [{
          data: Object.values(catCounts),
          backgroundColor: ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#be185d', '#4f46e5']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'right', labels: { color: 'var(--text-primary)' } } } }
    });
  }

  const yearCtx = document.getElementById('pub-chart-year');
  if (yearCtx) {
    new Chart(yearCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(yearCounts).sort(),
        datasets: [{
          label: '论文数',
          data: Object.keys(yearCounts).sort().map(y => yearCounts[y]),
          backgroundColor: '#2563eb'
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: 'var(--text-secondary)' }, grid: { color: 'var(--border)' } }, x: { ticks: { color: 'var(--text-secondary)' }, grid: { color: 'var(--border)' } } }, plugins: { legend: { labels: { color: 'var(--text-primary)' } } } }
    });
  }
}

function renderPubList(papers) {
  const list = document.getElementById('pub-list');
  if (!list) return;

  const grouped = {};
  papers.forEach(p => {
    if (!grouped[p.year]) grouped[p.year] = [];
    grouped[p.year].push(p);
  });

  list.innerHTML = Object.keys(grouped).sort((a, b) => b - a).map(year => `
    <div style="margin-bottom:16px;">
      <h3 style="font-size:1rem;color:var(--accent);margin-bottom:8px;border-bottom:2px solid var(--accent);display:inline-block;padding-bottom:2px;">${year}</h3>
      ${grouped[year].map(p => `
        <div style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div style="flex:1;">
            <div style="font-weight:500;margin-bottom:2px;">${p.title}</div>
            <div style="font-size:0.85rem;color:var(--text-secondary);">
              <span style="font-style:italic;">${p.journal}</span>
              ${p.doi ? ` · <a href="https://doi.org/${p.doi}" target="_blank">DOI</a>` : ''}
              ${p.pmid ? ` · <a href="https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/" target="_blank">PubMed</a>` : ''}
            </div>
          </div>
          <span class="badge badge-gray" style="white-space:nowrap;">${p.category}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function filterPapers(allPapers) {
  const cat = document.getElementById('pub-filter-cat').value;
  const year = document.getElementById('pub-filter-year').value;
  const search = document.getElementById('pub-search').value.toLowerCase();

  const filtered = allPapers.filter(p => {
    if (cat && p.category !== cat) return false;
    if (year && p.year !== year) return false;
    if (search && !p.title.toLowerCase().includes(search) && !p.journal.toLowerCase().includes(search)) return false;
    return true;
  });

  renderPubList(filtered);
}
