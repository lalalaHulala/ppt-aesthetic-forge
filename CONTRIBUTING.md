# 贡献指南

先说结论：这个项目**没有构建、没有依赖、没有测试框架**。改完刷新浏览器就是最新效果。

最欢迎的三类贡献：

1. **新增设计方案**（最有价值）
2. 修正某个方案在真实场景下的偏差（配色不对、版式不适合该场合）
3. 修 bug、改文案、补配图

---

## 本地跑起来

```bash
git clone https://github.com/lalalaHulala/ppt-aesthetic-forge.git
cd ppt-aesthetic-forge
# 直接双击 ppt-aesthetic-forge.html，
# 或者起本地服务（改完刷新更方便）
python -m http.server 8000
```

要求：现代浏览器（Chrome / Edge / Safari / Firefox 近两年的版本）。

---

## 新增一套设计方案

### 门槛（先自检，不满足就别提 PR）

- **视觉上必须和现有 10 套明显不同**。判断标准：把封面和内页截图并排放，别人能一眼说出区别。只是换配色、换字体的，不算新方案。
- **必须有可查的来源**。文献、公开课程、设计规范、知名机构的真实幻灯片都行，写在 `source` 字段里。
- **场景要具体**。"通用场合""各种汇报"这类描述不接受，写清楚是什么会、给谁看。

### 改动清单（4 个地方，缺一不可）

**① 数据**：在 `ppt-aesthetic-forge.html` 的 `OPTS.genre` 数组里追加一条（顺序决定列表顺序）：

```js
{id:'datajour', name:'数据新闻', en:'Data Journalism', cat:'business', tpl:'datajour', mood:'light',
 desc:'图表主导 · 注释叙事 · 细线分隔',
 good:'一句话说清这套为什么好——读者能得到什么。',
 scene:'适合什么场合，越具体越好。',
 source:'来源：xxx 规范 / xxx 课程',
 attrs:{impact:9,pro:15,warm:4,tech:9,culture:3},
 s:{palette:'inkblue',type:'sans',graphics:'datagrid',texture:'grid',density:'dense'}},
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一小写英文，会和 `tpl` 一起进 DNA 编码，**发布后不要再改** |
| `en` | 英文名，显示在右栏简介卡副标题，用 ` · ` 分隔 |
| `cat` | `classic` / `business` / `editorial` / `tech` / `human` / `formal` / `creative` 之一 |
| `tpl` | 模板类名后缀，对应 CSS 的 `.tp-<tpl>` |
| `mood` | `light`（浅底）/ `dark`（强制深色底）/ `ink`（宣纸底） |
| `attrs` | 五个属性 0–20，用于内部评分，别乱填 |
| `s` | 整套默认预设，值必须是下方各维度里**已存在**的 id |

**② 样式**：加一段 `.tp-<tpl>` CSS（放在其他 `tp-*` 区块附近），负责封面构图、内页结构、签名装饰。用已有的 CSS 变量（`--bg` `--text` `--accent` `--radius` `--pad` `--gap` `--tsize` …），不要写死颜色，否则配色维度会失灵。

**③ 列表图标**：`genreMini()` 里的 `icons` 对象加一个键，画个 38×26 的 SVG 小图（`fill="currentColor"`）。这是列表里唯一能让人不看文字就分辨方案的东西，别随便画个方块。

**④ 内页结构**（可选）：如果内页版式和现有分支都不同，在 `fillText()` 里加一个 `tpl === '<tpl>'` 分支。

### 预设值从哪选

```
palette :  inkblue 墨蓝商务 / deepnavy 深海军团 / mono 黑白极简 / neon 霓虹赛博 / earth 暖大地杂志
           redgold 红金政务 / forest 自然纪录 / terminal 终端暗绿 / candy 糖果渐变
           inkwash 水墨东方 / blackgold 黑金实验
type    :  sans 黑体 / serif 宋体 / round 圆体 / mono 等宽 / kai 楷体
graphics:  line 线性图标 / block 几何色块 / glow 渐变光晕 / photo 摄影留白 / hand 手绘涂鸦 / datagrid 数据网格
texture :  clean 纯净 / grid 网格线 / glass 玻璃拟态 / neon 霓虹辉光 / ink 水墨晕染
density :  airy 疏朗 / standard 标准 / dense 高信息
```

---

## 代码约定

- **保持单文件**。不引入打包器、不拆模块、不加 `<script src>`。这是这个项目最重要的特性。
- **不联网**。不加统计、不加字体 CDN、不加远程图片。要图标就画 SVG，要字体就用系统字体栈。
- **样式写在 `<style>` 里**，用已有的 CSS 变量，不要内联一堆 `style=""`。
- **数据集中在 `OPTS`**。改方案、加配色都只动数据，不要在渲染函数里硬编码 `if (genre === 'xxx')` 的长分支。
- 缩进 2 空格，单引号，语句结尾带分号（跟现有代码保持一致就行）。
- 中文文案用中文标点，术语后面可以跟英文对照。

---

## 提交前自检

- [ ] 双击打开，控制台无报错（F12 → Console）
- [ ] 新方案在列表里能点、能悬停预演、右栏简介正常
- [ ] 封面 / 内页 / 图表页三页都看一遍，文字没有被裁切、没有溢出
- [ ] 换成浅色和深色两套配色，样式都还成立
- [ ] 按 `Esc` 退出模式，按 `?` 帮助面板正常
- [ ] 导出 HTML 幻灯片能打开
- [ ] 没有新增网络请求（Network 面板确认）

---

## 提交 PR

- 一个 PR 只做一件事。加方案就只加方案，别顺手重构。
- 附截图：封面 + 内页，最好再附一张和其他方案的并排对比。
- 标题用中文，说清做了什么：`新增方案：数据新闻` / `修复：暗色科技下表格线看不见`。
- 如果是修 bug，写清楚复现步骤。

## 提 issue

用仓库自带的模板。提 bug 时请附：浏览器与版本、操作步骤、实际效果、期望效果，有截图最好。

参与本项目即表示同意遵守 [行为准则](CODE_OF_CONDUCT.md)。
