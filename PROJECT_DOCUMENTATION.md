# 🌶️ React 熱帶調味料天堂 - 專案文檔

## 📋 專案概述

這是一個使用 **React 19 + Vite** 建構的電商網站專案，包含前台商品展示和後台管理系統。專案採用現代化的開發架構，包括路由管理、全域 Loading 狀態、API 攔截器等功能。

---

## 📁 專案結構與功能說明

```
react-dev/
├── 📄 eslint.config.js      # ESLint 設定檔
├── 📄 index.html             # 應用程式入口 HTML
├── 📄 package.json           # 專案依賴與腳本設定
├── 📄 pnpm-lock.yaml         # pnpm 鎖定檔
├── 📄 pnpm-workspace.yaml    # pnpm 工作區設定
├── 📄 vite.config.js         # Vite 建構設定（含路徑別名 @）
├── 📁 public/                # 靜態資源目錄
└── 📁 src/                   # 主要原始碼目錄
```

### 📂 src/ 目錄結構

#### 🔹 核心檔案

| 檔案 | 功能說明 |
|------|----------|
| `App.jsx` | 應用程式根元件，整合 LoadingProvider、LoadingInitializer 和 RouterProvider |
| `main.jsx` | React 應用程式入口點 |

#### 🔹 assets/ - 樣式資源

| 檔案 | 功能說明 |
|------|----------|
| `_variables.scss` | SCSS 變數定義（亮色主題） |
| `_variables-dark.scss` | SCSS 變數定義（暗色主題） |
| `all.scss` | 全域樣式匯入檔 |

#### 🔹 components/ - 元件目錄

| 檔案 | 功能說明 |
|------|----------|
| `AuthRoute.jsx` | **已登入用戶重導向路由守衛** - 檢查用戶是否已登入，已登入則導向後台 |
| `ProtectedRoute.jsx` | **受保護路由守衛** - 檢查用戶是否已登入，未登入則導向登入頁 |
| `DeleteConfirmModal.jsx` | 刪除確認彈窗元件 |
| `ProductCard.jsx` | 產品卡片展示元件 |
| `ProductList.jsx` | 產品列表元件 |
| `index.js` | 元件統一匯出檔 |

##### 📁 components/Admin/ - 後台管理元件

| 檔案 | 功能說明 |
|------|----------|
| `AdminHeader.jsx` | 後台頁首導航元件 |
| `Pagination.jsx` | 分頁元件（支援頁碼顯示、上/下頁） |
| `ProductFormModal.jsx` | 產品表單彈窗（新增/編輯產品） |
| `ProductTable.jsx` | 產品列表表格（後台管理用） |
| `index.js` | Admin 元件統一匯出檔 |

##### 📁 components/common/ - 通用元件

| 檔案 | 功能說明 |
|------|----------|
| `Loading.jsx` | **全域 Loading 元件** - 顯示載入動畫（🌶️ 旋轉辣椒圖示） |
| `LoadingInitializer.jsx` | **Loading 初始化元件** - 將 Loading Context 注入到 axios interceptor |
| `index.js` | 通用元件統一匯出檔 |

#### 🔹 context/ - Context 狀態管理

| 檔案/目錄 | 功能說明 |
|-----------|----------|
| `index.js` | Context 統一匯出檔 |

##### 📁 context/loading/ - Loading 狀態管理

| 檔案 | 功能說明 |
|------|----------|
| `LoadingContext.js` | Loading Context 定義 |
| `LoadingProvider.jsx` | **Loading Provider** - 管理全域 loading 狀態，支援計數器處理併發請求 |
| `index.js` | Loading Context 統一匯出檔 |

#### 🔹 hooks/ - 自訂 Hooks

| 檔案 | 功能說明 |
|------|----------|
| `useLoading.js` | **Loading Hook** - 取得和控制全域 Loading 狀態 |
| `useNotification.js` | **通知 Hook** - 整合 Toast 和 Loading，避免重疊顯示，提供統一通知介面 |
| `index.js` | Hooks 統一匯出檔 |

#### 🔹 layout/ - 版面配置

| 檔案 | 功能說明 |
|------|----------|
| `FrontendLayout.jsx` | **前台版面** - 包含響應式導航列、手機選單、頁尾 |
| `BackendLayout.jsx` | **後台版面** - 簡潔的後台管理介面佈局 |

#### 🔹 routes/ - 路由設定

| 檔案 | 功能說明 |
|------|----------|
| `router.jsx` | **路由配置** - 使用 Hash Router，定義前台/後台所有路由 |

#### 🔹 services/ - API 服務層

| 檔案/目錄 | 功能說明 |
|-----------|----------|
| `index.js` | 服務統一匯出檔 |

##### 📁 services/api/ - API 相關

| 檔案 | 功能說明 |
|------|----------|
| `config.js` | **API 設定** - 環境變數、Token 管理（get/set/clear） |
| `axiosInstance.js` | **Axios 實例** - 包含 Request/Response Interceptor、自動 Token、Loading 控制 |
| `index.js` | API 服務統一匯出檔 |

#### 🔹 styles/ - CSS 樣式

| 檔案 | 功能說明 |
|------|----------|
| `Header.css` | 頁首導航樣式 |
| `Loading.css` | Loading 動畫樣式 |
| `Login.css` | 登入頁面樣式 |
| `ProductCard.css` | 產品卡片樣式 |
| `ProductDetail.css` | 產品詳情頁樣式 |
| `ProductTable.css` | 後台產品表格樣式 |
| `Swiper.css` | 輪播元件樣式 |

#### 🔹 views/ - 頁面視圖

##### 📁 views/front/ - 前台頁面

| 檔案 | 功能說明 |
|------|----------|
| `Home.jsx` | **首頁** - 產品輪播展示（Swiper） |
| `Products.jsx` | **產品列表頁** - 顯示所有產品 |
| `Product.jsx` | **產品詳情頁** - 單一產品詳細資訊 |
| `Cart.jsx` | **購物車頁** - 購物車管理 |
| `Login.jsx` | **登入頁** - 使用 react-hook-form 表單驗證 |
| `NotFound.jsx` | **404 頁面** - 找不到頁面的處理 |

##### 📁 views/admin/ - 後台頁面

| 檔案 | 功能說明 |
|------|----------|
| `Dashboard.jsx` | **後台儀表板** - 產品 CRUD 管理、圖片上傳 |
| `AdminSetting.jsx` | **後台設定頁** - 管理員設定功能 |

---

## 📦 NPM 依賴說明

### 生產依賴 (dependencies)

| 套件 | 版本 | 用途 |
|------|------|------|
| `react` | ^19.2.0 | React 核心框架 |
| `react-dom` | ^19.2.0 | React DOM 渲染 |
| `react-router` | ^7.13.0 | 路由管理 |
| `axios` | ^1.13.2 | HTTP 請求處理 |
| `react-hook-form` | ^7.71.1 | 表單狀態管理與驗證 |
| `react-toastify` | ^11.0.5 | Toast 通知訊息 |
| `bootstrap` | 5.3.8 | CSS 框架 |
| `swiper` | ^12.1.0 | 輪播/滑動元件 |
| `gh-pages` | ^6.3.0 | GitHub Pages 部署 |

### 開發依賴 (devDependencies)

| 套件 | 版本 | 用途 |
|------|------|------|
| `vite` | ^7.2.4 | 建構工具 |
| `@vitejs/plugin-react` | ^5.1.1 | Vite React 插件 |
| `sass` | ^1.97.2 | SCSS 預處理器 |
| `eslint` | ^9.39.1 | 程式碼檢查 |
| `@eslint/js` | ^9.39.1 | ESLint JavaScript 設定 |
| `eslint-plugin-react-hooks` | ^7.0.1 | React Hooks 規則檢查 |
| `eslint-plugin-react-refresh` | ^0.4.24 | React Fast Refresh 支援 |
| `globals` | ^16.5.0 | 全域變數定義 |
| `@types/react` | ^19.2.5 | React TypeScript 型別 |
| `@types/react-dom` | ^19.2.3 | React DOM TypeScript 型別 |

---

## 🗺️ 路由結構

```
/                          # 前台首頁 (Home)
├── /products              # 產品列表
├── /product/:id           # 產品詳情
├── /cart                  # 購物車
└── /login                 # 登入頁 (AuthRoute 保護 - 已登入重導向)

/admin                     # 後台入口 (BackendLayout)
├── /admin/dashboard       # 儀表板 (ProtectedRoute 保護)
└── /admin/setting         # 設定頁 (ProtectedRoute 保護)

/*                         # 404 頁面
```

---

## 🚀 最理想開發流程

### 階段 1：專案初始化與基礎設定 ⚙️

```bash
# 1. 建立專案
pnpm create vite react-project --template react

# 2. 安裝核心依賴
pnpm add react-router axios

# 3. 安裝開發工具
pnpm add -D sass
```

**處理順序：**
1. **Vite 設定** (`vite.config.js`)
   - 設定路徑別名 `@` → `./src`
   - 設定 base path（部署用）

2. **環境變數** (`.env`)
   - 設定 `VITE_API_BASE`（API 基礎網址）
   - 設定 `VITE_API_PATH`（API 路徑）

3. **ESLint 設定** (`eslint.config.js`)
   - 設定程式碼規範

---

### 階段 2：API 服務層建構 🔌

**處理順序：**
1. **API 設定檔** (`services/api/config.js`)
   - 定義 API 常數
   - 實作 Token 管理函數（get/set/clear）

2. **Axios 實例** (`services/api/axiosInstance.js`)
   - 建立 API 實例（有/無 API_PATH 前綴）
   - 實作 Request Interceptor（自動帶 Token）
   - 實作 Response Interceptor（錯誤處理、401 處理）
   - 預留 Loading 控制器注入點

3. **統一匯出** (`services/index.js`)

---

### 階段 3：全域狀態管理 - Loading 🔄

**安裝依賴：**
```bash
pnpm add react-toastify
```

**處理順序：**
1. **Loading Context** (`context/loading/LoadingContext.js`)
   - 建立 Context

2. **Loading Provider** (`context/loading/LoadingProvider.jsx`)
   - 管理 `isLoading` 狀態
   - 實作計數器處理併發請求
   - 提供 `showLoading`、`hideLoading`、`forceHideLoading`

3. **useLoading Hook** (`hooks/useLoading.js`)
   - 封裝 Context 使用

4. **Loading 元件** (`components/common/Loading.jsx`)
   - 實作 Loading UI

5. **LoadingInitializer** (`components/common/LoadingInitializer.jsx`)
   - 注入 Loading 控制器到 Axios

---

### 階段 4：路由系統建構 🛤️

**處理順序：**
1. **建立版面佈局**
   - `layout/FrontendLayout.jsx` - 前台佈局（導航、頁尾）
   - `layout/BackendLayout.jsx` - 後台佈局

2. **建立路由守衛**
   - `components/AuthRoute.jsx` - 已登入重導向
   - `components/ProtectedRoute.jsx` - 未登入重導向

3. **路由設定** (`routes/router.jsx`)
   - 使用 `createHashRouter`（支援 GitHub Pages）
   - 定義前台/後台路由結構
   - 套用路由守衛

4. **整合到 App.jsx**
   ```jsx
   <LoadingProvider>
     <LoadingInitializer>
       <Loading />
       <RouterProvider router={router} />
     </LoadingInitializer>
   </LoadingProvider>
   ```

---

### 階段 5：通知系統 📢

**處理順序：**
1. **useNotification Hook** (`hooks/useNotification.js`)
   - 整合 Toast 和 Loading
   - 防止 Toast 和 Loading 重疊

2. **在 App 或 Layout 中加入 ToastContainer**
   ```jsx
   import { ToastContainer } from 'react-toastify';
   import 'react-toastify/dist/ReactToastify.css';
   ```

---

### 階段 6：前台頁面開發 🏠

**安裝依賴：**
```bash
pnpm add swiper bootstrap
```

**處理順序：**
1. **首頁** (`views/front/Home.jsx`)
   - Swiper 輪播
   - 產品展示

2. **登入頁** (`views/front/Login.jsx`)
   ```bash
   pnpm add react-hook-form
   ```
   - 表單驗證
   - Token 存取

3. **產品列表頁** (`views/front/Products.jsx`)

4. **產品詳情頁** (`views/front/Product.jsx`)

5. **購物車頁** (`views/front/Cart.jsx`)

6. **404 頁面** (`views/front/NotFound.jsx`)

---

### 階段 7：後台管理開發 🔧

**處理順序：**
1. **後台共用元件**
   - `AdminHeader.jsx` - 導航
   - `ProductTable.jsx` - 產品列表
   - `Pagination.jsx` - 分頁
   - `ProductFormModal.jsx` - 產品表單
   - `DeleteConfirmModal.jsx` - 刪除確認

2. **儀表板頁面** (`views/admin/Dashboard.jsx`)
   - 產品 CRUD
   - 圖片上傳

3. **設定頁面** (`views/admin/AdminSetting.jsx`)

---

### 階段 8：樣式與優化 🎨

**處理順序：**
1. **SCSS 變數設定** (`assets/_variables.scss`)
2. **各元件 CSS 檔案**
3. **響應式設計調整**
4. **效能優化**

---

### 階段 9：部署準備 🚀

```bash
# 安裝部署工具（如已安裝則跳過）
pnpm add gh-pages

# 建構與部署
pnpm run deploy
```

---

## 📝 開發建議

### ✅ 最佳實踐

1. **使用 index.js 統一匯出** - 簡化 import 路徑
2. **Loading 狀態與 API 整合** - 透過 Interceptor 自動控制
3. **路由守衛分離** - AuthRoute 和 ProtectedRoute 各司其職
4. **元件分層** - 依功能分為 common、Admin 等目錄
5. **使用自訂 Hooks** - 封裝可重用邏輯

### ⚠️ 注意事項

1. 環境變數需以 `VITE_` 開頭才能在前端存取
2. Hash Router 用於 GitHub Pages 部署相容性
3. Token 存放在 Cookie，需注意安全性
4. Modal 需處理 Bootstrap 和 React 的整合問題

---

## 🔧 腳本指令

```bash
pnpm dev       # 開發伺服器
pnpm build     # 建構專案
pnpm preview   # 預覽建構結果
pnpm lint      # 程式碼檢查
pnpm deploy    # 部署到 GitHub Pages
```

---

## 📚 技術棧總覽

| 類別 | 技術 |
|------|------|
| 框架 | React 19 |
| 建構工具 | Vite 7 |
| 路由 | React Router 7 |
| HTTP 請求 | Axios |
| 表單處理 | React Hook Form |
| 通知 | React Toastify |
| UI 框架 | Bootstrap 5 |
| 輪播 | Swiper |
| 樣式預處理 | SASS |
| 部署 | GitHub Pages |
