# OpenHarness WebUI

OpenHarness 的浏览器端 WebUI，提供对话交互、提供者配置等核心功能。

## 项目结构

```
webui/
├── frontend/          # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # NavBar, SideBar, StatusBar, AppLayout
│   │   │   ├── chat/         # MessageList, MessageBubble, ChatInput, PermissionModal, RightPanel
│   │   │   ├── providers/    # ProviderCard, ProviderFormModal
│   │   │   └── shared/       # Button, Modal, Input, Select, Toggle, Badge, Spinner, Toast
│   │   ├── pages/            # ChatPage, ProvidersPage
│   │   ├── stores/           # chatStore (zustand), providerStore (zustand)
│   │   ├── types/            # protocol.ts (前后端通信协议类型)
│   │   ├── App.tsx           # 路由配置
│   │   └── main.tsx          # 入口
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/           # Python FastAPI + WebSocket
│   ├── app/
│   │   ├── main.py           # FastAPI 入口 + WebSocket 路由
│   │   ├── models.py         # Pydantic 协议模型
│   │   ├── ws_manager.py     # WebSocket 连接管理器
│   │   ├── routers/
│   │   │   └── providers.py  # 提供者配置 REST API
│   │   └── services/
│   │       ├── chat_handler.py   # WebSocket 对话处理器
│   │       └── provider_service.py  # 提供者文件存储服务
│   └── requirements.txt
└── README.md
```

## 快速启动

### 前置条件

- Node.js >= 18
- Python >= 3.10

### 启动后端

```bash
cd webui/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 启动前端

```bash
cd webui/frontend
npm install
npm run dev
```

### 访问

浏览器打开 http://localhost:5173

## 当前功能 (P0)

### ✅ 已完成

| 功能 | 路由 | 状态 |
|------|------|------|
| 全局布局框架 | 全局 | 完成 |
| 对话页 (流式消息) | `/chat` | 完成 (含 Mock 后端) |
| 提供者配置页 | `/providers` | 完成 |
| 工具调用可视化 | 对话页 | 完成 |
| 权限审批模态框 | 对话页 | 完成 |
| 斜杠命令补全 | 对话页 | 完成 |

### 待实现 (P1+)

| 页面 | 路由 | 说明 |
|------|------|------|
| 会话历史 | `/sessions` | 浏览/恢复历史会话 |
| 设置 | `/settings` | 主题/Effort/快捷键等 |
| 工具管理 | `/tools` | 工具注册表 + MCP |
| 技能管理 | `/skills` | 技能列表/安装 |
| 记忆管理 | `/memory` | 记忆 CRUD |
| 权限管理 | `/permissions` | 路径规则/黑白名单 |
| 任务管理 | `/tasks` | 后台任务监控 |

## 后端架构

WebUI 后端复用 OpenHarness 的 ReactBackendHost 运行时：

- **对话**: WebSocket (`/ws/chat`) 传输 FrontendRequest/BackendEvent
- **配置**: REST API (`/api/providers`) 管理提供者配置
- **协议**: 与现有 OpenHarness protocol.py 兼容

未安装 OpenHarness 时，后端自动使用 Mock 模式返回模拟回复。

## 设计参考

- 色彩: 深色主题 (#0F1117 主背景), 蓝色主色调 (#2563EB)
- 布局: NavBar + SideBar + 主内容 + StatusBar
- 组件: 卡片式设计, 圆角 6px, 精简动效
