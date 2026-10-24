# PPT 审美规格 · 10 套设计方案

> 由审美捏脸台 v1.3.0 自动生成，与 HTML 同源。最后更新 2026-10-24。

这份文件是给模型读的：**选一套，把「令牌」整组搬进页面，再填文案**。不需要看别的。
需要可直接运行的骨架，用同目录的 `starter.html`（960×540，零依赖）。

## 执行规则（比令牌更重要）

1. **一页一套色板**。不要把 A 方案的强调色挪到 B 方案里。
2. **全篇最多两款字体**，标题一款、正文一款，不引入第三款。
3. **正文对比度 ≥ 4.5:1**。浅底不要用浅灰字，深底不要用深灰字。每套的实测值见下方。
4. **强调色只用于大字、图形、线条**。政务金、糖果粉这类装饰色在底上对比度低，写成小字会糊。
5. **圆角、内边距、间距按给定值**，不要自行放大到 32px 圆角或 80px 边距。
6. **画布固定 960×540**。内容放不下就删要点，不要缩字号。
7. 方案已经按视觉家族去重，**不要自己再造第 11 套**。

## 字体映射

| id | 名称 | 标题字体栈 | 字重 | 字距 |
|---|---|---|---|---|
| `sans` | 黑体 · 现代 | `"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",sans-serif` | 800 | 0em |
| `serif` | 宋体 · 风骨 | `"Noto Serif SC","Songti SC","SimSun",serif` | 700 | 0.01em |
| `round` | 圆体 · 亲和 | `"HarmonyOS Sans SC","Yuanti SC","PingFang SC",sans-serif` | 700 | 0.01em |
| `mono` | 等宽 · 极客 | `"JetBrains Mono","Cascadia Code",Consolas,monospace` | 700 | -0.01em |
| `kai` | 楷体 · 写意 | `"Kaiti SC","STKaiti","KaiTi",serif` | 600 | 0.03em |

---

## 01 极简 / 北欧 · `minimal`

**高留白 · 单焦点 · 2-3 色**

- 用在：投资人路演、高管简报、产品发布等需要"少而有力"的正式场合。
- 好处：用大面积留白把注意力压到唯一焦点，信息噪音最低、最不费脑；全篇极易保持一致，显得克制专业。
- 版式：`minimal` / 浅色底 · 分类 classic · 来源 ppt-master「极简风 / 北欧极简」+ tyaward「极简设计」

```css
--ppt-bg:#FFFFFF; --ppt-surface:#FAFAFA;
--ppt-text:#111111; --ppt-sub:#6B6B6B;
--ppt-primary:#1A1A1A; --ppt-accent:#FF5A36;
--ppt-chart-1:#1A1A1A; --ppt-chart-2:#FF5A36; --ppt-chart-3:#9A9A9A; --ppt-chart-4:#D9D9D9;
--ppt-font-head:"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
--ppt-font-body:"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
--ppt-head-weight:800; --ppt-head-spacing:0em;
--ppt-radius:10px; --ppt-pad:58px; --ppt-gap:28px;
--ppt-title-size:47.8px; --ppt-body-size:21.8px;
```

字体 sans（标题 800 / 字距 0em） · 对比度 正文 18.88:1 / 辅助 5.33:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=minimal`

## 02 主题演讲 · `keynote`

**Hero 大字 · 高级留白**

- 用在：产品发布、TED 式主题演讲、品牌宣发等需要舞台感与金句的场合。
- 好处：超大标题配单张主视觉，情绪冲击强、记忆点集中；一页只讲一件事，节奏完全由演讲者掌控。
- 版式：`keynote` / 浅色底 · 分类 classic · 来源 ppt-master「Keynote 风 / 产品发布风」+ Gixo「Minimal White」

```css
--ppt-bg:#F5F7FA; --ppt-surface:#FFFFFF;
--ppt-text:#1B2A4A; --ppt-sub:#5B6B82;
--ppt-primary:#17324D; --ppt-accent:#2E6FDB;
--ppt-chart-1:#2E6FDB; --ppt-chart-2:#7FA8E8; --ppt-chart-3:#17324D; --ppt-chart-4:#B9CCE9;
--ppt-font-head:"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
--ppt-font-body:"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
--ppt-head-weight:800; --ppt-head-spacing:0em;
--ppt-radius:10px; --ppt-pad:58px; --ppt-gap:28px;
--ppt-title-size:47.8px; --ppt-body-size:21.8px;
```

字体 sans（标题 800 / 字距 0em） · 对比度 正文 13.25:1 / 辅助 5.06:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=keynote`

## 03 咨询报告 · `consulting`

**结论前置 · 单页单结论 · 克制配色**

- 用在：战略咨询、董事会汇报、经营复盘等"一页一个结论"的决策场合。
- 好处：结论写成标题、数据用单张图表说话，读者只读标题就能看完整个论证；克制配色让内容而非装饰承担说服力。
- 版式：`consulting` / 浅色底 · 分类 business · 来源 MBB 咨询规范（Minto 金字塔 / action title）+ Gixo「Consulting」

```css
--ppt-bg:#F5F7FA; --ppt-surface:#FFFFFF;
--ppt-text:#1B2A4A; --ppt-sub:#5B6B82;
--ppt-primary:#17324D; --ppt-accent:#2E6FDB;
--ppt-chart-1:#2E6FDB; --ppt-chart-2:#7FA8E8; --ppt-chart-3:#17324D; --ppt-chart-4:#B9CCE9;
--ppt-font-head:"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
--ppt-font-body:"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
--ppt-head-weight:800; --ppt-head-spacing:0em;
--ppt-radius:10px; --ppt-pad:32px; --ppt-gap:14px;
--ppt-title-size:31.2px; --ppt-body-size:15.6px;
```

字体 sans（标题 800 / 字距 0em） · 对比度 正文 13.25:1 / 辅助 5.06:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=consulting`

## 04 杂志编辑 · `editorial`

**大图叙事 · 非对称版式 · 衬线反差**

- 用在：品牌手册、生活方式产品、展览与人物专题等重视叙事质感的场合。
- 好处：大图当主体、非对称版式加衬线反差，像翻杂志一样有阅读节奏，能承载长故事与品牌调性。
- 版式：`editorial` / 浅色底 · 分类 editorial · 来源 ppt-master「杂志风 Editorial」+ Gixo「Vogue Lookbook」

```css
--ppt-bg:#F7F3EC; --ppt-surface:#FFFFFF;
--ppt-text:#2B2620; --ppt-sub:#716758;
--ppt-primary:#8A5A3B; --ppt-accent:#D96C3F;
--ppt-chart-1:#D96C3F; --ppt-chart-2:#8A5A3B; --ppt-chart-3:#C8A97E; --ppt-chart-4:#5C4A3A;
--ppt-font-head:"Noto Serif SC","Songti SC","SimSun",serif;
--ppt-font-body:"Noto Serif SC","Songti SC","SimSun",serif;
--ppt-head-weight:700; --ppt-head-spacing:0.01em;
--ppt-radius:10px; --ppt-pad:46px; --ppt-gap:20px;
--ppt-title-size:39.5px; --ppt-body-size:18.7px;
```

字体 serif（标题 700 / 字距 0.01em） · 对比度 正文 13.55:1 / 辅助 5.02:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=editorial`

## 05 暗色科技 · `darktech`

**深色底 · 霓虹点缀 · 未来感**

- 用在：科技产品发布、AI / 数据平台介绍、开发者大会等偏未来的场合。
- 好处：深色底配霓虹高光，天然带未来感；暗底让高饱和强调色特别跳，适合展示数据与产品界面。
- 版式：`darktech` / 深色底 · 分类 tech · 来源 ppt-master「暗色科技风 / 赛博朋克」+ Gixo「Dark Professional」

```css
--ppt-bg:#0B1526; --ppt-surface:#121E33;
--ppt-text:#E8EEF6; --ppt-sub:#8DA2B8;
--ppt-primary:#4D8DFF; --ppt-accent:#00D4FF;
--ppt-chart-1:#00D4FF; --ppt-chart-2:#4D8DFF; --ppt-chart-3:#2E5CBF; --ppt-chart-4:#17324D;
--ppt-font-head:"JetBrains Mono","Cascadia Code",Consolas,monospace;
--ppt-font-body:"JetBrains Mono","Cascadia Code",Consolas,monospace;
--ppt-head-weight:700; --ppt-head-spacing:-0.01em;
--ppt-radius:10px; --ppt-pad:46px; --ppt-gap:20px;
--ppt-title-size:39.5px; --ppt-body-size:18.7px;
```

字体 mono（标题 700 / 字距 -0.01em） · 对比度 正文 15.65:1 / 辅助 6.95:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=darktech`

## 06 新中式 · `guochao`

**水墨留白 · 朱砂点缀 · 传统纹样克制**

- 用在：文化传播、文旅推广、新消费品牌、节庆与政企文化项目。
- 好处：水墨留白配朱砂点缀，东方气质强、辨识度高；传统元素克制使用，避免"红配金"的俗气。
- 版式：`guochao` / 墨色 · 分类 human · 来源 ppt-master「新中式」+ slide-creator「Chinese Chan」

```css
--ppt-bg:#F5F2EB; --ppt-surface:#FFFFFF;
--ppt-text:#1A1A1A; --ppt-sub:#6E6E6E;
--ppt-primary:#1A1A1A; --ppt-accent:#B5451B;
--ppt-chart-1:#1A1A1A; --ppt-chart-2:#B5451B; --ppt-chart-3:#8A8577; --ppt-chart-4:#D8D2C4;
--ppt-font-head:"Kaiti SC","STKaiti","KaiTi",serif;
--ppt-font-body:"Kaiti SC","STKaiti","KaiTi",serif;
--ppt-head-weight:600; --ppt-head-spacing:0.03em;
--ppt-radius:10px; --ppt-pad:58px; --ppt-gap:28px;
--ppt-title-size:47.8px; --ppt-body-size:21.8px;
```

字体 kai（标题 600 / 字距 0.03em） · 对比度 正文 15.57:1 / 辅助 4.56:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=guochao`

## 07 学术答辩 · `academic`

**严格层级 · 编号 · 引用规范**

- 用在：论文答辩、学术会议、研究报告、基金申报等需要严谨可信的场合。
- 好处：层级严格、编号清晰、引用规范，经得起评审逐条追问；朴素排版让注意力留在论证本身。
- 版式：`academic` / 浅色底 · 分类 formal · 来源 ppt-master「学术答辩风」+ Gixo「Education Focus」

```css
--ppt-bg:#F5F7FA; --ppt-surface:#FFFFFF;
--ppt-text:#1B2A4A; --ppt-sub:#5B6B82;
--ppt-primary:#17324D; --ppt-accent:#2E6FDB;
--ppt-chart-1:#2E6FDB; --ppt-chart-2:#7FA8E8; --ppt-chart-3:#17324D; --ppt-chart-4:#B9CCE9;
--ppt-font-head:"Noto Serif SC","Songti SC","SimSun",serif;
--ppt-font-body:"Noto Serif SC","Songti SC","SimSun",serif;
--ppt-head-weight:700; --ppt-head-spacing:0.01em;
--ppt-radius:10px; --ppt-pad:46px; --ppt-gap:20px;
--ppt-title-size:39.5px; --ppt-body-size:18.7px;
```

字体 serif（标题 700 / 字距 0.01em） · 对比度 正文 13.25:1 / 辅助 5.06:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=academic`

## 08 政府汇报 · `gov`

**红蓝庄重 · 对称端正 · 标题加粗**

- 用在：政府汇报、党建宣传、年度总结、政策解读等正式政务场合。
- 好处：红蓝庄重、对称端正、标题加粗，传达权威与稳定；结构规整，便于大会宣读与层层汇报。
- 版式：`gov` / 浅色底 · 分类 formal · 来源 ppt-master「政府汇报风」+ Gixo「Atlas / Finance」

```css
--ppt-bg:#FFFFFF; --ppt-surface:#FBF6EE;
--ppt-text:#3A1F1F; --ppt-sub:#8A6A6A;
--ppt-primary:#C00000; --ppt-accent:#D4A843;
--ppt-chart-1:#C00000; --ppt-chart-2:#D4A843; --ppt-chart-3:#8A5A3B; --ppt-chart-4:#E8D9B8;
--ppt-font-head:"Noto Serif SC","Songti SC","SimSun",serif;
--ppt-font-body:"Noto Serif SC","Songti SC","SimSun",serif;
--ppt-head-weight:700; --ppt-head-spacing:0.01em;
--ppt-radius:10px; --ppt-pad:46px; --ppt-gap:20px;
--ppt-title-size:39.5px; --ppt-body-size:18.7px;
```

字体 serif（标题 700 / 字距 0.01em） · 对比度 正文 15.05:1 / 辅助 4.83:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=gov`

## 09 文艺手绘 · `hand`

**手绘线条 · 暖色纸感 · 涂鸦元素**

- 用在：课堂教学、培训工作坊、创意提案、zine 风格的个人表达。
- 好处：手绘线条配暖色纸感，亲切、有人味，能软化严肃内容；涂鸦元素帮观众建立记忆锚点。
- 版式：`hand` / 浅色底 · 分类 creative · 来源 ppt-master「文艺手绘」+ tyaward「活泼插画」

```css
--ppt-bg:#F7F3EC; --ppt-surface:#FFFFFF;
--ppt-text:#2B2620; --ppt-sub:#716758;
--ppt-primary:#8A5A3B; --ppt-accent:#D96C3F;
--ppt-chart-1:#D96C3F; --ppt-chart-2:#8A5A3B; --ppt-chart-3:#C8A97E; --ppt-chart-4:#5C4A3A;
--ppt-font-head:"HarmonyOS Sans SC","Yuanti SC","PingFang SC",sans-serif;
--ppt-font-body:"HarmonyOS Sans SC","PingFang SC",sans-serif;
--ppt-head-weight:700; --ppt-head-spacing:0.01em;
--ppt-radius:10px; --ppt-pad:58px; --ppt-gap:28px;
--ppt-title-size:47.8px; --ppt-body-size:21.8px;
```

字体 round（标题 700 / 字距 0.01em） · 对比度 正文 13.55:1 / 辅助 5.02:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=hand`

## 10 活泼波普 · `pop`

**高饱和大色块 · 粗描边 · 硬阴影**

- 用在：校园活动、社群营销、Z 世代品牌、创意竞赛等需要"抓眼球"的场合。
- 好处：高饱和大色块配粗描边与硬阴影，视觉冲击强、年轻有活力；几何元素让页面节奏感明显。
- 版式：`pop` / 浅色底 · 分类 creative · 来源 ppt-master「孟菲斯 / 波普风」+ tyaward「Digital Pop」

```css
--ppt-bg:#FDF4F8; --ppt-surface:#FFFFFF;
--ppt-text:#3D2A3A; --ppt-sub:#7E6076;
--ppt-primary:#FF6B9D; --ppt-accent:#7B61FF;
--ppt-chart-1:#FF6B9D; --ppt-chart-2:#7B61FF; --ppt-chart-3:#FFB3D1; --ppt-chart-4:#C4B5FD;
--ppt-font-head:"HarmonyOS Sans SC","Yuanti SC","PingFang SC",sans-serif;
--ppt-font-body:"HarmonyOS Sans SC","PingFang SC",sans-serif;
--ppt-head-weight:700; --ppt-head-spacing:0.01em;
--ppt-radius:10px; --ppt-pad:46px; --ppt-gap:20px;
--ppt-title-size:39.5px; --ppt-body-size:18.7px;
```

字体 round（标题 700 / 字距 0.01em） · 对比度 正文 12.24:1 / 辅助 5.09:1 · 链接 `https://lalalahulala.github.io/ppt-aesthetic-forge/?g=pop`

---

## 怎么用

```
1. 挑一套（按用户的主题和使用场合，别只看颜色好不好看）
2. 打开 ai/starter.html，把上面那组 --ppt-* 整段替换掉 :root 里的同名变量
3. 改三个 <section> 里的文字；深色方案把 --ppt-line 换成 rgba(255,255,255,.16)
4. 保存成 .html 交付，双击即可放映，也可直接打印成 PDF
```

完整机器可读数据：`ai/presets.json` · 更多说明：`https://lalalahulala.github.io/ppt-aesthetic-forge/llms.txt`
