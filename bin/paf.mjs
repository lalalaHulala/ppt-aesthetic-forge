#!/usr/bin/env node
/**
 * paf —— ppt-aesthetic-forge 的命令行接口
 *
 * 给任何能执行命令的 agent / 脚本用：
 *   paf list
 *   paf spec --design keynote --json
 *   paf spec --design darktech --palette neon --md
 *   paf url '?g=editorial&a=80'
 *   paf dna AF:keynote:inkblue:sans:photo:clean:airy:...   （旧版编码，仍兼容）
 */

import { listDesigns, listDimensions, specFor, parseDna, briefMarkdown } from '../tools/forge-core.mjs';

const argv = process.argv.slice(2);

function parseArgs(list) {
  const out = { _: [] };
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (a === '--json') out.json = true;
    else if (a === '--md' || a === '--markdown') out.md = true;
    else if (a === '--prompt') out.prompt = true;
    else if (a === '--css') out.css = true;
    else if (a === '--dna') out.dnaOnly = true;
    else if (a === '--url') out.urlOnly = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = list[i + 1] && !list[i + 1].startsWith('--') ? list[++i] : 'true';
      out[key] = val;
    } else out._.push(a);
  }
  return out;
}

const HELP = `paf —— PPT 审美捏脸台 · 命令行

用法
  paf list                          列出 10 套设计方案
  paf list --json                   同上，JSON
  paf dims                          列出 5 个微调维度及全部取值
  paf spec --design <id>            产出一份规格（默认 markdown 简报）
  paf url '<链接或查询串>'           还原一条分享链接里的审美
  paf dna <编码>                    还原旧版 DNA 编码（已弃用，仅兼容）

spec / url 的选项
  --palette  <id>    配色   --type     <id>  字体
  --graphics <id>    图形   --texture  <id>  质感
  --density  <id>    密度   --accent   0-100
  --radius   0-100          --ws       0-100    --scale 0-100

输出格式（互斥，默认 markdown）
  --json            完整 JSON（给程序吃）
  --md              人读简报（给 agent 塞进上下文）
  --prompt          只要提示词
  --css             只要 CSS 变量
  --url             只要分享链接
  --dna             只要旧版 DNA 编码

例子
  paf spec --design consulting --json
  paf spec --design keynote --palette mono --density dense
  paf spec --design editorial --url
  paf url '?g=editorial&a=80&r=10'

退出码：0 成功，1 参数错误。`;

function die(msg) {
  process.stderr.write(`错误：${msg}\n`);
  process.exit(1);
}

function printList() {
  const rows = listDesigns();
  if (argv.includes('--json')) {
    process.stdout.write(JSON.stringify({ schema: 'ppt-aesthetic-forge/catalogue@1', designs: rows }, null, 2) + '\n');
    return;
  }
  const catName = {
    classic: '经典简约', business: '商务数据', editorial: '出版叙事',
    tech: '科技未来', human: '人文东方', formal: '严肃正式', creative: '创意表现',
  };
  process.stdout.write(`\n  ${rows.length} 套设计方案\n\n`);
  let last = null;
  for (const d of rows) {
    if (d.cat !== last) {
      process.stdout.write(`  ${catName[d.cat] || d.cat}\n`);
      last = d.cat;
    }
    process.stdout.write(`    ${d.id.padEnd(12)} ${d.name.padEnd(12)} ${d.desc}\n`);
    process.stdout.write(`    ${''.padEnd(12)} 适合：${d.scene}\n\n`);
  }
}

function printDims() {
  const rows = listDimensions();
  if (argv.includes('--json')) {
    process.stdout.write(JSON.stringify({ schema: 'ppt-aesthetic-forge/dimensions@1', dimensions: rows }, null, 2) + '\n');
    return;
  }
  for (const d of rows) {
    process.stdout.write(`\n  ${d.id}（${d.name}）\n`);
    for (const o of d.options) process.stdout.write(`    ${o.id.padEnd(14)} ${o.name.padEnd(12)} ${o.desc}\n`);
  }
  process.stdout.write('\n');
}

function run() {
  const a = parseArgs(argv);
  if (a.help || a._.length === 0) {
    process.stdout.write(HELP + '\n');
    return;
  }

  const cmd = a._[0];

  try {
    if (cmd === 'list') return printList();
    if (cmd === 'dims' || cmd === 'dimensions') return printDims();

    let sel;
    if (cmd === 'spec') {
      sel = {
        design: a.design,
        palette: a.palette,
        type: a.type,
        graphics: a.graphics,
        texture: a.texture,
        density: a.density,
        accent: a.accent,
        radius: a.radius,
        ws: a.ws,
        scale: a.scale,
      };
      if (!sel.design) die('spec 需要 --design <id>，可先跑 paf list');
    } else if (cmd === 'url') {
      const u = a._[1] || a.url;
      if (!u) die("url 需要一条链接或查询串，例如 '?g=editorial&a=80'");
      sel = { url: u };
    } else if (cmd === 'dna') {
      const code = a._[1] || a.code;
      if (!code) die('dna 需要一个编码，例如 AF:minimal:mono:sans:line:clean:airy:...');
      parseDna(code); // 提前抛错
      sel = { dna: code };
    } else {
      die(`未知命令「${cmd}」，可用：list / dims / spec / url / dna`);
    }

    // 过滤掉 undefined
    Object.keys(sel).forEach((k) => sel[k] === undefined && delete sel[k]);

    const spec = specFor(sel);

    if (a.json) {
      process.stdout.write(JSON.stringify(spec, null, 2) + '\n');
    } else if (a.prompt) {
      process.stdout.write(spec.prompt + '\n');
    } else if (a.css) {
      process.stdout.write(spec.tokens.cssVars + '\n');
    } else if (a.urlOnly) {
      process.stdout.write(spec.url + '\n');
    } else if (a.dnaOnly) {
      process.stdout.write(spec.dna + '\n');
    } else {
      process.stdout.write(briefMarkdown(spec) + '\n');
    }
  } catch (e) {
    die(e.message);
  }
}

run();
