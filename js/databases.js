window.renderDatabases = function(container, data) {
  const databases = data.databases || [];

  const deepBlue = databases.filter(d => d.score >= 75);
  const shallowBlue = databases.filter(d => d.score >= 65 && d.score < 75);
  const nearShore = databases.filter(d => d.score >= 55 && d.score < 65);
  const redSea = databases.filter(d => d.score < 55);

  container.innerHTML = `
    <div style="margin-bottom:20px;">
      <h2 style="font-size:1.3rem;margin-bottom:8px;">公共数据库速查</h2>
      <p style="color:var(--text-secondary);">基于发表潜力和竞争程度的分类推荐</p>
    </div>

    ${renderDbSection('深海蓝海 (高潜力 · 低竞争)', deepBlue, '#059669')}
    ${renderDbSection('浅海蓝海 (中高潜力 · 较低竞争)', shallowBlue, '#0891b2')}
    ${renderDbSection('近岸蓝海 (中等潜力 · 中等竞争)', nearShore, '#d97706')}
    ${renderDbSection('红海 (低潜力 · 高竞争)', redSea, '#dc2626')}
  `;
};

function renderDbSection(title, dbs, color) {
  if (dbs.length === 0) return '';
  return `
    <div class="card" style="margin-bottom:20px;">
      <h3 style="font-size:1.1rem;margin-bottom:16px;color:${color};">${title}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
        ${dbs.map(d => `
          <div style="padding:16px;background:var(--bg-tertiary);border-radius:8px;border-left:4px solid ${color};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <h4 style="font-size:1rem;font-weight:600;">${d.name}</h4>
              <span class="badge" style="background:${color}20;color:${color};">${d.score}分</span>
            </div>
            <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">${d.description || ''}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">
              <strong>为什么适合你:</strong> ${d.why || '基于您的研究背景推荐'}
            </div>
            <a href="${d.url}" target="_blank" style="font-size:0.85rem;">
              <i class="fas fa-external-link-alt"></i> 访问数据库
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
