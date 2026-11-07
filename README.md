# 🏛️ MindOverSmoke (智熄)

> **经济学人风 · 前额叶认知阻断与良性承诺契约戒烟系统**  
> *A Minimalist Cognitive Intervention & Behavioral Economics Tool to Override Nicotine Cravings.*

[![Production](https://img.shields.io/badge/Production-royfree.men-8C1D24?style=flat-square&logo=cloudflare)](https://royfree.men/)
[![License](https://img.shields.io/badge/License-MIT-111827?style=flat-square)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square)](https://royfree.men/)

---

## 🌐 线上正式生产环境

* 官方永久域名：👉 **[https://royfree.men/](https://royfree.men/)**
* 网络基础设施：**Cloudflare Anycast CDN**（免翻墙、国内移动/联通/电信全网低延迟直连） + **GitHub Pages 双向自动化镜像分发**。
* 支持 PWA 离线安装至手机主屏幕或电脑桌面，秒级秒开。

---

## 🧠 核心科学原理与机制

### 1. 认知负荷理论 (Cognitive Load & Working Memory Disruption)
* **180 秒急性浪涌定律**：烟瘾在生理学上表现为边缘系统的多巴胺急性渴求浪涌，其峰值通常持续 3~5 分钟（180 秒）后自然消退。
* **前额叶强行占满**：大脑前额叶皮层的工作记忆容量极其有限（仅约 4~7 个信息块）。MindOverSmoke 拒绝让用户在戒烟时“干熬苦撑”，而是通过高强度的英美权威报刊反讽推理与英汉意象逆向转码，瞬间打满工作记忆，物理切断烟瘾冲动神经回路。

### 2. 三项 SOS 任务与题型轮换
每轮 SOS 固定有一项体力活动、一项「你真的没有其他事可做了吗？」生活反思，以及一项轮换挑战；三项顺序随机。

* **体力活动**：从俯卧撑、空击、卷腹等四项动作中抽取；换题仍是体力活动。
* **生活反思**：从工作、身体、关系、休息、成长五方面依次轮换，沿用“在自己能安排的时间里，留给该方面的时间够用吗”的问题。读完可直接继续，也可选写一句；不评分。
* **轮换挑战**：呼吸练习、古典诗词英译中、古典诗词中译英、英文完形填空、原创中文论断英译、电影台词背诵六种题型轮流出现。正常连续开始六轮 SOS 且不换题时，每种题型各出现一次；题型内部的题目用完一轮前不重复。

SOS 中连续点击「换下一题」会在尚未完成的类别间切换，跳过不算完成；被跳过的类别会备好另一道题。只剩一类未完成时，按钮改为「换一道同类题」；最后一项是反思时用「换一个方面」。[换题与进度方案](./docs/sos-skip-rotation-2026-11-06.md)。

诗词题共 100 道，英文完形共 100 道，原创中文论断英译现为 30 道。英译题是本站原创练习，并非《经济学人》原文；可自由输入后对照参考表达，不逐字判分。[题型设计与演变](./docs/economist-zh-to-en-2026-11-06.md)。日常精读每轮为五项任务，其中一项是生活反思，至少一项是思辨题。

电影台词背诵现收录 27 条，保留电影原声语言。看过台词后点击开始，原句隐藏 10 秒供自行背诵；到时可核对或再背一次，不录音评分。[台词任务规则](./docs/film-quote-recall-2026-11-07.md)。

本轮双语题库逐题审核结果见 [双语题库逐题审核记录](./BILINGUAL_REVIEW.md)。

### 3. 14 天无烟挑战（目前为免费体验）
* 正式计划拟收取 $20 计划费。14 个完整自然日内，每天结束后可在随后两个自然日内自报该日是否吸烟。自报无烟的日子申请 $1 原路退款，最多 $14；SOS 做题不影响资格。
* 吸烟或逾期未报的日子不退款，也不会取消之后日期的资格。全胜时平台保留 $6 **毛收入**；未返部分由平台保留，因此实际毛收入可能更高。自报并非客观核验。
* **当前网站未接入支付或退款**：免费体验中的金额只是规则演示，本地记录不是现金凭据，不会收取 $20 或退还 $1。正式开通须先完成服务端支付与退款接入，并公布完整条款。

### 4. 生活的一角
* 首页每次只展示工作、身体、关系、休息、成长中的一个方面，提问在自己能安排的时间里留给该方面的时间是否够用。同一天默认保持同一方面，可手动切换。
* 反思现在计入 SOS 的三项任务和日常精读的五项任务，每轮各出现一次；可换一个方面，无需填写或评分，点击继续即可推进。首页卡片仍可单独使用。
* 如想写，可以展开小输入区保存一句话，并在首页卡片中回看或删除。文字只保存在当前浏览器，清除浏览器数据后无法恢复。反思不影响 14 天无烟自报。

---

## 🎨 视觉美学：方案 A 极简墨白 (Minimalist Editorial Monolith)

致敬《The Economist》纸本装帧克制审美，让戒烟成为一次严肃、清醒且有智识尊严的心理重置：
* **纸张底色**：古典纸张米白 `#FAF8F5`
* **深墨文字**：深墨碳黑 `#111827`
* **发丝分界**：超细微发丝边框 `#E5E0D8`
* **重点点缀**：仅用微小的经济学人深红 `#8C1D24` 作为点睛之笔
* **完全剔除**：严禁彩虹渐变、浮夸彩屑漂浮与任何低幼游戏化插画。

---

## 📖 离线点击查词

在阅读复杂的英文批判长难句或古诗英译时，用户随时可以点击任意单词获得辅助：
1. **本地即时释义**：题干、Verdict 判词及英文参考译文的可点击单词均使用内置词库；当前词库约 3,400 条。释义卡展示已有的音标、词性与中文释义。
2. **发布前覆盖检查**：构建会检查这些可点击单词；缺少释义时构建失败，需先补词。连字符词组按单词分别点击，所有格可查询其基础词。
3. **原生划词**：保留浏览器原生文本选择能力，用户仍可使用自己的翻译工具。
4. **🔇 静音**：点击单词不自动发音。

---

## 🛠️ 项目目录全貌

```text
mind-over-smoke/
├── public/
│   ├── CNAME                       # 生产自定义域名 royfree.men
│   ├── manifest.json               # PWA 桌面/移动端清单
│   ├── sw.js                       # Service Worker (skipWaiting & Network-First)
│   └── icon.svg                    # 矢量图标
├── src/
│   ├── components/
│   │   ├── Header.jsx              # 经济学人纸质红标刊头与自报无烟天数
│   │   ├── SosPanicButton.jsx      # HERO 核心入口：3分钟阻断急救
│   │   ├── QuizModal.jsx           # 全功能阻断模态框 (答题、换题、180s退潮曲线、查词)
│   │   ├── ContractDashboard.jsx   # 14天承诺契约网格与提现结算面板
│   │   ├── BiologicalTracker.jsx   # 人体机能逆转时间轴与戒烟财务省钱器
│   │   ├── ReflectionCard.jsx      # 每次一个生活方面的可选反思卡
│   │   ├── ReflectionQuestion.jsx  # SOS 和日常精读中的生活反思任务
│   │   └── VocabModal.jsx          # 认知武器库：已收录的 GRE/SAT 高级生词本
│   ├── data/
│   │   ├── questions.json          # 100 道经济学人风格英文完形填空题
│   │   ├── economist_translation.json # 30 道原创中文论断英译题
│   │   ├── tang_translation.json   # 100 道古典诗词双向翻译题 (Mode 1 & Mode 2)
│   │   ├── physical_tasks.json     # 膝盖友好型上肢与核心抗阻运动
│   │   ├── breathing_tasks.json    # 4-7-8 箱式迷走神经重置深呼吸任务
│   │   └── fullDictionary.json     # 当前约 3,400 条离线词条
│   ├── utils/
│   │   ├── taskManager.js          # SOS 多模态任务智能配比与无缝换题调度器
│   │   ├── storage.js              # 契约进度、打卡记录与 SOS 会话抗刷新持久化
│   │   ├── reflection.js           # 出现频率、方面轮换与浏览器本地记录
│   │   └── phoneticDict.js         # 核心核心词汇音标检索字典
│   ├── App.jsx                     # 根应用：全局状态、模式路由与应急恢复
│   ├── index.css                   # 全局样式与 Scheme A 纸本排版规则
│   └── main.jsx                    # React 挂载入口与 Service Worker 注册
├── scripts/
│   ├── deploy_gh_pages.js          # 自动编译并推送到 mind-over-smoke (gh-pages)
│   ├── deploy_user_site.js         # 自动编译并推送到 devastatingroy.github.io (main)
│   ├── audit_deep.js               # 题库防剧透与数据完整性全自动审查
│   ├── build_full_dictionary.js    # 离线词库生成与音标丰富脚本
│   ├── verify_deployment.js        # 线上正式站点状态与资源校验
│   └── simulate_user.js            # Puppeteer 端到端自动化用户行为模拟
├── GEMINI.md                       # AI Agent 强制执行规范与操作铁律
├── PROJECT_REQUIREMENTS.md         # 完整产品需求规格说明书 (PRD v3.0)
├── AGENT_GUIDE.md                  # 后续 AI Agent 快速接手与协同指南
└── package.json
```

---

## 💻 本地开发与启动

### 环境要求
* Node.js >= 18.0.0
* npm >= 9.0.0

### 安装依赖
```bash
npm install
```

### 启动本地开发服务
```bash
npm run dev
```
启动后在浏览器访问控制台提示的本地地址（通常为 `http://localhost:5173/`）。

### 本地生产打包
```bash
npm run build
```
编译产物将安全输出至 `dist/` 目录。

---

## 🚀 生产部署法则 (Auto-Deployment)

本项目采用严格的**改动即部署**铁律。任何代码改动验证无误后，依次运行以下部署流水线：

```bash
# 1. 编译生产静态包
npm run build

# 2. 推送至当前仓库的 gh-pages 分支
node scripts/deploy_gh_pages.js

# 3. 同步推送至 devastatingroy.github.io 主站 main 分支 (Cloudflare Anycast 源站)
node scripts/deploy_user_site.js

# 4. 提交并同步源代码仓库
git add -A
git commit -m "feat/fix: your commit message"
git push origin master
```

---

## 🤝 开发者与 AI Agent 协作须知

本项目已全面建立标准化的 **AI Agent 接力开发规范**：
* 详细技术细节、状态机与题库新增契约见：👉 **[`AGENT_GUIDE.md`](./AGENT_GUIDE.md)**
* 完整产品设计决策与需求演进见：👉 **[`PROJECT_REQUIREMENTS.md`](./PROJECT_REQUIREMENTS.md)**
* 强制不可违反的执行铁律见：👉 **[`GEMINI.md`](./GEMINI.md)**

欢迎提出 PR 或 Issue，与我们一起用高级前额叶认知战胜原始边缘系统成瘾！
