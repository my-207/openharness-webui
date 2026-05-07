# OpenHarness WebUI

## Project Overview
OpenHarness 的浏览器端 WebUI — AI 编程助手的对话界面。前端 React + TypeScript + Vite + Tailwind CSS，后端 Python FastAPI + WebSocket。

## Quick Start

### Backend
```bash
cd webui/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd webui/frontend
npm install
npm run dev
```

### Visit
http://localhost:5173

## Project Structure

```
webui/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── main.py             # 入口，注册路由 + WebSocket /ws/chat
│   │   ├── models.py           # Pydantic 协议模型
│   │   ├── ws_manager.py       # WebSocket 连接管理器
│   │   ├── routers/            # REST API 路由
│   │   │   ├── sessions.py     # /api/sessions CRUD
│   │   │   ├── providers.py    # /api/providers CRUD
│   │   │   ├── skills.py       # /api/skills
│   │   │   ├── settings.py     # /api/settings
│   │   │   ├── auth.py         # /api/auth
│   │   │   ├── tools.py        # /api/tools + MCP
│   │   │   ├── memory.py       # /api/memory
│   │   │   ├── tasks.py        # /api/tasks
│   │   │   ├── plugins.py      # /api/plugins
│   │   │   ├── swarm.py        # /api/swarm
│   │   │   ├── cron.py         # /api/cron
│   │   │   ├── autopilot.py    # /api/autopilot
│   │   │   ├── ohmo.py         # /api/ohmo
│   │   │   └── permissions.py  # /api/permissions
│   │   └── services/           # 业务逻辑层
│   │       ├── chat_handler.py # WebSocket 对话处理核心
│   │       ├── sessions_service.py
│   │       ├── provider_service.py
│   │       └── ...
│   └── requirements.txt
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── main.tsx            # 入口
│   │   ├── App.tsx             # 路由配置
│   │   ├── index.css           # Tailwind + CSS 变量主题
│   │   ├── types/protocol.ts   # 前后端通信协议类型
│   │   ├── components/
│   │   │   ├── layout/         # AppLayout, NavBar, SideBar, StatusBar
│   │   │   ├── chat/           # MessageList, MessageBubble, ChatInput, RightPanel, PermissionModal
│   │   │   ├── providers/      # ProviderCard, ProviderFormModal
│   │   │   └── shared/         # Button, Modal, Input, Select, Toggle, Badge, Spinner, Toast
│   │   ├── pages/              # 每个路由对应一个页面组件
│   │   ├── stores/             # Zustand 状态管理
│   │   └── locales/            # i18n JSON (en, zh-CN)
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── OpenHarness/                # 子模块 (OpenHarness 核心)
└── webui/*.py                  # Python 测试文件
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 6, Tailwind CSS 3 |
| State | Zustand 5 |
| Routing | react-router-dom 6 |
| Backend | Python 3.10+, FastAPI, uvicorn |
| Protocol | WebSocket (typed JSON events) |
| Icons | lucide-react |

## Architecture & Conventions

### Backend
- **Pattern**: FastAPI router → service layer → JSON file / file-based storage
- **Routers** in `routers/` define endpoints, **services** in `services/` contain logic
- **WebSocket**: `/ws/chat` — FrontendRequest (client→server) / BackendEvent (server→client) protocol
- **REST APIs**: `/api/*` standard CRUD
- **Data storage**: JSON files in `backend/data/` directory
- **Dual mode**: Real OpenHarness runtime when available, otherwise mock responses
- All Python files use `from __future__ import annotations`

### Frontend
- **Routing**: All routes nested under `<AppLayout>` which provides NavBar + SideBar + StatusBar
- **State**: Separate Zustand store per domain (chatStore, providerStore, sessionsStore, etc.)
- **i18n**: All user-facing strings in `locales/` JSON files, keys like `"page.key"`
- **CSS**: Tailwind utility classes + CSS custom properties for theming (light/dark)
- **Components**: Shared UI kit in `components/shared/` (Button, Modal, Input, Select, Toggle, etc.)
- **WS connection**: Established once in AppLayout, doesn't disconnect on route change

### Key Patterns
- Backend: `APIRouter(prefix="/api/xxx")` + `tags=["xxx"]`, with typed Pydantic request models
- Frontend: Named function components, Zustand stores with `create<Interface>((set, get) => ({...}))`
- Error handling: try/except in services, HTTPException to return proper status codes
- Session auto-save: Debounced (500ms) transcript save after each `line_complete` event

### Testing
- Python test files at `webui/` level (test_*.py)
- Tests use direct HTTP/WS calls to backend

## Naming Conventions
- Python: `snake_case` for files, functions, variables
- TypeScript: `camelCase` for variables/functions, `PascalCase` for components/types
- CSS: Utility-first (Tailwind), CSS variables for theme colors
- Store files: `{domain}Store.ts`
- Page files: `{Name}Page.tsx`

## Routes (Frontend)
| Path | Component | Description |
|------|-----------|-------------|
| `/` or `/chat` | ChatPage | Chat interface (streaming) |
| `/providers` | ProvidersPage | LLM provider config |
| `/sessions` | SessionsPage | Session history |
| `/settings` | SettingsPage | App settings |
| `/permissions` | PermissionsPage | Permission rules |
| `/tools` | ToolsPage | Tools + MCP servers |
| `/skills` | SkillsPage | Skill management |
| `/skills/:name` | SkillDetailPage | Skill detail |
| `/memory` | MemoryPage | Memory CRUD |
| `/tasks` | TasksPage | Background tasks |
| `/plugins` | PluginsPage | Plugin management |
| `/swarm` | SwarmPage | Swarm team management |
| `/cron` | CronPage | Cron job scheduler |
| `/autopilot` | AutopilotPage | Autopilot mode |
| `/auth` | AuthPage | Auth management |
| `/bridge` | BridgePage | Bridge sessions |
| `/about` | AboutPage | Version info |

## Environment
- Platform: Windows 11 (WSL/bash environment)
- Node.js >= 18, Python >= 3.10
- Ports: 5173 (Vite), 8000 (uvicorn)
- WS connects directly to port 8000 (not through Vite proxy)
