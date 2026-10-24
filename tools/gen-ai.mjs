/**
 * gen-ai —— 给 AI 用的入口文件生成器
 *
 * 从 ppt-aesthetic-forge.html（单一数据源）生成：
 *   llms.txt          根目录，llmstxt.org 标准，AI 工具的默认探测点
 *   ai/spec.md        10 套方案的完整规格，约 8KB，一次读完就能复现
 *   ai/presets.json   机器可读全量数据，给脚本 / MCP / 构建流程用
 *
 * 为什么要生成而不是手写：HTML 里的 OPTS 一改，这三个文件必须跟着变。
 * 复制粘贴迟早漂移，生成才永远同步。
 *
 * 用法：node tools/gen-ai.mjs   （CI 里会跑 --check 验一致性）
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadForge, listDesigns, listDimensions, specFor } from './forge-core.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const AI_DIR = join(ROOT, 'ai');

const REPO = 'lalalaHulala/ppt-aesthetic-forge';
const OWNER_LOWER = REPO.split('/')[0].toLowerCase();
const NAME = REPO.split('/')[1];
const PAGES = `https://${OWNER_LOWER}.github.io/${NAME}/`;
const CDN = `https://cdn.jsdelivr.net/gh/${REPO}@main/`;
const RAW = `https://raw.githubusercontent.com/${REPO}/main/`;

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

/* ---------- 采集 ---------- */

const F = loadForge();
const designs = listDesigns();
const dims = listDimensions();
const types = F.OPTS.type;

const TYPE_ALIAS = Object.fromEntries(
  types.map((t) => [t.id, { id: t.id, name: t.name, head: t.f.head, body: t.f.body, weight: t.f.w, spacing: t.f.ls }])
);

const rows = designs.map((d) => {
  const spec = specFor({ design: d.id });
  return { design: d, spec };
});

/* ---------- ai/presets.json ---------- */

const presets = {
  schema: 'ppt-aesthetic-forge/presets@1',
  version: pkg.version,
  updated: new Date().toISOString().slice(0, 10),
  project: { name: 'PPT 审美捏脸台', en: 'Aesthetic Forge', cn: '小咔小小咔', repo: REPO, license: 'MIT' },
  entry: {
    pages: PAGES,
    cdn: CDN,
    llms: PAGES + 'llms.txt',
    spec: PAGES + 'ai/spec.md',
    starter: PAGES + 'ai/starter.html',
    app: PAGES,
  },
  usage:
    '给 AI：读 ai/spec.md 挑一套方案，把 tokens.cssVars 粘进 ai/starter.html 的 :root，再填文案。' +
    '给程序：直接用 designs[].tokens 与 designs[].dna。' +
    '不要解析 ppt-aesthetic-forge.html，那是给人用的界面。',
  stages: { canvas: '960x540', pages: ['cover', 'content', 'chart'], rule: '正文对比度 ≥ 4.5:1，全篇 ≤ 2 款字体' },
  fonts: TYPE_ALIAS,
  dimensions: dims.map((d) => ({
    id: d.id, no: d.no, name: d.name, primary: d.primary,
    options: d.options.map((o) => o.id),
  })),
  designs: rows.map(({ design: d, spec }) => ({
    id: d.id,
    no: String(designs.indexOf(d) + 1).padStart(2, '0'),
    name: d.name,
    en: d.en,
    category: d.cat,
    dna: spec.dna,
    template: d.tpl,
    mood: d.mood,
    summary: d.desc,
    why: d.good,
    when: d.scene,
    source: d.source.replace(/^来源：/, ''),
    preset: d.preset,
    tokens: {
      colors: spec.tokens.colors,
      fonts: spec.tokens.fonts,
      metrics: spec.tokens.metrics,
      cssVars: spec.tokens.cssVars,
    },
    contrast: spec.contrast,
    harmony: spec.harmony,
    prompt: spec.prompt,
  })),
};

/* ---------- ai/spec.md ---------- */

const fontLine = (s) => {
  const t = TYPE_ALIAS[s.config.type.id];
  return `${t.id}（标题 ${t.weight} / 字距 ${t.spacing}）`;
};

const specMd = [
  '# PPT 审美规格 · 10 套设计方案',
  '',
  `> 由审美捏脸台 v${pkg.version} 自动生成，与 HTML 同源。最后更新 ${presets.updated}。`,
  '',
  '这份文件是给模型读的：**选一套，把「令牌」整组搬进页面，再填文案**。不需要看别的。',
  '需要可直接运行的骨架，用同目录的 `starter.html`（960×540，零依赖）。',
  '',
  '## 执行规则（比令牌更重要）',
  '',
  '1. **一页一套色板**。不要把 A 方案的强调色挪到 B 方案里。',
  '2. **全篇最多两款字体**，标题一款、正文一款，不引入第三款。',
  '3. **正文对比度 ≥ 4.5:1**。浅底不要用浅灰字，深底不要用深灰字。每套的实测值见下方。',
  '4. **强调色只用于大字、图形、线条**。政务金、糖果粉这类装饰色在底上对比度低，写成小字会糊。',
  '5. **圆角、内边距、间距按给定值**，不要自行放大到 32px 圆角或 80px 边距。',
  '6. **画布固定 960×540**。内容放不下就删要点，不要缩字号。',
  '7. 方案已经按视觉家族去重，**不要自己再造第 11 套**。',
  '',
  '## 字体映射',
  '',
  '| id | 名称 | 标题字体栈 | 字重 | 字距 |',
  '|---|---|---|---|---|',
  ...types.map((t) => `| \`${t.id}\` | ${t.name} | \`${t.f.head}\` | ${t.f.w} | ${t.f.ls} |`),
  '',
  '---',
  '',
];

rows.forEach(({ design: d, spec }, idx) => {
  const c = spec.tokens.colors;
  const m = spec.tokens.metrics;
  const ground = d.mood === 'dark' ? '深色底' : d.mood === 'ink' ? '墨色' : '浅色底';
  specMd.push(
    `## ${String(idx + 1).padStart(2, '0')} ${d.name} · \`${d.id}\``,
    '',
    `**${d.desc}**`,
    '',
    `- 用在：${d.scene}`,
    `- 好处：${d.good}`,
    `- 版式：\`${d.tpl}\` / ${ground} · 分类 ${d.cat} · 来源 ${d.source.replace(/^来源：/, '')}`,
    '',
    '```css',
    `--ppt-bg:${c.bg}; --ppt-surface:${c.surface};`,
    `--ppt-text:${c.text}; --ppt-sub:${c.sub};`,
    `--ppt-primary:${c.primary}; --ppt-accent:${c.accent};`,
    `--ppt-chart-1:${c.chart[0]}; --ppt-chart-2:${c.chart[1]}; --ppt-chart-3:${c.chart[2]}; --ppt-chart-4:${c.chart[3]};`,
    `--ppt-font-head:${TYPE_ALIAS[spec.config.type.id].head};`,
    `--ppt-font-body:${TYPE_ALIAS[spec.config.type.id].body};`,
    `--ppt-head-weight:${spec.tokens.fonts.headWeight}; --ppt-head-spacing:${spec.tokens.fonts.headSpacing};`,
    `--ppt-radius:${m.radiusPx}px; --ppt-pad:${m.padPx}px; --ppt-gap:${m.gapPx}px;`,
    `--ppt-title-size:${m.titleSizePx}px; --ppt-body-size:${m.bodySizePx}px;`,
    '```',
    '',
    `字体 ${fontLine(spec)} · 对比度 正文 ${spec.contrast.body}:1 / 辅助 ${spec.contrast.sub}:1 · DNA \`${spec.dna}\``,
    '',
  );
});

specMd.push(
  '---',
  '',
  '## 怎么用',
  '',
  '```',
  '1. 挑一套（按用户的主题和使用场合，别只看颜色好不好看）',
  '2. 打开 ai/starter.html，把上面那组 --ppt-* 整段替换掉 :root 里的同名变量',
  '3. 改三个 <section> 里的文字；深色方案把 --ppt-line 换成 rgba(255,255,255,.16)',
  '4. 保存成 .html 交付，双击即可放映，也可直接打印成 PDF',
  '```',
  '',
  `完整机器可读数据：\`ai/presets.json\` · 更多说明：\`${PAGES}llms.txt\``,
  '',
);

/* ---------- llms.txt ---------- */

const llms = [
  '# PPT 审美捏脸台 · Aesthetic Forge（小咔小小咔）',
  '',
  '> 10 套去重过的 PPT 设计方案。每套一句话定位就在本页，完整设计令牌（色值 / 字体 / 圆角 / 间距 / 字号 / 对比度）在 ai/spec.md。',
  '> 让 AI 做 PPT 时不再靠形容词猜审美，而是照参数执行。单文件 HTML，零依赖，MIT。',
  '',
  '这页是给模型看的。人用的界面在 ' + PAGES,
  '',
  '## 先读什么',
  '',
  '- 做 PPT / 幻灯片 / 汇报页 → 读 `' + PAGES + 'ai/spec.md`（约 13KB，10 套完整规格）。**光看本页做不出来，必须读它。**',
  '- 要一个能直接跑的页面骨架 → 取 `' + PAGES + 'ai/starter.html`。它的 `:root` 里有 16 个 `--ppt-*` 变量，与 spec.md 的令牌逐字对应，**整段替换**即可，不要逐个手调。',
  '- 要结构化数据（脚本 / MCP / 构建）→ `' + PAGES + 'ai/presets.json`',
  '- 被要求"给我一个方案" → 用 `' + PAGES + 'ai/prompt.txt` 里的话术',
  '',
  '**不要读 `ppt-aesthetic-forge.html`**：118KB 的交互界面，是给人点着用的，不是给模型读的规格。',
  '它的数据全部在上面三个文件里，体积小 95%。',
  '',
  '## 没说使用场合时怎么选',
  '',
  '用户往往只给主题、不说场合。按内容性质挑，不要靠颜色好不好看：',
  '',
  '- 说服投资人 / 高管 / 董事会 → `minimal`、`consulting`',
  '- 讲故事、有大量图片或品牌素材 → `editorial`',
  '- 科技产品、AI、数据平台、开发者大会 → `darktech`',
  '- 文化、文旅、节庆、东方题材 → `guochao`',
  '- 论文、课题、评审、基金申报 → `academic`',
  '- 政务、党建、年度总结、政策解读 → `gov`',
  '- 培训、课堂、工作坊、创意提案 → `hand`',
  '- 校园、社群、年轻品牌 → `pop`',
  '- 发布会、需要一句金句撑场 → `keynote`',
  '',
  '拿不准就 `consulting`（最不容易出错）或 `minimal`（最不挑内容）。',
  '',
  '## 执行规则',
  '',
  '- **整套** PPT 只用一套色板（11 个色板任选其一，不要跨方案混搭）；全篇最多两款字体；正文与辅助文字对比度 ≥ 4.5:1',
  '- 强调色只用于大字、图形、线条；政务金、糖果粉这类装饰色不要写小字',
  '- 画布固定 960×540；圆角 / 间距照给定值，不要放大',
  '- 10 套已按视觉家族去重，不要再造第 11 套',
  '',
  '## 10 套设计方案',
  '',
  ...rows.map(
    ({ design: d }, i) =>
      `- **${String(i + 1).padStart(2, '0')} ${d.name}** \`${d.id}\` — ${d.desc}；用在：${d.scene.split('、')[0]}等`,
  ),
  '',
  '## 可微调的五个维度',
  '',
  '方案定了以后，这五项可以单独换；每项的具体色值 / 效果见 spec.md 对应章节。',
  '',
  ...dims
    .filter((d) => !d.primary)
    .map((d) => `- ${d.name}（\`${d.id}\`）：${d.options.map((o) => o.id).join(' / ')}`),
  '',
  '## 可选入口',
  '',
  `- [交互界面](${PAGES}): 人用的选择器，选完复制提示词或导出 HTML 幻灯片`,
  `- [命令行](https://github.com/${REPO}#命令行): \`npx paf spec --design editorial --json\``,
  `- [MCP server](https://github.com/${REPO}#mcp): 4 个工具，接入支持 MCP 的 agent`,
  `- [Agent Skill](${RAW}skill/SKILL.md): 放进 skill 目录，agent 自动按场景选方案`,
  `- [源码](https://github.com/${REPO}): MIT，欢迎 PR`,
  '',
  '## 国内访问',
  '',
  'GitHub 直连不稳时，把上面所有 `' + PAGES + '` 换成 `' + CDN + '`（jsDelivr 镜像，同样路径）。',
  '',
  '想锁版本（下游批量生成时避免上游改动导致输出漂移），把 `@main` 换成 tag，例如 `@v' + pkg.version + '`。',
  '',
];

/* ---------- ai/prompt.txt（一段可直接粘给任何 AI 的话术） ---------- */

const shortFont = (id) => TYPE_ALIAS[id].name.split('·')[0].trim();

const promptTxt = [
  '帮我做一份 PPT，审美已经定好了，按这个执行。',
  '',
  '一、先读规格（约 13KB，10 套方案的完整令牌）',
  `${PAGES}ai/spec.md`,
  '',
  '二、用这个骨架（960×540，单文件零依赖，改令牌和文案就是成品）',
  `${PAGES}ai/starter.html`,
  '',
  '三、要求',
  '1. 按我的主题从这 10 套里挑一套，用一句话说明为什么是它。',
  '2. 把该方案那组 --ppt-* 令牌整段替换进 starter.html 的 :root，不要只改一两个值。',
  '3. 只用这套色板和这套字体；不加渐变、不加图标库、不改圆角。',
  '4. 输出一个可直接双击打开的 .html 文件，不要附说明文档。',
  '',
  '四、我的主题',
  '（在这里写主题、受众、要点、数据。不写就先用示例内容占位，版式别动。）',
  '',
  '',
  '────────────────────────────────────────────',
  '如果你的环境打不开网页，用下面这份最小规格自行近似，不要凭感觉配色：',
  '',
  ...rows.map(({ design: d, spec }) => {
    const c = spec.tokens.colors;
    return `${d.name} \`${d.id}\` — 底 ${c.bg} 字 ${c.text} 强调 ${c.accent} ${shortFont(spec.config.type.id)} ${spec.tokens.fonts.headWeight}｜${d.desc}`;
  }),
  '',
  '通用铁律：一页只用一套色板；全篇最多两款字体；正文对比度 ≥ 4.5:1（浅底不用浅灰字，深底不用深灰字）；画布固定 960×540，放不下就删要点，不要缩字号。',
  '',
  '更完整的令牌（含每个色板的表面色、辅助色、图表四色、圆角 / 边距 / 字号实测值）以 spec.md 为准。',
  '',
].join('\n');

/* ---------- 输出 ---------- */

mkdirSync(AI_DIR, { recursive: true });

const files = [
  [join(AI_DIR, 'presets.json'), JSON.stringify(presets, null, 2) + '\n'],
  [join(AI_DIR, 'spec.md'), specMd.join('\n')],
  [join(AI_DIR, 'prompt.txt'), promptTxt],
  [join(ROOT, 'llms.txt'), llms.join('\n')],
];

const check = process.argv.includes('--check');
let stale = 0;

for (const [path, content] of files) {
  let old = null;
  try {
    old = readFileSync(path, 'utf8');
  } catch {
    /* 文件不存在 */
  }
  if (old === content) {
    console.log(`  = ${path.replace(ROOT + '/', '').replace(ROOT + '\\', '')} 未变化`);
    continue;
  }
  if (check) {
    console.error(`  ! ${path} 与 HTML 不同步，请运行 node tools/gen-ai.mjs`);
    stale++;
    continue;
  }
  writeFileSync(path, content, 'utf8');
  console.log(`  + ${path.replace(ROOT + '/', '').replace(ROOT + '\\', '')} 已写入`);
}

if (check && stale) {
  console.error(`\n${stale} 个文件过期。`);
  process.exit(1);
}
console.log(`\n完成：${designs.length} 套方案 · v${pkg.version}`);
