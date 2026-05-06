---
name: clone-and-push-openharness
overview: 克隆 HKUDS/OpenHarness 项目到本地，并推送到 my-207/openharness-webui 仓库
todos:
  - id: pre-check
    content: 检查 Git 安装状态、GitHub 认证配置及目标仓库存在性
    status: in_progress
  - id: clone-source
    content: 使用 git clone 克隆 HKUDS/OpenHarness 到工作目录
    status: pending
    dependencies:
      - pre-check
  - id: modify-remote
    content: 进入项目目录，将 origin 远程地址改为目标仓库地址
    status: pending
    dependencies:
      - clone-source
  - id: push-target
    content: 推送所有分支和标签到目标仓库 my-207/openharness-webui
    status: pending
    dependencies:
      - modify-remote
  - id: verify
    content: 在浏览器中访问目标仓库确认代码已成功上传
    status: pending
    dependencies:
      - push-target
---

将 GitHub 上的开源项目 [HKUDS/OpenHarness](https://github.com/HKUDS/OpenHarness) 完整克隆到本地工作目录，然后推送至用户目标仓库 [my-207/openharness-webui](https://github.com/my-207/openharness-webui)，实现源项目代码的完整迁移。

核心操作流程：

1. 从源仓库克隆完整代码（含所有分支和提交历史）
2. 修改远程仓库地址为目标仓库
3. 推送到目标仓库

## 技术方案

### 技术栈

- **Git**: 版本控制与仓库操作
- **GitHub**: 远程代码托管平台

### 实现方案

采用标准的 Git 远程仓库迁移方案：

1. **克隆源仓库**：使用 `git clone` 将 HKUDS/OpenHarness 完整克隆到本地
2. **修改远程地址**：通过 `git remote set-url` 将 origin 指向目标仓库
3. **推送代码**：使用 `git push` 将所有分支和标签推送到目标仓库

### 前置条件

在执行前需确保以下条件满足：

- **Git 已安装**：Windows 系统可通过 `git --version` 验证
- **GitHub 认证**：需要配置 HTTPS + Personal Access Token（推荐）或 SSH Key
- **目标仓库存在**：`my-207/openharness-webui` 仓库需要已存在且用户拥有写入权限
- **网络连通性**：能够正常访问 github.com（如网络受限需配置代理）

### 认证方式说明

推荐使用 HTTPS + GitHub Personal Access Token (PAT) 方式：

1. 在 GitHub Settings -> Developer settings -> Personal access tokens 中创建 Token
2. Token 需要赋予 `repo` 权限（完整控制私有仓库）或 `public_repo` 权限（仅公开仓库）
3. 推送时使用 Token 作为密码进行认证

### 风险与注意事项

1. **仓库大小**：OpenHarness 作为 AI 项目可能较大，首次克隆可能需要较长时间
2. **子模块检查**：若源仓库包含 Git submodules，需要使用 `--recursive` 参数克隆
3. **分支完整性**：需确保所有分支（包括 main/master）以及标签都被推送
4. **强制推送风险**：仅在确认目标仓库为空或不保留历史时使用 `--force`