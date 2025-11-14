const API_BASE = "http://127.0.0.1:8000";

const MENU = [
  {
    title: "1. 仪表盘",
    children: [
      {
        name: "总览看板",
        path: "/dashboard",
        menuKey: "dashboard.overview",
        apiKey: "GET /api/dashboard/overview",
        method: "GET",
        endpoint: "/api/dashboard/overview",
        description: "展示容量、磁盘健康、同步状态与告警摘要",
      },
    ],
  },
  {
    title: "2. 项目中心",
    children: [
      {
        name: "项目列表",
        path: "/projects",
        menuKey: "project.list",
        apiKey: "GET /api/projects",
        method: "GET",
        endpoint: "/api/projects",
        description: "支持关键字、状态、负责人筛选",
        actions: [
          {
            label: "新建项目",
            method: "POST",
            endpoint: "/api/projects",
            samplePayload: {
              name: "新品发布会",
              clientName: "阿尔法科技",
              ownerName: "江舟",
              status: "ongoing",
              defaultStorageTargetId: 1,
              defaultStorageTargetName: "华南对象存储",
              size: 1.5,
              projectCapacityGb: 1500,
              tierLevel: "hot",
            },
          },
        ],
      },
      {
        name: "项目详情",
        path: "/projects/:projectId",
        menuKey: "project.detail",
        apiKey: "GET /api/projects/{id}",
        method: "GET",
        endpoint: "/api/projects/1",
        description: "展示项目基础信息、容量与同步关联",
      },
      {
        name: "项目成员",
        path: "/projects/:projectId/members",
        menuKey: "project.members",
        apiKey: "GET /api/projects/{id}/members",
        method: "GET",
        endpoint: "/api/projects/1/members",
        description: "查看与管理项目成员角色",
        actions: [
          {
            label: "添加成员",
            method: "POST",
            endpoint: "/api/projects/1/members",
            samplePayload: { userId: 3, role: "viewer" },
          },
        ],
      },
    ],
  },
  {
    title: "3. 素材管理",
    children: [
      {
        name: "目录浏览与文件列表",
        path: "/assets/browser",
        menuKey: "asset.browser",
        apiKey: "GET /api/projects/{id}/tree",
        method: "GET",
        endpoint: "/api/projects/1/tree",
        description: "树形目录 + 文件列表",
        actions: [
          {
            label: "新建目录",
            method: "POST",
            endpoint: "/api/folders",
            samplePayload: { projectId: 1, name: "新增分卷", parentId: 1 },
          },
        ],
      },
      {
        name: "文件详情",
        path: "/assets/:assetId",
        menuKey: "asset.detail",
        apiKey: "GET /api/assets/{id}",
        method: "GET",
        endpoint: "/api/assets/1",
        description: "预览、元数据、同步历史",
        actions: [
          {
            label: "更新元数据",
            method: "PATCH",
            endpoint: "/api/assets/1/meta",
            samplePayload: { clientName: "星河汽车", camera: "FX9", tags: ["夜景"] },
          },
          {
            label: "恢复冷数据",
            method: "POST",
            endpoint: "/api/assets/3/restore",
            samplePayload: {},
          },
        ],
      },
    ],
  },
  {
    title: "4. 导入与归档",
    children: [
      {
        name: "导入向导",
        path: "/import/wizard",
        menuKey: "import.wizard",
        apiKey: "GET /api/import/devices",
        method: "GET",
        endpoint: "/api/import/devices",
        description: "列出可导入设备",
      },
      {
        name: "导入任务列表",
        path: "/import/tasks",
        menuKey: "import.tasks",
        apiKey: "GET /api/import/tasks",
        method: "GET",
        endpoint: "/api/import/tasks",
        description: "查看状态、重试失败",
        actions: [
          {
            label: "创建导入任务",
            method: "POST",
            endpoint: "/api/import/tasks",
            samplePayload: {
              sourceDevice: "SSD-素材",
              sourcePaths: ["/素材A"],
              targetProjectId: 1,
              targetFolderId: 4,
              createdBy: "林楠",
              status: "pending",
            },
          },
        ],
      },
    ],
  },
  {
    title: "5. 搜索与视图",
    children: [
      {
        name: "全局检索",
        path: "/search",
        menuKey: "search.global",
        apiKey: "POST /api/assets/search",
        method: "POST",
        endpoint: "/api/assets/search",
        description: "关键字 + 多条件搜索",
        defaultBody: { keyword: "A", projectIds: [1] },
      },
      {
        name: "已保存视图",
        path: "/search/views",
        menuKey: "search.views",
        apiKey: "GET /api/search/views?userId=2",
        method: "GET",
        endpoint: "/api/search/views?userId=2",
        description: "个人视图管理",
        actions: [
          {
            label: "保存视图",
            method: "POST",
            endpoint: "/api/search/views",
            samplePayload: { userId: 2, name: "冷数据", conditions: { tierLevel: "cold" } },
          },
        ],
      },
    ],
  },
  {
    title: "6. 同步与分层",
    children: [
      {
        name: "同步任务管理",
        path: "/sync/tasks",
        menuKey: "sync.tasks",
        apiKey: "GET /api/sync-tasks",
        method: "GET",
        endpoint: "/api/sync-tasks",
        description: "创建/启停/立即执行",
        actions: [
          {
            label: "新建同步任务",
            method: "POST",
            endpoint: "/api/sync-tasks",
            samplePayload: {
              name: "工程备份",
              projectId: 1,
              source: "项目/工程",
              target: ["华南对象存储"],
              direction: "local_to_cloud",
              mode: "incremental",
              schedule: "每日 04:00",
              enabled: true,
            },
          },
          {
            label: "手动执行",
            method: "POST",
            endpoint: "/api/sync-tasks/1/run",
            samplePayload: {},
          },
        ],
      },
      {
        name: "同步任务执行历史",
        path: "/sync/jobs",
        menuKey: "sync.jobs",
        apiKey: "GET /api/sync-jobs",
        method: "GET",
        endpoint: "/api/sync-jobs",
        description: "按任务筛选执行记录",
      },
      {
        name: "分层策略配置",
        path: "/tier/policies",
        menuKey: "tier.policies",
        apiKey: "GET /api/tier-policies",
        method: "GET",
        endpoint: "/api/tier-policies",
        description: "全局与项目策略",
        actions: [
          {
            label: "新增项目策略",
            method: "PATCH",
            endpoint: "/api/projects/1/tier-policy",
            samplePayload: { hotToWarmDays: 10, warmToColdDays: 30, coldCacheGb: 400 },
          },
        ],
      },
      {
        name: "冷数据恢复任务",
        path: "/tier/restore-tasks",
        menuKey: "tier.restore",
        apiKey: "GET /api/restore/tasks",
        method: "GET",
        endpoint: "/api/restore/tasks",
        description: "查看回迁与重试",
        actions: [
          {
            label: "重试恢复",
            method: "POST",
            endpoint: "/api/restore/tasks/1/retry",
            samplePayload: {},
          },
        ],
      },
    ],
  },
  {
    title: "7. 存储与资源",
    children: [
      {
        name: "磁盘管理",
        path: "/storage/disks",
        menuKey: "storage.disks",
        apiKey: "GET /api/disks",
        method: "GET",
        endpoint: "/api/disks",
        description: "盘符、型号、状态与 SMART",
      },
      {
        name: "RAID 与卷管理",
        path: "/storage/arrays",
        menuKey: "storage.arrays",
        apiKey: "GET /api/storage/arrays",
        method: "GET",
        endpoint: "/api/storage/arrays",
        description: "阵列、卷创建与扩容",
        actions: [
          {
            label: "新增卷",
            method: "POST",
            endpoint: "/api/storage/volumes",
            samplePayload: { arrayId: 1, mountPoint: "/mnt/new", capacityGb: 2000, usedGb: 0, fsType: "ext4" },
          },
        ],
      },
      {
        name: "容量分析",
        path: "/storage/capacity",
        menuKey: "storage.capacity",
        apiKey: "GET /api/storage/capacity/summary",
        method: "GET",
        endpoint: "/api/storage/capacity/summary",
        description: "整体容量与分层占比",
      },
    ],
  },
  {
    title: "8. 云存储与网盘",
    children: [
      {
        name: "对象存储配置",
        path: "/storage/targets/object",
        menuKey: "cloud.object",
        apiKey: "GET /api/storage-targets?type=object",
        method: "GET",
        endpoint: "/api/storage-targets?type=object",
        description: "OSS/COS/S3 等目标",
        actions: [
          {
            label: "新增对象存储",
            method: "POST",
            endpoint: "/api/storage-targets",
            samplePayload: {
              name: "华北对象存储",
              type: "object",
              provider: "S3",
              bucket: "nas-demo",
              status: "enabled",
              endpoint: "s3.amazonaws.com",
            },
          },
        ],
      },
      {
        name: "网盘绑定管理",
        path: "/storage/targets/netdisk",
        menuKey: "cloud.netdisk",
        apiKey: "GET /api/storage-targets?type=netdisk",
        method: "GET",
        endpoint: "/api/storage-targets?type=netdisk",
        description: "扫码/账号授权",
        actions: [
          {
            label: "发起绑定",
            method: "POST",
            endpoint: "/api/netdisk/teamDrive/bind",
            samplePayload: { account: "video@team.com" },
          },
        ],
      },
    ],
  },
  {
    title: "9. 用户与权限",
    children: [
      {
        name: "用户管理",
        path: "/auth/users",
        menuKey: "auth.users",
        apiKey: "GET /api/users",
        method: "GET",
        endpoint: "/api/users",
        description: "账号、角色、状态",
        actions: [
          {
            label: "新增用户",
            method: "POST",
            endpoint: "/api/users",
            samplePayload: { username: "new_user", name: "新同事", email: "new@example.com", roles: [3], status: "enabled" },
          },
        ],
      },
      {
        name: "角色与菜单权限",
        path: "/auth/roles",
        menuKey: "auth.roles",
        apiKey: "GET /api/roles",
        method: "GET",
        endpoint: "/api/roles",
        description: "菜单 + permKey 绑定",
      },
      {
        name: "项目授权",
        path: "/auth/project-access",
        menuKey: "auth.project-access",
        apiKey: "GET /api/projects/{id}/members",
        method: "GET",
        endpoint: "/api/projects/1/members",
        description: "跨项目统一授权",
      },
    ],
  },
  {
    title: "10. 日志与审计",
    children: [
      {
        name: "操作日志",
        path: "/logs/audit",
        menuKey: "logs.audit",
        apiKey: "GET /api/audit/logs",
        method: "GET",
        endpoint: "/api/audit/logs",
        description: "登陆/上传/删除审计",
      },
      {
        name: "系统日志",
        path: "/logs/system",
        menuKey: "logs.system",
        apiKey: "GET /api/system/logs",
        method: "GET",
        endpoint: "/api/system/logs",
        description: "模块级 info/warn/error",
      },
    ],
  },
  {
    title: "11. 告警与监控",
    children: [
      {
        name: "告警列表",
        path: "/alerts",
        menuKey: "alerts.list",
        apiKey: "GET /api/alerts",
        method: "GET",
        endpoint: "/api/alerts",
        description: "容量/磁盘/同步告警",
        actions: [
          {
            label: "更新告警状态",
            method: "PATCH",
            endpoint: "/api/alerts/1",
            samplePayload: { status: "processing", handler: "admin", handledAt: new Date().toISOString() },
          },
        ],
      },
      {
        name: "告警规则与通知",
        path: "/alerts/settings",
        menuKey: "alerts.settings",
        apiKey: "GET /api/alerts/settings",
        method: "GET",
        endpoint: "/api/alerts/settings",
        description: "阈值与通知渠道",
      },
    ],
  },
  {
    title: "12. 系统设置",
    children: [
      {
        name: "基础设置",
        path: "/settings/base",
        menuKey: "settings.base",
        apiKey: "GET /api/settings/base",
        method: "GET",
        endpoint: "/api/settings/base",
        description: "系统名、时区、语言",
        actions: [
          {
            label: "更新基础设置",
            method: "POST",
            endpoint: "/api/settings/base",
            samplePayload: { systemName: "创作 NAS X", timezone: "Asia/Shanghai" },
          },
        ],
      },
      {
        name: "网络与服务",
        path: "/settings/network",
        menuKey: "settings.network",
        apiKey: "GET /api/settings/network",
        method: "GET",
        endpoint: "/api/settings/network",
        description: "IP/DNS/SMB/NFS",
        actions: [
          {
            label: "更新网络配置",
            method: "POST",
            endpoint: "/api/settings/network",
            samplePayload: { mode: "static", ip: "192.168.10.60", gateway: "192.168.10.1" },
          },
        ],
      },
      {
        name: "备份与恢复",
        path: "/settings/backup",
        menuKey: "settings.backup",
        apiKey: "GET /api/settings/backup",
        method: "GET",
        endpoint: "/api/settings/backup",
        description: "导出配置、导入恢复",
        actions: [
          {
            label: "上传恢复文件",
            method: "POST",
            endpoint: "/api/settings/restore",
            samplePayload: { file: "config-latest.json" },
          },
        ],
      },
    ],
  },
];

const menuContainer = document.getElementById("menu");
const content = document.getElementById("content");
let activeKey = null;

function renderMenu() {
  menuContainer.innerHTML = "";
  MENU.forEach((group) => {
    const groupEl = document.createElement("div");
    groupEl.className = "menu-group";
    const titleEl = document.createElement("h3");
    titleEl.textContent = group.title;
    groupEl.appendChild(titleEl);

    group.children.forEach((item) => {
      const btn = document.createElement("div");
      btn.className = "menu-item";
      btn.textContent = `${item.name} (${item.menuKey})`;
      if (item.menuKey === activeKey) {
        btn.classList.add("active");
      }
      btn.addEventListener("click", () => loadItem(item));
      groupEl.appendChild(btn);
    });

    menuContainer.appendChild(groupEl);
  });
}

async function loadItem(item) {
  activeKey = item.menuKey;
  renderMenu();
  content.innerHTML = "";
  const header = document.createElement("div");
  header.className = "content-header";
  header.innerHTML = `
    <h2>${item.name}</h2>
    <p>${item.description || ""}</p>
    <div class="meta">
      <span>path: ${item.path}</span>
      <span>menuKey: ${item.menuKey}</span>
      <span>api: ${item.apiKey}</span>
      ${item.actions ? `<span>可操作 ${item.actions.length} 项</span>` : ""}
    </div>
  `;
  content.appendChild(header);

  const resultPre = document.createElement("pre");
  resultPre.textContent = "加载中...";
  content.appendChild(resultPre);

  try {
    const response = await callApi(item.method, item.endpoint, item.defaultBody);
    resultPre.textContent = JSON.stringify(response, null, 2);
  } catch (error) {
    resultPre.textContent = `请求失败: ${error.message}`;
  }

  if (item.actions && item.actions.length) {
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "actions";
    actionsWrap.innerHTML = `<h3>可执行操作</h3>`;
    item.actions.forEach((action) => {
      actionsWrap.appendChild(createActionCard(action));
    });
    content.appendChild(actionsWrap);
  }
}

async function callApi(method = "GET", endpoint = "", body) {
  const url = `${API_BASE}${endpoint}`;
  const options = { method, headers: {} };
  if (["POST", "PATCH", "PUT", "DELETE"].includes(method) && body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

function createActionCard(action) {
  const card = document.createElement("div");
  card.className = "action-card";
  card.innerHTML = `
    <h4>${action.label}</h4>
    <p><code>${action.method} ${action.endpoint}</code></p>
  `;
  const textarea = document.createElement("textarea");
  if (action.samplePayload !== undefined) {
    textarea.value = JSON.stringify(action.samplePayload, null, 2);
  } else {
    textarea.placeholder = "可选：输入 JSON 负载";
  }
  card.appendChild(textarea);
  const runBtn = document.createElement("button");
  runBtn.textContent = "执行";
  const status = document.createElement("div");
  status.className = "result-status";
  runBtn.addEventListener("click", async () => {
    try {
      const payload = textarea.value ? JSON.parse(textarea.value) : undefined;
      const res = await callApi(action.method, action.endpoint, payload);
      status.style.color = "#059669";
      status.textContent = `成功: ${JSON.stringify(res)}`;
    } catch (error) {
      status.style.color = "#dc2626";
      status.textContent = `失败: ${error.message}`;
    }
  });
  card.appendChild(runBtn);
  card.appendChild(status);
  return card;
}

renderMenu();
