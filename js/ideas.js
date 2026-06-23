const CROSS_MATCH_IDEAS = [
  { field: 'TB疫苗诊断', routine: 'mr', idea: 'TB生物标志物的孟德尔随机化因果验证', question: '利用MR方法验证TB相关生物标志物与疾病风险的因果关系' },
  { field: 'TB疫苗诊断', routine: 'single_cell', idea: 'TB免疫微环境单细胞图谱', question: '通过单细胞测序解析TB感染后的免疫微环境变化' },
  { field: 'TB疫苗诊断', routine: 'multi_omics', idea: 'TB多组学整合生物标志物发现', question: '整合基因组、转录组、蛋白质组数据发现TB诊断标志物' },
  { field: 'GBD Global Burden of Disease', routine: 'gbd', idea: 'GBD全球疾病负担趋势分析', question: '分析全球TB疾病负担时空变化趋势', explored: true },
  { field: 'GBD Global Burden of Disease', routine: 'causal_inference', idea: '政策干预对TB负担的因果效应评估', question: '利用DID方法评估公共卫生政策对TB发病率的影响' },
  { field: 'GBD Global Burden of Disease', routine: 'aging_cohort', idea: '老龄化对传染病负担的因果贡献', question: '基于老龄化队列数据量化老龄化对TB负担的贡献' },
  { field: 'GBD Global Burden of Disease', routine: 'nhanes', idea: '美国TB风险因素的流调分析', question: '利用NHANES数据分析美国人群TB风险因素' },
  { field: 'Bibliometrics & Knowledge Mapping', routine: 'bibliometrics', idea: '文献计量学方法学研究', question: '开发新的文献计量学分析框架', explored: true },
  { field: 'Bibliometrics & Knowledge Mapping', routine: 'nlp_medical', idea: 'AI辅助文献挖掘的新方法学', question: '利用NLP技术自动化医学文献知识发现' },
  { field: 'Multi-omics & Bioinformatics', routine: 'gut_microbiota_mr', idea: '肠道菌群-免疫轴的MR因果推断', question: '通过MR验证肠道菌群与TB易感性的因果关系' },
  { field: 'Multi-omics & Bioinformatics', routine: 'metabolomics_mr', idea: '代谢物对TB风险的MR分析', question: '利用代谢组学MR识别TB相关的代谢物标志物' },
  { field: 'Multi-omics & Bioinformatics', routine: 'pqtl_mr', idea: '蛋白质组学的因果推断', question: '通过pQTL-MR发现TB相关的蛋白质因果因子' },
  { field: 'Multi-omics & Bioinformatics', routine: 'virtual_ko', idea: '基因功能虚拟筛选', question: '利用虚拟敲除分析筛选TB关键基因' },
  { field: 'Multi-omics & Bioinformatics', routine: 'rna_modification', idea: 'RNA表观遗传修饰的TB关联', question: '分析RNA修饰在TB感染中的调控作用' },
  { field: 'Nanomedicine & Biomaterials', routine: 'drug_target_mr', idea: '纳米药物靶点的MR验证', question: '通过MR验证纳米药物靶点的因果效应' },
  { field: 'Infectious Disease Vaccines (non-TB)', routine: 'network_pharma', idea: '中药抗病毒成分的网络药理学', question: '利用网络药理学发现中药抗病毒活性成分' },
  { field: 'Physiological & Environmental Health', routine: 'nhanes', idea: '环境暴露与健康结局的关联', question: '基于NHANES分析环境暴露与传染病风险' },
  { field: 'Physiological & Environmental Health', routine: 'seer', idea: '环境因素与癌症发病率的生态研究', question: '利用SEER数据研究环境暴露与癌症关联' },
  { field: 'Genetics & Molecular Biology', routine: 'gdsc_drug', idea: '药物基因组学的敏感性预测', question: '基于GDSC数据预测药物基因组学敏感性' }
];

function getRoutineById(id, routines) {
  return routines.find(r => r.id === id) || null;
}

function calcScore(routine) {
  if (!routine) return 0;
  return (routine.hotness || 0) * 0.3 + (routine.innovation || 0) * 0.3 + (6 - (routine.difficulty_write || 3)) * 0.2 + (6 - (routine.difficulty_pub || 3)) * 0.2;
}

const VERIFICATION_KEY = 'research_nav_verification';
const FAV_KEY = 'research_nav_favorites';

function getVerificationState() {
  try {
    const raw = localStorage.getItem(VERIFICATION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function setVerificationState(state) {
  localStorage.setItem(VERIFICATION_KEY, JSON.stringify(state));
}

function getIdeaStatus(ideaId) {
  return getVerificationState()[ideaId] || 'unverified';
}

function setIdeaStatus(ideaId, status) {
  const state = getVerificationState();
  state[ideaId] = status;
  setVerificationState(state);
  updateVerificationStats();
}

function getFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

window.toggleFavorite = function(ideaId) {
  const favs = getFavorites();
  const idx = favs.indexOf(ideaId);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(ideaId);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));

  const btn = document.querySelector(`.fav-btn[data-idea="${ideaId}"]`);
  if (btn) {
    const isFav = idx < 0;
    btn.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-star"></i>`;
    btn.style.color = isFav ? 'var(--orange)' : 'var(--text-muted)';
  }
};

window.renderIdeas = function(container, data) {
  const routines = (data.hotspot && data.hotspot.routines) || [];

  const matches = CROSS_MATCH_IDEAS.map(m => {
    const routine = getRoutineById(m.routine, routines);
    return { ...m, score: calcScore(routine), routineObj: routine };
  }).sort((a, b) => b.score - a.score);

  const verificationState = getVerificationState();
  const verifiedCount = Object.values(verificationState).filter(v => v === 'verified').length;
  const rejectedCount = Object.values(verificationState).filter(v => v === 'rejected').length;
  const total = matches.length;

  container.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <span style="font-weight:500;">筛选:</span>
        <select id="idea-filter-field" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
          <option value="">全部领域</option>
          ${[...new Set(matches.map(m => m.field))].map(f => `<option value="${f}">${f}</option>`).join('')}
        </select>
        <select id="idea-filter-status" style="padding:6px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
          <option value="">全部状态</option>
          <option value="unverified">未核查</option>
          <option value="verified">已核查</option>
          <option value="rejected">已否决</option>
          <option value="unexplored">未探索</option>
        </select>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" id="idea-fav-only">
          <span>只看收藏</span>
        </label>
      </div>
      <div style="margin-top:12px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:0.85rem;color:var(--text-secondary);">核查进度:</span>
        <div style="flex:1;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;max-width:300px;">
          <div id="verify-bar" style="width:${(verifiedCount / total * 100)}%;height:100%;background:var(--green);border-radius:4px;transition:width 0.3s;"></div>
        </div>
        <span id="verify-stats" style="font-size:0.85rem;color:var(--text-secondary);">${verifiedCount}/${total} 已核查 · ${rejectedCount} 已否决</span>
      </div>
    </div>

    <div id="ideas-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:16px;"></div>
  `;

  renderIdeasList(matches, routines);

  document.getElementById('idea-filter-field').addEventListener('change', () => renderIdeasList(matches, routines));
  document.getElementById('idea-filter-status').addEventListener('change', () => renderIdeasList(matches, routines));
  document.getElementById('idea-fav-only').addEventListener('change', () => renderIdeasList(matches, routines));
};

function renderIdeasList(matches, routines) {
  const fieldFilter = document.getElementById('idea-filter-field')?.value || '';
  const statusFilter = document.getElementById('idea-filter-status')?.value || '';
  const favOnly = document.getElementById('idea-fav-only')?.checked;
  const favs = getFavorites();

  let filtered = matches;
  if (fieldFilter) filtered = filtered.filter(m => m.field === fieldFilter);
  if (statusFilter) {
    if (statusFilter === 'unexplored') filtered = filtered.filter(m => !m.explored);
    else filtered = filtered.filter(m => getIdeaStatus(m.idea) === statusFilter);
  }
  if (favOnly) filtered = filtered.filter(m => favs.includes(m.idea));

  const list = document.getElementById('ideas-list');
  if (!list) return;

  list.innerHTML = filtered.map(m => {
    const status = getIdeaStatus(m.idea);
    const isFav = favs.includes(m.idea);
    const routine = m.routineObj;
    const topJournals = routine ? (routine.journals || []).slice(0, 2) : [];
    const refs = routine ? (routine.journals || []).flatMap(j => j.articles || []).slice(0, 3) : [];

    return `
      <div class="card idea-card" data-idea="${m.idea}" style="position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
              <span class="badge ${m.score >= 4 ? 'badge-green' : m.score >= 3 ? 'badge-yellow' : 'badge-gray'}">${m.score.toFixed(1)}</span>
              ${m.explored ? '<span class="badge" style="background:rgba(37,99,235,0.15);color:var(--accent);">已探索</span>' : ''}
              <span class="verification-status" data-idea="${m.idea}" style="cursor:pointer;font-size:1.2rem;user-select:none;" onclick="toggleIdeaStatus('${m.idea}')" title="点击切换核查状态">
                ${status === 'verified' ? '<span style="color:var(--green);">✓</span>' : status === 'rejected' ? '<span style="color:var(--red);">✗</span>' : '<span style="color:var(--orange);">❓</span>'}
              </span>
            </div>
            <h3 style="font-size:1rem;font-weight:600;">${m.idea}</h3>
          </div>
          <button class="fav-btn" data-idea="${m.idea}" onclick="toggleFavorite('${m.idea}')" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:${isFav ? 'var(--orange)' : 'var(--text-muted)'};">
            <i class="${isFav ? 'fas' : 'far'} fa-star"></i>
          </button>
        </div>

        <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">
          <strong>研究问题:</strong> ${m.question}
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
          <span class="badge badge-gray">${m.field}</span>
          <span class="badge badge-gray">${routine ? routine.name : m.routine}</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;font-size:0.85rem;">
          <div>
            <strong style="color:var(--text-muted);">推荐方法:</strong>
            <div style="margin-top:4px;">
              <a href="#/toolkit">${routine ? routine.name : '查看工具箱'}</a>
            </div>
          </div>
          <div>
            <strong style="color:var(--text-muted);">推荐数据源:</strong>
            <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;">
              ${(routine ? routine.databases || [] : []).map(d => `<span class="badge badge-gray" style="font-size:0.7rem;">${d}</span>`).join('')}
            </div>
          </div>
        </div>

        ${topJournals.length > 0 ? `
          <div style="border-top:1px solid var(--border);padding-top:8px;margin-bottom:8px;">
            <strong style="font-size:0.8rem;color:var(--text-muted);">推荐期刊:</strong>
            ${topJournals.map(j => `
              <div style="font-size:0.8rem;margin-top:2px;">${j.name} <span style="color:var(--text-muted);">IF=${j.if} ${j.cas}</span></div>
            `).join('')}
          </div>
        ` : ''}

        ${refs.length > 0 ? `
          <div style="border-top:1px solid var(--border);padding-top:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="toggleRefs('${m.idea}')">
              <strong style="font-size:0.8rem;color:var(--text-muted);">参考文献 (${refs.length}篇)</strong>
              <i class="fas fa-chevron-down" id="ref-icon-${m.idea}"></i>
            </div>
            <div id="refs-${m.idea}" style="display:none;margin-top:8px;">
              ${refs.map(ref => `
                <div style="padding:8px;background:var(--bg-tertiary);border-radius:6px;margin-bottom:6px;font-size:0.8rem;">
                  <div style="font-weight:500;margin-bottom:4px;">${ref.title || 'N/A'}</div>
                  <div style="color:var(--text-muted);">
                    ${ref.authors || ''} ${ref.year ? '(' + ref.year + ')' : ''} ${ref.journal || ''}
                  </div>
                  <div style="margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;">
                    ${ref.doi ? `<a href="https://doi.org/${ref.doi}" target="_blank" style="font-size:0.75rem;">DOI: ${ref.doi}</a>` : ''}
                    ${ref.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/" target="_blank" style="font-size:0.75rem;">PMID: ${ref.pmid}</a>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

window.toggleIdeaStatus = function(ideaId) {
  const current = getIdeaStatus(ideaId);
  const next = current === 'unverified' ? 'verified' : current === 'verified' ? 'rejected' : 'unverified';
  setIdeaStatus(ideaId, next);

  const el = document.querySelector(`.verification-status[data-idea="${ideaId}"]`);
  if (el) {
    el.innerHTML = next === 'verified' ? '<span style="color:var(--green);">✓</span>' : next === 'rejected' ? '<span style="color:var(--red);">✗</span>' : '<span style="color:var(--orange);">❓</span>';
  }
};

function updateVerificationStats() {
  const state = getVerificationState();
  const verified = Object.values(state).filter(v => v === 'verified').length;
  const rejected = Object.values(state).filter(v => v === 'rejected').length;
  const total = CROSS_MATCH_IDEAS.length;

  const bar = document.getElementById('verify-bar');
  const stats = document.getElementById('verify-stats');
  if (bar) bar.style.width = `${(verified / total * 100)}%`;
  if (stats) stats.textContent = `${verified}/${total} 已核查 · ${rejected} 已否决`;
}

window.toggleRefs = function(ideaId) {
  const el = document.getElementById(`refs-${ideaId}`);
  const icon = document.getElementById(`ref-icon-${ideaId}`);
  if (el) {
    const showing = el.style.display === 'block';
    el.style.display = showing ? 'none' : 'block';
    if (icon) icon.className = showing ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
  }
};
