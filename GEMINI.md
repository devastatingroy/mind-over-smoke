# MindOverSmoke (智熄) - Project Rules & Mandatory Directives

> **核心指引**：关于完整的 AI Agent 开发协议、代码库结构与部署架构，请务必参阅 [`AGENT_GUIDE.md`](./AGENT_GUIDE.md) 与 [`PROJECT_REQUIREMENTS.md`](./PROJECT_REQUIREMENTS.md)。  
> 任何接手本项目的 AI Agent 必须无条件严格执行以下铁律。

---

## 1. 绝对自动化部署法则 (Strict Auto-Deployment)
* **严禁等待用户提醒部署**：每次代码修改、Bug 修复或需求调整完成，并经本地测试验证通过后，**必须立即在同一次回复前自动执行全套构建与部署**：
  1. `npm run build`
  2. `node scripts/deploy_gh_pages.js` (同步至 `mind-over-smoke` 的 `gh-pages` 分支)
  3. `node scripts/deploy_user_site.js` (同步至 `devastatingroy.github.io` 的 `main` 分支)
  4. `git push origin master` (同步源码仓库)
* 部署完成后，在回复中明确汇报部署已生效，生产地址为 `https://royfree.men/`。

## 2. 拒绝临时方案 (Zero Temporary Solutions)
* 生产环境唯一官方永久域名为：**`https://royfree.men/`**。
* 严禁再次提及、使用或启动任何临时穿透隧道（如 `trycloudflare.com`、Ngrok、Localtunnel 等）。
* 所有静态资源、CNAME 与 Service Worker 必须绑定 `royfree.men`。

## 3. 后台进程绝对清零 (Zero Background Daemons)
* 每次任务完成后，必须检查并清理所有后台进程（如 `npm run preview`、无用的 CLI 任务）。
* 保证 `manage_task` 状态始终为 `No background tasks are currently running`，严禁在用户电脑后台残留无谓占用。

## 4. 所有需求与规则必须强制落盘 (Persistent Documentation)
* 用户提出的所有产品逻辑调整、审美偏好、架构决策，必须即刻持久化写入项目文档与规则文件，严禁仅保留在对话历史中。
* 核心决策记录于 `PROJECT_REQUIREMENTS.md`，执行铁律记录于 `GEMINI.md`，Agent 协同规范记录于 `AGENT_GUIDE.md`。

## 5. 题目认知挑战标准 (Cognitive Load Standards)
* **Mode 1（英译名篇逆向还原）**：
  - **严禁出选择题（Zero Multiple Choice）**：严禁给出 4 首/句中文诗句选项供蒙题或反向认读；必须保持纯净的**前额叶自主记忆提取挑战**。
  - 仅展示权威英译文（如 Arthur Waley、许渊冲、Kenneth Rexroth、David Hawkes 译本）与作者/篇名。
  - **严禁题干漏题**：题干引导语严禁出现任何答案中的中文诗句，仅剖析英译意象群。
  - 提供双向无压力按钮：【🎯 我想到了 · 揭晓原诗对照】与【❓ 暂时想不出 · 直接看答案】。
  - 揭晓后大号书法字体展示正解原句、全篇诗文与双语对仗意象表（Mapping）。
* **Mode 2（汉诗英译填空）**：
  - 呈现古典名篇名句。
  - 用户输入完整英文译文后对照参考译本，不提供选择题选项，也不以参考译文逐字判错。
  - 必须提供【暂时想不出？点击看参考译文】按钮。
* **经济学人题**：不使用 True or False；完形选择题正确答案分散在四个位置，选错只提示重试，主动看答案或答对后才揭晓。
* **完形填空与译文线索准则**：
  - 英文填空槽位纯净展示 `[  ?  ]`，严禁将释义 hint 碎片塞入空格引发视觉混淆或剧透。
  - **译文线索随时可用**：只要有按钮在，中文对照译文（如【译 · 中文翻译】）属于用户自主选择调用的认知梯级线索，绝不属于漏题；必须随时允许用户主动点击展开或收起，严禁人为限制在作答后。
* **点击查词规划与交互标准**：
  - 现阶段采用本地核心高频词秒开，规划采用方案 C（动态免密 API 缓存 + 原生划词透传）。
  - **点击选词严禁自动朗读发音**：只显示国际音标（IPA）与精简释义，保持静音克制，不产生音频打扰。

## 6. 视觉设计铁律 (Scheme A: Minimalist Editorial Monolith)
* 致敬《The Economist》纸本装帧克制美学。
* 纸张米白背景 `#FAF8F5`、深墨碳黑 `#111827`、超细微发丝边框 `#E5E0D8`、仅用微小的经济学人深红 `#8C1D24` 作为重点线缀。
* 严禁彩色标签堆叠、严禁碎纸彩屑漂浮动效，保持肃穆、理智、高级感。

## 7. 坚决剔除傻瓜单字填空题 (Zero Trivial Cloze)
* **严禁在题库中出现任何“中文古诗句单字填空”式的傻瓜题**（如“长风破浪会有时，直挂云帆济____”）。
* 中文母语者对此类题目存在无需动脑的脊髓下意识条件反射，完全无法占用前额叶工作记忆，无法起到戒烟急救认知阻断作用。
* 所有认知阻断任务必须保证中等以上认知负荷（经济学人批判性讽刺阅读与词汇、英译名篇逆向推导、汉诗名篇评鉴西方名译）。
* 原 `tang_poetry.json` 已被物理删除，严禁再次引入。

## 8. 题库容量与前沿审核铁律 (Bank Scale & GPT Review)
* **题库规模基线**：
  - 《经济学人》反讽与商业逻辑批判精读题：必须保持 100 道以上。
  - 传世名篇英汉双向名译挑战：必须保持 100 道以上（50 题 Mode 1 纯英文逆向还原完整古诗 + 50 题 Mode 2 汉诗挑选大师译本）。
  - 总认知阻断题量达 200 道以上，杜绝无聊重复刷题。
* **题目质检标准**：
  - 必须符合 ChatGPT 前沿模型（o3 / GPT-5 级词法与逻辑）审校标准，确保西方汉学译本权威真实、意象咬合精准、完全契合前额叶认知阻断机制。
