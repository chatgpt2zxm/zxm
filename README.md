# 创作 NAS 混合云演示系统（前后端分离版）

本仓库实现了“统一菜单 + 权限控制”方案中列出的全部菜单、接口与操作。系统分为 FastAPI 后端与纯静态前端：

- **后端（`backend/`）**：提供 `/api` 命名空间下 60+ 个 REST 接口，覆盖仪表盘、项目、素材、导入、同步、分层、存储、云目标、用户权限、日志告警、系统设置等模块，所有数据由 `data_store.json` 持久化，可直接进行增删改查。
- **前端（`frontend/`）**：一个零依赖的控制台式页面，按照“一级/二级菜单 + path/menuKey/permKey/apiKey”展示所有模块，点击任意菜单即可调用对应接口并查看返回 JSON，同时可在页面内直接执行 POST/PATCH 等写操作。

## 快速开始

1. 安装依赖并启动 FastAPI 后端（会自动托管前端静态文件）：

   ```bash
   pip install -r requirements.txt
   uvicorn app:app --reload --port 8000
   ```

2. 打开 <http://127.0.0.1:8000> 即可在同一端口访问控制台与 API。如仍希望单独部署前端，可用 `python -m http.server -d frontend` 并把 `frontend/main.js` 中的 `API_BASE` 指向后端地址。

## 主要能力对照

| 一级菜单 | 二级菜单 | path/menuKey | 主要接口（permKey 可在 `/api/permissions` 查看） |
| --- | --- | --- | --- |
| 仪表盘 | 总览看板 | `/dashboard` / `dashboard.overview` | `GET /api/dashboard/overview` |
| 项目中心 | 项目列表 / 项目详情 / 项目成员 | `/projects` 等 | `GET/POST/PATCH/DELETE /api/projects`、`/api/projects/{id}/members` |
| 素材管理 | 目录浏览 / 文件详情 | `/assets/browser` | `GET /api/projects/{id}/tree`、`GET/PATCH /api/assets/{id}` |
| 导入与归档 | 导入向导 / 任务列表 | `/import/wizard` | `GET /api/import/devices`、`/api/import/tasks` |
| 搜索与视图 | 全局检索 / 已保存视图 | `/search` | `POST /api/assets/search`、`/api/search/views` |
| 同步与分层 | 同步任务 / 执行历史 / 分层策略 / 冷数据恢复 | `/sync/tasks` 等 | `GET/POST/PATCH /api/sync-tasks`、`/api/sync-jobs`、`/api/tier-policies`、`/api/restore/tasks` |
| 存储与资源 | 磁盘 / RAID / 容量 | `/storage/disks` | `GET /api/disks`、`/api/storage/arrays`、`/api/storage/capacity/*` |
| 云存储与网盘 | 对象存储配置 / 网盘绑定 | `/storage/targets/*` | `GET/POST/PATCH/DELETE /api/storage-targets`、`/api/netdisk/{provider}/bind` |
| 用户与权限 | 用户 / 角色 / 项目授权 | `/auth/*` | `GET/POST/PATCH /api/users`、`/api/roles` |
| 日志与审计 | 操作日志 / 系统日志 | `/logs/*` | `GET /api/audit/logs`、`/api/system/logs` |
| 告警与监控 | 告警列表 / 告警规则 | `/alerts*` | `GET/PATCH /api/alerts`、`GET/POST /api/alerts/settings` |
| 系统设置 | 基础 / 网络 / 备份 | `/settings/*` | `GET/POST /api/settings/base|network|backup|restore` |

所有接口均返回 JSON，且示例数据在 `backend/datastore.py` 中可自由扩展。若删除 `data_store.json`，系统会自动恢复默认演示数据。

## 数据存储

- `backend/datastore.py` 定义了默认数据结构（项目、文件、任务、策略、用户、告警、设置等）以及统一的增删改查工具。
- 所有写操作都会立即落盘到 `data_store.json`，便于多次启动与调试。

## 自定义与扩展

- 可在前端 `MENU` 配置中追加新的路由或动作，满足更多自定义 API 调用。
- 后端可替换为真实数据库或接入业务逻辑，只需保持接口协议即可。

欢迎在此基础上继续深化 UI、接入真实认证、或对接实际的 NAS/云存储控制平面。
