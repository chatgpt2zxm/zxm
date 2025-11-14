from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .datastore import iso_now, store

app = FastAPI(title="创作 NAS 混合云 API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_exists(collection: str, item_id: int) -> Dict[str, Any]:
    item = store.find_by_id(collection, item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"{collection} {item_id} 不存在")
    return item


@app.get("/api/dashboard/overview")
def dashboard_overview() -> Dict[str, Any]:
    return store.dashboard_overview()


@app.get("/api/projects")
def list_projects(
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    owner: Optional[str] = None,
) -> Dict[str, Any]:
    projects = store.data["projects"]
    result = []
    for project in projects:
        if keyword and keyword not in (project.get("name", "") + project.get("clientName", "")):
            continue
        if status and project.get("status") != status:
            continue
        if owner and project.get("ownerName") != owner:
            continue
        result.append(project)
    return {"items": result, "total": len(result)}


@app.post("/api/projects")
def create_project(payload: Dict[str, Any]) -> Dict[str, Any]:
    project_id = store.next_id("projects")
    payload.setdefault("createdAt", iso_now())
    payload.setdefault("updatedAt", iso_now())
    payload["id"] = project_id
    store.get_collection("projects").append(payload)
    store.save()
    return payload


@app.get("/api/projects/{project_id}")
def get_project(project_id: int) -> Dict[str, Any]:
    return ensure_exists("projects", project_id)


@app.patch("/api/projects/{project_id}")
def update_project(project_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    project = ensure_exists("projects", project_id)
    project.update(payload)
    project["updatedAt"] = iso_now()
    store.save()
    return project


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int) -> Dict[str, Any]:
    deleted = store.delete_by_id("projects", project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="项目不存在")
    store.save()
    return {"status": "deleted"}


@app.get("/api/projects/{project_id}/stats")
def project_stats(project_id: int) -> Dict[str, Any]:
    ensure_exists("projects", project_id)
    assets = [asset for asset in store.data["assets"] if asset.get("projectId") == project_id]
    total_gb = sum(asset.get("size", 0) for asset in assets)
    tiers: Dict[str, float] = {}
    for asset in assets:
        tier = asset.get("tierLevel", "hot")
        tiers[tier] = tiers.get(tier, 0) + asset.get("size", 0)
    folder_usage: Dict[int, float] = {}
    for asset in assets:
        folder_usage[asset.get("folderId")] = folder_usage.get(asset.get("folderId"), 0) + asset.get("size", 0)
    folder_map = {folder["id"]: folder["name"] for folder in store.data["folders"]}
    folder_breakdown = [
        {"folderId": folder_id, "folderName": folder_map.get(folder_id, ""), "size": size}
        for folder_id, size in folder_usage.items()
    ]
    folder_breakdown.sort(key=lambda item: item["size"], reverse=True)
    return {"totalSize": total_gb, "tiers": tiers, "topFolders": folder_breakdown[:10]}


@app.get("/api/projects/{project_id}/sync-tasks")
def project_sync_tasks(project_id: int) -> Dict[str, Any]:
    ensure_exists("projects", project_id)
    tasks = [task for task in store.data["sync_tasks"] if task.get("projectId") == project_id]
    return {"items": tasks}


@app.get("/api/projects/{project_id}/members")
def list_project_members(project_id: int) -> Dict[str, Any]:
    ensure_exists("projects", project_id)
    members = [member for member in store.data["project_members"] if member.get("projectId") == project_id]
    user_map = {user["id"]: user for user in store.data["users"]}
    for member in members:
        user = user_map.get(member.get("userId"))
        if user:
            member["username"] = user.get("username")
            member["name"] = user.get("name")
    return {"items": members}


@app.post("/api/projects/{project_id}/members")
def add_project_member(project_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    ensure_exists("projects", project_id)
    member_id = store.next_id("project_members")
    payload["id"] = member_id
    payload["projectId"] = project_id
    payload.setdefault("joinedAt", iso_now())
    store.get_collection("project_members").append(payload)
    store.save()
    return payload


@app.patch("/api/projects/{project_id}/members/{user_id}")
def update_project_member(project_id: int, user_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    member = next(
        (item for item in store.data["project_members"] if item.get("projectId") == project_id and item.get("userId") == user_id),
        None,
    )
    if not member:
        raise HTTPException(status_code=404, detail="成员不存在")
    member.update(payload)
    store.save()
    return member


@app.delete("/api/projects/{project_id}/members/{user_id}")
def delete_project_member(project_id: int, user_id: int) -> Dict[str, Any]:
    before = len(store.data["project_members"])
    store.data["project_members"] = [
        item for item in store.data["project_members"] if not (item.get("projectId") == project_id and item.get("userId") == user_id)
    ]
    if before == len(store.data["project_members"]):
        raise HTTPException(status_code=404, detail="成员不存在")
    store.save()
    return {"status": "deleted"}


@app.get("/api/projects/{project_id}/tree")
def project_tree(project_id: int) -> Dict[str, Any]:
    ensure_exists("projects", project_id)
    folders = [folder for folder in store.data["folders"] if folder.get("projectId") == project_id]

    def build(parent_id: Optional[int]) -> List[Dict[str, Any]]:
        nodes = [folder for folder in folders if folder.get("parentId") == parent_id]
        for node in nodes:
            node["children"] = build(node.get("id"))
        return nodes

    return {"items": build(None)}


@app.get("/api/folders/{folder_id}/assets")
def folder_assets(folder_id: int) -> Dict[str, Any]:
    ensure_exists("folders", folder_id)
    assets = [asset for asset in store.data["assets"] if asset.get("folderId") == folder_id]
    return {"items": assets}


@app.post("/api/folders")
def create_folder(payload: Dict[str, Any]) -> Dict[str, Any]:
    folder_id = store.next_id("folders")
    payload["id"] = folder_id
    store.get_collection("folders").append(payload)
    store.save()
    return payload


@app.patch("/api/folders/{folder_id}")
def update_folder(folder_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    folder = ensure_exists("folders", folder_id)
    folder.update(payload)
    store.save()
    return folder


@app.delete("/api/folders/{folder_id}")
def delete_folder(folder_id: int) -> Dict[str, Any]:
    ensure_exists("folders", folder_id)
    has_child = any(folder.get("parentId") == folder_id for folder in store.data["folders"])
    has_assets = any(asset.get("folderId") == folder_id for asset in store.data["assets"])
    if has_child or has_assets:
        raise HTTPException(status_code=400, detail="目录非空，无法删除")
    store.data["folders"] = [folder for folder in store.data["folders"] if folder.get("id") != folder_id]
    store.save()
    return {"status": "deleted"}


@app.patch("/api/assets/batch")
def batch_asset_operation(payload: Dict[str, Any]) -> Dict[str, Any]:
    action = payload.get("action")
    asset_ids: List[int] = payload.get("assetIds", [])
    updated: List[Dict[str, Any]] = []
    for asset_id in asset_ids:
        asset = store.find_by_id("assets", asset_id)
        if not asset:
            continue
        if action == "move":
            asset["folderId"] = payload.get("targetFolderId", asset.get("folderId"))
        elif action == "delete":
            store.delete_by_id("assets", asset_id)
        elif action == "tag":
            tags = payload.get("tags", [])
            asset.setdefault("tags", [])
            asset["tags"] = list(set(asset["tags"]) | set(tags))
        updated.append(asset)
    store.save()
    return {"items": updated}


@app.get("/api/assets/{asset_id}")
def get_asset(asset_id: int) -> Dict[str, Any]:
    return ensure_exists("assets", asset_id)


@app.patch("/api/assets/{asset_id}/meta")
def update_asset_meta(asset_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    asset = ensure_exists("assets", asset_id)
    asset.update(payload)
    asset["updatedAt"] = iso_now()
    store.save()
    return asset


@app.post("/api/assets/{asset_id}/restore")
def restore_asset(asset_id: int) -> Dict[str, Any]:
    asset = ensure_exists("assets", asset_id)
    asset["localPresence"] = "both"
    store.save()
    return {"status": "restoring", "asset": asset}


@app.get("/api/import/devices")
def list_import_devices() -> Dict[str, Any]:
    return {"items": store.data.get("import_devices", [])}


@app.post("/api/import/tasks")
def create_import_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    task_id = store.next_id("import_tasks")
    payload["id"] = task_id
    payload.setdefault("status", "pending")
    payload.setdefault("createdAt", iso_now())
    store.get_collection("import_tasks").append(payload)
    store.save()
    return payload


@app.get("/api/import/tasks")
def list_import_tasks() -> Dict[str, Any]:
    return {"items": store.data["import_tasks"]}


@app.get("/api/import/tasks/{task_id}")
def get_import_task(task_id: int) -> Dict[str, Any]:
    return ensure_exists("import_tasks", task_id)


@app.post("/api/import/tasks/{task_id}/retry")
def retry_import_task(task_id: int) -> Dict[str, Any]:
    task = ensure_exists("import_tasks", task_id)
    task["status"] = "running"
    task["startedAt"] = iso_now()
    store.save()
    return task


@app.post("/api/assets/search")
def search_assets(payload: Dict[str, Any]) -> Dict[str, Any]:
    keyword = payload.get("keyword")
    project_ids = payload.get("projectIds")
    tier_level = payload.get("tierLevel")
    file_type = payload.get("fileType")
    results = []
    for asset in store.data["assets"]:
        if keyword and keyword not in (asset.get("fileName", "") + asset.get("projectName", "") + asset.get("clientName", "")):
            continue
        if project_ids and asset.get("projectId") not in project_ids:
            continue
        if tier_level and asset.get("tierLevel") != tier_level:
            continue
        if file_type and asset.get("fileType") != file_type:
            continue
        results.append(asset)
    return {"items": results, "total": len(results)}


@app.post("/api/search/views")
def create_search_view(payload: Dict[str, Any]) -> Dict[str, Any]:
    view_id = store.next_id("search_views")
    payload["id"] = view_id
    payload.setdefault("lastUsedAt", iso_now())
    store.get_collection("search_views").append(payload)
    store.save()
    return payload


@app.get("/api/search/views")
def list_search_views(userId: Optional[int] = Query(default=None, alias="userId")) -> Dict[str, Any]:
    views = store.data["search_views"]
    if userId is not None:
        views = [view for view in views if view.get("userId") == userId]
    return {"items": views}


@app.patch("/api/search/views/{view_id}")
def update_search_view(view_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    view = ensure_exists("search_views", view_id)
    view.update(payload)
    store.save()
    return view


@app.delete("/api/search/views/{view_id}")
def delete_search_view(view_id: int) -> Dict[str, Any]:
    deleted = store.delete_by_id("search_views", view_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="视图不存在")
    store.save()
    return {"status": "deleted"}


@app.get("/api/sync-tasks")
def list_sync_tasks() -> Dict[str, Any]:
    return {"items": store.data["sync_tasks"]}


@app.post("/api/sync-tasks")
def create_sync_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    task_id = store.next_id("sync_tasks")
    payload["id"] = task_id
    payload.setdefault("enabled", True)
    store.get_collection("sync_tasks").append(payload)
    store.save()
    return payload


@app.patch("/api/sync-tasks/{task_id}")
def update_sync_task(task_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    task = ensure_exists("sync_tasks", task_id)
    task.update(payload)
    store.save()
    return task


@app.patch("/api/sync-tasks/{task_id}/enable")
def toggle_sync_task(task_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    task = ensure_exists("sync_tasks", task_id)
    task["enabled"] = payload.get("enabled", True)
    store.save()
    return task


@app.post("/api/sync-tasks/{task_id}/run")
def run_sync_task(task_id: int) -> Dict[str, Any]:
    task = ensure_exists("sync_tasks", task_id)
    job_id = store.next_id("sync_jobs")
    job = {
        "id": job_id,
        "taskId": task_id,
        "taskName": task.get("name"),
        "startedAt": iso_now(),
        "finishedAt": None,
        "status": "running",
        "totalFiles": 0,
        "successFiles": 0,
        "failedFiles": 0,
    }
    store.get_collection("sync_jobs").append(job)
    store.save()
    return job


@app.delete("/api/sync-tasks/{task_id}")
def delete_sync_task(task_id: int) -> Dict[str, Any]:
    deleted = store.delete_by_id("sync_tasks", task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="任务不存在")
    store.save()
    return {"status": "deleted"}


@app.get("/api/sync-jobs")
def list_sync_jobs(taskId: Optional[int] = Query(default=None, alias="taskId")) -> Dict[str, Any]:
    jobs = store.data["sync_jobs"]
    if taskId is not None:
        jobs = [job for job in jobs if job.get("taskId") == taskId]
    return {"items": jobs}


@app.get("/api/sync-jobs/{job_id}")
def get_sync_job(job_id: int) -> Dict[str, Any]:
    return ensure_exists("sync_jobs", job_id)


@app.get("/api/tier-policies")
def list_tier_policies() -> Dict[str, Any]:
    return {"items": store.data["tier_policies"]}


@app.post("/api/tier-policies")
def create_tier_policy(payload: Dict[str, Any]) -> Dict[str, Any]:
    policy_id = store.next_id("tier_policies")
    payload["id"] = policy_id
    store.get_collection("tier_policies").append(payload)
    store.save()
    return payload


@app.patch("/api/tier-policies/{policy_id}")
def update_tier_policy(policy_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    policy = ensure_exists("tier_policies", policy_id)
    policy.update(payload)
    store.save()
    return policy


@app.patch("/api/projects/{project_id}/tier-policy")
def update_project_tier_policy(project_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    project = ensure_exists("projects", project_id)
    existing = next((p for p in store.data["tier_policies"] if p.get("projectId") == project_id), None)
    if existing:
        existing.update(payload)
        policy = existing
    else:
        policy_id = store.next_id("tier_policies")
        policy = {
            "id": policy_id,
            "type": "project",
            "projectId": project_id,
            "projectName": project.get("name"),
            **payload,
        }
        store.get_collection("tier_policies").append(policy)
    store.save()
    return policy


@app.get("/api/restore/tasks")
def list_restore_tasks() -> Dict[str, Any]:
    return {"items": store.data["restore_tasks"]}


@app.get("/api/restore/tasks/{task_id}")
def get_restore_task(task_id: int) -> Dict[str, Any]:
    return ensure_exists("restore_tasks", task_id)


@app.post("/api/restore/tasks/{task_id}/retry")
def retry_restore_task(task_id: int) -> Dict[str, Any]:
    task = ensure_exists("restore_tasks", task_id)
    task["status"] = "running"
    task["startedAt"] = iso_now()
    task["finishedAt"] = None
    store.save()
    return task


@app.get("/api/disks")
def list_disks() -> Dict[str, Any]:
    return {"items": store.data["disks"]}


@app.get("/api/disks/{disk_id}")
def get_disk(disk_id: int) -> Dict[str, Any]:
    return ensure_exists("disks", disk_id)


@app.get("/api/storage/arrays")
def list_storage_arrays() -> Dict[str, Any]:
    return {"items": store.data["storage_arrays"]}


@app.post("/api/storage/arrays")
def create_storage_array(payload: Dict[str, Any]) -> Dict[str, Any]:
    array_id = store.next_id("storage_arrays")
    payload["id"] = array_id
    store.get_collection("storage_arrays").append(payload)
    store.save()
    return payload


@app.get("/api/storage/volumes")
def list_storage_volumes() -> Dict[str, Any]:
    return {"items": store.data["storage_volumes"]}


@app.post("/api/storage/volumes")
def create_storage_volume(payload: Dict[str, Any]) -> Dict[str, Any]:
    volume_id = store.next_id("storage_volumes")
    payload["id"] = volume_id
    store.get_collection("storage_volumes").append(payload)
    store.save()
    return payload


@app.get("/api/storage/capacity/summary")
def storage_capacity_summary() -> Dict[str, Any]:
    return store.dashboard_overview().get("capacitySummary", {})


@app.get("/api/storage/capacity/by-project")
def storage_capacity_by_project() -> Dict[str, Any]:
    assets = store.data["assets"]
    breakdown: Dict[int, Dict[str, Any]] = {}
    for asset in assets:
        project_id = asset.get("projectId")
        info = breakdown.setdefault(project_id, {"projectId": project_id, "size": 0})
        info["size"] += asset.get("size", 0)
    for info in breakdown.values():
        project = store.find_by_id("projects", info["projectId"])
        if project:
            info["projectName"] = project.get("name")
    return {"items": list(breakdown.values())}


@app.get("/api/storage-targets")
def list_storage_targets(type: Optional[str] = None) -> Dict[str, Any]:
    targets = store.data["storage_targets"]
    if type:
        targets = [target for target in targets if target.get("type") == type]
    return {"items": targets}


@app.post("/api/storage-targets")
def create_storage_target(payload: Dict[str, Any]) -> Dict[str, Any]:
    target_id = store.next_id("storage_targets")
    payload["id"] = target_id
    store.get_collection("storage_targets").append(payload)
    store.save()
    return payload


@app.patch("/api/storage-targets/{target_id}")
def update_storage_target(target_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    target = ensure_exists("storage_targets", target_id)
    target.update(payload)
    store.save()
    return target


@app.delete("/api/storage-targets/{target_id}")
def delete_storage_target(target_id: int) -> Dict[str, Any]:
    deleted = store.delete_by_id("storage_targets", target_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="存储目标不存在")
    store.save()
    return {"status": "deleted"}


@app.post("/api/storage-targets/{target_id}/test")
def test_storage_target(target_id: int) -> Dict[str, Any]:
    ensure_exists("storage_targets", target_id)
    return {"status": "ok", "testedAt": iso_now()}


@app.post("/api/netdisk/{provider}/bind")
def bind_netdisk(provider: str, payload: Dict[str, Any] = Body(default={})) -> Dict[str, Any]:
    session_id = f"session-{len(store.data['netdisk_sessions']) + 1}"
    store.data["netdisk_sessions"][session_id] = {
        "provider": provider,
        "status": "pending",
        "createdAt": iso_now(),
        "account": payload.get("account"),
    }
    store.save()
    return {"sessionId": session_id}


@app.get("/api/netdisk/{provider}/bind/status")
def netdisk_bind_status(provider: str, session: str) -> Dict[str, Any]:
    data = store.data.get("netdisk_sessions", {}).get(session)
    if not data or data.get("provider") != provider:
        raise HTTPException(status_code=404, detail="会话不存在")
    return data


@app.get("/api/users")
def list_users() -> Dict[str, Any]:
    return {"items": store.data["users"]}


@app.post("/api/users")
def create_user(payload: Dict[str, Any]) -> Dict[str, Any]:
    user_id = store.next_id("users")
    payload["id"] = user_id
    payload.setdefault("status", "enabled")
    store.get_collection("users").append(payload)
    store.save()
    return payload


@app.patch("/api/users/{user_id}")
def update_user(user_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    user = ensure_exists("users", user_id)
    user.update(payload)
    store.save()
    return user


@app.post("/api/users/{user_id}/reset-password")
def reset_password(user_id: int) -> Dict[str, Any]:
    ensure_exists("users", user_id)
    return {"status": "reset", "updatedAt": iso_now()}


@app.get("/api/roles")
def list_roles() -> Dict[str, Any]:
    return {"items": store.data["roles"]}


@app.post("/api/roles")
def create_role(payload: Dict[str, Any]) -> Dict[str, Any]:
    role_id = store.next_id("roles")
    payload["id"] = role_id
    store.get_collection("roles").append(payload)
    store.save()
    return payload


@app.patch("/api/roles/{role_id}")
def update_role(role_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    role = ensure_exists("roles", role_id)
    role.update(payload)
    store.save()
    return role


@app.delete("/api/roles/{role_id}")
def delete_role(role_id: int) -> Dict[str, Any]:
    deleted = store.delete_by_id("roles", role_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="角色不存在")
    store.save()
    return {"status": "deleted"}


@app.get("/api/permissions")
def list_permissions() -> Dict[str, Any]:
    return {"items": store.data["permissions"]}


@app.get("/api/audit/logs")
def audit_logs(user: Optional[str] = None) -> Dict[str, Any]:
    logs = store.data["audit_logs"]
    if user:
        logs = [log for log in logs if log.get("user") == user]
    return {"items": logs}


@app.get("/api/system/logs")
def system_logs(level: Optional[str] = None) -> Dict[str, Any]:
    logs = store.data["system_logs"]
    if level:
        logs = [log for log in logs if log.get("level") == level]
    return {"items": logs}


@app.get("/api/alerts")
def list_alerts(status: Optional[str] = None) -> Dict[str, Any]:
    alerts = store.data["alerts"]
    if status:
        alerts = [alert for alert in alerts if alert.get("status") == status]
    return {"items": alerts}


@app.patch("/api/alerts/{alert_id}")
def update_alert(alert_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    alert = ensure_exists("alerts", alert_id)
    alert.update(payload)
    store.save()
    return alert


@app.get("/api/alerts/settings")
def get_alert_settings() -> Dict[str, Any]:
    return store.data["alert_settings"]


@app.post("/api/alerts/settings")
def update_alert_settings(payload: Dict[str, Any]) -> Dict[str, Any]:
    store.data["alert_settings"].update(payload)
    store.save()
    return store.data["alert_settings"]


@app.get("/api/settings/base")
def get_base_settings() -> Dict[str, Any]:
    return store.data["settings"].get("base", {})


@app.post("/api/settings/base")
def update_base_settings(payload: Dict[str, Any]) -> Dict[str, Any]:
    store.data["settings"]["base"].update(payload)
    store.save()
    return store.data["settings"]["base"]


@app.get("/api/settings/network")
def get_network_settings() -> Dict[str, Any]:
    return store.data["settings"].get("network", {})


@app.post("/api/settings/network")
def update_network_settings(payload: Dict[str, Any]) -> Dict[str, Any]:
    store.data["settings"]["network"].update(payload)
    store.save()
    return store.data["settings"]["network"]


@app.get("/api/settings/backup")
def list_backups() -> Dict[str, Any]:
    return {"items": store.data["settings"].get("backup_history", [])}


@app.post("/api/settings/restore")
def restore_settings(payload: Dict[str, Any]) -> Dict[str, Any]:
    entry = {
        "id": len(store.data["settings"].get("backup_history", [])) + 1,
        "file": payload.get("file", "uploaded-config.json"),
        "createdAt": iso_now(),
        "downloadUrl": payload.get("file", "uploaded-config.json"),
    }
    store.data["settings"].setdefault("backup_history", []).append(entry)
    store.save()
    return entry


# -------------------------- Frontend delivery --------------------------
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount(
        "/",
        StaticFiles(directory=str(FRONTEND_DIR), html=True),
        name="frontend",
    )
