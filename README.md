# 日常民宿预订管理系统

> **软件工程结对编程作业**  
> 选题：日常民宿预订管理系统  
> 结对成员：学生A & 学生B

---

## 技术栈

| 层级 | 技术 |
|-----|------|
| 前端 | Vue 3 + Element Plus + Pinia + Axios |
| 后端 | Node.js + Express |
| 数据库 | MySQL 8.0 |
| 认证 | JWT + bcrypt |

---

## 快速开始

### 1. 数据库初始化
```bash
mysql -u root -p < backend/sql/init.sql
```

### 2. 配置环境变量
编辑 `backend/.env`，修改数据库密码：
```
DB_PASSWORD=你的MySQL密码
```

### 3. 启动后端
```bash
cd backend
npm install
npm run dev
```
后端运行在 http://localhost:3000

### 4. 启动前端
```bash
cd frontend
npm install
npm run dev
```
前端运行在 http://localhost:5173

---

## 测试账号

| 角色 | 用户名 | 密码 |
|-----|-------|------|
| 管理员 | admin | 123456 |
| 租客 | zhangsan | 123456 |
| 租客 | lisi | 123456 |

---

## 项目结构

```
campus-bnb/
├── docs/                    # 文档
│   ├── 结对编程计划.md
│   ├── SRS.md               # 需求规格说明书
│   ├── 系统设计文档.md       # ER图 + 架构
│   └── 模块分工及角色互换日志.md
├── backend/                 # 后端
│   ├── sql/init.sql         # 数据库建表脚本
│   └── src/
│       ├── config/db.js     # 数据库连接
│       ├── middleware/auth.js # JWT认证中间件
│       ├── models/          # 数据访问层
│       ├── services/        # 业务逻辑层
│       ├── controllers/     # 控制器层
│       ├── routes/          # 路由层
│       └── app.js           # 入口
└── frontend/                # 前端
    └── src/
        ├── api/index.js     # API接口封装
        ├── router/index.js  # 路由配置
        ├── store/user.js    # 用户状态
        ├── utils/request.js # Axios封装
        └── views/           # 页面组件
```

---

## 结对编程工作流

1. 每次Pair Session前拉取最新 `develop` 分支
2. 从 `develop` 创建 `feature/*` 分支
3. 结对编写代码（30-45分钟互换角色）
4. 提交代码并发起 PR 到 `develop`
5. 另一人 Review 并 Approve 后合并
6. 删除功能分支

**严禁直接推送到 `develop` 和 `main` 分支！**
