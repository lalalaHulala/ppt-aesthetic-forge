#!/usr/bin/env node
/**
 * paf-mcp —— 把捏脸台做成 MCP server，任何支持 MCP 的 agent 都能直接调用
 *
 * 零依赖：手写 JSON-RPC 2.0 over stdio（MCP 的 stdio 传输就是换行分隔的 JSON）。
 * 注册方式（以 Claude Desktop 为例，claude_desktop_config.json）：
 *
 *   {
 *     "mcpServers": {
 *       "ppt-aesthetic-forge": {
 *         "command": "node",
 *         "args": ["C:/path/to/bin/paf-mcp.mjs"]
 *       }
 *     }
 *   }
 *
 * 注意：stdout 只能输出协议消息，所有日志走 stderr。
 */

import { listDesigns, specFor, briefMarkdown } from '../tools/forge-core.mjs';

const SERVER = { name: 'ppt-aesthetic-forge', version: '1.0.0' };
const PROTOCOL = '2024-11-05';

const DESIGN_ENUM = listDesigns().map((d) => d.id);

const TOOLS = [
  {
    name: 'list_design_presets',
    description:
      '列出 PPT 审美捏脸台收录的 10 套设计方案（极简/北欧、主题演讲、咨询报告、杂志编辑、暗色科技、新中式、学术答辩、政府汇报、文艺手绘、活泼波普）。每套附「好处」「适用场景」「来源」。当用户要做 PPT、幻灯片、演示文稿、汇报材料，但还没确定视觉风格时，先调这个。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_design_spec',
    description:
      '按设计方案产出完整的设计规格：精确色值（底色/面板/正文/辅助/主色/强调/图表色）、字体与字重、圆角间距字号、WCAG 对比度、版式模板名、以及可直接使用的提示词。当你需要为一份 PPT 定下视觉基调、或要写 PPT 生成代码时调用。',
    inputSchema: {
      type: 'object',
      properties: {
        design: {
          type: 'string',
          enum: DESIGN_ENUM,
          description: '设计方案 id。不确定就先用 list_design_presets 看一遍。',
        },
        palette: { type: 'string', description: '覆盖配色，如 mono / inkblue / earth / deepnavy / neon' },
        type: { type: 'string', description: '覆盖字体搭配，如 sans / serif / mono' },
        graphics: { type: 'string', description: '覆盖图形语言，如 line / block / glow / photo / datagrid' },
        texture: { type: 'string', description: '覆盖背景质感，如 clean / grid / ink / glass / neon' },
        density: { type: 'string', enum: ['airy', 'standard', 'dense'], description: '覆盖版式密度' },
        accent: { type: 'number', description: '强调色强度 0-100' },
        radius: { type: 'number', description: '圆角 0-100' },
        ws: { type: 'number', description: '留白强度 0-100' },
        scale: { type: 'number', description: '字号缩放 0-100' },
      },
      required: ['design'],
      additionalProperties: false,
    },
  },
  {
    name: 'apply_design_dna',
    description:
      '用一串 DNA 编码还原设计规格。DNA 形如 AF:keynote:inkblue:sans:photo:clean:airy:jeii，可跨设备、跨对话传递，粘一次就还原同一套审美。当用户给了你一段 AF: 开头的编码时调用。',
    inputSchema: {
      type: 'object',
      properties: { dna: { type: 'string', description: '形如 AF:xxx:xxx:xxx:xxx:xxx:xxx:xxxx 的编码' } },
      required: ['dna'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_style_prompt',
    description:
      '只取一段可直接粘贴给 AI PPT 工具（Kimi PPT / iSlide / Gamma / Genspark）的风格提示词，含设计令牌。当用户已经有内容、只想解决「AI 生成的 PPT 风格每次都不一样」的问题时调用。',
    inputSchema: {
      type: 'object',
      properties: {
        design: { type: 'string', enum: DESIGN_ENUM, description: '设计方案 id' },
        density: { type: 'string', enum: ['airy', 'standard', 'dense'], description: '可选：覆盖密度' },
      },
      required: ['design'],
      additionalProperties: false,
    },
  },
];

function text(s) {
  return { content: [{ type: 'text', text: typeof s === 'string' ? s : JSON.stringify(s, null, 2) }] };
}

function callTool(name, args) {
  switch (name) {
    case 'list_design_presets': {
      const rows = listDesigns();
      const lines = rows.map(
        (d) => `### ${d.name}（${d.id}）\n- 一句话：${d.desc}\n- 好处：${d.good}\n- 场景：${d.scene}\n- ${d.source}`
      );
      return text(`收录 ${rows.length} 套设计方案：\n\n${lines.join('\n\n')}`);
    }
    case 'get_design_spec': {
      if (!args?.design) throw new Error('缺少 design 参数');
      const spec = specFor(args);
      return text(`${briefMarkdown(spec)}\n\n---\n\n完整 JSON：\n\`\`\`json\n${JSON.stringify(spec, null, 2)}\n\`\`\``);
    }
    case 'apply_design_dna': {
      if (!args?.dna) throw new Error('缺少 dna 参数');
      const spec = specFor({ dna: args.dna });
      return text(`${briefMarkdown(spec)}\n\n---\n\n完整 JSON：\n\`\`\`json\n${JSON.stringify(spec, null, 2)}\n\`\`\``);
    }
    case 'get_style_prompt': {
      if (!args?.design) throw new Error('缺少 design 参数');
      const spec = specFor({ design: args.design, density: args.density });
      return text(spec.prompt);
    }
    default:
      throw new Error(`未知工具：${name}`);
  }
}

function handle(msg) {
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  try {
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: PROTOCOL,
          capabilities: { tools: {} },
          serverInfo: SERVER,
        },
      };
    }
    if (method === 'notifications/initialized' || method === 'initialized') return null;
    if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
    if (method === 'tools/list') return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
    if (method === 'tools/call') {
      const result = callTool(params?.name, params?.arguments || {});
      return { jsonrpc: '2.0', id, result };
    }
    if (isNotification) return null;
    return { jsonrpc: '2.0', id, error: { code: -32601, message: `不支持的 method: ${method}` } };
  } catch (e) {
    if (isNotification) return null;
    return { jsonrpc: '2.0', id, error: { code: -32603, message: e.message } };
  }
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      process.stderr.write(`[paf-mcp] 非法 JSON 行，已忽略\n`);
      continue;
    }
    const out = handle(msg);
    if (out) process.stdout.write(JSON.stringify(out) + '\n');
  }
});
process.stdin.on('end', () => process.exit(0));
process.stderr.write(`[paf-mcp] ${SERVER.name} v${SERVER.version} 就绪，${TOOLS.length} 个工具\n`);
