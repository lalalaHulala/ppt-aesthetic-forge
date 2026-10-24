---
name: ppt-aesthetic-forge
description: 当用户要做 PPT、幻灯片、演示文稿、汇报材料、路演 deck、课件，或抱怨「AI 生成的 PPT 风格每次都不一样」「不知道该怎么描述我想要的风格」「能不能统一一下配色」时使用。提供 10 套经互联网调研去重的设计方案，以及可直接消费的结构化设计令牌（精确色值、字体、字号、间距、WCAG 对比度）。不联网、不装依赖、输出确定。
---

# PPT 审美捏脸台 · Agent Skill

## 这个 skill 解决什么问题

用户说"做个高级感的 PPT"，AI 通常只会产出一套随机配色的模板。真正缺的不是模板，是**一份机器可读的审美规格**：底色到底哪个 hex、标题字重多少、正文和背景的对比度够不够、卡片圆角几像素。

这个 skill 把"模糊的审美描述"翻译成"确定的设计令牌"，然后再交给下游的生成环节。

## 什么时候用

- 用户要做 PPT / 幻灯片 / 汇报材料，但没指定视觉风格
- 用户要你写生成 PPT 的代码（HTML / pptxgenjs / reveal.js），需要具体数值
- 用户已有的 AI PPT 工具产出风格漂移，需要一段稳定的风格提示词
- 用户给你一串 `AF:` 开头的编码，要你还原那套审美

## 怎么用

不需要安装任何依赖，只要有 Node 18+。在仓库根目录执行：

```bash
node bin/paf.mjs list                  # 看 10 套方案（含好处与适用场景）
node bin/paf.mjs spec --design keynote # 出一份规格（markdown 简报，适合塞进上下文）
node bin/paf.mjs spec --design keynote --json   # 完整 JSON，适合程序消费
node bin/paf.mjs spec --design darktech --prompt # 只要提示词，适合贴给 AI PPT 工具
node bin/paf.mjs dna AF:keynote:inkblue:sans:photo:clean:airy:jeii  # 从编码还原
```

如果本仓库不在当前目录，先定位：`find / -name "paf.mjs" -path "*bin*" 2>/dev/null`。

## 标准工作流

1. **先看清楚有哪些方案**：跑 `paf list`。不要凭印象编造风格名。
2. **按用户场景挑一套**，判断依据是每套的「适合场景」字段，不是名字好听不好听。
   - 路演 / 高管简报 → `minimal` 或 `keynote`
   - 咨询 / 董事会 / 经营复盘 → `consulting`
   - 品牌 / 长故事 / 人物专题 → `editorial`
   - 科技产品 / AI / 开发者大会 → `darktech`
   - 文化 / 文旅 / 节庆 → `guochao`
   - 论文答辩 / 学术会议 → `academic`
   - 政务 / 党建 / 汇报 → `gov`
   - 课件 / 手账 / 生活内容 → `hand`
   - 活动 / 年轻向 / 社媒 → `pop`
3. **生成规格**：`paf spec --design <id> --json`。
4. **确认可读性**：读 `contrast.pass`。为 false 时告知用户当前配色对比度不足，换一套配色（`--palette`）。
5. **交付**，三种下游任选：
   - 用户要 AI PPT 工具出图 → 把 `prompt` 字段整段给用户，让他贴进 Kimi PPT / iSlide / Gamma
   - 用户要你写代码 → 用 `tokens.colors` / `tokens.metrics` / `tokens.cssVars` 里的确切数值，不要自己猜
   - 用户要你复现同一套审美 → 用 `dna` 字段

## 输出里的关键字段

| 字段 | 用途 |
|---|---|
| `design.good` | 这套方案为什么好，可直接转述给用户 |
| `design.scene` | 适用场景，用来解释"为什么推荐这套" |
| `tokens.colors` | 精确 hex：bg / surface / text / sub / primary / accent / chart[4] |
| `tokens.fonts` | 标题与正文字体栈、字重、字距 |
| `tokens.metrics` | 圆角、内边距、间距、标题字号、正文字号的**具体像素值** |
| `tokens.cssVars` | 一段可直接粘进 `<style>` 的 `:root{}` |
| `contrast` | WCAG 实测值，`pass` 为 false 时必须提示用户 |
| `dna` | 可跨会话传递的编码 |

## 微调（可选）

除设计方案外还有 5 个维度可以覆盖，用参数传给 `spec`：

- `--palette`：配色（mono 单色 / inkblue 墨蓝 / earth 大地 / deepnavy 深海军 / neon 霓虹 …）
- `--type`：字体（sans 黑体 / serif 衬线 / mono 等宽 …）
- `--graphics`：图形语言（line / block / glow / photo / datagrid …）
- `--density`：密度（airy 疏朗 / standard 标准 / dense 密集）
- `--texture`：质感（clean / grid / ink / glass / neon）

不传就用该方案自带的预设。全部合法取值跑 `paf dims`。

## 注意事项

- **不要自己发明设计风格**。这个 skill 的 10 套是调研 + 去重后的结果，编新的会破坏一致性。
- **DNA 编码有量化误差**：末尾 4 位走 base36 单字符（36 档），4 个微调滑杆往返误差 ≤ 1.5%。不影响视觉。
- 规格里的字体是**字体栈**（含降级），不是单个字体名。生成代码时整串保留。
- 只做"定风格"，不做"写内容"。用户要大纲和文案，那是另一件事。
