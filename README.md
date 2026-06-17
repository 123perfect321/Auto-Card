# 星云发卡 · AutoCard

**24 小时自动发卡 SaaS 平台** —— 面向虚拟商品（卡密、激活码、充值卡、会员账号等）的自动化发卡解决方案。下单后自动发卡密，订单链接不暴露订单号，支持可选提取密码二次验证，全链路 AES-256-CBC 加密存储。

---

## ✨ 核心特性

**买家侧**

- 商品浏览 / 分类筛选 / 多规格选择
- 下单时可选「卡密提取密码」，查询订单需邮箱 + 提取密码双重校验
- 订单链接使用 32 位随机 token（非订单号），防止遍历猜测
- 支付宝 / 微信 / USDT 多支付通道（通过易支付网关）
- 订单超时自动关闭 + 释放库存
- 邮件回补卡密

**管理侧**

- 实时数据看板：今日销量 / 销售额 / 近 7 天趋势 / 商品热度（数据来自数据库，非写死）
- 商品管理：多规格、封面图上传、上下架、排序、热销/新品标记
- 卡密管理：按商品/规格导入、清空，AES 加密落库，管理后台可看明文
- 订单管理：展开行直接查看已解密的卡密
- 分类管理、优惠券、邮件模板、系统设置
- 暗色主题 UI（Element Plus + ECharts）

---

## 🛠 技术栈

| 模块 | 技术 | 说明 |
|------|------|------|
| 后端 | Node.js + Express + TypeScript | RESTful API，`src/` 按 routes / controllers / services / middlewares 分层 |
| ORM | Prisma + SQLite | 类型安全的查询构建器；SQLite 文件库，开箱即用（可平滑切 MySQL/PostgreSQL） |
| 安全 | helmet + express-rate-limit + bcrypt + AES-256-CBC | 卡密加密存储格式：`iv_hex:encrypted_hex` |
| 鉴权 | JWT (jsonwebtoken) | Admin 端 Bearer token，订单查询用随机 orderToken |
| 文件上传 | multer | 商品封面图上传至 `backend/public/uploads/` |
| 校验 | zod | 请求体/参数 schema 化校验 |
| 邮件 | nodemailer | 订单卡密邮件回补 |
| 前端（商城） | Vue 3 + Vite + Pinia + Vue Router | 商城买家端，`frontend/` |
| 前端（管理） | Vue 3 + Vite + Element Plus + ECharts | 管理后台，`admin/`，暗色主题 |

---

## 📁 项目结构

```
auto-card/
├── backend/                # 后端 API 服务
│   ├── prisma/
│   │   ├── schema.prisma   # 数据模型
│   │   ├── migrations/     # 迁移文件
│   │   └── seed.ts         # 种子数据（分类 + 商品 + 规格 + 测试卡密）
│   ├── src/
│   │   ├── config/         # 环境变量与常量
│   │   ├── controllers/    # 请求处理
│   │   ├── middlewares/    # auth / validation / errorHandler
│   │   ├── routes/         # 路由（含 upload.routes 图片上传）
│   │   ├── services/       # 业务逻辑
│   │   ├── utils/          # encrypt / token / response / logger
│   │   └── index.ts        # 入口
│   └── public/uploads/     # 上传的商品封面图（git 忽略）
├── frontend/               # 商城前端（买家）
│   └── src/
│       ├── api/            # axios 封装
│       ├── views/          # Home / ProductDetail / Checkout / Pay / Success / Query
│       ├── router/         # 路由，/pay/:token 与 /success/:token
│       └── stores/         # Pinia
├── admin/                  # 管理后台前端
│   └── src/
│       ├── api/            # axios 封装
│       ├── views/          # Dashboard / Products / Orders / Cards / Categories ...
│       ├── router/         # 路由守卫
│       └── styles/         # admin.css 暗色主题
├── docker-compose.yml      # 容器化部署（可选）
├── PROJECT_SPEC.md         # 完整产品需求规格
└── README.md
```

---

## 🚀 启动方法

### 0. 环境准备

- **Node.js >= 18**
- **npm >= 9**
- 不需要任何数据库 —— SQLite 文件库随 Prisma 自动创建

### 1. 克隆仓库

```bash
git clone https://github.com/<your-username>/auto-card.git
cd auto-card
```

### 2. 启动后端

```bash
cd backend
cp .env.example .env           # 复制环境变量模板（JWT 密钥等已内置默认值，可直接用）
npm install
npx prisma generate            # 生成 Prisma Client
npx prisma migrate dev         # 执行迁移，创建 SQLite 库
npx prisma db seed             # 灌入分类 + 6 个示例商品 + 规格 + 测试卡密
npm run dev                    # 启动开发服务器，默认 :3000
```

启动后 API 健康检查：`http://localhost:3000/health`

### 3. 启动商城前端

新开一个终端：

```bash
cd frontend
npm install
npm run dev                    # 默认 :5173
```

访问 `http://localhost:5173`

### 4. 启动管理后台

再开一个终端：

```bash
cd admin
npm install
npm run dev                    # 默认 :5174
```

访问 `http://localhost:5174`

**默认管理员账号：**

| 用户名 | 密码 |
|--------|------|
| `admin` | `admin123456` |

> ⚠️ 生产环境请务必在后台「个人中心」修改默认密码，并在 `.env` 中更换 `JWT_SECRET`。

### 5. 一键启动（可选）

如已安装 [concurrently](https://www.npmjs.com/package/concurrently)，可在项目根目录 `package.json` 添加：

```json
"scripts": {
  "dev": "concurrently -n api,web,admin -c blue,green,magenta \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\" \"npm run dev --prefix admin\""
}
```

然后 `npm run dev` 一次性拉起三个服务。

### 6. Docker 部署（可选）

```bash
docker-compose up -d
```

| 服务 | 地址 |
|------|------|
| 商城 | http://localhost |
| 管理后台 | http://localhost:8080 |
| API | http://localhost:3000 |

---

## 🔐 关键设计点

**订单号不可遍历**
下单后返回 32 位随机 `orderToken` 存库，URL 使用 `/pay/:token` 与 `/success/:token`。订单号 `ORD + 14 位时间戳` 仅在查询页面由买家手填，不参与链接。

**卡密 AES-256-CBC 加密**
`utils/encrypt.ts` 中每张卡密独立 IV，存储格式 `iv_hex:encrypted_hex`；解密仅在订单发货与管理后台查看时触发。

**订单提取密码**
买家下单可勾选举报「提取密码」，后端用 bcrypt 存储哈希；查询时邮箱 + 密码双重校验，防社工。

**订单超时自动释放**
`setInterval` 每分钟扫一次 `order.service.closeExpiredOrders`，超过 15 分钟未支付的订单自动置为「已关闭」并回补库存。

**封面图上传**
管理后台新建/编辑商品时可直接上传封面，图片存于 `backend/public/uploads/`，通过 Express 静态服务 + Vite `/uploads` 代理访问，无需 OSS。

---

## 📄 License

MIT
