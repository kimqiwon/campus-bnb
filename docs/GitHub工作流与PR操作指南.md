# GitHub 工作流与 PR 操作指南

## 日常民宿预订管理系统 - 结对编程 Git 操作手册

---

## 一、前期准备

### 1.1 注册 GitHub 账号
- 学生A和学生B各自注册 GitHub 账号：https://github.com

### 1.2 安装 Git
下载安装：https://git-scm.com/download/win
安装完成后右键桌面 → "Git Bash Here" 验证：
```bash
git --version
```

### 1.3 配置 Git 用户信息
```bash
git config --global user.name "你的姓名"
git config --global user.email "你的邮箱"
```

---

## 二、项目初始化（其中一人操作）

**学生A** 执行以下步骤：

### 2.1 在 GitHub 上创建仓库
1. 登录 GitHub → 右上角 "+" → "New repository"
2. Repository name: `campus-bnb`
3. Description: `日常民宿预订管理系统 - 软件工程结对编程作业`
4. 选择 **Public**（老师需要查看）
5. **不要勾选** "Add a README file"（我们已有）
6. 点击 "Create repository"

### 2.2 推送本地代码
```bash
cd c:\Users\hp\Desktop\campus-bnb

# 初始化 Git
git init

# 创建 .gitignore（已存在则跳过）
# 添加所有文件
git add .

# 首次提交
git commit -m "chore: 项目初始化 - 民宿预订管理系统"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/campus-bnb.git

# 推送 main 分支
git branch -M main
git push -u origin main
```

### 2.3 创建 develop 分支并推送
```bash
git checkout -b develop
git push -u origin develop
```

### 2.4 添加协作者
1. GitHub 仓库页面 → Settings → Collaborators
2. 搜索学生B的 GitHub 用户名 → Add collaborator

---

## 三、学生B 克隆仓库

```bash
cd c:\Users\hp\Desktop
git clone https://github.com/学生A的用户名/campus-bnb.git
cd campus-bnb
git checkout develop
```

---

## 四、日常结对开发流程（★★★ 核心 ★★★）

### 每次 Pair Session 的标准流程：

```bash
# ===== 1. 两人一起，拉取最新代码 =====
git checkout develop
git pull origin develop

# ===== 2. 创建功能分支（命名规范） =====
git checkout -b feature/模块名-功能简述

# 例如：
git checkout -b feature/tenant-register
git checkout -b feature/room-crud
git checkout -b feature/booking-date-check
git checkout -b feature/settlement-stats

# ===== 3. 开始结对编程（驾驶员写代码，领航员审查） =====
# 每 30-45 分钟互换角色
# 两人共用一台电脑（或 VS Code Live Share）

# ===== 4. 提交代码 =====
git add .
git commit -m "feat(tenant): 实现租客注册功能"

# 多次提交，保持 commit 粒度合理
git commit -m "feat(tenant): 添加JWT登录认证"
git commit -m "style(tenant): 统一代码格式"

# ===== 5. 推送到远程 =====
git push origin feature/tenant-register

# ===== 6. 在 GitHub 上创建 Pull Request =====
# 见下方 "五、PR 操作步骤"

# ===== 7. 另一人 Review 代码并 Approve =====
# 见下方 "六、代码审查"

# ===== 8. 合并后删除功能分支 =====
git checkout develop
git pull origin develop
git branch -d feature/tenant-register
git push origin --delete feature/tenant-register
```

---

## 五、PR（Pull Request）操作步骤（★★★ 评分核心 ★★★）

### 5.1 创建 PR
1. 推送功能分支后，打开 GitHub 仓库页面
2. 点击 "Pull requests" → "New pull request"
3. **base 选择 `develop`** ← **compare 选择 `feature/xxx`**（你的功能分支）
4. 点击 "Create pull request"

### 5.2 PR 标题格式
```
[模块名] 功能简述

示例：
[租客模块] 实现注册、登录、JWT认证
[房源模块] 完成房间CRUD及状态管控
[预订模块] 实现预订提交及日期冲突校验
[结算模块] 费用核算及订单核销归档
```

### 5.3 PR 描述模板（必填）
```markdown
## 实现功能
- 实现了租客注册接口 POST /api/tenant/register
- 实现了租客登录接口 POST /api/tenant/login
- 添加了 JWT 认证中间件

## 结对信息
- 驾驶员：学生A（9:00-9:45）
- 领航员：学生B
- 互换后驾驶员：学生B（9:45-10:30）
- 领航员：学生A

## 测试情况
- [x] Postman 测试通过
- [x] 注册重复用户名返回409
- [x] 错误密码登录返回401

## 关联 Issue
Closes #1
```

### 5.4 合并 PR
1. 确认 Review 已通过（有 Approve）
2. 点击 "Merge pull request"
3. 选择 "Squash and merge" 或 "Merge commit"
4. 点击 "Confirm merge"
5. 合并后删除分支（GitHub 会提示）

---

## 六、代码审查（Review）规范

### 6.1 Reviewer 检查清单
- [ ] 代码是否有注释
- [ ] 命名是否清晰
- [ ] 是否有 SQL 注入风险
- [ ] 是否有硬编码
- [ ] 错误处理是否完善
- [ ] 是否符合分层架构（Controller-Service-Model）

### 6.2 Review 评论示例（不能只写 LGTM！）
```
✅ 好的评论示例：
"建议在 tenantService.register 中加入手机号格式校验"
"这里 SQL 查询使用了参数化，SQL注入防护做得不错"
"checkConflict 的日期逻辑需要再确认一下，如果 check_in == 已有预订的 check_out 应该不算冲突"

❌ 不好的评论示例（老师会扣分）：
"LGTM"
"OK"
"好的"
```

---

## 七、分支管理总览

```
main ────────────────────────────────────── (最终提交)
  │
  └─ develop ───────────────────────────── (开发主分支)
       │
       ├─ feature/tenant-module ──── PR#1 ──┤
       ├─ feature/room-module ────── PR#2 ──┤
       ├─ feature/booking-module ─── PR#3 ──┤
       ├─ feature/settlement-module  PR#4 ──┤
       └─ feature/frontend-pages ─── PR#5 ──┤
```

---

## 八、常见问题

**Q: 提交时间显示不对怎么办？**
A: 检查 `git config user.email` 是否与 GitHub 账号邮箱一致。

**Q: 推送被拒绝？**
A: 先 `git pull origin develop` 然后解决冲突再推送。

**Q: 如何撤销 commit？**
A: `git reset --soft HEAD~1`（撤销最近一次commit，保留修改）

**Q: 老师说的"凌晨提交"是什么意思？**
A: 如果 Git Log 显示提交时间集中在凌晨 1-4 点，说明是各自分头写然后由一人集中合并的，不是真正的结对编程。结对编程的提交应该在白天工作时间均匀分布。

---

## 九、交付前最终检查清单

- [ ] Git Log 中有两人交替的 commit 记录
- [ ] 有多个 feature 分支和对应的 PR
- [ ] 每个 PR 都有另一人的 Review 评论
- [ ] PR 评论不是 "LGTM" 而是实质性内容
- [ ] 提交时间在工作时间（非凌晨）
- [ ] 有角色互换记录（见模块分工文档）
- [ ] develop 和 main 分支都有内容
- [ ] 仓库设置为 Public（老师可查看）
