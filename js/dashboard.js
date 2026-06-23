const CROSS_MATCH = [
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

window.renderDashboard = function(container, data) {
  const papers = data.papers || [];
  const routines = (data.hotspot && data.hotspot.routines) || [];
  const databases = data.databases || [];

  const categories = {};
  papers.forEach(p => { categories[p.category] = (categories[p.category] || 0) + 1; });
  const fieldCount = Object.keys(categories).length;

  const matches = CROSS_MATCH.map(m => {
    const routine = getRoutineById(m.routine, routines);
    return { ...m, score: calcScore(routine), routineObj: routine };
  }).sort((a, b) => b.score - a.score);

  const topIdeas = matches.filter(m => !m.explored).slice(0, 5);

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">${papers.length}</div>
        <div class="kpi-label">已发表论文</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${fieldCount}</div>
        <div class="kpi-label">活跃领域</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${routines.length}</div>
        <div class="kpi-label">可追热点</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${databases.length}</div>
        <div class="kpi-label">推荐数据库</div>
      </div>
    </div>

    <div class="dashboard-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:24px;">
      <div class="card">
        <div class="card-title"><i class="fas fa-project-diagram"></i> 领域 × 热点交叉网络</div>
        <div id="cross-network" style="height:400px;"></div>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">
          节点大小 = 领域影响力 | 边粗细 = 匹配强度 | 边颜色 = 发表潜力
        </p>
      </div>
      <div class="card">
        <div class="card-title"><i class="fas fa-star"></i> Top 5 推荐 Idea</div>
        <div class="top-ideas-list">
          ${topIdeas.map((idea, i) => `
            <div class="idea-mini" style="padding:12px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="window.location.hash='#/ideas'">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span class="badge ${idea.score >= 4 ? 'badge-green' : idea.score >= 3 ? 'badge-yellow' : 'badge-gray'}">${idea.score.toFixed(1)}</span>
                <span style="font-size:0.8rem;color:var(--text-muted);">${idea.field}</span>
              </div>
              <div style="font-weight:500;font-size:0.9rem;">${idea.idea}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">${idea.question}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => renderCrossNetwork(matches, routines, data.hotspot && data.hotspot.categories_js), 100);
};

function renderCrossNetwork(matches, routines, categoriesJsStr) {
  const container = document.getElementById('cross-network');
  if (!container) return;
  const width = container.clientWidth;
  const height = 400;

  let categories = [];
  try {
    categories = eval(categoriesJsStr || '[]');
  } catch { categories = []; }

  const catColors = {};
  categories.forEach(c => { catColors[c.id] = c.cl; });

  const fieldNodes = [...new Set(matches.map(m => m.field))].map((f, i) => ({
    id: f, type: 'field', group: i, radius: 25
  }));
  const routineNodes = routines.map(r => ({
    id: r.id, name: r.name, type: 'routine',
    group: r.category, radius: 10,
    color: catColors[categories.find(c => c.nm === r.category)?.id] || '#999'
  }));
  const nodes = [...fieldNodes, ...routineNodes];

  const links = matches.map(m => {
    const score = m.score;
    return {
      source: m.field, target: m.routine,
      value: score,
      color: score >= 4 ? '#059669' : score >= 3 ? '#d97706' : '#94a3b8'
    };
  });

  const svg = d3.select('#cross-network').append('svg')
    .attr('width', width).attr('height', height)
    .attr('viewBox', [0, 0, width, height]);

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(80))
    .force('charge', d3.forceManyBody().strength(-250))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.radius + 5));

  const link = svg.append('g').selectAll('line')
    .data(links).join('line')
    .attr('stroke', d => d.color)
    .attr('stroke-width', d => Math.max(1, d.value))
    .attr('stroke-opacity', 0.5);

  const node = svg.append('g').selectAll('g')
    .data(nodes).join('g')
    .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

  node.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => d.type === 'field' ? '#2563eb' : (d.color || '#999'))
    .attr('stroke', '#fff').attr('stroke-width', 2);

  node.append('text')
    .text(d => d.type === 'field' ? (d.id.length > 8 ? d.id.substring(0, 8) + '...' : d.id) : '')
    .attr('text-anchor', 'middle').attr('dy', 4)
    .attr('font-size', '9px').attr('fill', '#fff').attr('pointer-events', 'none');

  const tooltip = d3.select('body').append('div')
    .style('position', 'absolute').style('visibility', 'hidden')
    .style('background', 'var(--bg-secondary)').style('padding', '8px 12px')
    .style('border-radius', '8px').style('box-shadow', 'var(--shadow-lg)')
    .style('font-size', '0.85rem').style('max-width', '250px')
    .style('border', '1px solid var(--border)').style('z-index', '1000')
    .style('color', 'var(--text-primary)');

  node.on('mouseover', (event, d) => {
    tooltip.style('visibility', 'visible')
      .html(d.type === 'field' ? `<strong>${d.id}</strong>` : `<strong>${d.name}</strong><br><span style="color:var(--text-muted);font-size:0.75rem;">${d.group}</span>`);
  }).on('mousemove', event => {
    tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
  }).on('mouseout', () => tooltip.style('visibility', 'hidden'));

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
  function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
  function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
}
