# OpenHarness WebUI 需求规格说明文档

> **版本**: v0.1.0  
> **日期**: 2026-04-30  
> **来源仓库**: https://github.com/HKUDS/OpenHarness  
> **目标仓库**: https://github.com/my-207/openharness-webui  
> **UI 参考**: CodeBuddy WebUI 界面风格

---

## 1. 项目概述

### 1.1 项目背景

OpenHarness 是一个开源的 AI 驱动编程助手（Python 版 Claude Code），提供工具使用、技能加载、记忆管理、多代理协调等核心智能体基础设施。目前 OpenHarness 采用 **React/Ink 终端 TUI** 作为前端交互方式，缺少浏览器端的 WebUI 界面。

本项目的目标是为 OpenHarness 开发一套功能完整的 **Web 用户界面（WebUI）**，参考 CodeBuddy 的 WebUI 设计风格，实现与 CLI 同等功能的全可视化操作体验，并在此基础上增加更适合 Web 的交互模式（如可视化管理面板、拖拽操作、实时流式渲染等）。

### 1.2 业务目标

- 为 OpenHarness 提供现代化的 Web 交互界面
- 覆盖 OpenHarness CLI 的全部功能，降低使用门槛
- 支持会话管理、提供者配置、工具监控等核心场景
- 保留 CLI 模式下的全部高级功能，以 Web 可视化方式呈现

### 1.3 目标用户

| 用户角色 | 描述 | 核心需求 |
|---------|------|---------|
| **AI 开发者** | 使用 OpenHarness 进行编码的开发者 | 会话聊天、工具调用、代码编辑 |
| **系统管理员** | 配置和运维 OpenHarness 服务 | 提供者管理、权限配置、MCP 服务器管理 |
| **研究者** | 研究 AI 智能体行为的研究人员 | 多代理协调、任务监控、日志分析 |
| **普通用户** | 通过 ohmo 使用个人 AI 代理 | 频道配置、记忆管理、网关管理 |

---

## 2. 功能需求

### 2.1 功能全景图

OpenHarness WebUI 将 CLI 功能映射为以下功能模块：

```
OpenHarness WebUI
├── 📝 会话中心 (Chat/Session)
│   ├── 对话交互界面
│   ├── 会话管理（新建/继续/恢复/删除）
│   ├── 会话历史浏览
│   ├── 会话导出与分享
│   └── 会话快照（标签/恢复）
├── ⚙️ 提供者配置 (Provider)
│   ├── 提供者配置文件列表
│   ├── 新增/编辑/删除配置文件
│   ├── 切换活动提供者
│   ├── API 密钥管理
│   └── 认证状态监控
├── 🛡️ 权限管理 (Permissions)
│   ├── 权限模式切换（Default/Plan/Auto）
│   ├── 路径级规则配置
│   ├── 命令黑名单管理
│   └── 工具黑白名单配置
├── 🔧 工具管理 (Tools)
│   ├── 工具注册表概览
│   ├── 工具调用实时监控
│   ├── 工具执行日志
│   └── MCP 服务器管理
├── 📚 技能管理 (Skills)
│   ├── 已安装技能列表
│   ├── 技能详情查看
│   ├── 技能启用/禁用
│   └── 技能安装（本地 .md 文件）
├── 🔌 插件管理 (Plugins)
│   ├── 插件列表
│   ├── 插件的安装/卸载/启用/禁用
│   └── 插件详情（命令/钩子/代理/MCP）
├── 🧠 记忆管理 (Memory)
│   ├── 项目记忆查看
│   ├── 记忆条目增删改
│   └── 记忆搜索
├── 📋 任务管理 (Tasks)
│   ├── 后台任务列表
│   ├── 任务状态监控
│   ├── 任务创建/停止/更新
│   └── 任务输出查看
├── 🤝 多代理协调 (Swarm)
│   ├── 队友状态面板
│   ├── 团队管理（创建/删除团队）
│   ├── 消息通信监控
│   └── 工作树管理
├── ⏰ 定时任务 (Cron)
│   ├── Cron 调度器启停
│   ├── 作业列表与状态
│   ├── 作业创建/编辑/删除
│   └── 执行历史与日志
├── 🤖 Autopilot
│   ├── 状态与指标仪表板
│   ├── 仓库扫描
│   ├── 条目管理
│   └── Cron 集成配置
├── 🎨 个性化设置 (Settings)
│   ├── 主题切换
│   ├── 输出样式
│   ├── 快捷键绑定
│   ├── Vim/语音模式
│   └── 推理努力级别（Effort/Passes/Turns）
└── 🏠 ohmo 个人代理（ohmo 模块）
    ├── 工作区管理
    ├── 频道配置（Telegram/Slack/Discord/飞书）
    ├── 网关管理（运行/停止/状态）
    ├── Soul/User 配置
    └── 个人记忆管理
```

### 2.2 详细功能规格

#### 2.2.1 会话中心

| 功能编号 | 功能名称 | 优先级 | 描述 |
|---------|---------|--------|------|
| S-01 | 对话交互 | P0 | 支持用户输入消息，实时流式显示 AI 回复 |
| S-02 | 斜杠命令 | P0 | 在输入框中支持 `/command` 格式的斜杠命令，自动补全 |
| S-03 | 工具调用可视化 | P0 | 以卡片形式展示工具调用过程（名称、输入、输出、执行状态） |
| S-04 | 会话管理 | P1 | 新建会话、继续最近的会话、按 ID 恢复历史会话 |
| S-05 | 会话历史 | P1 | 浏览历史会话列表，按时间/摘要排序 |
| S-06 | 会话导出 | P2 | 导出当前对话记录（Markdown/JSON 格式） |
| S-07 | 会话快照 | P2 | 创建带标签的命名快照，支持快速恢复 |
| S-08 | 会话摘要 | P2 | 显示/生成对话摘要 |
| S-09 | 上下文压缩 | P2 | 手动或自动触发上下文压缩，展示压缩进度 |
| S-10 | 对话复制 | P2 | 复制最新回复或选中文本 |
| S-11 | 对话分享 | P3 | 创建可分享的对话快照链接 |

#### 2.2.2 提供者配置

| 功能编号 | 功能名称 | 优先级 | 描述 |
|---------|---------|--------|------|
| P-01 | 提供者概览 | P0 | 以列表形式展示所有提供者配置文件的名称、状态、活跃标记 |
| P-02 | 配置文件 CRUD | P0 | 创建、查看、编辑、删除提供者配置文件 |
| P-03 | 切换活跃提供者 | P0 | 一键切换当前使用的提供者配置文件 |
| P-04 | 认证配置 | P0 | 管理 API Key 等认证凭据的输入、保存、清除 |
| P-05 | 模型选择 | P0 | 选择当前配置文件使用的模型（支持别名和完整 ID） |
| P-06 | 认证状态监控 | P1 | 实时显示各提供者的认证状态（就绪/缺失认证） |
| P-07 | 提供者工作流引导 | P1 | 引导用户完成提供者选择、认证和模型设置流程 |
| P-08 | 兼容端点配置 | P1 | 支持自定义 base_url、api_format 等高级配置 |
| P-09 | Gateway 配置 | P2 | ohmo Gateway 的提供者选择和频道配置 |

**支持的提供者工作流：**

| 工作流 | 认证方式 | WebUI 映射 |
|--------|---------|-----------|
| Anthropic-Compatible API | API Key 输入 | 表单输入 API Key + Base URL |
| Claude Subscription | 本地凭据绑定 | 文件路径选择 |
| OpenAI-Compatible API | API Key 输入 | 表单输入 API Key + Base URL |
| Codex Subscription | 本地凭据绑定 | 文件路径选择 |
| GitHub Copilot | OAuth 设备流 | 浏览器弹窗认证 |

#### 2.2.3 权限管理

| 功能编号 | 功能名称 | 优先级 | 描述 |
|---------|---------|--------|------|
| PM-01 | 权限模式切换 | P0 | 在 Default（询问）/ Plan（禁止写入）/ Auto（自动允许）间切换 |
| PM-02 | 路径规则配置 | P1 | 以表格形式管理路径级权限规则（模式、路径、允许/拒绝） |
| PM-03 | 命令黑名单 | P1 | 配置被拒绝的命令列表 |
| PM-04 | 工具黑白名单 | P2 | 允许/禁止特定工具的列表配置 |
| PM-05 | 权限审批对话框 | P0 | 工具调用时的交互式权限审批（允许/拒绝/始终允许） |

#### 2.2.4 工具管理

| 功能编号 | 功能名称 | 优先级 | 描述 |
|---------|---------|--------|------|
| T-01 | 工具概览 | P0 | 展示所有已注册工具的 Schema 信息 |
| T-02 | 工具执行监控 | P0 | 实时展示工具调用的输入、输出和执行状态 |
| T-03 | 工具执行日志 | P1 | 按时间线展示所有工具调用的历史记录 |
| T-04 | MCP 服务器管理 | P1 | 添加/删除/查看 MCP 服务器配置 |
| T-05 | MCP 状态监控 | P1 | 显示 MCP 服务器连接状态、可用工具和资源列表 |
| T-06 | 工具过滤搜索 | P2 | 按名称/类别搜索和过滤工具 |

**工具类别一览：**

| 类别 | 工具 | WebUI 映射 |
|------|------|-----------|
| 文件 I/O | Bash, Read, Write, Edit, Glob, Grep | 文件浏览器 + 代码编辑器 |
| 搜索 | WebFetch, WebSearch, ToolSearch, LSP | 搜索面板集成 |
| 笔记本 | NotebookEdit | 笔记本编辑器 |
| 代理 | Agent, SendMessage, TeamCreate/Delete | 多代理面板 |
| 任务 | TaskCreate/Get/List/Update/Stop/Output | 任务管理器 |
| MCP | MCPTool, ListMcpResources, ReadMcpResource | MCP 面板 |
| 模式 | EnterPlanMode, ExitPlanMode, Worktree | 模式切换控件 |
| 调度 | CronCreate/List/Delete, RemoteTrigger | 定时任务面板 |
| 元数据 | Skill, Config, Brief, Sleep, AskUser | 配置面板 |

#### 2.2.5 其他功能模块

| 模块 | 功能 | 优先级 | 描述 |
|------|------|--------|------|
| 技能 | 技能列表/详情/启禁/安装 | P1 | 展示所有可用技能，支持安装 .md 技能文件 |
| 插件 | 列表/安装/卸载/启禁 | P2 | 支持 claude-code 兼容的插件格式 |
| 记忆 | 增删改查/搜索 | P1 | 项目记忆条目管理 |
| 任务 | 列表/监控/创建/停止 | P1 | 后台代理/Shell 任务管理 |
| Swarm | 队友面板/通知/团队 | P2 | 多代理协作实时监控 |
| Cron | 调度器/作业管理 | P2 | 定时任务管理面板 |
| Autopilot | 仪表板/扫描/条目 | P2 | 仓库自动导航管理 |
| 设置 | 主题/快捷键/Vim/语音 | P1 | 个性化设置面板 |
| ohmo | 工作区/频道/网关 | P2 | 个人代理管理面板 |

---

## 3. 非功能需求

### 3.1 性能需求

| 需求项 | 指标 |
|--------|------|
| 首屏加载时间 | ≤ 3 秒 |
| 会话切换响应 | ≤ 1 秒 |
| 实时流式渲染 | 支持 SSE/WebSocket，延迟 ≤ 100ms |
| 并发会话数 | 支持同时 5 个活跃会话 |
| 历史记录加载 | 1000 条记录加载 ≤ 2 秒 |

### 3.2 安全需求

| 需求项 | 描述 |
|--------|------|
| API Key 安全 | API Key 仅在前端内存中，可加密存储在后端 |
| CSRF 防护 | 所有 API 请求需要 CSRF Token |
| XSS 防护 | 用户输入的内容需过滤，Markdown 渲染需 sanitize |
| 权限隔离 | 不同会话的上下文隔离 |
| HTTPS | 生产环境必须使用 HTTPS |

### 3.3 兼容性需求

| 需求项 | 支持范围 |
|--------|---------|
| 浏览器 | Chrome 90+, Firefox 90+, Edge 90+, Safari 14+ |
| 响应式 | 桌面端优先，支持 1280px+ 分辨率 |
| Python 版本 | ≥ 3.10（与 OpenHarness 一致） |

### 3.4 UX 需求

| 需求项 | 描述 |
|--------|------|
| 暗色/亮色主题 | 支持主题切换，默认暗色 |
| 快捷键支持 | 常用操作支持键盘快捷键 |
| 操作反馈 | 所有操作需有 Loading/成功/失败状态反馈 |
| 错误提示 | 友好的人类可读错误提示 |
| 无障碍 | 符合 WCAG 2.1 AA 标准 |

---

## 4. 系统架构

### 4.1 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                       浏览器 (Browser)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 OpenHarness WebUI                      │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │  │
│  │  │ 会话面板  │ │ 配置面板  │ │ 工具面板  │ │ 设置面板 │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │          WebSocket / HTTP SSE 客户端            │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket / HTTP
┌──────────────────────────▼──────────────────────────────────┐
│              WebUI 后端服务 (Python/FastAPI)                  │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ WS 管理器   │ │ REST API     │ │ 会话存储 + 事件缓冲   │  │
│  └────────────┘ └──────────────┘ └──────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐    │
│  │           OpenHarness Runtime 适配层                │    │
│  │    (复用现有 ReactBackendHost / run_backend_host)    │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### 4.2 前后端通信

WebUI 后端复用 OpenHarness 现有的 Runtime 和 Backend 架构：

| 通信方式 | 用途 | 说明 |
|---------|------|------|
| **WebSocket** | 实时流式事件 | 替代现有 stdin/stdout 管道，传输 `BackendEvent` |
| **HTTP REST** | 配置管理 API | 提供者、权限、技能、插件等 CRUD 操作 |
| **HTTP SSE** | 备用流式传输 | 在 WebSocket 不可用时的回退方案 |

### 4.3 事件协议映射

WebUI 沿用 OpenHarness 现有的 `FrontendRequest` / `BackendEvent` 协议，额外增加：

**新增 FrontendRequest 类型：**
- `update_config` — 更新配置（主题、权限模式等）
- `manage_provider` — 提供者配置 CRUD
- `manage_plugin` — 插件管理操作
- `manage_cron` — 定时任务管理
- `manage_autopilot` — Autopilot 管理

**新增 BackendEvent 类型：**
- `config_updated` — 配置更新确认
- `provider_list` — 提供者列表数据
- `tool_list` — 工具注册表数据
- `skill_list` — 技能列表数据
- `plugin_list` — 插件列表数据
- `cron_status` — 定时任务状态
- `autopilot_data` — Autopilot 数据

---

## 5. UI 设计原则

### 5.1 设计风格

参考 CodeBuddy WebUI，采用以下设计语言：

| 元素 | 风格 |
|------|------|
| 色彩 | 深色/浅色双主题，蓝色调主色 (#2563EB) |
| 字体 | 系统字体栈优先，代码使用等宽字体 |
| 布局 | 三栏式布局：左侧导航 + 中间主内容 + 右侧上下文面板 |
| 组件 | 现代化卡片式设计，圆角 8px，适度的阴影 |
| 图标 | 使用 Lucide 或 Heroicons 图标集 |
| 动效 | 精简的过渡动画（200-300ms） |

### 5.2 布局规范

```
┌────────────────────────────────────────────────────────┐
│  Header Bar                                            │
│  [☰ Logo] [New Chat] [Search] [Model Selector] [⚙️]  │
├────────┬───────────────────────────────┬────────────────┤
│        │                               │                │
│  Side  │      Main Content Area        │    Right       │
│  Bar   │                               │    Panel       │
│        │   ┌──────────────────────┐    │    (Context)   │
│ [💬]   │   │                      │    │                │
│  Chat   │   │   Message Thread     │    │  Skills       │
│        │   │                      │    │  Memory       │
│ [🔧]   │   │   ┌──────────────┐   │    │  Tools        │
│  Tools  │   │   │ Tool Call    │   │    │  Files        │
│        │   │   └──────────────┘   │    │                │
│ [⚙️]   │   │                      │    │                │
│  Config │   └──────────────────────┘    │                │
│        │                               │                │
│ [...更多]│   ┌──────────────────────┐    │                │
│        │   │   Input Box            │    │                │
│        │   │   [/command hints]     │    │                │
│        │   └──────────────────────┘    │                │
├────────┴───────────────────────────────┴────────────────┤
│  Status Bar                                              │
│  [Model: claude-sonnet-4] [Provider: anthropic] [🔌MCP:3]│
└────────────────────────────────────────────────────────┘
```

### 5.3 交互规范

| 交互 | 规范 |
|------|------|
| 输入提交 | Enter 发送，Shift+Enter 换行 |
| 命令补全 | 输入 `/` 触发下拉命令列表 |
| 工具调用 | 以折叠卡片展示，可展开查看详情 |
| 权限审批 | 模态对话框，快捷键 y/n |
| 配置编辑 | 行内编辑或模态表单 |
| 侧栏收起 | 可收起左侧导航栏 |

---

## 6. 页面原型

### 6.1 页面清单

| 页面 | 路由 | 对应 CLI 功能 | 优先级 |
|------|------|--------------|--------|
| 对话页 | `/chat` / `/` | `oh` 交互式会话 | P0 |
| 会话历史 | `/sessions` | `/resume`, `/session` | P1 |
| 提供者配置 | `/providers` | `oh provider`, `oh setup` | P0 |
| 认证管理 | `/auth` | `oh auth` | P0 |
| 权限配置 | `/permissions` | `/permissions` | P1 |
| 工具管理 | `/tools` | `/mcp`, tool registry | P1 |
| 技能管理 | `/skills` | `/skills` | P1 |
| 插件管理 | `/plugins` | `oh plugin`, `/plugin` | P2 |
| 记忆管理 | `/memory` | `/memory` | P1 |
| 任务管理 | `/tasks` | `/tasks` | P1 |
| 多代理面板 | `/swarm` | `/agents`, `/subagents` | P2 |
| 定时任务 | `/cron` | `oh cron` | P2 |
| Autopilot | `/autopilot` | `oh autopilot` | P2 |
| 设置页 | `/settings` | `/theme`, `/fast`, `/effort` 等 | P1 |
| ohmo 管理 | `/ohmo` | `ohmo init/config/gateway` | P2 |

### 6.2 页面原型详细设计

#### 6.2.1 对话页 (`/chat`)

**布局：**
```
三栏布局
├── 左侧导航栏（可收起）
│   ├── Logo + 应用名 "OpenHarness"
│   ├── 新建会话按钮 [+]
│   ├── 导航菜单
│   │   ├── 💬 会话 (高亮)
│   │   ├── 🏠 会话历史
│   │   ├── ⚡ 工具
│   │   ├── 🧠 技能
│   │   └── ⚙️ 设置
│   └── 底部用户信息
│
├── 中间主区域
│   ├── 顶部标题栏
│   │   ├── 会话名称（可编辑）
│   │   ├── 模型选择器下拉
│   │   └── 操作按钮（导出/分享/清除）
│   ├── 消息列表（可滚动）
│   │   ├── 用户消息（右对齐，蓝色气泡）
│   │   ├── AI 回复（左对齐，Markdown 渲染）
│   │   ├── 工具调用卡片
│   │   │   ├── 折叠状态: [🔧 tool_name] [⏱ 耗时] [✅/❌]
│   │   │   ├── 展开状态: 输入 JSON + 输出文本
│   │   │   └── 状态动画: 执行中旋转图标
│   │   ├── 系统消息（居中，灰色小字）
│   │   └── 压缩进度条（压缩时显示）
│   └── 输入区域（底部固定）
│       ├── 多行输入框（自动调整高度）
│       ├── 斜杠命令下拉面板
│       ├── 附加功能按钮（文件上传等）
│       └── 发送按钮
│
└── 右侧面板（可收起）
    ├── 会话信息
    │   ├── Token 用量/费用
    │   ├── 对话轮次
    │   └── 会话 ID
    ├── 活跃技能
    ├── MCP 状态
    ├── Todo 面板
    └── Swarm 队友状态
```

**关键交互：**
- 输入 `/` 触发命令补全下拉列表
- 工具调用卡片可点击展开/折叠
- 流式输出实时更新
- 权限审批弹出模态对话框
- 按 Esc 中断当前操作

**状态管理：**
- `ready`: 后端就绪，可以输入
- `busy`: 正在处理，显示加载动画
- `streaming`: AI 正在输出，实时更新文本
- `tool_executing`: 工具正在执行，显示进度

---

#### 6.2.2 提供者配置页 (`/providers`)

**布局：**
```
单栏布局，配置面板
├── 顶部: 标题 "Provider Profiles" + [+ 添加] 按钮
│       └── 认证状态提示 (绿色/黄色/红色指示灯)
│
├── 提供者列表（卡片列表）
│   ├── 卡片: anthropic (当前) [绿色指示灯]
│   │   ├── Provider: Anthropic-Compatible API
│   │   ├── Model: claude-sonnet-4-6
│   │   ├── Auth: ✅ 已配置
│   │   ├── Base URL: https://api.anthropic.com
│   │   ├── [使用] [编辑] [删除]
│   │   └── 认证详情展开面板
│   ├── 卡片: openai [黄色指示灯]
│   │   ├── Provider: OpenAI-Compatible API
│   │   ├── Model: gpt-4.1
│   │   ├── Auth: ⚠️ 缺少 API Key
│   │   ├── [使用] [编辑] [删除]
│   │   └── 快速配置按钮
│   └── 卡片: copilot [绿色指示灯]
│       ├── Provider: GitHub Copilot
│       ├── Auth: ✅ 已登录 (user@github.com)
│       └── [使用] [编辑]
│
├── 新增/编辑模态表单
│   ├── 名称 (name)*
│   ├── 显示标签 (label)*
│   ├── 提供者类型 (provider)*
│   ├── API 格式 (api_format)*
│   ├── 认证源 (auth_source)*
│   ├── 模型 (model)*
│   ├── Base URL
│   ├── API Key (密码输入框)
│   ├── 凭据槽位 (credential_slot)
│   ├── 允许的模型列表
│   └── 高级选项（上下文窗口等）
│
└── 设置引导工作流（可切换）
    ├── Step 1: 选择提供者工作流
    ├── Step 2: 认证配置
    └── Step 3: 选择模型
```

---

#### 6.2.3 设置页 (`/settings`)

**布局：**
```
双栏布局
├── 左侧设置分类导航
│   ├── 通用 (General)
│   ├── 主题 (Theme)
│   ├── 输出样式 (Output Style)
│   ├── 快捷键 (Keybindings)
│   ├── 模型 (Model)
│   ├── 权限 (Permissions)
│   ├── Vim 模式
│   ├── 语音模式
│   └── 高级 (Advanced)
│
└── 右侧设置内容面板
    ├── 通用设置
    │   ├── 推理努力级别: [低] [中] [高] [最大]
    │   ├── 推理轮次: [1-8] 滑块
    │   ├── 最大轮次: 下拉选择/自定义
    │   ├── 快速模式: [开关]
    │   └── 自动压缩: [开关]
    ├── 主题设置
    │   ├── 主题预览卡片列表
    │   └── 当前主题: default/dark/cyberpunk/solarized
    ├── 快捷键设置
    │   └── 快捷键绑定表格
    ├── 输出样式
    │   └── 样式选择下拉 + 预览
    └── 高级设置
        ├── 调试模式: [开关]
        └── MCP 配置路径
```

---

#### 6.2.4 工具管理页 (`/tools`)

**布局：**
```
双栏布局
├── 左侧工具类别导航
│   ├── 全部工具
│   ├── 文件 I/O (Bash/Read/Write/Edit/Glob/Grep)
│   ├── 搜索 (WebFetch/WebSearch/ToolSearch/LSP)
│   ├── 笔记本 (NotebookEdit)
│   ├── 代理 (Agent/SendMessage/Team)
│   ├── 任务 (Task)
│   ├── MCP (McpTool/Resources)
│   ├── 模式 (PlanMode/Worktree)
│   ├── 调度 (Cron/RemoteTrigger)
│   └── 元数据 (Skill/Config/Brief)
│
└── 右侧工具详情
    ├── 工具 Schema 表格
    │   ├── 工具名
    │   ├── 描述
    │   ├── 必需参数
    │   └── 可选参数
    ├── 工具调用实时日志
    │   ├── 时间 | 工具名 | 输入 | 输出 | 状态
    │   └── 实时刷新
    └── MCP 服务器面板
        ├── 服务器列表
        │   ├── 名称 | 传输协议 | 状态
        │   └── 详情（工具/资源数量）
        └── 添加 MCP 服务器表单
            ├── 名称
            ├── 传输类型 (stdio/http/ws)
            ├── 命令/URL
            └── 参数/头信息
```

---

#### 6.2.5 其他关键页面

**技能管理 (`/skills`)：**
- 卡片网格展示技能
- 每张卡片：技能名、描述、来源、启用状态
- 支持启用/禁用切换
- 支持上传/拖拽 `.md` 技能文件安装

**任务管理 (`/tasks`)：**
- 表格视图展示后台任务
- 列：ID、类型（Agent/Shell）、状态、描述、元数据
- 操作：查看详情、停止任务、查看输出

**多代理面板 (`/swarm`)：**
- 实时队友状态面板（卡片网格）
- 每位队友：名称、状态（运行中/空闲/完成/错误）、持续时间、当前任务
- 通知流（时间线的消息通知）
- 团队创建/删除操作

**ohmo 管理 (`/ohmo`)：**
- 工作区概览（路径、文件列表）
- 频道配置向导（Telegram/Slack/Discord/飞书）
- 网关管理（启动/停止/重启/状态）
- Soul/User 配置编辑器

---

## 7. 技术方案

### 7.1 前端技术栈

| 技术 | 用途 | 说明 |
|------|------|------|
| React 18+ | UI 框架 | 函数组件 + Hooks |
| TypeScript | 类型安全 | 严格模式 |
| Next.js / Vite | 构建工具 | SPA 或 SSR |
| Tailwind CSS | 样式 | 原子化 CSS，暗色模式支持 |
| React Router | 路由 | 页面路由管理 |
| Zustand / Jotai | 状态管理 | 轻量级全局状态 |
| React Query / SWR | 数据获取 | 缓存和重试 |
| WebSocket (ws) | 实时通信 | 流式事件传输 |
| React Markdown | Markdown 渲染 | 代码高亮 (Prism/Shiki) |
| Monaco Editor | 代码编辑器 | 代码展示和编辑 |
| Radix UI / shadcn/ui | UI 组件库 | 无障碍组件 |

### 7.2 后端技术栈

| 技术 | 用途 |
|------|------|
| Python 3.10+ | 后端语言 |
| FastAPI | Web 框架，WebSocket 支持 |
| uvicorn | ASGI 服务器 |
| Pydantic v2 | 数据验证 |
| OpenAI/Runtime | 复用现有 OpenHarness 核心 |

### 7.3 后端适配方案

WebUI 后端通过以下方式复用现有 OpenHarness 运行时：

```python
# 核心思路：将 ReactBackendHost 的 stdin/stdout 通信
# 改为 WebSocket 通信

class WebBackendHost(ReactBackendHost):
    """基于 WebSocket 的后端主机"""
    
    async def run_websocket(self, websocket: WebSocket):
        self._websocket = websocket
        self._bundle = await build_runtime(...)
        await start_runtime(self._bundle)
        # 通过 websocket.send_json() 发送 BackendEvent
        # 通过 websocket.receive_json() 接收 FrontendRequest
```

---

## 8. 数据模型

### 8.1 核心数据模型

```typescript
// 会话
interface Session {
  id: string;
  name: string;
  model: string;
  provider: string;
  created_at: number;
  message_count: number;
  summary?: string;
  messages: ConversationMessage[];
}

// 对话消息
interface ConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'tool' | 'tool_result';
  text: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  is_error?: boolean;
  timestamp: number;
}

// 提供者配置文件
interface ProviderProfile {
  name: string;
  label: string;
  provider: string;
  api_format: string;
  auth_source: string;
  model: string;
  base_url?: string;
  configured: boolean;
  active: boolean;
  allowed_models?: string[];
  context_window_tokens?: number;
  auto_compact_threshold_tokens?: number;
}

// 工具定义
interface ToolDefinition {
  name: string;
  description: string;
  required_args: string[];
  optional_args: string[];
  category: string;
}

// 后台任务
interface Task {
  id: string;
  type: 'agent' | 'shell';
  status: 'running' | 'completed' | 'failed' | 'stopped';
  description: string;
  metadata: Record<string, string>;
  output?: string;
}

// 技能
interface Skill {
  name: string;
  description: string;
  content?: string;
  source: string;
  enabled: boolean;
}

// 权限配置
interface PermissionConfig {
  mode: 'default' | 'plan' | 'full_auto';
  path_rules: PathRule[];
  denied_commands: string[];
  allowed_tools: string[];
  disallowed_tools: string[];
}
```

---

## 9. 验收标准

### 9.1 功能验收

| 验收项 | 标准 |
|--------|------|
| 对话交互 | 用户可正常聊天，AI 回复实时流式显示 |
| 提供者配置 | 可完成 Anthropic/OpenAI/Copilot 的完整配置流程 |
| 工具调用 | 工具调用过程可视化，状态实时更新 |
| 权限审批 | 模态对话框正常弹出，y/n 快捷键生效 |
| 会话管理 | 可创建/恢复/删除会话 |
| 设置修改 | 主题、模型、权限模式等设置即时生效 |
| 技能管理 | 技能列表展示，启用/禁用切换 |
| 任务管理 | 后台任务列表、状态监控、停止操作 |

### 9.2 性能验收

| 验收项 | 标准 |
|--------|------|
| AI 回复延迟（首次 token） | ≤ 3 秒 |
| 页面切换 | ≤ 500ms |
| WebSocket 重连 | 断线后 5 秒内自动重连 |
| 内存占用 | 单会话 ≤ 200MB |

---

## 10. 附录

### 10.1 术语表

| 术语 | 说明 |
|------|------|
| Harness | 智能体基础设施，包含工具、权限、记忆等 |
| MCP | Model Context Protocol，模型上下文协议 |
| Tool | 工具，智能体可调用的功能 |
| Skill | 技能，领域知识的 Markdown 文件 |
| Plugin | 插件，扩展 Harness 功能的模块 |
| Swarm | 多代理协作系统 |
| Provider | 提供者，LLM 后端服务 |
| ohmo | 基于 OpenHarness 的个人 AI 代理 |
| Gateway | ohmo 的网关服务，连接 IM 平台 |

### 10.2 CLI-WebUI 功能映射对照表

| CLI 命令 | WebUI 页面 | 操作 |
|----------|-----------|------|
| `oh` | `/chat` | 启动/进入会话 |
| `oh -p "..."` | `/chat` 输入框 | 提交单次提示 |
| `oh --dry-run` | `/tools` | 预览运行时配置 |
| `oh -c` / `--continue` | 自动 | 继续最近的会话 |
| `oh -r <id>` | `/sessions` | 按 ID 恢复会话 |
| `oh setup` | `/providers` | 提供者设置向导 |
| `oh auth login` | `/providers` | 认证配置 |
| `oh auth status` | `/providers` (状态指示器) | 查看认证状态 |
| `oh provider list` | `/providers` | 提供者列表 |
| `oh provider use` | `/providers` (切换按钮) | 切换提供者 |
| `oh mcp list` | `/tools` (MCP 面板) | MCP 服务器列表 |
| `oh plugin list` | `/plugins` | 插件列表 |
| `oh cron` | `/cron` | 定时任务管理 |
| `oh autopilot` | `/autopilot` | 自动导航管理 |
| `ohmo init` | `/ohmo` | ohmo 工作区初始化 |
| `ohmo gateway` | `/ohmo` (网关面板) | 网关管理 |
| `/model` | `/settings` 或 顶部导航 | 切换模型 |
| `/permissions` | `/permissions` | 权限模式切换 |
| `/theme` | `/settings` | 主题切换 |
| `/memory` | `/memory` | 记忆管理 |
| `/skills` | `/skills` | 技能管理 |
| `/tasks` | `/tasks` | 任务管理 |
| `/cost` | `/chat` 右侧面板 | Token 费用查看 |
| `/export` | `/chat` 操作菜单 | 导出对话 |
| `/compact` | `/chat` 操作菜单 | 压缩上下文 |

---

> **文档版本**: v0.1.0  
> **状态**: 初稿  
> **下一步**: 技术方案详细设计 → 前后端接口定义 → 原型图交互设计 → 开发实现
