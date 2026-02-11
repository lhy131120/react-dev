# 🌶️ 熱帶調味料天堂 — 開發進度追蹤

> **專案名稱：** Tropical Spice Paradise（React 電商網站）  
> **技術棧：** React 19 + Vite 7 + React Router 7 + Axios + Bootstrap 5 + Swiper 12  
> **開始日期：** ____/____/____  
> **目標：** 完成前台電商展示 + 後台管理系統，部署至 GitHub Pages

---

## 📊 總進度一覽

| 階段 | 名稱 | 狀態 | 完成度 |
|:----:|------|:----:|:------:|
| 1 | [專案初始化與環境配置](#階段-1專案初始化與環境配置-) | ✅ 完成 | 100% |
| 2 | [API 服務層建立](#階段-2api-服務層建立-) | ✅ 完成 | 100% |
| 3 | [全域 Loading 系統](#階段-3全域-loading-系統-) | ✅ 完成 | 100% |
| 4 | [路由系統與守衛](#階段-4路由系統與守衛-) | ✅ 完成 | 100% |
| 5 | [通知系統](#階段-5通知系統-) | ✅ 完成 | 100% |
| 6 | [前台頁面切版與功能](#階段-6前台頁面切版與功能-) | ✅ 完成 | 100% |
| 7 | [後台管理系統](#階段-7後台管理系統-) | 🟡 進行中 | 80% |
| 8 | [樣式優化與響應式設計](#階段-8樣式優化與響應式設計-) | ✅ 完成 | 100% |
| 9 | [部署與上線](#階段-9部署與上線-) | ✅ 完成 | 100% |
| 10 | [未來擴充功能](#階段-10未來擴充功能-) | ⬜ 未開始 | 0% |

---

## 階段 1：專案初始化與環境配置 ⚙️

> 從零開始建立專案骨架，配置好開發環境與基礎工具鏈。

### 待辦清單

- [x] 使用 `pnpm create vite` 建立 React 專案
- [x] 安裝生產依賴（react-router、axios、bootstrap、swiper、react-toastify、react-hook-form）
- [x] 安裝開發依賴（sass）
- [x] 安裝部署工具（gh-pages）
- [x] 配置 `vite.config.js`（路徑別名 `@`、production base path）
- [x] 配置 `.env` 環境變數（`VITE_API_BASE`、`VITE_API_PATH`）
- [x] 配置 `eslint.config.js`
- [x] 設定 `index.html`（Google Fonts、Bootstrap Icons CDN）
- [x] 建立 SCSS 架構（`assets/_variables.scss`、`assets/_variables-dark.scss`、`assets/all.scss`）
- [x] 建立基礎目錄結構（components、views、layout、routes、services、hooks、context、styles）

### 涉及檔案

```
vite.config.js
package.json
.env
eslint.config.js
index.html
src/assets/_variables.scss
src/assets/_variables-dark.scss
src/assets/all.scss
```

### 備註

- 使用 pnpm workspace 管理
- 路徑別名 `@` → `./src`，簡化 import 路徑

---

## 階段 2：API 服務層建立 🔌

> 建立與後端溝通的基礎設施，包含 Axios 實例、攔截器、Token 管理。

### 待辦清單

- [x] 建立 `config.js` — API 常數（API_BASE、API_PATH）
- [x] 建立 `config.js` — Token CRUD 工具函式（getTokenFromCookie、setToken、clearToken）
- [x] 建立 `axiosInstance.js` — 雙 Axios 實例（`api` 帶 API_PATH / `plainApi` 不帶）
- [x] 實作 Request Interceptor — 自動帶 Token、觸發 Loading
- [x] 實作 Response Interceptor — 隱藏 Loading、401 自動跳轉登入頁
- [x] 實作靜默請求機制（`config.silent = true` 跳過 Loading）
- [x] 實作 Loading 注入點（`injectLoadingController`）
- [x] 建立 `services/api/index.js` 統一匯出
- [x] 建立 `services/index.js` 統一匯出
- [x] 401 跳轉使用 `import.meta.env.BASE_URL` 動態路徑（避免 GitHub Pages 路徑問題）

### 涉及檔案

```
src/services/api/config.js
src/services/api/axiosInstance.js
src/services/api/index.js
src/services/index.js
```

### 設計重點

- **雙實例模式：** `api`（一般 CRUD）vs `plainApi`（登入/驗證等不帶 API_PATH 的請求）
- **注入模式：** Axios Interceptor 在 React Context 外部，透過注入方式橋接
- **pendingRequests Set：** 追蹤進行中的請求，控制 Loading 顯示/隱藏時機

---

## 階段 3：全域 Loading 系統 🔄

> 實作全螢幕 Loading 覆蓋層，與 Axios Interceptor 自動聯動。

### 待辦清單

- [x] 建立 `LoadingContext.js` — Context 定義
- [x] 建立 `LoadingProvider.jsx` — 計數器模式 Provider（`useRef` 處理併發請求）
- [x] 建立 `useLoading.js` — 自訂 Hook 封裝
- [x] 建立 `Loading.jsx` — Loading UI 元件（全螢幕覆蓋、旋轉辣椒 🌶️ 動畫）
- [x] 建立 `LoadingInitializer.jsx` — 橋接 Context ↔ Axios Interceptor
- [x] 建立 `Loading.css` — Loading 樣式（模糊背景、旋轉動畫、文字跳動）
- [x] 組裝至 `App.jsx`（Provider → Initializer → Loading → Router）

### 涉及檔案

```
src/context/loading/LoadingContext.js
src/context/loading/LoadingProvider.jsx
src/context/loading/index.js
src/context/index.js
src/hooks/useLoading.js
src/hooks/index.js
src/components/common/Loading.jsx
src/components/common/LoadingInitializer.jsx
src/components/common/index.js
src/styles/Loading.css
src/App.jsx
```

### 設計重點

- **計數器模式：** `useRef` 計數併發請求，第一個請求 show、最後一個完成 hide，避免閃爍
- **forceHide：** 錯誤時重置計數器並立即隱藏
- **注入模式：** `LoadingInitializer` 在 React 內部取得 Context 方法，注入給外部的 Axios

---

## 階段 4：路由系統與守衛 🛤️

> 建立前後台路由架構，實作權限守衛保護頁面。

### 待辦清單

- [x] 建立 `FrontendLayout.jsx` — 前台佈局（Header + Outlet + Footer）
- [x] 建立 `BackendLayout.jsx` — 後台佈局（Container + Outlet + Footer）
- [x] 建立 `AuthRoute.jsx` — 登入頁守衛（已登入 → 重導向至後台）
- [x] 建立 `ProtectedRoute.jsx` — 後台守衛（未登入 → 重導向至登入頁）
- [x] 建立 `router.jsx` — 完整路由樹定義（`createHashRouter`）
- [x] 實作 `isMounted` cleanup 防止 unmount 後 setState
- [x] FrontendLayout 手機版漢堡選單（slide-in drawer + backdrop）
- [x] 建立 `Header.css` — 響應式 Header 樣式

### 涉及檔案

```
src/layout/FrontendLayout.jsx
src/layout/BackendLayout.jsx
src/components/AuthRoute.jsx
src/components/ProtectedRoute.jsx
src/routes/router.jsx
src/styles/Header.css
```

### 路由結構

```
/                    → FrontendLayout
├── /                → Home
├── /products        → Products
├── /product/:id     → Product
├── /cart            → Cart
└── [AuthRoute]
    └── /login       → Login

/admin               → BackendLayout
└── [ProtectedRoute]
    ├── /admin/dashboard  → Dashboard
    └── /admin/setting    → AdminSetting

/*                   → NotFound
```

---

## 階段 5：通知系統 📢

> 整合 react-toastify 與 Loading 狀態，統一通知體驗。

### 待辦清單

- [x] 建立 `useNotification.js` — 整合 Toast + Loading 的自訂 Hook
- [x] 實作 `notifySuccess` — 成功通知（自動關閉 Loading，內建防抖）
- [x] 實作 `notifyError` — 錯誤通知（強制關閉 Loading，加長顯示）
- [x] 實作 `notifyInfo` / `notifyWarning` — 資訊/警告通知
- [x] 在 `main.jsx` 配置 `<ToastContainer />`

### 涉及檔案

```
src/hooks/useNotification.js
src/hooks/index.js
src/main.jsx
```

### 設計重點

- 呼叫任何 `notify*` 前自動 `forceHideLoading()`，避免 Loading 覆蓋 Toast
- `notifySuccess` 有 100ms 防抖，避免短時間重複觸發

---

## 階段 6：前台頁面切版與功能 🏠

> 逐一完成前台各頁面的 UI 切版與 API 串接。

### 6.1 首頁（Home）

- [x] 切版 — Swiper 輪播展示全部商品
- [x] API 串接 — `GET /products/all`
- [x] 功能 — 點擊商品卡片跳轉至商品詳情頁
- [x] 樣式 — `Swiper.css`（全幅容器、hover 效果、響應式）

### 6.2 登入頁（Login）

- [x] 切版 — 左右分割佈局（插圖 + 表單）
- [x] 功能 — react-hook-form 表單驗證
- [x] 功能 — 密碼顯示/隱藏切換
- [x] API 串接 — `POST /admin/signin`（透過 plainApi）
- [x] 功能 — 登入成功後 setToken + 跳轉 `/admin/dashboard`
- [x] 樣式 — `Login.css`（漸層背景、輸入框圖示、響應式）

### 6.3 商品列表頁（Products）

- [x] 切版 — 商品卡片網格佈局
- [x] 功能 — 類別篩選下拉選單
- [x] API 串接 — `GET /products/all`
- [x] 元件 — `ProductCard` 可重用商品卡片（圖片、標籤、價格、hover 效果）
- [x] 樣式 — `ProductCard.css`（卡片設計、懸浮效果、徽章、響應式）

### 6.4 商品詳情頁（Product/:id）

- [x] 切版 — 雙欄佈局（Swiper 圖庫 + 商品資訊）
- [x] 功能 — Swiper 圖庫 + 縮圖導覽（Thumbs、FreeMode、Zoom）
- [x] 功能 — 口味選擇器、數量調整
- [x] API 串接 — `GET /product/{id}`、`POST /cart`（加入購物車）
- [x] 樣式 — `ProductDetail.css`（麵包屑、圖庫、口味按鈕、響應式）

### 6.5 購物車頁（Cart）

- [x] 切版 — 購物車列表 + 金額摘要
- [x] 功能 — 數量增減更新
- [x] 功能 — 刪除單一商品（DeleteConfirmModal 確認）
- [x] 功能 — 清空購物車（DeleteConfirmModal 確認）
- [x] API 串接 — `GET /cart`、`PUT /cart/{id}`、`DELETE /cart/{id}`
- [x] 功能 — 樂觀更新 + 失敗回滾
- [x] 元件 — `DeleteConfirmModal` 刪除確認彈窗

### 6.6 404 頁面（NotFound）

- [x] 切版 — 動畫漸層 "404" 文字
- [x] 功能 — 10 秒倒數自動跳轉首頁
- [x] 樣式 — CSS 浮動動畫

### 涉及檔案

```
src/views/front/Home.jsx
src/views/front/Login.jsx
src/views/front/Products.jsx
src/views/front/Product.jsx
src/views/front/Cart.jsx
src/views/front/NotFound.jsx
src/components/ProductCard.jsx
src/components/ProductList.jsx
src/components/DeleteConfirmModal.jsx
src/components/index.js
src/styles/Swiper.css
src/styles/Login.css
src/styles/ProductCard.css
src/styles/ProductDetail.css
```

---

## 階段 7：後台管理系統 🔧

> 建立後台 CRUD 管理介面與相關元件。

### 7.1 共用後台元件

- [x] `AdminHeader` — 頂部操作列（回前台、登出、新增產品按鈕）
- [x] `ProductTable` — 商品列表卡片（圖片、標題、分類、狀態、操作按鈕）
- [x] `Pagination` — 分頁器（前/後頁、省略號、±2 頁碼顯示）
- [x] `ProductFormModal` — 新增/編輯商品大型彈窗（所有欄位 + 圖片上傳）
- [x] `DeleteConfirmModal` — 刪除確認彈窗（共用元件）

### 7.2 儀表板頁面（Dashboard）

- [x] 切版 — 商品管理主頁面佈局
- [x] 功能 — 商品列表分頁顯示
- [x] API 串接 — `GET /admin/products?page=N`
- [x] 功能 — 新增商品（`POST /admin/product`）
- [x] 功能 — 編輯商品（`PUT /admin/product/{id}`）
- [x] 功能 — 刪除商品（`DELETE /admin/product/{id}`）
- [x] 功能 — 圖片上傳（`POST /admin/upload`）
- [x] 功能 — 登出（`POST /admin/logout`）
- [x] 樣式 — `ProductTable.css`

### 7.3 設定頁面（AdminSetting）

- [ ] 切版 — 設定頁面 UI
- [ ] 功能 — 待規劃（目前為空白佔位）

### 涉及檔案

```
src/views/admin/Dashboard.jsx
src/views/admin/AdminSetting.jsx
src/components/Admin/AdminHeader.jsx
src/components/Admin/ProductTable.jsx
src/components/Admin/Pagination.jsx
src/components/Admin/ProductFormModal.jsx
src/components/Admin/index.js
src/components/DeleteConfirmModal.jsx
src/styles/ProductTable.css
```

---

## 階段 8：樣式優化與響應式設計 🎨

> 完善各頁面的視覺設計與跨裝置適配。

### 待辦清單

- [x] Header 響應式（桌面導覽列 ↔ 手機漢堡選單 + 抽屜）
- [x] Swiper 輪播響應式（不同斷點調整 slidesPerView）
- [x] ProductCard 響應式（網格自適應）
- [x] ProductDetail 響應式（雙欄 → 單欄）
- [x] Login 響應式（雙欄 → 單欄）
- [x] ProductTable 響應式（卡片式列表自適應）
- [x] Loading 全螢幕覆蓋層（模糊背景）
- [x] 動態粒子背景（`main.jsx`）
- [x] SCSS 變數系統（亮色/暗色主題變數）

### 涉及檔案

```
src/styles/Header.css
src/styles/Swiper.css
src/styles/ProductCard.css
src/styles/ProductDetail.css
src/styles/Login.css
src/styles/ProductTable.css
src/styles/Loading.css
src/assets/_variables.scss
src/assets/_variables-dark.scss
src/assets/all.scss
src/App.css
src/main.jsx（粒子背景）
```

---

## 階段 9：部署與上線 🚀

> 配置部署流程，上線至 GitHub Pages。

### 待辦清單

- [x] 配置 `vite.config.js` production base path
- [x] 配置 `package.json` deploy script（`vite build && gh-pages -d dist`）
- [x] 使用 Hash Router 確保 GitHub Pages 路由正常
- [x] 確認所有路徑使用 `import.meta.env.BASE_URL` 動態前綴
- [x] 執行 `pnpm run deploy` 成功部署

---

## 階段 10：未來擴充功能 🔮

> 尚未實作但可考慮加入的功能。

### 待辦清單

- [ ] AdminSetting 頁面實作（帳號管理、系統設定等）
- [ ] 結帳 / 訂單流程（Checkout 頁面、訂單確認）
- [ ] 優惠券 / 折扣系統（購物車已有原價 vs 折扣價欄位）
- [ ] 訂單管理（後台查看/管理訂單）
- [ ] 商品搜尋功能（前台關鍵字搜尋）
- [ ] 使用者註冊系統
- [ ] 訂單歷史查詢
- [ ] 深色模式切換（SCSS 變數已預備 `_variables-dark.scss`）
- [ ] 效能優化（圖片懶載入、路由懶載入 `React.lazy`）
- [ ] 單元測試 / E2E 測試

---

## 📝 開發日誌

> 記錄重要里程碑與踩坑經驗。

| 日期 | 事項 | 備註 |
|------|------|------|
| — | 專案建立，完成初始化配置 | Vite + React + pnpm |
| — | API 服務層完成 | 雙 Axios 實例 + Interceptors |
| — | 全域 Loading 系統完成 | 計數器模式解決併發閃爍問題 |
| — | 路由系統完成 | Hash Router + 雙守衛 |
| — | 通知系統完成 | Toast + Loading 聯動 |
| — | 前台頁面全部完成 | Home / Products / Product / Cart / Login / 404 |
| — | 後台 Dashboard 完成 | 商品 CRUD + 圖片上傳 |
| — | 響應式設計完成 | 手機版漢堡選單、各頁面自適應 |
| — | 成功部署至 GitHub Pages | 解決 base path 問題 |

---

## 🔑 踩坑速記

| # | 問題 | 解法 | 詳見 |
|---|------|------|------|
| 1 | GitHub Pages 部署後 401 跳轉路徑錯誤 | 使用 `import.meta.env.BASE_URL` 動態路徑 | PROJECT_DOCUMENTATION.md |
| 2 | useEffect cleanup 未處理導致 memory leak | `isMounted` flag 模式 | PROJECT_DOCUMENTATION.md |
| 3 | Axios Interceptor 無法使用 React Context | 注入模式（LoadingInitializer） | PROJECT_DOCUMENTATION.md |
| 4 | Loading 覆蓋 Toast 通知 | notify 前先 forceHideLoading | PROJECT_DOCUMENTATION.md |
| 5 | 併發請求 Loading 閃爍 | useRef 計數器取代 boolean | PROJECT_DOCUMENTATION.md |

---

## 📎 相關文件

- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) — 架構設計與技術文檔（開發參考模板）
- [README.md](README.md) — 專案說明
