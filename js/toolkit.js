const METHOD_GROUPS = {
  '因果推断': [
    { id: 'mr', name: '孟德尔随机化(MR)', desc: '利用遗传变异作为工具变量推断暴露与结局的因果关系', methods: ['两样本MR', '多变量MR', '药物靶点MR'] },
    { id: 'drug_target_mr', name: '药靶MR', desc: '验证药物靶点的因果效应，指导药物重定位', methods: ['药靶MR', '共定位分析'] },
    { id: 'pqtl_mr', name: 'pQTL蛋白质组MR', desc: '通过蛋白质定量性状位点进行因果推断', methods: ['pQTL-MR', '蛋白质组学分析'] },
    { id: 'metabolomics_mr', name: '代谢组学MR', desc: '代谢物与疾病风险的因果推断', methods: ['代谢组学MR', '代谢通路分析'] },
    { id: 'gut_microbiota_mr', name: '肠道菌群MR', desc: '肠道菌群与疾病的因果关系验证', methods: ['菌群MR', '16S/宏基因组'] },
    { id: 'causal_inference', name: '因果推断(DID/RDD/PSM)', desc: '准实验方法用于政策评估和自然实验', methods: ['DID', 'RDD', 'PSM', '合成控制'] }
  ],
  '生信挖掘': [
    { id: 'geo_tcga', name: 'GEO/TCGA挖掘', desc: '公共数据库的基因表达与生存分析', methods: ['差异表达', '生存分析', 'WGCNA'] },
    { id: 'immune_infiltration', name: '免疫浸润分析', desc: '肿瘤微环境中的免疫细胞组成分析', methods: ['CIBERSORT', 'xCell', 'ssGSEA'] },
    { id: 'cerna', name: 'ceRNA网络', desc: '竞争性内源RNA调控网络构建', methods: ['ceRNA', 'lncRNA-miRNA-mRNA'] },
    { id: 'methylation', name: 'DNA甲基化分析', desc: '表观遗传修饰与疾病关联', methods: ['差异甲基化', '甲基化生存'] },
    { id: 'gdsc_drug', name: '药物敏感性(GDSC)', desc: '细胞系药物敏感性预测', methods: ['GDSC', 'IC50分析'] },
    { id: 'ppi', name: 'PPI蛋白互作', desc: '蛋白质相互作用网络分析', methods: ['STRING', 'Cytoscape'] }
  ],
  '生信前沿': [
    { id: 'single_cell', name: '单细胞挖掘', desc: '单细胞转录组数据分析', methods: ['Seurat', 'Scanpy', '细胞注释'] },
    { id: 'multi_omics', name: '多组学整合', desc: '整合多维度组学数据进行系统分析', methods: ['MOFA', 'iCluster', 'SNF'] },
    { id: 'virtual_ko', name: '虚拟敲除', desc: '计算预测基因敲除效应', methods: ['CRISPR', 'shRNA', '虚拟筛选'] },
    { id: 'rna_modification', name: 'RNA修饰', desc: 'm6A/m5C/m7G等RNA修饰分析', methods: ['m6A', 'MeRIP-seq'] },
    { id: 'cell_death', name: '程序性死亡', desc: '铁死亡/铜死亡/焦亡等新型死亡方式', methods: ['铁死亡', '铜死亡', '焦亡'] }
  ],
  '临床数据库': [
    { id: 'mimic', name: 'MIMIC-IV', desc: 'ICU重症监护数据库', methods: ['SQL查询', '临床预测模型'] },
    { id: 'eicu', name: 'eICU-CRD', desc: '电子ICU协作研究数据库', methods: ['SQL查询', '队列研究'] },
    { id: 'faers', name: 'FAERS药物警戒', desc: 'FDA不良事件报告系统', methods: ['信号检测', 'disproportionality'] }
  ],
  '流调数据库': [
    { id: 'nhanes', name: 'NHANES', desc: '美国健康营养调查', methods: ['复杂抽样', '加权分析'] },
    { id: 'seer', name: 'SEER', desc: '美国癌症登记数据库', methods: ['生存分析', '发病率分析'] },
    { id: 'gbd', name: 'GBD', desc: '全球疾病负担数据库', methods: ['GBD分析', '疾病负担估算'] },
    { id: 'aging_cohort', name: '老龄化队列', desc: 'CHARLS/ELSA/HRS等老龄化队列', methods: ['纵向分析', '队列研究'] }
  ],
  '其他': [
    { id: 'nomogram', name: 'Nomogram', desc: '临床预测模型可视化', methods: ['Logistic回归', 'Cox回归', '列线图'] },
    { id: 'bibliometrics', name: '文献计量学', desc: '科学知识图谱与热点分析', methods: ['CiteSpace', 'VOSviewer', 'bibliometrix'] },
    { id: 'network_pharma', name: '网络药理学', desc: '中药成分-靶点-疾病网络分析', methods: ['TCMSP', 'SwissTarget', 'KEGG'] },
    { id: 'nlp_medical', name: '医学NLP', desc: '电子病历自然语言处理', methods: ['NER', '关系抽取', '临床文本挖掘'] },
    { id: 'radiomics', name: '影像组学', desc: '医学影像高通量特征提取', methods: ['特征提取', '影像预测模型'] }
  ]
};

window.renderToolkit = function(container, data) {
  container.innerHTML = `
    <div style="margin-bottom:20px;">
      <h2 style="font-size:1.3rem;margin-bottom:8px;">科研方法工具箱</h2>
      <p style="color:var(--text-secondary);">基于 <a href="https://github.com/JivonKiang/tuberculosis-causal-inference" target="_blank">tuberculosis-causal-inference</a> 仓库的可复用方法</p>
    </div>
    ${Object.entries(METHOD_GROUPS).map(([group, methods]) => `
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:1.1rem;margin-bottom:16px;color:var(--accent);">${group}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">
          ${methods.map(m => `
            <div style="padding:12px;background:var(--bg-tertiary);border-radius:8px;">
              <div style="font-weight:600;margin-bottom:4px;">${m.name}</div>
              <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">${m.desc}</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${m.methods.map(me => `<span class="badge badge-gray" style="font-size:0.7rem;">${me}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  `;
};
