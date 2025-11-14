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
        description:
          "开机后即展示容量、分层、磁盘健康、同步任务与告警的健康视图，帮助快速判断 NAS 状态。",
        features: [
          "容量监控：显示总容量 / 已用 / 剩余容量。",
          "分层结构：以热 / 温 / 冷比例展示空间分布。",
          "磁盘健康：统计正常 / 警告 / 故障盘数量。",
          "同步任务：展示最近 24 小时成功 / 失败次数。",
          "告警联动：展示未处理告警数量并支持跳转。",
        ],
        apis: [
          {
            method: "GET",
            endpoint: "/api/dashboard/overview",
            description: "获取容量、分层、磁盘、同步与告警摘要。",
          },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/dashboard/overview" },
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
        description: "统一管理所有项目并提供多条件筛选与 CRUD 操作。",
        features: [
          "条件查询：按项目名称、客户、状态、负责人、创建时间范围过滤。",
          "列表字段：项目名称、客户、负责人、状态、创建 / 最近更新时间、占用容量。",
          "操作：新建、编辑、状态变更（完成 / 归档）、删除，点击名称进入详情。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/projects", description: "分页查询项目列表。" },
          { method: "POST", endpoint: "/api/projects", description: "新建项目。" },
          { method: "GET", endpoint: "/api/projects/{project_id}", description: "获取项目详情。" },
          { method: "PATCH", endpoint: "/api/projects/{project_id}", description: "更新项目信息或状态。" },
          { method: "DELETE", endpoint: "/api/projects/{project_id}", description: "删除项目（可按需软删）。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/projects" },
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
        description: "展示单个项目的基础信息、容量统计以及关联同步任务。",
        features: [
          "基础信息：名称、客户、负责人、状态、备注。",
          "容量统计：占用总容量、文件总数、按热 / 温 / 冷分布、目录容量 Top。",
          "同步概览：列出关联同步任务名称、目标、最近执行状态。",
          "操作：编辑、标记完成、跳转目录浏览或成员管理。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/projects/{project_id}", description: "获取项目基本信息。" },
          { method: "GET", endpoint: "/api/projects/{project_id}/stats", description: "查询容量与分层统计。" },
          { method: "GET", endpoint: "/api/projects/{project_id}/sync-tasks", description: "获取项目关联同步任务。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/projects/1" },
        actions: [
          { label: "查看容量统计", method: "GET", endpoint: "/api/projects/1/stats" },
        ],
      },
      {
        name: "项目成员管理",
        path: "/projects/:projectId/members",
        menuKey: "project.members",
        description: "维护项目成员及其项目内角色，用于控制目录权限。",
        features: [
          "成员列表：展示账号、姓名、角色、加入时间。",
          "添加成员：从系统用户选择并指定负责人 / 编辑 / 只读角色。",
          "角色调整：支持修改成员项目内角色。",
          "移除成员：移除后立即收回访问权限。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/projects/{project_id}/members", description: "查询项目成员列表。" },
          { method: "POST", endpoint: "/api/projects/{project_id}/members", description: "添加项目成员。" },
          {
            method: "PATCH",
            endpoint: "/api/projects/{project_id}/members/{user_id}",
            description: "调整成员项目内角色。",
          },
          {
            method: "DELETE",
            endpoint: "/api/projects/{project_id}/members/{user_id}",
            description: "移除成员。",
          },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/projects/1/members" },
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
        description: "以项目维度展示目录树与文件列表，支持批量操作。",
        features: [
          "项目选择：支持顶部或左侧切换项目。",
          "目录树：展示结构、可展开 / 折叠、新建、重命名、删除空目录。",
          "文件列表：显示缩略图、名称、类型、大小、标签、分层、本地 / 云状态等，可切换列表 / 缩略图视图。",
          "文件操作：移动、删除、重命名、批量标签 / 元数据更新。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/projects/{project_id}/tree", description: "获取项目目录树。" },
          { method: "GET", endpoint: "/api/folders/{folder_id}/assets", description: "查询目录下文件列表。" },
          { method: "POST", endpoint: "/api/folders", description: "新建目录。" },
          { method: "PATCH", endpoint: "/api/folders/{folder_id}", description: "重命名或移动目录。" },
          { method: "DELETE", endpoint: "/api/folders/{folder_id}", description: "删除空目录。" },
          { method: "PATCH", endpoint: "/api/assets/batch", description: "批量移动 / 删除 / 标签更新。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/projects/1/tree" },
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
        name: "文件详情与预览",
        path: "/assets/:assetId",
        menuKey: "asset.detail",
        description: "查看单个素材文件的基础信息、元数据、标签与同步记录。",
        features: [
          "基础信息：文件名、所在目录、大小、类型、创建 / 修改时间。",
          "媒体属性：分辨率、时长、帧率、编码等。",
          "业务元数据：客户、拍摄日期、摄影师、机位、场景。",
          "标签与分层：管理标签、显示热 / 温 / 冷与本地 / 云状态。",
          "同步记录与冷数据恢复：查看最近同步结果并触发恢复任务。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/assets/{asset_id}", description: "获取文件详情。" },
          { method: "PATCH", endpoint: "/api/assets/{asset_id}/meta", description: "更新业务元数据与标签。" },
          { method: "POST", endpoint: "/api/assets/{asset_id}/restore", description: "创建冷数据恢复任务。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/assets/1" },
        actions: [
          {
            label: "更新元数据",
            method: "PATCH",
            endpoint: "/api/assets/1/meta",
            samplePayload: { clientName: "星河汽车", camera: "FX9", tags: ["夜景"] },
          },
          { label: "恢复冷数据", method: "POST", endpoint: "/api/assets/3/restore", samplePayload: {} },
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
        description: "通过引导式流程把外部设备素材导入到指定项目目录。",
        features: [
          "自动检测外部设备并展示名称、挂载路径、容量。",
          "支持浏览设备目录并多选来源路径。",
          "选择目标项目与目录，可按规则自动建子目录。",
          "配置重复文件策略（跳过 / 覆盖 / 重命名）。",
          "提交后生成导入任务，由后台异步执行。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/import/devices", description: "列出可导入设备。" },
          { method: "POST", endpoint: "/api/import/tasks", description: "创建导入任务。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/import/devices" },
      },
      {
        name: "导入任务列表",
        path: "/import/tasks",
        menuKey: "import.tasks",
        description: "跟踪导入任务执行进度、失败情况及重试。",
        features: [
          "列表字段：任务 ID、来源、目标项目 / 目录、创建人、状态、起止时间、文件数。",
          "筛选条件：按项目、创建人、状态、时间范围过滤。",
          "任务详情：展示失败文件及原因。",
          "操作：失败文件重试、停止执行中的任务（可选实现）。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/import/tasks", description: "查询导入任务列表。" },
          { method: "GET", endpoint: "/api/import/tasks/{task_id}", description: "查看导入任务详情。" },
          { method: "POST", endpoint: "/api/import/tasks/{task_id}/retry", description: "对失败文件重试导入。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/import/tasks" },
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
        description: "跨项目的素材检索能力，支持多维度组合过滤。",
        features: [
          "关键字匹配文件名、项目名、客户名、标签。",
          "支持多项目、文件类型、时间范围、分辨率区间、标签等过滤。",
          "结果以卡片 / 列表展示缩略图、文件名、项目、分层、本地 / 云状态。",
          "操作：打开详情、跳转所在目录、保存当前检索条件为视图。",
        ],
        apis: [
          { method: "POST", endpoint: "/api/assets/search", description: "根据条件组合检索素材，返回分页结果。" },
        ],
        defaultRequest: {
          method: "POST",
          endpoint: "/api/assets/search",
          body: { keyword: "A", projectIds: [1] },
        },
      },
      {
        name: "已保存视图",
        path: "/search/views",
        menuKey: "search.views",
        description: "管理个人常用检索视图，便于快速切换条件。",
        features: [
          "列表展示视图名称、条件摘要、最近使用时间。",
          "操作：应用视图（跳转到检索并带入条件）、重命名、删除。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/search/views?userId={user_id}", description: "列出指定用户保存的视图。" },
          { method: "POST", endpoint: "/api/search/views", description: "保存新的视图条件。" },
          { method: "PATCH", endpoint: "/api/search/views/{view_id}", description: "更新视图名称或条件。" },
          { method: "DELETE", endpoint: "/api/search/views/{view_id}", description: "删除视图。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/search/views?userId=2" },
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
        description: "配置项目 / 目录与云存储之间的同步策略。",
        features: [
          "任务列表：任务名称、源范围、目标、方向、模式、调度、启用状态、最近结果。",
          "向导：选择源项目 / 目录、目标存储、方向、过滤规则、调度计划、带宽限制。",
          "操作：启用 / 停用、立即执行、删除、查看历史。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/sync-tasks", description: "查询同步任务列表。" },
          { method: "POST", endpoint: "/api/sync-tasks", description: "创建同步任务。" },
          { method: "GET", endpoint: "/api/sync-tasks/{task_id}", description: "获取任务详情。" },
          { method: "PATCH", endpoint: "/api/sync-tasks/{task_id}", description: "编辑同步任务。" },
          { method: "PATCH", endpoint: "/api/sync-tasks/{task_id}/enable", description: "启用 / 停用任务。" },
          { method: "POST", endpoint: "/api/sync-tasks/{task_id}/run", description: "手动立即执行任务。" },
          { method: "DELETE", endpoint: "/api/sync-tasks/{task_id}", description: "删除任务。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/sync-tasks" },
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
          { label: "手动执行", method: "POST", endpoint: "/api/sync-tasks/1/run", samplePayload: {} },
        ],
      },
      {
        name: "同步任务执行历史",
        path: "/sync/jobs",
        menuKey: "sync.jobs",
        description: "查看同步任务执行记录与结果。",
        features: [
          "列表字段：执行 ID、任务名称 / ID、起止时间、状态、总文件数、成功数、失败数。",
          "筛选条件：按任务、状态、时间范围过滤。",
          "详情：查看失败文件列表与原因。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/sync-jobs", description: "查询执行记录，可按任务过滤。" },
          { method: "GET", endpoint: "/api/sync-jobs/{job_id}", description: "查看单次执行详情。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/sync-jobs" },
      },
      {
        name: "分层策略配置",
        path: "/tier/policies",
        menuKey: "tier.policies",
        description: "配置热 / 温 / 冷生命周期策略以及项目级覆盖。",
        features: [
          "全局策略：设置热→温、温→冷阈值与冷数据本地缓存上限。",
          "项目覆盖：为单个项目定义独立策略或恢复继承。",
          "策略执行：后台按策略定期调整分层并执行清理。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/tier-policies", description: "获取全局与项目策略。" },
          { method: "POST", endpoint: "/api/tier-policies", description: "创建或更新全局策略。" },
          {
            method: "PATCH",
            endpoint: "/api/projects/{project_id}/tier-policy",
            description: "设置或恢复项目策略。",
          },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/tier-policies" },
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
        description: "管理云端冷数据恢复到本地的任务队列。",
        features: [
          "列表字段：任务 ID、发起人、对象类型、项目、状态、起止时间、失败原因。",
          "筛选：按项目、发起人、状态、时间范围过滤。",
          "详情：展示涉及的文件 / 目录及恢复结果。",
          "操作：对失败任务发起重试。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/restore/tasks", description: "列出恢复任务。" },
          { method: "GET", endpoint: "/api/restore/tasks/{task_id}", description: "查看恢复任务详情。" },
          { method: "POST", endpoint: "/api/restore/tasks/{task_id}/retry", description: "重试恢复任务。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/restore/tasks" },
        actions: [{ label: "重试恢复", method: "POST", endpoint: "/api/restore/tasks/1/retry", samplePayload: {} }],
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
        description: "监控物理磁盘容量与健康状态，联动告警。",
        features: [
          "磁盘列表：设备名、型号、容量、温度、S.M.A.R.T 健康状态。",
          "详情：展示关键 S.M.A.R.T 指标。",
          "异常联动：磁盘异常时在告警列表生成记录。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/disks", description: "列出所有磁盘信息。" },
          { method: "GET", endpoint: "/api/disks/{disk_id}", description: "查看单盘详细信息。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/disks" },
      },
      {
        name: "RAID 与卷管理",
        path: "/storage/arrays",
        menuKey: "storage.arrays",
        description: "配置与监控存储阵列和逻辑卷。",
        features: [
          "阵列列表：RAID 类型、成员磁盘、总容量、可用容量、状态。",
          "卷管理：展示卷所属阵列、挂载点、总容量、已用容量。",
          "操作：创建阵列、创建卷并挂载、扩容（添加新盘扩展阵列 / 卷）。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/storage/arrays", description: "列出存储阵列。" },
          { method: "POST", endpoint: "/api/storage/arrays", description: "创建存储阵列。" },
          { method: "GET", endpoint: "/api/storage/volumes", description: "列出存储卷。" },
          { method: "POST", endpoint: "/api/storage/volumes", description: "创建存储卷。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/storage/arrays" },
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
        description: "展示全局与项目维度的容量占用情况。",
        features: [
          "全局容量：总容量、已用、剩余、按热 / 温 / 冷分层统计。",
          "项目排名：列出项目占用容量并可跳转项目详情。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/storage/capacity/summary", description: "获取整体容量统计。" },
          { method: "GET", endpoint: "/api/storage/capacity/by-project", description: "按项目统计容量。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/storage/capacity/summary" },
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
        description: "管理接入的对象存储（S3 / OSS / COS 等）。",
        features: [
          "配置列表：名称、类型、Bucket、状态（启用 / 停用）。",
          "操作：新增（填写 endpoint、AK/SK、Bucket）、测试连接、编辑、启用 / 停用、删除。",
          "引用校验：删除前校验是否被同步任务引用。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/storage-targets?type=object", description: "列出对象存储配置。" },
          { method: "POST", endpoint: "/api/storage-targets", description: "新增对象存储。" },
          { method: "PATCH", endpoint: "/api/storage-targets/{id}", description: "编辑对象存储。" },
          { method: "POST", endpoint: "/api/storage-targets/{id}/test", description: "测试连接。" },
          { method: "DELETE", endpoint: "/api/storage-targets/{id}", description: "删除对象存储。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/storage-targets?type=object" },
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
        description: "管理个人 / 团队网盘授权，供同步任务作为目标。",
        features: [
          "绑定列表：网盘类型、账号标识、绑定用户、状态、授权时间 / 到期时间。",
          "新增绑定：选择网盘类型，生成二维码供手机 App 扫码授权。",
          "授权查询：轮询扫码状态，成功后生成存储目标记录。",
          "解绑与刷新授权。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/storage-targets?type=netdisk", description: "列出已绑定网盘。" },
          { method: "POST", endpoint: "/api/netdisk/{provider}/bind", description: "发起扫码绑定会话。" },
          {
            method: "GET",
            endpoint: "/api/netdisk/{provider}/bind/status?session=...",
            description: "轮询会话状态。",
          },
          { method: "DELETE", endpoint: "/api/storage-targets/{id}", description: "解绑网盘。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/storage-targets?type=netdisk" },
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
        description: "维护系统用户账号、角色与状态。",
        features: [
          "用户列表：账号、姓名、角色列表、状态、最近登录时间。",
          "操作：新建、编辑基础信息、启用 / 禁用、重置密码。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/users", description: "查询用户列表。" },
          { method: "POST", endpoint: "/api/users", description: "创建用户。" },
          { method: "PATCH", endpoint: "/api/users/{user_id}", description: "编辑用户信息。" },
          { method: "POST", endpoint: "/api/users/{user_id}/reset-password", description: "重置密码。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/users" },
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
        description: "基于 RBAC 的角色、菜单、操作权限配置。",
        features: [
          "角色列表：名称、描述、关联用户数。",
          "配置：为角色分配菜单（menuKey）与操作权限（permKey）。",
          "操作：新建、编辑、删除角色，提供权限清单。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/roles", description: "查询角色列表。" },
          { method: "POST", endpoint: "/api/roles", description: "创建角色。" },
          { method: "PATCH", endpoint: "/api/roles/{role_id}", description: "更新角色。" },
          { method: "DELETE", endpoint: "/api/roles/{role_id}", description: "删除角色。" },
          { method: "GET", endpoint: "/api/permissions", description: "返回 permKey 列表供前端渲染。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/roles" },
      },
      {
        name: "项目授权视图",
        path: "/auth/project-access",
        menuKey: "auth.project-access",
        description: "以项目维度查看成员权限，便于集中调整。",
        features: [
          "切换项目时展示成员及其项目内角色。",
          "直接复用项目成员接口增删改成员。",
          "与项目中心数据保持一致。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/projects/{project_id}/members", description: "查看项目成员。" },
          { method: "POST", endpoint: "/api/projects/{project_id}/members", description: "新增成员。" },
          { method: "PATCH", endpoint: "/api/projects/{project_id}/members/{user_id}", description: "调整成员角色。" },
          { method: "DELETE", endpoint: "/api/projects/{project_id}/members/{user_id}", description: "移除成员。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/projects/1/members" },
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
        description: "记录用户关键操作，支持审计追溯。",
        features: [
          "日志字段：时间、用户、操作类型、对象类型、对象 ID、IP、详情。",
          "筛选条件：按时间、用户、操作类型过滤。",
          "操作：查看详情、导出日志（可选）。",
        ],
        apis: [{ method: "GET", endpoint: "/api/audit/logs", description: "查询操作日志。" }],
        defaultRequest: { method: "GET", endpoint: "/api/audit/logs" },
      },
      {
        name: "系统日志",
        path: "/logs/system",
        menuKey: "logs.system",
        description: "查看系统模块级运行日志，辅助排障。",
        features: [
          "按级别（INFO / WARN / ERROR）过滤。",
          "定位后端服务运行状态与异常信息。",
        ],
        apis: [{ method: "GET", endpoint: "/api/system/logs", description: "查询系统运行日志。" }],
        defaultRequest: { method: "GET", endpoint: "/api/system/logs" },
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
        description: "统一展示容量、磁盘、同步等告警并支持处理。",
        features: [
          "告警字段：ID、类型、级别、内容、状态、产生时间、处理人 / 时间。",
          "筛选：按类型、级别、状态、时间范围过滤。",
          "操作：标记已读、处理中、已关闭并填写处理备注。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/alerts", description: "查询告警列表。" },
          { method: "PATCH", endpoint: "/api/alerts/{alert_id}", description: "更新告警状态。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/alerts" },
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
        description: "配置告警触发条件与通知方式。",
        features: [
          "容量、磁盘、同步失败等告警阈值配置。",
          "通知方式：SMTP 邮件服务器与收件人列表。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/alerts/settings", description: "获取告警规则与通知配置。" },
          { method: "POST", endpoint: "/api/alerts/settings", description: "更新告警规则。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/alerts/settings" },
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
        description: "配置系统名称、时区、默认语言等基础信息。",
        features: [
          "字段：系统名称、主机名、时区、默认语言、管理员邮箱。",
          "操作：查询与更新基础配置。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/settings/base", description: "获取基础设置。" },
          { method: "POST", endpoint: "/api/settings/base", description: "更新基础设置。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/settings/base" },
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
        description: "配置 NAS 设备网络参数及 SMB/NFS 等基础服务。",
        features: [
          "网络：IP 模式（静态 / 动态）、IP、子网、网关、DNS。",
          "服务：SMB / NFS 等开关与基础参数。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/settings/network", description: "获取网络与服务配置。" },
          { method: "POST", endpoint: "/api/settings/network", description: "更新网络配置。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/settings/network" },
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
        description: "导出 / 导入系统配置，支持灾备。",
        features: [
          "导出：生成包含配置、策略、权限等信息的备份文件。",
          "导入：上传备份文件并恢复系统状态，过程需二次确认。",
        ],
        apis: [
          { method: "GET", endpoint: "/api/settings/backup", description: "获取历史备份或触发导出。" },
          { method: "POST", endpoint: "/api/settings/restore", description: "上传备份并恢复配置。" },
        ],
        defaultRequest: { method: "GET", endpoint: "/api/settings/backup" },
        actions: [
          { label: "上传恢复文件", method: "POST", endpoint: "/api/settings/restore", samplePayload: { file: "config-latest.json" } },
        ],
      },
    ],
  },
];

const buildUrl = (endpoint = "") => {
  if (/^https?:/i.test(endpoint)) {
    return endpoint;
  }
  if (!endpoint) {
    return API_BASE;
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
      selectedDefaultApi: null,
      request: {
        method: "GET",
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
    selectedApis() {
      return this.selectedItem?.apis || [];
    },
  },
  methods: {
    selectMenu(item) {
      this.selectedItem = item;
      const fallback = item.apis && item.apis.length ? item.apis[0] : null;
      const defaultRequest = item.defaultRequest || fallback;
      this.selectedDefaultApi = defaultRequest || null;
      this.request.method = defaultRequest?.method || "GET";
      this.request.endpoint = defaultRequest?.endpoint || "";
      this.request.payloadText = defaultRequest?.body
        ? JSON.stringify(defaultRequest.body, null, 2)
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
      if (this.request.endpoint) {
        this.executePrimaryRequest();
      }
    },
    async executePrimaryRequest() {
      if (!this.request.endpoint) {
        this.primary.error = "请填写要请求的接口地址";
        return;
      }
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
          <h1>创作 NAS 混合云功能蓝图</h1>
          <p>左侧按一级 / 二级菜单浏览功能，右侧查看功能描述与后端接口并可直接调试。</p>
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
            <h2>请选择左侧任一功能模块</h2>
            <p>这里会展示详细的功能说明、主要交互点以及 FastAPI 接口规划。</p>
          </div>
          <div v-else>
            <div class="content-header">
              <h2>{{ selectedItem.name }}</h2>
              <p>{{ selectedItem.description }}</p>
              <div class="meta">
                <span>path: {{ selectedItem.path }}</span>
                <span>menuKey: {{ selectedItem.menuKey }}</span>
                <span v-if="selectedDefaultApi">默认调试: {{ selectedDefaultApi.method }} {{ selectedDefaultApi.endpoint }}</span>
              </div>
            </div>
            <div class="info-grid">
              <div class="panel" v-if="selectedItem.features?.length">
                <div class="panel-header">
                  <h3>主要功能点</h3>
                  <span>覆盖用户在前端的关键交互</span>
                </div>
                <ul class="feature-list">
                  <li v-for="(feature, index) in selectedItem.features" :key="feature + index">{{ feature }}</li>
                </ul>
              </div>
              <div class="panel" v-if="selectedApis.length">
                <div class="panel-header">
                  <h3>后端接口规划</h3>
                  <span>FastAPI /api 命名空间</span>
                </div>
                <table class="api-table">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Endpoint</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="api in selectedApis" :key="api.method + api.endpoint">
                      <td><span class="method-tag" :class="api.method">{{ api.method }}</span></td>
                      <td><code>{{ api.endpoint }}</code></td>
                      <td>{{ api.description }}</td>
                    </tr>
                  </tbody>
                </table>
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
