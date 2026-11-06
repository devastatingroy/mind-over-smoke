# 🤖 MindOverSmoke (智熄) - AI Agent 接手与协同开发指南 (Agent Handover Manual)

> **适用对象**：后续接手本项目进行功能迭代、Bug 修复、样式调整或题库扩展的任何 AI 编程智能体（如 Gemini、Claude、GPT、DeepSeek 等）及人类开发者。  
> **生产官网**：`https://royfree.men/`  
> **最后更新**：2026-11-05 (v3.0 Handover Edition)

---

## 1. 30 秒极速全景认知 (Executive Context)

* **项目定位**：一款融合**认知负荷理论 (Cognitive Load Theory)**、**迷走神经重置**与**14 天无烟自报挑战（正式计划拟 $20、无烟日返 $1）**的《经济学人》风格戒烟微干预 Web 应用 / PWA。目前只有免费体验，没有真实收退款。
* **核心战场**：拦截烟瘾来袭时的 **180 秒急性渴求浪涌 (Craving Wave)**。通过“躯体动作/深呼吸 ➔ 传世名篇英汉翻译挑战 ➔ 《经济学人》批判反讽精读”三阶段，强行占满前额叶工作记忆，阻断边缘系统多巴胺反射回路。
* **视觉流派**：**方案 A 极简墨白 (Minimalist Editorial Monolith)**——纸张米白 `#FAF8F5`、深墨碳黑 `#111827`、超细发丝边框 `#E5E0D8`、克制经济学人红 `#8C1D24`，摒弃所有彩色标签与花哨动效。
* **部署架构**：Cloudflare Anycast CDN（代理加速与国内直连） + GitHub Pages 双向分发（`devastatingroy.github.io` 主站 + `mind-over-smoke` 仓库分支）。

---

## 2. ⚡ 铁律：接盘 Agent 必须严格恪守的 4 大法则

作为接手本项目的 Agent，你的每一次任务交付必须无条件执行以下准则：

### 法则 1：绝对自动化全套部署 (Strict Auto-Deployment)
**严禁等待用户提醒或催促部署**。凡是涉及任何代码调整、Bug 修复、文案优化或题库补充，本地构建验证无误后，**必须在同一次会话回复前按顺序自动执行全部 4 步部署**：
```bash
# 1. 生产编译
npm run build

# 2. 同步至项目分支 (gh-pages)
node scripts/deploy_gh_pages.js

# 3. 同步至用户 GitHub Pages 根域名主站 (main)
node scripts/deploy_user_site.js

# 4. 提交并同步源代码仓库
git add -A
git commit -m "your descriptive commit message"
git push origin master
```
并在最终回复中明确汇报部署已生效，生产地址为 `https://royfree.men/`。

### 法则 2：拒绝任何临时替代方案 (Zero Temporary Solutions)
* **生产环境唯一永久域名**为：**`https://royfree.men/`**。
* **严禁**再次引入、提及或启动任何临时穿透工具（如 `trycloudflare.com`、Ngrok、Localtunnel 等）。
* `public/CNAME` 必须永远保持为 `royfree.men`。

### 法则 3：后台驻留进程绝对清零 (Zero Background Daemons)
* Agent 执行的所有命令行任务、测试脚本或 Dev Server，在回复用户之前**必须彻底清理/终止**。
* 确保 Agent 的 `manage_task` 状态始终为 `No background tasks are currently running`，严禁在宿主电脑后台残留无谓进程。

### 法则 4：认知阻断标准与坚决杜绝低质题 (Zero Trivial Cloze)
* **严禁在题库中出现任何“中文古诗单字填空”式的傻瓜题**（如“长风破浪会有时，直挂云帆济____”）。母语者会无意识触发肌肉记忆，完全起不到前额叶认知阻断效果。
* **Mode 1（英译逆向还原）**：**严禁出选择题（Zero Multiple Choice）**。严禁给出中文选项供反向认读；通过与答案范围对应的参考英译自主回忆中文原诗，提供【🎯 我想到了 · 揭晓原诗对照】与【❓ 暂时想不出 · 直接看答案】。无可核实出处时，不署名具体译者。
* **Mode 2（汉诗英译填空）**：自行输入英文译文，与参考译本对照；允许点击看答案，不用选择题或逐字匹配判分。
* **经济学人题**：统一使用语境完形填空；正确选项分散于四个位置，选错先提示重试，不直接揭晓。
* **题干防剧透**：题干和提示语严禁直接泄露答案中文原句或英文词汇。
* **查词静音原则**：查词弹窗仅展示国际音标（IPA）与简要释义，**严禁自动触发任何发音朗读**。

---

## 3. 代码库全景地图 (Architecture & File Mapping)

```text
mind-over-smoke/
├── public/
│   ├── CNAME                       # 绑定生产域名: royfree.men
│   ├── manifest.json               # PWA 清单文件 (支持独立窗口安装)
│   ├── sw.js                       # 强效 Service Worker (支持 skipWaiting 与 Network-First)
│   └── icon.svg                    # 经济学人极简红墨质感图标
├── src/
│   ├── components/
│   │   ├── Header.jsx              # 顶部刊头：经济学人经典深红标识、自报无烟天数
│   │   ├── SosPanicButton.jsx      # HERO 区域：三分钟急救阻断入口及状态提示
│   │   ├── QuizModal.jsx           # 核心认知阻断模态框：多模态答题器、180s 潮退曲线、音标查词浮层
│   │   ├── ContractDashboard.jsx   # 14 天无烟自报网格和免费体验说明
│   │   ├── BiologicalTracker.jsx   # 人体机能逆转时间轴与戒烟财务节省计算器
│   │   └── VocabModal.jsx          # 生词与金句武器库：回顾做题积累的 SAT/GRE 词汇
│   ├── data/
│   │   ├── questions.json          # 100 题《经济学人》反讽与商业逻辑完形填空题
│   │   ├── tang_translation.json   # 100 题古典诗词双向翻译题 (50 题 Mode 1 + 50 题 Mode 2)
│   │   ├── physical_tasks.json     # 膝盖友好型躯体动作题 (俯卧撑、空击等)
│   │   ├── breathing_tasks.json    # 4-7-8 箱式迷走神经重置深呼吸任务
│   │   └── fullDictionary.json     # 当前约 3,400 条离线词条
│   ├── utils/
│   │   ├── taskManager.js          # SOS 与训练模式的任务抽取、类别配比、动态换题算法
│   │   ├── storage.js              # 契约进度、打卡记录、SOS 急救会话崩溃持久化
│   │   └── phoneticDict.js         # 经济学人常考核心高阶词汇音标表 (与 fullDictionary 互补加速)
│   ├── App.jsx                     # 根组件：全局状态管控、路由/模式切换、紧急会话恢复
│   ├── index.css                   # Tailwind 基础导入与 Scheme A 自定义工具类
│   └── main.jsx                    # React 挂载点与 Service Worker 注册
├── scripts/
│   ├── deploy_gh_pages.js          # 自动分发至本仓库 gh-pages 分支
│   ├── deploy_user_site.js         # 自动分发至 devastatingroy.github.io main 分支
│   ├── audit_deep.js               # 题库防剧透、空格格式、选项完整度深度审计脚本
│   ├── build_full_dictionary.js    # 离线词库构建与音标丰富脚本
│   ├── verify_deployment.js        # 自动化线上真实站点抓取与状态校验脚本
│   └── simulate_user.js            # 无头浏览器端到端行为自动化模拟脚本
├── GEMINI.md                       # 核心执行规范与操作铁律
├── PROJECT_REQUIREMENTS.md         # 完整产品需求规格书与架构决策总览 (PRD)
├── AGENT_GUIDE.md                  # 本文档 (AI Agent 开发与交接全指南)
└── package.json                    # 依赖配置与 Vite 编译指令
```

---

## 4. 核心工作流与状态机 (State Machine & Lifecycles)

### 4.1 SOS 急救三维组卷策略 (`src/utils/taskManager.js`)
每次用户点击【🚨 烟瘾急救 · 3分钟阻断 (SOS)】时，系统必须组装 3 个互不相同且跨越不同感知维度的任务：
1. **维度 1（生理重置）**：随机抽取 1 个躯体发力动作（保留俯卧撑，移除平板支撑）或 1 个 4-7-8 迷走神经呼吸。
2. **维度 2（英汉跨语种意象转码）**：随机抽取 1 个诗词翻译挑战（Mode 1 英译逆向还原 或 Mode 2 汉诗英译填空）。
3. **维度 3（高阶思维批判精读）**：随机抽取 1 个《经济学人》批判阅读或词汇完形填空。
4. **动态换题机制 (`handleSwapTask`)**：用户可在题目上方或下方点击【换下一题】，算法优先从不同类别的候选池中无刷新替换当前题目，并将题目内容滚动回顶部。

### 4.2 会话崩溃恢复机制 (`src/utils/storage.js`)
* **痛点**：用户在急救 180 秒倒计时期间，若手滑刷新页面或切换应用，倒计时和题目绝不能丢失！
* **实现**：
  - `saveActiveSession({ mode, questions, currentIndex, secondsLeft })` 实时写入 `localStorage`。
  - `App.jsx` 初始化时通过 `getSavedSession()` 自动 re-hydrate。
  - 只有在三道题全答完并点击【结算胜利】后，调用 `clearActiveSession()` 清除草稿。

### 4.3 点击查词与音标系统交互准则
1. **离线查词与覆盖检查**：
   - 题干、Verdict 判词和英文参考译文共用 `wordTokens.js` 的分词规则与本地词库。
   - 构建前运行 `scripts/verify_dictionary.js`；当前可点击词缺少释义时禁止发布。新词用 `scripts/build_full_dictionary.js` 补全，专名语境覆盖写在 `dictionaryOverrides.json`。
   - 保留浏览器原生文本选取能力，不拦截用户自带的划词翻译工具；客户端当前没有在线词典请求。
2. **静音铁律**：弹窗只呈现 IPA 国际音标、词性与精炼释义，**绝对静音**，杜绝任何自动音频打扰。

---

## 5. 题库数据规范与新增准则 (Data Schemas)

新增或修改题目必须符合以下 JSON 契约：

### 5.1 诗词翻译题 (`src/data/tang_translation.json`)
```json
{
  "id": "trans_101",
  "category": "translation",
  "type": "translation",
  "mode": "en_to_zh",           // "en_to_zh" (Mode 1) 或 "zh_to_en" (Mode 2)
  "theme": "英译逆向猜唐诗 · 意象转码挑战",
  "difficulty": "medium",
  "author": "唐 · 杜甫",
  "title": "《春望》",
  "translator": "参考英译（意译）",
  "english_text": "The country is broken, yet mountains and rivers remain;\nIn the city spring arrives, with grass and trees growing deep.",
  "prompt": "解读上方英译中的核心意象群，调动前额叶记忆：你能逆向还原杜甫写下的是哪句诗吗？", // 严禁出现中文原句!
  "correct_answer": "国破山河在，城春草木深",
  "options": [                  // 仅 Mode 1 的旧数据保留此字段；两个模式前端均不展示选项
    "国破山河在，城春草木深",
    "感时花溅泪，恨别鸟惊心"
  ],
  "full_verse": "国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。",
  "mapping": [                  // 揭晓后中英对仗意象映射
    { "en": "The country is broken", "zh": "国破" },
    { "en": "mountains and rivers remain", "zh": "山河在" }
  ],
  "science_note": "纯净英文意象转码激活古诗长时记忆，强行占满前额叶工作记忆。",
  "punchline": "杜甫经历山河破碎尚且笔耕不辍，今日你身体的健康山河尚在，何苦自愿给烟草公司进贡破财？"
}
```

### 5.2 经济学人题 (`src/data/questions.json`)
```json
{
  "id": "q101",
  "type": "cloze",              // 不再使用 true_false
  "theme": "Behavioral Addiction",
  "passage": "Big Tobacco relies on cognitive ________ to maintain sales.",
  "blank": "dissonance",
  "options": ["dissonance", "clarity", "euphoria", "prudence"],
  "hint": "Noun: psychological tension from contradictory beliefs",
  "first_letter": "d",
  "punchline": "Smoking rationalizations are high-interest loans taken out against your intelligence.",
  "vocab": {
    "word": "dissonance",
    "phonetic": "/ˈdɪsənəns/",
    "meaning": "n. 不一致，不和谐；认知失调"
  },
  "passage_translation": "大型烟草公司依赖认知失调来维系其惊人的销售额。"
}
```

---

## 6. 自动化脚本工具箱 (`scripts/`)

| 脚本文件 | 作用与运行方式 |
| :--- | :--- |
| `scripts/deploy_gh_pages.js` | 自动化打包并将 `dist` 强制推送至 `devastatingroy/mind-over-smoke` 的 `gh-pages` 分支 |
| `scripts/deploy_user_site.js` | 自动化打包并将 `dist` 强制推送至 `devastatingroy/devastatingroy.github.io` 的 `main` 分支 |
| `scripts/audit_deep.js` | 审计 200+ 题库，检查有无中文题干剧透、选项数量、空格规范及映射完整度 |
| `scripts/build_full_dictionary.js` | 按当前题库内容补齐本地词库 |
| `scripts/verify_deployment.js` | 线上健康度检查，验证 `https://royfree.men/` 的 HTTP 200、HTML 与资源可访问性 |
| `scripts/simulate_user.js` | 使用 Puppeteer 运行完整的答题、换题、查词、打卡、本地持久化流程自动化测试 |

---

## 7. Agent 交付前自检清单 (Handover Checklist)

每次准备结束会话向用户交付成果前，必须在心中逐项核对：
- [ ] **编译测试**：已运行 `npm run build`，输出正常无报错。
- [ ] **分支 1 部署**：已运行 `node scripts/deploy_gh_pages.js` 并提示 success。
- [ ] **分支 2 部署**：已运行 `node scripts/deploy_user_site.js` 并提示 success。
- [ ] **源码推送**：已运行 `git push origin master` 提交最新源码。
- [ ] **后台清零**：已检查 `manage_task`，确保无未杀死的后台开发服务器或挂起任务。
- [ ] **文档落盘**：若进行了任何新决策或架构调整，已同步更新 `PROJECT_REQUIREMENTS.md`、`GEMINI.md` 与 `README.md`。
- [ ] **生产验证**：生产域名固定且仅为 `https://royfree.men/`。

遵循以上规范，后续任何 AI 智能体均可在 1 分钟内完成上下文重建并继续安全高品质地开发！
