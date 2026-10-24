/**
 * selftest —— 校验「大脑抽取层」与 HTML 保持一致
 *
 * 这个文件存在的意义：CLI / MCP / Skill 全部依赖 forge-core，
 * 而 forge-core 又依赖 HTML 里的 OPTS 与纯函数。任何一边改动导致对不上，
 * 这里会立刻失败，CI 会拦住。
 */

import { listDesigns, listDimensions, specFor, parseDna, briefMarkdown, loadForge } from './forge-core.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

let pass = 0;
let fail = 0;
const problems = [];

function check(name, fn) {
  try {
    const r = fn();
    if (r === false) throw new Error('返回 false');
    pass++;
  } catch (e) {
    fail++;
    problems.push(`${name} → ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/* ---------- 目录层 ---------- */

const designs = listDesigns();
const dims = listDimensions();

check('10 套设计方案', () => assert(designs.length === 10, `实际 ${designs.length}`));
check('id 唯一', () => assert(new Set(designs.map((d) => d.id)).size === designs.length, '有重复 id'));
check('模板唯一', () => {
  const s = new Set(designs.map((d) => d.tpl));
  assert(s.size === designs.length, `模板去重后只剩 ${s.size} 个`);
});
check('每套必备字段完整', () => {
  const bad = designs.filter((d) => !d.name || !d.en || !d.desc || !d.good || !d.scene || !d.source || !d.cat || !d.tpl || !d.mood || !d.preset);
  assert(bad.length === 0, `缺字段：${bad.map((d) => d.id).join(', ')}`);
});
check('6 个维度（1 主选择 + 5 微调）', () => {
  assert(dims.length === 6, `实际 ${dims.length}`);
  assert(dims.filter((d) => d.primary).length === 1, '主选择维度数量不对');
  assert(dims.filter((d) => !d.primary).length === 5, '微调维度数量不对');
});
check('每维至少 2 个取值', () => {
  const bad = dims.filter((d) => d.options.length < 2);
  assert(bad.length === 0, `取值过少：${bad.map((d) => d.id).join(', ')}`);
});

/* ---------- 规格层：10 套逐一生成 ---------- */

const specs = {};
for (const d of designs) {
  check(`spec: ${d.id}`, () => {
    const s = specFor({ design: d.id });
    assert(s.schema === 'ppt-aesthetic-forge/spec@1', 'schema 不对');
    assert(s.design.id === d.id, 'design id 回填错误');
    assert(s.tokens.colors.bg.startsWith('#'), '底色不是 hex');
    assert(s.tokens.colors.chart.length === 4, '图表色不是 4 个');
    assert(s.tokens.metrics.titleSizePx > s.tokens.metrics.bodySizePx, '标题字号应大于正文');
    assert(s.dna.startsWith('AF:'), 'DNA 前缀不对');
    assert(s.prompt.length > 200, '提示词过短');
    assert(s.tokens.cssVars.includes('--ppt-bg'), 'CSS 变量缺 --ppt-bg');
    assert(briefMarkdown(s).includes(d.name), '简报里没有方案名');
    specs[d.id] = s;
  });
}

check('10 套规格互不相同', () => {
  const uniq = new Set(Object.values(specs).map((s) => s.tokens.cssVars));
  assert(uniq.size === 10, `去重后只剩 ${uniq.size} 套`);
});

check('暗色方案底色确实深', () => {
  const s = specs.darktech;
  const hex = s.tokens.colors.bg.replace('#', '');
  const lum = (h) => parseInt(h, 16) / 255;
  const r = lum(hex.slice(0, 2)), g = lum(hex.slice(2, 4)), b = lum(hex.slice(4, 6));
  assert((r + g + b) / 3 < 0.3, `平均亮度 ${((r + g + b) / 3).toFixed(2)} 不够深`);
});

/* ---------- DNA 往返 ---------- */

check('DNA 往返稳定（编码字符串不变）', () => {
  for (let i = 0; i < 20; i++) {
    const d = designs[i % designs.length];
    const a = specFor({ design: d.id, density: i % 2 ? 'dense' : 'airy', accent: (i * 7) % 100 });
    const b = specFor({ dna: a.dna });
    assert(b.dna === a.dna, `${a.dna} → ${b.dna}`);
    const c = specFor({ dna: b.dna });
    assert(c.tokens.cssVars === b.tokens.cssVars, '二次往返后 CSS 变量仍应完全一致');
  }
});

check('DNA 量化误差 ≤ 1.5（4 个滑杆走 base36 单字符，36 档）', () => {
  for (let v = 0; v <= 100; v += 1) {
    const a = specFor({ design: 'minimal', accent: v, radius: v, ws: v, scale: v });
    const b = specFor({ dna: a.dna });
    for (const k of ['accent', 'radius', 'ws', 'scale']) {
      const diff = Math.abs(b.config[k] - v);
      assert(diff <= 1.5, `${k}: ${v} → ${b.config[k]}，偏差 ${diff}`);
    }
  }
});

check('parseDna 拒绝非法输入', () => {
  const bad = ['', 'AF:bad', 'XX:a:b:c:d:e:f:g', 'AF:nope:inkblue:sans:line:clean:airy:jeii'];
  for (const c of bad) {
    let threw = false;
    try { parseDna(c); } catch { threw = true; }
    assert(threw, `「${c}」应当报错却没报`);
  }
});

/* ---------- 覆盖层 ---------- */

check('逐维覆盖生效', () => {
  const base = specFor({ design: 'minimal' });
  const over = specFor({ design: 'minimal', density: 'dense', palette: 'mono' });
  assert(over.config.density.id === 'dense', '密度没覆盖上');
  assert(over.config.palette.id === 'mono', '配色没覆盖上');
  assert(over.dna !== base.dna, 'DNA 应当变化');
});

check('覆盖优先级高于预设', () => {
  const s = specFor({ design: 'editorial', palette: 'neon' }); // editorial 预设是 earth
  assert(s.config.palette.id === 'neon', '预设压过了显式覆盖');
});

check('非法取值会报错', () => {
  const cases = [
    { design: 'nope' },
    { design: 'minimal', palette: 'nope' },
    { design: 'minimal', density: 'nope' },
    { design: 'minimal', accent: 999 },
  ];
  for (const c of cases) {
    let threw = false;
    try { specFor(c); } catch { threw = true; }
    assert(threw, `应报错：${JSON.stringify(c)}`);
  }
});

/* ---------- 对比度 ---------- */

check('全部方案正文对比度 ≥ 4.5', () => {
  const bad = Object.values(specs).filter((s) => s.contrast.body < 4.5);
  assert(bad.length === 0, bad.map((s) => `${s.design.id}=${s.contrast.body}`).join(', '));
});

check('全部色板辅助文字对比度 ≥ 4.5', () => {
  // 辅助色承载大量正文（副标题、说明、脚注），不达标就是真实的可读性缺陷
  const F = loadForge();
  const bad = F.OPTS.palette
    .map((p) => ({ id: p.id, v: F.contrast(p.c.sub, p.c.bg) }))
    .filter((x) => x.v < 4.5);
  assert(bad.length === 0, bad.map((x) => `${x.id}=${x.v.toFixed(2)}`).join(', '));
});

/* ---------- 给 AI 的入口文件（防止 HTML 改了这三个文件没跟上） ---------- */

check('AI 入口文件齐全', () => {
  for (const f of ['llms.txt', 'ai/spec.md', 'ai/presets.json', 'ai/prompt.txt', 'ai/starter.html']) {
    assert(existsSync(join(ROOT, f)), `缺文件：${f}`);
    assert(read(f).length > 200, `文件过短：${f}`);
  }
});

check('spec.md 覆盖全部方案且带令牌', () => {
  const md = read('ai/spec.md');
  for (const d of designs) {
    assert(md.includes(`\`${d.id}\``), `spec.md 漏了 ${d.id}`);
  }
  assert((md.match(/--ppt-bg:/g) || []).length === designs.length, '每套方案都该有一组 --ppt-bg');
  assert(!md.includes('undefined'), 'spec.md 里有 undefined，说明取字段失败');
});

check('prompt.txt 覆盖全部方案', () => {
  const t = read('ai/prompt.txt');
  for (const d of designs) assert(t.includes(`\`${d.id}\``), `prompt.txt 漏了 ${d.id}`);
});

check('llms.txt 覆盖全部方案并指向规格', () => {
  const t = read('llms.txt');
  for (const d of designs) assert(t.includes(`\`${d.id}\``), `llms.txt 漏了 ${d.id}`);
  assert(t.includes('ai/spec.md'), 'llms.txt 没指向 ai/spec.md');
  assert(/不要读/i.test(t), 'llms.txt 应明确劝阻读主 HTML');
});

check('presets.json 结构完整', () => {
  const p = JSON.parse(read('ai/presets.json'));
  assert(p.designs.length === designs.length, '方案数不符');
  assert(p.entry && p.entry.pages && p.entry.spec, '缺 entry 入口字段');
  for (const d of p.designs) {
    assert(d.tokens?.cssVars?.includes('--ppt-bg'), `${d.id} 缺 cssVars`);
    assert(/^AF:/.test(d.dna), `${d.id} 的 DNA 不对`);
  }
});

check('starter.html 自带全部设计令牌', () => {
  const h = read('ai/starter.html');
  const vars = ['--ppt-bg', '--ppt-surface', '--ppt-text', '--ppt-sub', '--ppt-primary', '--ppt-accent',
    '--ppt-chart-1', '--ppt-chart-4', '--ppt-font-head', '--ppt-font-body', '--ppt-head-weight',
    '--ppt-radius', '--ppt-pad', '--ppt-gap', '--ppt-title-size', '--ppt-body-size'];
  for (const v of vars) assert(h.includes(`${v}:`), `starter.html 缺变量 ${v}`);
  assert((h.match(/<section class="page/g) || []).length === 3, '应为三页');
  assert(!/<script[^>]+src=|<link[^>]+href="http/.test(h), 'starter.html 不得引用外部资源');
});

check('主页面带 AI 引导注释与直达参数', () => {
  const h = read('ppt-aesthetic-forge.html');
  assert(h.includes('ai/spec.md'), 'HTML 头部没有指向 ai/spec.md');
  assert(h.includes('applyUrlState'), '缺 URL 深链逻辑');
  assert(h.includes("'embed'"), '缺 embed 模式');
  assert(h.includes('btnHandoff'), '缺「交给 AI」按钮');
});

/* ---------- 分享链接（取代旧版 DNA） ---------- */

check('每套方案的裸链接只有 ?g=，不带冗余维度', () => {
  for (const d of designs) {
    const u = specFor({ design: d.id }).url;
    const q = u.slice(u.indexOf('?') + 1);
    const keys = q.split('&').map((kv) => kv.split('=')[0]);
    assert(keys.length === 1 && keys[0] === 'g', `${d.id} 的链接带了多余参数：${q}`);
  }
});

check('常见用法下分享链接明显短于旧版 DNA', () => {
  // 现实分布：绝大多数人只选方案，少数人再拖一两根滑杆。
  // 极端情况（九个维度全改）链接会更长，但那不是真实用法，也不影响可用性。
  for (const d of designs) {
    const bare = specFor({ design: d.id });
    const withSliders = specFor({ design: d.id, accent: 99, radius: 1 });
    const qBare = bare.url.slice(bare.url.indexOf('?')).length;
    const qSlide = withSliders.url.slice(withSliders.url.indexOf('?')).length;
    assert(qBare <= 20, `${d.id} 只选方案却要 ${qBare} 字符`);
    assert(qSlide < withSliders.dna.length + 14, `${d.id} 改滑杆后链接 ${qSlide} 字符，不比 DNA 省`);
  }
});

check('分享链接往返还原（10 套 × 全维度覆盖）', () => {
  for (const d of designs) {
    const a = specFor({ design: d.id, palette: 'candy', type: 'serif', graphics: 'block', texture: 'ink', density: 'airy', accent: 20, radius: 90, ws: 10, scale: 70 });
    const b = specFor({ url: a.url });
    assert(JSON.stringify(a.config) === JSON.stringify(b.config),
      `${d.id} 还原不一致：\n  ${JSON.stringify(a.config)}\n  ${JSON.stringify(b.config)}`);
    assert(a.url === b.url, `${d.id} 二次生成的链接漂移`);
  }
});

check('分享链接只含 URL 安全字符', () => {
  for (const d of designs) {
    const u = specFor({ design: d.id }).url;
    assert(!/[^\w:\/.\-?&=]/.test(u), `${d.id} 的链接含非法字符：${u}`);
  }
});

check('旧版 DNA 仍可解析，并转成分享链接', () => {
  const cases = [
    'AF:minimal:mono:sans:line:clean:airy:jeii',
    'AF:darktech:deepnavy:mono:glow:grid:standard:jeii',
    'AF:guochao:inkwash:kai:hand:ink:airy:jeii',
  ];
  for (const code of cases) {
    const s = specFor({ dna: code });
    assert(s.url.includes('?g=' + s.design.id), `${code} 没转成链接`);
    assert(parseDna(code).genre === s.design.id, `${code} 设计方案解析错`);
  }
});

check('垃圾输入不会静默套用', () => {
  const F = loadForge();
  for (const bad of ['', '   ', 'hello', '?g=', '?g=nope', 'AF:minimal', 'AF:minimal:mono:sans:line:clean:airy:!!', '?a=abc']) {
    const v = F.parseShare(bad);
    assert(v === null || v.genre === undefined, `「${bad}」被误判为有效`);
  }
});

check('提示词不再输出 DNA 密文', () => {
  for (const d of designs) {
    const s = specFor({ design: d.id });
    assert(!/AF:/.test(s.prompt), `${d.id} 的提示词里仍有 DNA 串`);
    assert(s.prompt.startsWith('【设计方案】'), `${d.id} 的提示词首行不是方案名`);
  }
});

check('页面不再向用户暴露 DNA 字样', () => {
  const h = read('ppt-aesthetic-forge.html');
  assert(!h.includes('复制 DNA'), '按钮仍在让用户复制 DNA');
  assert(!h.includes('导出 DNA'), '菜单仍在导出 DNA');
  assert(h.includes('btnCopyShare'), '缺「复制链接」按钮');
  assert(h.includes('btnCopyEmbed'), '缺「嵌入码」按钮');
  assert(h.includes('shareUrl'), '缺 shareUrl 实现');
});

/* ---------- 结果 ---------- */

if (fail) {
  process.stderr.write(`\n失败 ${fail} / 共 ${pass + fail}\n`);
  problems.forEach((p) => process.stderr.write(`  ✗ ${p}\n`));
  process.exit(1);
}
process.stdout.write(`全部通过：${pass} 项检查 · ${designs.length} 套方案 · ${dims.length} 个维度\n`);
