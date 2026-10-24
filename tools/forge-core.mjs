/**
 * forge-core —— 把 ppt-aesthetic-forge.html 的「大脑」抽出来给程序用
 *
 * 设计原则：单一数据源。不复制、不重写任何方案数据，而是用 DOM 桩加载
 * HTML 里的脚本，直接复用其中的 OPTS / dnaCode / promptText / cssVarsText。
 * 好处是 HTML 改了这里自动跟着变，永远不会漂移；也不必把单文件拆成模块。
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
export const HTML_PATH = join(HERE, '..', 'ppt-aesthetic-forge.html');

export const DIM_KEYS = ['palette', 'type', 'graphics', 'texture', 'density'];

/* ---------- 最小 DOM 桩：只为让脚本能跑完初始化 ---------- */

function makeNode() {
  const node = {
    _children: [],
    _html: '',
    _cls: '',
    style: new Proxy({}, {
      get: (t, k) => (k === 'setProperty' ? () => {} : (t[k] ?? '')),
      set: (t, k, v) => { t[k] = v; return true; },
    }),
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {},
    textContent: '',
    appendChild(c) { node._children.push(c); return c; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
    addEventListener() {},
    closest() { return null; },
    setAttribute() {},
    removeAttribute() {},
    getAttribute() { return null; },
    toggleAttribute() {},
    cloneNode() { return makeNode(); },
    getBoundingClientRect() { return { width: 960, height: 540, top: 0, left: 0 }; },
    focus() {},
    remove() {},
    click() {},
    onclick: null,
  };
  Object.defineProperty(node, 'innerHTML', {
    get: () => node._html,
    set: (v) => { node._html = v; node._children = []; },
  });
  Object.defineProperty(node, 'className', {
    get: () => node._cls,
    set: (v) => { node._cls = v; },
  });
  return node;
}

function installGlobals() {
  const byId = new Map();
  const store = new Map();

  globalThis.document = {
    getElementById(id) {
      if (!byId.has(id)) byId.set(id, makeNode());
      return byId.get(id);
    },
    createElement() { return makeNode(); },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
    addEventListener() {},
    body: makeNode(),
    documentElement: makeNode(),
  };
  globalThis.window = globalThis;
  globalThis.location = { search: '', hash: '', href: 'http://localhost/', origin: 'http://localhost' };
  globalThis.addEventListener = () => {};
  globalThis.removeEventListener = () => {};
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  globalThis.requestAnimationFrame = (fn) => (typeof fn === 'function' ? 0 : 0);
  globalThis.cancelAnimationFrame = () => {};
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '0' });
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
}

/* ---------- 加载并缓存 ---------- */

let cached = null;

export function loadForge(htmlPath = HTML_PATH) {
  if (cached && htmlPath === HTML_PATH) return cached;

  const html = readFileSync(htmlPath, 'utf8');
  const open = html.indexOf('<script>');
  const close = html.lastIndexOf('</script>');
  if (open < 0 || close < 0) throw new Error('未找到内联脚本');
  const script = html.slice(open + 8, close);

  installGlobals();

  // 用 Function 构造（非严格模式），避免把脚本当模块解析
  const tail = `
;globalThis.__FORGE__ = {
  get S(){ return S; },
  get DEFAULT(){ return DEFAULT; },
  OPTS, DIMS, DIM_IDS, ATTR_KEYS, CONTENT,
  O, hexRGB, contrast, getMetrics, computeAttrs, harmony, gradeOf,
  dnaCode, promptText, cssVarsText, applyTheme,
};`;
  new Function(script + tail)();

  const F = globalThis.__FORGE__;
  if (!F) throw new Error('脚本加载失败：未导出内部状态');
  cached = F;
  return F;
}

/* ---------- DNA 解析（自己实现，避免依赖 UI 里的 toast） ---------- */

export function parseDna(code) {
  const raw = String(code || '').trim();
  const parts = raw.split(':');
  if (parts.length !== 8 || parts[0] !== 'AF') {
    throw new Error(`DNA 编码格式不正确，应为 AF:6段:4位，实际 ${parts.length} 段`);
  }
  const keys = ['genre', ...DIM_KEYS];
  const F = loadForge();
  keys.forEach((k, i) => {
    const v = parts[i + 1];
    if (!F.OPTS[k].some((o) => o.id === v)) {
      throw new Error(`DNA 里 ${k} 的取值「${v}」不存在`);
    }
  });
  const nums = parts[7].split('').map((c) => parseInt(c, 36));
  if (nums.some((n) => Number.isNaN(n))) throw new Error('DNA 末尾 4 位不是合法 base36');
  return {
    genre: parts[1],
    palette: parts[2],
    type: parts[3],
    graphics: parts[4],
    texture: parts[5],
    density: parts[6],
    accent: Math.round(nums[0] / 35 * 100),
    radius: Math.round(nums[1] / 35 * 100),
    ws: Math.round(nums[2] / 35 * 100),
    scale: Math.round(nums[3] / 35 * 100),
  };
}

/* ---------- 目录 ---------- */

export function listDesigns() {
  const F = loadForge();
  return F.OPTS.genre.map((d) => ({
    id: d.id,
    name: d.name,
    en: d.en,
    cat: d.cat,
    tpl: d.tpl,
    mood: d.mood,
    desc: d.desc,
    good: d.good,
    scene: d.scene,
    source: d.source,
    attrs: d.attrs,
    preset: d.s,
  }));
}

export function listDimensions() {
  const F = loadForge();
  return F.DIMS.map((d) => ({
    id: d.id,
    no: d.no,
    name: d.name,
    sub: d.sub,
    hint: d.hint,
    primary: d.id === 'genre', // 01 是主选择，其余 5 个是微调
    options: F.OPTS[d.id].map((o) => ({ id: o.id, name: o.name, desc: o.desc })),
  }));
}

/* ---------- 核心：给定选择，产出一份完整规格 ---------- */

export function specFor(sel = {}) {
  const F = loadForge();
  const S = F.S;

  // 1. 回到默认
  Object.assign(S, F.DEFAULT);

  // 2. 从 DNA 或设计方案起步
  if (sel.dna) {
    Object.assign(S, parseDna(sel.dna));
  } else if (sel.design) {
    const d = F.OPTS.genre.find((x) => x.id === sel.design);
    if (!d) {
      throw new Error(`没有叫「${sel.design}」的设计方案，可选：${F.OPTS.genre.map((x) => x.id).join(', ')}`);
    }
    F.applyTheme(d.s, d.id);
  }

  // 3. 逐维覆盖
  for (const k of DIM_KEYS) {
    const v = sel[k];
    if (v == null) continue;
    if (!F.OPTS[k].some((o) => o.id === v)) {
      throw new Error(`${k} 没有取值「${v}」，可选：${F.OPTS[k].map((o) => o.id).join(', ')}`);
    }
    S[k] = v;
  }
  for (const k of ['accent', 'radius', 'ws', 'scale']) {
    if (sel[k] == null) continue;
    const n = Number(sel[k]);
    if (!Number.isFinite(n) || n < 0 || n > 100) throw new Error(`${k} 必须是 0-100 的数字`);
    S[k] = Math.round(n);
  }

  // 4. 取值
  return buildSpec(F, sel);
}

function buildSpec(F, sel) {
  const S = F.S;
  const design = F.OPTS.genre.find((x) => x.id === S.genre);
  const pal = F.O('palette');
  const typ = F.O('type');
  const gfx = F.O('graphics');
  const tex = F.O('texture');
  const den = F.O('density');
  const m = F.getMetrics();
  const p = pal.c;
  const t = typ.f;

  return {
    schema: 'ppt-aesthetic-forge/spec@1',
    dna: F.dnaCode(),
    design: {
      id: design.id, name: design.name, en: design.en, cat: design.cat,
      template: design.tpl, mood: design.mood, desc: design.desc,
      good: design.good, scene: design.scene, source: design.source,
      attrs: design.attrs,
    },
    config: {
      palette: { id: pal.id, name: pal.name },
      type: { id: typ.id, name: typ.name },
      graphics: { id: gfx.id, name: gfx.name },
      texture: { id: tex.id, name: tex.name },
      density: { id: den.id, name: den.name },
      accent: S.accent, radius: S.radius, ws: S.ws, scale: S.scale,
    },
    tokens: {
      colors: {
        bg: p.bg, surface: p.surface, text: p.text, sub: p.sub,
        primary: p.primary, accent: p.accent,
        chart: p.chart.slice(),
      },
      fonts: {
        head: t.head, body: t.body, headWeight: t.w, headSpacing: t.ls,
      },
      metrics: {
        radiusPx: m.rad, padPx: m.pad, gapPx: m.gap,
        titleSizePx: Number(m.tsize), bodySizePx: Number(m.bsize),
      },
      cssVars: F.cssVarsText(),
    },
    contrast: {
      body: Number(F.contrast(p.text, p.bg).toFixed(2)),
      sub: Number(F.contrast(p.sub, p.bg).toFixed(2)),
      accent: Number(F.contrast(p.accent, p.bg).toFixed(2)),
      pass: F.contrast(p.text, p.bg) >= 4.5 && F.contrast(p.sub, p.bg) >= 4.5,
    },
    harmony: { score: F.harmony(), grade: F.gradeOf(F.harmony()) },
    prompt: F.promptText(),
    request: sel || {},
  };
}

/* ---------- 给 agent 直接读的 markdown 简报 ---------- */

export function briefMarkdown(spec) {
  const { design: d, config: c, tokens: tk, contrast: ct, dna } = spec;
  const sw = (hex, label) => `\`${hex}\` ${label}`;
  return [
    `## 设计方案：${d.name}${d.en ? `（${d.en}）` : ''}`,
    ``,
    `- **一句话**：${d.desc}`,
    `- **为什么用它**：${d.good}`,
    `- **适合场景**：${d.scene}`,
    `- **来源**：${d.source.replace(/^来源：/, '')}`,
    ``,
    `## 设计令牌`,
    ``,
    `| 角色 | 值 |`,
    `|---|---|`,
    `| 底色 | ${sw(tk.colors.bg, '')} |`,
    `| 面板 | ${sw(tk.colors.surface, '')} |`,
    `| 正文 | ${sw(tk.colors.text, '')} |`,
    `| 辅助文字 | ${sw(tk.colors.sub, '')} |`,
    `| 主色 | ${sw(tk.colors.primary, '')} |`,
    `| 强调色 | ${sw(tk.colors.accent, '')} |`,
    `| 图表色 | ${tk.colors.chart.map((h) => `\`${h}\``).join(' ')} |`,
    `| 标题字体 | ${tk.fonts.head} · ${tk.fonts.headWeight} 字重 · 字距 ${tk.fonts.headSpacing} |`,
    `| 正文字体 | ${tk.fonts.body} |`,
    `| 圆角 / 内边距 / 间距 | ${tk.metrics.radiusPx}px / ${tk.metrics.padPx}px / ${tk.metrics.gapPx}px |`,
    `| 标题 / 正文字号 | ${tk.metrics.titleSizePx}px / ${tk.metrics.bodySizePx}px |`,
    ``,
    `## 版式`,
    ``,
    `- 模板：\`${d.template}\`（氛围 ${d.mood}）`,
    `- 配色：${c.palette.name} · 字体：${c.type.name} · 图形：${c.graphics.name} · 密度：${c.density.name} · 质感：${c.texture.name}`,
    ``,
    `## 可读性`,
    ``,
    `- 正文对比度 ${ct.body}:1，辅助文字 ${ct.sub}:1，强调色 ${ct.accent}:1 → ${ct.pass ? '达标（WCAG AA）' : '未达标，需调整配色'}`,
    ``,
    `## 复现`,
    ``,
    `DNA 编码（可粘贴回捏脸台还原）：\`${dna}\``,
  ].join('\n');
}

export { makeNode, installGlobals };
