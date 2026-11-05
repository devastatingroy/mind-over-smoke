# MindOverSmoke (智熄) - Project Rules & Mandatory Directives

## 1. 绝对自动化部署法则 (Strict Auto-Deployment)
* **严禁等待用户提醒部署**：每次代码修改、Bug 修复或需求调整完成，并经本地测试验证通过后，**必须立即在同一次回复前自动执行全套构建与部署**：
  1. `npm run build`
  2. `node scripts/deploy_gh_pages.js` (同步至 `mind-over-smoke` 的 `gh-pages` 分支)
  3. `node scripts/deploy_user_site.js` (同步至 `devastatingroy.github.io` 的 `main` 分支)
  4. `git push origin master` (同步源码仓库)
* 部署完成后，在回复中明确汇报部署已生效。

## 2. 拒绝临时方案 (Zero Temporary Solutions)
* 生产环境唯一官方永久域名为：**`https://royfree.men/`**。
* 严禁再次提及、使用或启动任何临时穿透隧道（如 `trycloudflare.com`、Ngrok、Localtunnel 等）。
* 所有静态资源、CNAME 与 Service Worker 必须绑定 `royfree.men`。

## 3. 后台进程绝对清零 (Zero Background Daemons)
* 每次任务完成后，必须检查并清理所有后台进程（如 `npm run preview`、无用的 CLI 任务）。
* 保证 `manage_task` 状态始终为 `No background tasks are currently running`，严禁在用户电脑后台残留无谓占用。

## 4. 所有需求与规则必须强制落盘 (Persistent Documentation)
* 用户提出的所有产品逻辑调整、审美偏好、架构决策，必须即刻持久化写入项目文档与规则文件，严禁仅保留在对话历史中。
* 核心决策记录于 `PROJECT_REQUIREMENTS.md`，执行铁律记录于 `GEMINI.md`。

## 5. 题目认知挑战标准 (Cognitive Load Standards)
* **Mode 1（英译名篇逆向还原）**：
  - 仅展示权威英译文（如 Arthur Waley、许渊冲、Kenneth Rexroth 译本）与作者/篇名。
  - **严禁任何中文句子残缺填空剧透**（严禁出现“国破山河在，城春草木____”式剧透）。
  - 提供 4 首/句完整的古典名作诗句选项供逆向推导。
  - 必须提供清晰的【❓ 暂时想不出？点击直接看答案与双语解析】按钮。
* **Mode 2（汉诗名篇挑选英译）**：
  - 呈现古典名篇名句。
  - 提供 4 个高质量西方汉学英译选项供品评挑选。
  - 必须提供【❓ 暂时想不出？点击直接看答案】按钮。
* **点击查词规划（方案 C）**：
  - 现阶段先不改代码（只谋划先不做）。
  - 规划采用方案 C（本地已有核心词 0.001 秒秒开 + 公共免密词典 API 动态缓存，透传原生选词，不冲突浏览器划词扩展）。

## 6. 视觉设计铁律 (Scheme A: Minimalist Editorial Monolith)
* 致敬《The Economist》纸本装帧克制美学。
* 纸张米白背景 `#FAF8F5`、深墨碳黑 `#111827`、超细微发丝边框 `#E5E0D8`、仅用微小的经济学人深红 `#8C1D24` 作为重点线缀。
* 严禁彩色标签堆叠、严禁碎纸彩屑漂浮动效，保持肃穆、理智、高级感。
