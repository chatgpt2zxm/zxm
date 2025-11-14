const API_BASE = window.API_BASE || window.location.origin;
const HTTP_METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE"];

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

const buildUrl = (endpoint = "") => {
  if (/^https?:/i.test(endpoint)) {
    return endpoint;
  }
  if (!endpoint.startsWith("/")) {
    return `${API_BASE}/${endpoint}`;
  }
  return `${API_BASE}${endpoint}`;
};

const callApi = async (method = "GET", endpoint = "", body) => {
  const url = buildUrl(endpoint);
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
};

const parsePayload = (text) => {
  if (!text || !text.trim()) {
    return { data: undefined };
  }
  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    return { error };
  }
};

const formatResponse = (payload) => {
  if (payload === null || payload === undefined) {
    return "";
  }
  if (typeof payload === "string") {
    return payload;
  }
  return JSON.stringify(payload, null, 2);
};

const app = Vue.createApp({
  data() {
    return {
      apiBase: API_BASE,
      menuGroups: MENU,
      httpMethods: HTTP_METHODS,
      selectedItem: null,
      request: {
        method: "",
        endpoint: "",
        payloadText: "",
      },
      primary: {
        loading: false,
        error: "",
        response: null,
      },
      actionsState: [],
    };
  },
  computed: {
    prettyPrimaryResponse() {
      return formatResponse(this.primary.response);
    },
  },
  methods: {
    selectMenu(item) {
      this.selectedItem = item;
      this.request.method = item.method;
      this.request.endpoint = item.endpoint;
      this.request.payloadText = item.defaultBody
        ? JSON.stringify(item.defaultBody, null, 2)
        : "";
      this.primary.loading = false;
      this.primary.error = "";
      this.primary.response = null;
      this.actionsState = (item.actions || []).map((action) => ({
        ...action,
        payloadText:
          action.samplePayload !== undefined
            ? JSON.stringify(action.samplePayload, null, 2)
            : "",
        status: "",
        isError: false,
        loading: false,
      }));
      this.executePrimaryRequest();
    },
    async executePrimaryRequest() {
      this.primary.loading = true;
      this.primary.error = "";
      this.primary.response = null;
      const parsed = parsePayload(this.request.payloadText);
      if (parsed.error) {
        this.primary.loading = false;
        this.primary.error = `JSON 解析失败：${parsed.error.message}`;
        return;
      }
      try {
        const response = await callApi(
          this.request.method,
          this.request.endpoint,
          parsed.data,
        );
        this.primary.response = response;
      } catch (error) {
        this.primary.error = error.message;
      } finally {
        this.primary.loading = false;
      }
    },
    actionPlaceholder(action) {
      return action.samplePayload === undefined ? "可选：输入 JSON 负载" : "";
    },
    async runAction(index) {
      const action = this.actionsState[index];
      if (!action) return;
      action.loading = true;
      action.status = "";
      action.isError = false;
      const parsed = parsePayload(action.payloadText);
      if (parsed.error) {
        action.loading = false;
        action.status = `JSON 解析失败：${parsed.error.message}`;
        action.isError = true;
        return;
      }
      try {
        const response = await callApi(action.method, action.endpoint, parsed.data);
        action.status = `成功：${formatResponse(response)}`;
      } catch (error) {
        action.status = `失败：${error.message}`;
        action.isError = true;
      } finally {
        action.loading = false;
      }
    },
  },
  template: `
    <div class="app-shell">
      <header>
        <div>
          <h1>创作 NAS 混合云统一菜单</h1>
          <p>左侧选择菜单，Vue 前端会直接调用 Python FastAPI 的 /api 接口。</p>
        </div>
        <span class="api-base">API: {{ apiBase }}</span>
      </header>
      <main>
        <aside class="menu-panel">
          <div v-for="group in menuGroups" :key="group.title" class="menu-group">
            <h3>{{ group.title }}</h3>
            <button
              v-for="item in group.children"
              :key="item.menuKey"
              class="menu-item"
              :class="{ active: selectedItem && selectedItem.menuKey === item.menuKey }"
              @click="selectMenu(item)"
            >
              <span class="menu-name">{{ item.name }}</span>
              <span class="menu-key">{{ item.menuKey }}</span>
            </button>
          </div>
        </aside>
        <section class="content-panel">
          <div v-if="!selectedItem" class="placeholder">
            <h2>请选择菜单</h2>
            <p>Vue 控制台会展示 path/menuKey/apiKey 信息，并可直接发起请求。</p>
          </div>
          <div v-else>
            <div class="content-header">
              <h2>{{ selectedItem.name }}</h2>
              <p>{{ selectedItem.description }}</p>
              <div class="meta">
                <span>path: {{ selectedItem.path }}</span>
                <span>menuKey: {{ selectedItem.menuKey }}</span>
                <span>api: {{ selectedItem.apiKey }}</span>
                <span v-if="actionsState.length">操作：{{ actionsState.length }}</span>
              </div>
            </div>
            <div class="panel">
              <div class="panel-header">
                <h3>接口调试</h3>
                <span>{{ request.method }} {{ request.endpoint }}</span>
              </div>
              <div class="form-grid">
                <label>
                  Method
                  <select v-model="request.method">
                    <option v-for="method in httpMethods" :key="method" :value="method">
                      {{ method }}
                    </option>
                  </select>
                </label>
                <label class="endpoint">
                  Endpoint
                  <input v-model="request.endpoint" />
                </label>
              </div>
              <label class="textarea-label">
                请求体
                <textarea
                  v-model="request.payloadText"
                  placeholder="GET 请求可留空"
                ></textarea>
              </label>
              <div class="panel-actions">
                <button @click="executePrimaryRequest" :disabled="primary.loading">
                  {{ primary.loading ? "请求中..." : "重新请求" }}
                </button>
                <span class="error" v-if="primary.error">{{ primary.error }}</span>
              </div>
              <pre v-if="primary.response !== null">{{ prettyPrimaryResponse }}</pre>
              <div v-else-if="primary.loading" class="loading">请求中...</div>
            </div>
            <div class="actions" v-if="actionsState.length">
              <h3>可执行操作</h3>
              <div class="actions-grid">
                <div
                  v-for="(action, index) in actionsState"
                  :key="action.label + action.endpoint"
                  class="action-card"
                >
                  <div class="action-meta">
                    <strong>{{ action.label }}</strong>
                    <code>{{ action.method }} {{ action.endpoint }}</code>
                  </div>
                  <textarea
                    v-model="action.payloadText"
                    :placeholder="actionPlaceholder(action)"
                  ></textarea>
                  <div class="panel-actions">
                    <button @click="runAction(index)" :disabled="action.loading">
                      {{ action.loading ? "执行中..." : "执行" }}
                    </button>
                    <span class="result-status" :class="{ error: action.isError }" v-if="action.status">
                      {{ action.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
});

app.mount("#app");
