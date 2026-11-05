# 📋 MindOverSmoke (智熄) - 产品需求规格与架构决策总览 (PRD)

> **版本**：v3.0 (Handover & Evolution Edition)  
> **生产官网**：`https://royfree.men/`  
> **核心基础设施**：Cloudflare Proxy (Anycast CDN) + GitHub Pages 自动化多仓库双向镜像分发  
> **设计语言**：Scheme A (Minimalist Editorial Monolith 极简墨白装帧)

---

## 一、 产品愿景与理论根基 (Vision & Scientific Foundations)

### 1. 核心定位
MindOverSmoke (智熄) 不是一款普通的“记录吸烟天数”的鸡汤记事本，而是一款基于**认知负荷理论 (Cognitive Load Theory)**、**工作记忆阻断 (Working Memory Disruption)** 与 **行为经济学良性承诺契约 (Commitment Device)** 的前额叶急性微干预戒烟系统。

### 2. 生理学与脑神经机制
* **180 秒急性渴求浪涌 (The Craving Wave)**：
  - 吸烟者的生理渴求并非无休止增强，而是以 3~5 分钟（180 秒）为一个波峰周期。
  - 传统戒烟者靠“咬牙苦熬”，边缘系统（Amygdala / Nucleus Accumbens）不断放大对多巴胺的渴望，极易引发复吸。
* **前额叶工作记忆强占**：
  - 人脑工作记忆容量极为有限（约 4~7 个信息块）。
  - 当大脑被迫进行高级跨语种转码（如阅读 Kenneth Rexroth 或 Arthur Waley 译本逆向回忆唐诗）及《经济学人》反讽与商业欺骗批判推理时，前额叶皮层算力瞬间满载，物理性切断边缘系统的成瘾信号传递。
* **躯体阻断与迷走神经调控**：
  - 俯卧撑等动作占用手部，帮助中断拿烟、点火的下意识动作；
  - 4-7-8 呼吸通过 8 秒超长呼气刺激颈动脉窦与迷走神经，迅速压低心率，瓦解焦虑。

### 3. 行为经济学良性对赌契约
* **痛点**：传统戒烟对赌产品因“平台盼着用户失败以没收保证金”导致用户产生抵触心理。
* **双赢机制**：
  - 用户自愿预存 $20 承诺金，开启 14 天自控对赌。
  - 14 天内每天坚持完成 1 次急救阻断或训练打卡，系统每日返还 $1，累计返还 $14。
  - 用户全胜只需自付 $6（相当于少抽半包烟）；平台光明正大收取 $6 技术运营服务费，双方利益彻底绑定。

---

## 二、 认知阻断任务体系与质量标准 (Task Matrix & Quality Standards)

整个题目系统总容量严格保持在 **200 道以上高难度题目**，且完全经由 ChatGPT 前沿模型（o3 / GPT-5 级词法与修辞逻辑）深度审校。

### 1. 传世名篇英汉双向挑战 (100 题，`src/data/tang_translation.json`)
彻底淘汰所有傻瓜式中文古诗单字填空（原 `tang_poetry.json` 已物理删除，严禁再次引入）。改为高质量双向挑战：
* **Mode 1：英译名篇逆向还原 (50 题)**
  - **严禁出选择题（Zero Multiple Choice）**：严禁给出中文选项供反向认读或蒙题；必须展示 Arthur Waley、许渊冲、Kenneth Rexroth、Ezra Pound、David Hawkes 等权威西方汉学英译与作者篇名。
  - **题干防剧透铁律**：题干引导语严禁出现任何答案中的中文诗句，仅剖析英译意象群。
  - 提供双向无压力按钮：【🎯 我想到了 · 揭晓原诗对照】与【❓ 暂时想不出 · 直接看答案】。
  - 揭晓后大号书法字体展示正解原句、全篇诗文与双语对仗意象映射表（Mapping）。
* **Mode 2：汉诗英译填空 (50 题)**
  - 呈现古典名篇名句。
  - 用户自行输入完整英文译文；提交后并排对照自己的表达与参考译本，不按单一措辞机械判错。
  - 必须提供【暂时想不出？点击看参考译文】按钮。
  - 参考译文揭晓后，英文单词可点击查看现有词典的音标与释义；查词保持静音。

### 2. 《经济学人》批判反讽深度阅读 (100 题，`src/data/questions.json`)
* **题型分布**：100 道 SAT/GRE 高阶词汇与语境推理完形填空，不再使用 True or False 判断题。
* **选择题反馈**：四个位置均可出现正确答案；选错只提示错误并允许重试，答对或主动看答案后才揭晓答案与解析。
* **填空格局标准**：完形填空空格处纯净显示 `[  ?  ]`，严禁塞入释义字符串。
* **译文线索准则**：中文对照译文按钮（【译 · 中文翻译】）随时可点击展开或收起，作为用户自主选择调用的认知梯级线索，绝非被动漏题，严禁人为锁死在答题后。
* **毒舌评语 (Punchline)**：每道题均附带符合《经济学人》语调的辛辣讽刺与成瘾本质解构。

### 3. 躯体动作与迷走神经重置任务
* **躯体运动 (`src/data/physical_tasks.json`)**：
  - 保留俯卧撑与空击等动作；移除平板支撑。
  - 所有动作遵循 **Knee-Friendly 膝盖友好** 原则，对膝关节软骨零压力。
* **深呼吸 (`src/data/breathing_tasks.json`)**：
  - 4-7-8 镇静呼吸（4秒鼻吸、7秒屏息、8秒慢呼），精准刺激迷走神经降低心率。

---

## 三、 核心交互与可靠性架构 (Interaction & Reliability)

### 1. 突发刷新与崩溃持久化 (Crash-Proof SOS Session)
* 用户在 180 秒倒计时内若手滑刷新页面或切换 App，`localStorage` 中的活动急救状态会自动恢复 (`getSavedSession`)，保证倒计时、当前题号及任务列表不被重置。
* 只有三道急救题全流程完成后，才会清除活动会话并写入契约打卡成果。

### 2. 场景化动态换题机制 (Adaptive Task Swapping)
* 用户处于公共交通或办公室等不便做运动的场景时，支持一键点击【换一道题】，`getReplacementTask` 算法会从同类别题库中动态置换新题目，无需退出重开。

### 3. 方案 C 双保险查词与静音规范
* **双保险检索**：
  1. 本地核心词库 (`phoneticDict.js` + `fullDictionary.json`)：收录 30,000+ 常用与学术词汇，0.001 秒弹窗直出 IPA 国际音标与中文释义。
  2. 云端免费公开 API 兜底：未命中词汇异步请求公共词典 API 并自动缓存。
  3. 原生透传：完全允许用户通过系统级划词或自带翻译插件查词。
* **静音铁律**：点击查词**严禁自动朗读发音**，保持纸本阅读般的肃穆与克制。

---

## 四、 视觉设计系统：Scheme A (Minimalist Editorial Monolith)

* **设计美学**：致敬《经济学人》纸质装帧，采用极简现代主义排版。
* **配色规范**：
  - 纸张底色：`#FAF8F5`
  - 深墨文字：`#111827`
  - 发丝细边框：`#E5E0D8`
  - 核心标线与徽章：经济学人经典深红 `#8C1D24`
* **完全剔除**：严禁彩虹渐变、纸屑飞舞、彩色多色标签堆叠与轻浮动效。

---

## 五、 全球基础设施与自动化交付流水线 (DevOps & Infrastructure)

### 1. 域名与 CDN 架构
* **官方永久域名**：`https://royfree.men/`。
* **Cloudflare Anycast CDN**：开启 Cloudflare Proxy 代理，提供全球 Anycast 边缘路由，彻底消除国内移动/联通/电信对 GitHub Pages 的直连抖动与阻断。
* **PWA / Service Worker**：`sw.js` 具备 `skipWaiting()` 与 `clients.claim()`，HTML 遵循 Network-First，保证用户始终获取最新编译版本。

### 2. 改动即部署铁律 (Automated Dual-Push Deployment)
所有代码与文档改动验证后，在同一回复前必须自动执行全套发布：
1. `npm run build`
2. `node scripts/deploy_gh_pages.js` (发布至 `mind-over-smoke:gh-pages`)
3. `node scripts/deploy_user_site.js` (发布至 `devastatingroy.github.io:main`)
4. `git push origin master` (发布源码至 GitHub master 分支)

---

## 六、 接盘与演进指引 (Handover Reference)

后续接手本项目的 AI Agent 或开发者：
* **Agent 快速开发手册**：详见 [`AGENT_GUIDE.md`](./AGENT_GUIDE.md)。
* **行为准则与强制指令**：详见 [`GEMINI.md`](./GEMINI.md)。
* **项目公开主页文档**：详见 [`README.md`](./README.md)。
