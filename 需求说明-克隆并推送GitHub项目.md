# 需求说明：克隆并推送 GitHub 项目

## 1. 项目概述

### 1.1 任务目标
将 GitHub 开源项目 `HKUDS/OpenHarness` 完整克隆到本地工作目录，然后推送至用户目标仓库 `my-207/openharness-webui`，实现源项目代码的完整迁移。

### 1.2 应用场景
- 代码仓库备份与迁移
- 开源项目 Fork 与二次开发
- 企业/个人代码库管理

---

## 2. 功能需求

### 2.1 核心功能

| 功能模块 | 需求描述 | 优先级 |
|---------|---------|--------|
| 环境预检 | 自动检测 Git 安装状态，如未安装则尝试自动安装 | P0 |
| 仓库克隆 | 使用 `git clone` 将源仓库完整克隆到本地（包含所有分支和提交历史） | P0 |
| 远程切换 | 修改本地仓库的 origin 远程地址指向目标仓库 | P0 |
| 代码推送 | 将代码强制推送到目标仓库（处理权限限制情况） | P0 |
| 状态验证 | 验证推送结果并清理敏感信息（如 PAT Token） | P1 |

### 2.2 异常处理

| 异常场景 | 处理策略 |
|---------|---------|
| Git 未安装 | 尝试使用 winget/choco 自动安装，或提示用户手动安装 |
| 网络连接失败 | 检测并配置系统代理（如 Clash） |
| PAT 权限不足 | 提示用户更新 Token 权限，或跳过受限文件（如 workflow） |
| 目标仓库非空 | 使用强制推送（force push）覆盖 |

---

## 3. 技术方案

### 3.1 技术栈
- **Git**: 版本控制与仓库操作
- **GitHub**: 远程代码托管平台
- **PowerShell**: Windows 环境下的命令执行

### 3.2 实现流程

```
┌─────────────────┐
│   1. 环境预检    │ ──→ 检查 Git 安装 / 配置代理
└────────┬────────┘
         ▼
┌─────────────────┐
│   2. 克隆仓库    │ ──→ git clone https://github.com/HKUDS/OpenHarness.git
└────────┬────────┘
         ▼
┌─────────────────┐
│   3. 切换远程    │ ──→ git remote set-url origin <目标仓库>
└────────┬────────┘
         ▼
┌─────────────────┐
│   4. 推送代码    │ ──→ git push -f origin main
└────────┬────────┘
         ▼
┌─────────────────┐
│   5. 清理验证    │ ──→ 清理 PAT / 验证远程地址
└─────────────────┘
```

---

## 4. 执行记录

### 4.1 任务列表
1. ✅ 检查 Git 安装状态、GitHub 认证配置及目标仓库存
2. ✅ 使用 git clone 克隆 HKUDS/OpenHarness 到工作目录
3. ✅ 进入项目目录，将 origin 远程地址改为目标仓库地址
4. ✅ 推送到新远程仓库
5. ✅ 清理配置与验证

### 4.2 遇到的问题与解决方案

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| Git 未安装 | 系统缺少 Git 环境 | 发现 Git 已安装在 `C:\Program Files\Git`，添加 PATH |
| GitHub 连接超时 | 国内网络限制 | 检测到 Clash 代理在 127.0.0.1:7890，配置 Git 使用代理 |
| Workflow 文件推送失败 | PAT 缺少 `workflow` scope | 跳过 `.github/workflows/` 目录，其余代码推送成功 |

---

## 5. 交付成果

### 5.1 本地仓库
- **路径**: `C:\Users\Administrator\CodeBuddy\20260430153150\OpenHarness`
- **状态**: 完整代码（含 workflow 文件，未推送）
- **远程**: https://github.com/my-207/openharness-webui

### 5.2 远程仓库
- **地址**: https://github.com/my-207/openharness-webui
- **内容**: OpenHarness 完整代码（不含 workflow 文件）
- **分支**: main

---

## 6. 后续建议

1. **Workflow 文件处理**: 如需推送 GitHub Actions 工作流文件，需生成包含 `workflow` 权限的新 PAT
2. **分支管理**: 如需同步其他分支，可执行 `git push --all origin`
3. **标签同步**: 如需同步标签，可执行 `git push --tags origin`

---

## 7. 附录

### 7.1 用到的 Git 命令
```bash
# 克隆仓库
git clone https://github.com/HKUDS/OpenHarness.git

# 修改远程地址
git remote set-url origin https://github.com/my-207/openharness-webui.git

# 配置代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 强制推送
git push -f -u origin main
```

### 7.2 相关链接
- 源仓库: https://github.com/HKUDS/OpenHarness
- 目标仓库: https://github.com/my-207/openharness-webui
