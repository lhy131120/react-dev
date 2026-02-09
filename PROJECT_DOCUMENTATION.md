# React + Vite 電商專案模板 - 開發參考文檔

> 本文檔整理自 **react-dev** 專案的架構設計與開發經驗，作為未來類似 React 專案的開發參考模板。

---

## 📋 專案概述

使用 **React 19 + Vite 7** 建構的 SPA 電商網站，包含前台商品展示與後台管理系統。  
採用 **Hash Router** 以相容 GitHub Pages 等靜態部署環境。

---

## 📁 推薦專案結構

```
project-root/
├── 📄 eslint.config.js          # ESLint 設定
├── 📄 index.html                # SPA 入口 HTML
├── 📄 package.json              # 依賴與腳本
├── 📄 vite.config.js            # Vite 建構設定（路徑別名、base path）
├── 📄 .env                      # 環境變數（VITE_ 開頭）
├── 📁 public/                   # 靜態資源（不經 Vite 處理）
└── 📁 src/
    ├── 📄 App.jsx               # 根元件（Provider 包裹層）
    ├── 📄 main.jsx              # 入口點
    ├── 📁 assets/               # SCSS 變數、全域樣式
    ├── 📁 components/           # 可重用元件
    │   ├── 📁 Admin/            # 後台專用元件
    │   └── 📁 common/           # 通用元件（Loading 等）
    ├── 📁 context/              # React Context 狀態管理
    │   └── 📁 loading/          # Loading 全域狀態
    ├── 📁 hooks/                # 自訂 Hooks
    ├── 📁 layout/               # 版面佈局元件
    ├── 📁 routes/               # 路由設定
    ├── 📁 services/             # API 服務層
    │   └── 📁 api/              # Axios 實例與設定
    ├── 📁 styles/               # CSS 樣式檔
    └── 📁 views/                # 頁面視圖
        ├── 📁 front/            # 前台頁面
        └── 📁 admin/            # 後台頁面
```

### 📌 目錄分層原則

| 目錄 | 職責 | 說明 |
|------|------|------|
| `components/` | 可重用 UI 元件 | 不含業務邏輯，依功能分子資料夾（`Admin/`、`common/`） |
| `views/` | 頁面級元件 | 對應路由的完整頁面，可包含業務邏輯 |
| `layout/` | 版面佈局 | 前台/後台各一個 Layout，搭配 `<Outlet />` |
| `hooks/` | 自訂 Hooks | 封裝可重用邏輯（`useLoading`、`useNotification`） |
| `context/` | 全域狀態 | 使用 React Context 管理跨元件狀態 |
| `services/` | API 層 | Axios 實例、Token 管理、Interceptor |
| `routes/` | 路由設定 | 路由樹 + 路由守衛整合 |

### 📌 index.js 統一匯出模式

每個資料夾使用 `index.js` 統一 re-export，簡化引入路徑：

```js
// services/api/index.js
export { api, plainApi, injectLoadingController, getTokenFromCookie } from "./axiosInstance";
export { clearToken, setToken, API_BASE, API_PATH } from "./config";

// services/index.js
export * from "./api";
```

使用時只需：
```js
import { api, plainApi, setToken } from "@/services";
```

---

## 🗺️ 路由架構設計

### 路由結構

```
/                              → FrontendLayout
├── /                          → Home（首頁）
├── /products                  → Products（產品列表）
├── /product/:id               → Product（產品詳情）
├── /cart                      → Cart（購物車）
└── [AuthRoute]                → 已登入者重導向守衛
    └── /login                 → Login（登入頁）

/admin                         → BackendLayout
└── [ProtectedRoute]           → 未登入者重導向守衛
    ├── /admin/dashboard       → Dashboard（儀表板）
    └── /admin/setting         → AdminSetting（設定頁）

/*                             → NotFound（404 頁面）
```

### Hash Router 選擇原因

使用 `createHashRouter` 而非 `createBrowserRouter`：
- GitHub Pages 不支援 SPA 的伺服器端路由 fallback
- Hash Router 的路由資訊在 `#` 之後，不會觸發伺服器端請求
- 代價：URL 會帶有 `#`（如 `https://example.github.io/project/#/login`）

```jsx
import { createHashRouter } from "react-router";

const router = createHashRouter([
  {
    path: "/",
    element: <FrontendLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "product/:id", element: <Product /> },
      { path: "cart", element: <Cart /> },
      {
        element: <AuthRoute />,       // 無 path 的 Layout Route
        children: [
          { path: "login", element: <Login /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <BackendLayout />,
    children: [
      {
        element: <ProtectedRoute />,  // 無 path 的 Layout Route
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "setting", element: <AdminSetting /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
```

### 路由守衛設計模式

兩種守衛使用**無 path 的 Layout Route** 搭配 `<Outlet />`：

#### AuthRoute（登入頁守衛）
- **目的**：已登入用戶不應看到登入頁
- **邏輯**：呼叫 API 檢查登入狀態 → 已登入則 `<Navigate to="/admin/dashboard" />` → 未登入則 `<Outlet />`

#### ProtectedRoute（後台守衛）
- **目的**：未登入用戶不應進入後台
- **邏輯**：呼叫 API 檢查登入狀態 → 已登入則 `<Outlet />` → 未登入則 `<Navigate to="/login" />`

#### 守衛共用模式

```jsx
const RouteGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = 載入中

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        await plainApi.post("/api/user/check");
        if (isMounted) setIsAuthenticated(true);
      } catch {
        if (isMounted) setIsAuthenticated(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; }; // 防止 unmount 後 setState
  }, []);

  if (isAuthenticated === null) return <Loading />;  // 載入中
  if (isAuthenticated) return <Navigate to="..." replace />;  // 或 <Outlet />
  return <Outlet />;  // 或 <Navigate to="..." replace />
};
```

> ⚠️ **關鍵：** `isMounted` flag 防止元件已 unmount 後還呼叫 `setState`，避免 React 記憶體洩漏警告。

---

## 🔌 API 服務層架構

### 架構概覽

```
services/
├── index.js                  # 統一匯出
└── api/
    ├── config.js             # API 常數 + Token CRUD
    ├── axiosInstance.js       # Axios 實例 + Interceptors
    └── index.js              # API 模組匯出
```

### 雙 Axios 實例設計

```js
// 帶 API_PATH 前綴（一般 CRUD 操作）
export const api = axios.create({
  baseURL: `${API_BASE}/api/${API_PATH}`,
  timeout: 10000,
  withCredentials: true,
});

// 不帶 API_PATH 前綴（登入、驗證等）
export const plainApi = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
});
```

### Request Interceptor

每次請求自動：
1. 從 Cookie 讀取 Token 並加到 `Authorization` header
2. 產生唯一 `requestId` 追蹤請求
3. 加入 `pendingRequests` 集合，首個請求時觸發 Loading

```js
const requestInterceptor = (config) => {
  const token = getTokenFromCookie();
  if (token) {
    config.headers.Authorization = `${token}`;
  }

  if (!config.silent) {  // config.silent = true 可跳過 Loading
    const requestId = `${config.method}-${config.url}-${Date.now()}`;
    config._requestId = requestId;
    pendingRequests.add(requestId);
    if (pendingRequests.size === 1) {
      loadingController.show();
    }
  }
  return config;
};
```

### Response Interceptor

```js
// 成功：移除 pending → 全部完成時隱藏 Loading
const responseSuccessHandler = (response) => {
  const { config } = response;
  if (config._requestId) {
    pendingRequests.delete(config._requestId);
    if (pendingRequests.size === 0) loadingController.hide();
  }
  return response;
};

// 失敗：移除 pending → 強制隱藏 Loading → 401 自動跳轉登入頁
const responseErrorHandler = (error) => {
  const { config, response } = error;
  if (config?._requestId) {
    pendingRequests.delete(config._requestId);
    if (pendingRequests.size === 0) loadingController.forceHide();
  }

  if (response?.status === 401) {
    document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = `${import.meta.env.BASE_URL}#/login`;
  }

  return Promise.reject(error);
};
```

### Token 管理（Cookie）

```js
// 取得
export function getTokenFromCookie() {
  const name = "hexToken=";
  const ca = decodeURIComponent(document.cookie).split(";");
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(name) === 0) return c.substring(name.length);
  }
  return "";
}

// 設定（含過期時間）
export function setToken(token, expired) {
  clearToken();
  document.cookie = `hexToken=${token}; expires=${new Date(expired).toUTCString()}; path=/`;
}

// 清除
export function clearToken() {
  document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
```

---

## 🔄 全域 Loading 系統

### 架構流程

```
LoadingProvider (Context)
  ↓ 提供 show/hide/forceHide
LoadingInitializer
  ↓ 注入到 axios interceptor
Loading (UI 元件)
  ↓ 根據 isLoading 顯示/隱藏
```

### 組裝方式（App.jsx）

```jsx
export default function App() {
  return (
    <LoadingProvider>
      <LoadingInitializer>
        <Loading />
        <RouterProvider router={router} />
      </LoadingInitializer>
    </LoadingProvider>
  );
}
```

### LoadingProvider（計數器模式）

處理併發請求：多個同時進行的 API 呼叫只顯示一次 Loading，全部完成才隱藏。

```jsx
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const loadingCount = useRef(0);

  const showLoading = useCallback(() => {
    loadingCount.current += 1;
    if (loadingCount.current === 1) setIsLoading(true);  // 第一個請求才顯示
  }, []);

  const hideLoading = useCallback(() => {
    loadingCount.current = Math.max(0, loadingCount.current - 1);
    if (loadingCount.current === 0) setIsLoading(false);  // 最後一個請求完成才隱藏
  }, []);

  const forceHideLoading = useCallback(() => {
    loadingCount.current = 0;  // 重置計數器（錯誤時使用）
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, forceHideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
```

### LoadingInitializer（橋接 Context 與 Axios）

解決「Axios Interceptor 在 React Context 外部無法存取 Context」的問題：

```jsx
const LoadingInitializer = ({ children }) => {
  const { showLoading, hideLoading, forceHideLoading } = useLoading();

  useEffect(() => {
    injectLoadingController({
      show: showLoading,
      hide: hideLoading,
      forceHide: forceHideLoading,
    });
  }, [showLoading, hideLoading, forceHideLoading]);

  return children;
};
```

### 靜默請求（跳過 Loading）

```js
// 加入 silent: true 即可跳過 Loading 顯示
await api.get("/products", { silent: true });
```

---

## 📢 通知系統（useNotification）

整合 `react-toastify` 與 Loading 狀態，防止 Toast 和 Loading 重疊：

```js
const {
  showLoading,
  hideLoading,
  forceHideLoading,
  isLoading,
  notifySuccess,   // 成功通知（自動關閉 Loading）
  notifyError,     // 錯誤通知（強制關閉 Loading，加長顯示時間）
  notifyInfo,      // 資訊通知
  notifyWarning,   // 警告通知
} = useNotification();
```

**設計要點：**
- 呼叫任何 `notify*` 時，若 Loading 正在顯示，會先 `forceHideLoading()`
- `notifySuccess` 內建 100ms 防抖，避免短時間重複顯示
- `notifyError` 使用 `theme: "colored"` 和較長的 `autoClose: 3000`

---

## ⚠️ 踩坑紀錄與解決方案

### 1. GitHub Pages 部署路徑問題

**問題：** 部署到 `https://user.github.io/repo-name/` 後，API 401 跳轉使用硬編碼 `"/#/login"` 會導致跳到 `https://user.github.io/#/login`（缺少 repo-name），顯示 GitHub 預設 404。

**根因：** `window.location.href = "/#/login"` 是絕對路徑，忽略了部署的 base path。

**解決：** 使用 Vite 的 `import.meta.env.BASE_URL` 動態取得 base path：

```js
// ❌ 錯誤：硬編碼路徑
window.location.href = "/#/login";

// ✅ 正確：動態 base path
window.location.href = `${import.meta.env.BASE_URL}#/login`;
```

**Vite 設定：**
```js
// vite.config.js
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/repo-name/" : "/",
});
```

> 📌 **規則：** 任何需要用到完整 URL 路徑的地方（`window.location.href`、`<a href>`），都應使用 `import.meta.env.BASE_URL` 作為前綴，不要硬編碼。

### 2. useEffect Cleanup 防止 Memory Leak

**問題：** 路由守衛中的非同步 API 呼叫，如果元件在 API 回應前就被 unmount，會觸發 `setState on unmounted component` 警告。

**解決：** 使用 `isMounted` flag：

```jsx
useEffect(() => {
  let isMounted = true;
  const fetchData = async () => {
    const result = await api.get("...");
    if (isMounted) setState(result);  // 只在 mounted 時才更新
  };
  fetchData();
  return () => { isMounted = false; };
}, []);
```

### 3. Axios Interceptor 無法直接使用 React Context

**問題：** Axios interceptor 是在 React 組件樹之外建立的，無法直接使用 `useContext`。

**解決：** 使用「注入模式」——在 React 組件內透過 `useEffect` 將 Context 方法注入到外部模組變數：

```js
// axiosInstance.js（React 外部）
let loadingController = { show: () => {}, hide: () => {}, forceHide: () => {} };
export const injectLoadingController = (controller) => {
  loadingController = controller;
};

// LoadingInitializer.jsx（React 內部）
useEffect(() => {
  injectLoadingController({
    show: showLoading,
    hide: hideLoading,
    forceHide: forceHideLoading,
  });
}, [...]);
```

### 4. Loading 與 Toast 重疊

**問題：** 全螢幕 Loading 覆蓋了 Toast 通知，使用者看不到操作結果。

**解決：** `useNotification` Hook 在顯示 Toast 前先強制關閉 Loading。

### 5. 併發請求的 Loading 閃爍

**問題：** 多個 API 同時發出，每個完成時都會隱藏 Loading，導致 Loading 閃爍。

**解決：** 使用 `useRef` 計數器而非單純的 boolean，只有當所有請求都完成時才隱藏。

---

## 🚀 最理想開發流程

### 階段 1：專案初始化 ⚙️

```bash
# 建立專案
pnpm create vite my-project --template react

# 安裝核心依賴
pnpm add react-router axios react-toastify react-hook-form bootstrap swiper

# 安裝開發工具
pnpm add -D sass

# 安裝部署工具
pnpm add gh-pages
```

**設定檔：**
1. `vite.config.js` — 路徑別名 `@`、production base path
2. `.env` — `VITE_API_BASE`、`VITE_API_PATH`
3. `eslint.config.js` — 程式碼規範
4. `index.html` — 外部 CDN（Google Fonts、Bootstrap Icons）

---

### 階段 2：API 服務層 🔌

**建立順序：**
1. `services/api/config.js` — API 常數 + Token CRUD
2. `services/api/axiosInstance.js` — 雙實例 + Interceptors + Loading 注入點
3. `services/api/index.js` → `services/index.js` — 統一匯出

---

### 階段 3：全域 Loading 狀態 🔄

**建立順序：**
1. `context/loading/LoadingContext.js` — Context 定義
2. `context/loading/LoadingProvider.jsx` — 計數器模式 Provider
3. `hooks/useLoading.js` — Context 封裝 Hook
4. `components/common/Loading.jsx` — Loading UI
5. `components/common/LoadingInitializer.jsx` — 注入 axios

---

### 階段 4：路由系統 🛤️

**建立順序：**
1. `layout/FrontendLayout.jsx` — 前台佈局（Nav + Outlet + Footer）
2. `layout/BackendLayout.jsx` — 後台佈局
3. `components/AuthRoute.jsx` — 登入頁守衛
4. `components/ProtectedRoute.jsx` — 後台守衛
5. `routes/router.jsx` — 路由樹定義
6. `App.jsx` — 組裝 Provider → Initializer → Loading → Router

---

### 階段 5：通知系統 📢

1. `hooks/useNotification.js` — 整合 Toast + Loading
2. Layout 中加入 `<ToastContainer />`

---

### 階段 6：前台頁面 🏠

1. Home（Swiper 輪播）
2. Login（react-hook-form 表單驗證）
3. Products（產品列表 + 分頁）
4. Product/:id（產品詳情）
5. Cart（購物車）
6. NotFound（404）

---

### 階段 7：後台管理 🔧

1. 共用元件：AdminHeader、ProductTable、Pagination、ProductFormModal、DeleteConfirmModal
2. Dashboard（CRUD + 圖片上傳）
3. AdminSetting

---

### 階段 8：樣式與部署 🎨🚀

1. SCSS 變數 + 各元件 CSS
2. 響應式設計
3. `pnpm run deploy`（vite build + gh-pages）

---

## 📦 依賴清單參考

### 生產依賴

| 套件 | 用途 | 備註 |
|------|------|------|
| `react` + `react-dom` | 核心框架 | v19 |
| `react-router` | 路由管理 | v7，使用 `createHashRouter` |
| `axios` | HTTP 請求 | 雙實例 + Interceptor 模式 |
| `react-hook-form` | 表單驗證 | 效能好，不重渲染整個表單 |
| `react-toastify` | Toast 通知 | 整合至 `useNotification` |
| `bootstrap` | CSS 框架 | 僅用 CSS，不引入 JS |
| `swiper` | 輪播元件 | 首頁產品展示 |
| `gh-pages` | GitHub Pages 部署 | 搭配 `deploy` script |

### 開發依賴

| 套件 | 用途 |
|------|------|
| `vite` + `@vitejs/plugin-react` | 建構工具 |
| `sass` | SCSS 預處理器 |
| `eslint` + plugins | 程式碼檢查 |

---

## 🔧 NPM Scripts

```bash
pnpm dev        # 啟動開發伺服器
pnpm build      # 建構 production 版本
pnpm preview    # 本地預覽 build 結果
pnpm lint       # 執行 ESLint 檢查
pnpm deploy     # 建構 + 部署到 GitHub Pages（vite build && gh-pages -d dist）
```

---

## 📚 技術棧總覽

| 類別 | 技術 | 版本 |
|------|------|------|
| 框架 | React | 19 |
| 建構工具 | Vite | 7 |
| 路由 | React Router | 7 |
| HTTP 請求 | Axios | 1.x |
| 表單處理 | React Hook Form | 7 |
| 通知 | React Toastify | 11 |
| UI 框架 | Bootstrap | 5 |
| 輪播 | Swiper | 12 |
| 樣式 | SASS / CSS | — |
| 部署 | GitHub Pages (gh-pages) | — |
| 套件管理 | pnpm | — |

---

## 🔑 關鍵設計模式速查

| 模式 | 應用場景 | 核心檔案 |
|------|----------|----------|
| Context + Provider | 全域 Loading 狀態 | `LoadingContext.js` / `LoadingProvider.jsx` |
| 注入模式 | Axios Interceptor 使用 React Context | `LoadingInitializer.jsx` → `axiosInstance.js` |
| 計數器模式 | 併發請求 Loading 控制 | `LoadingProvider.jsx`（`useRef` 計數器） |
| Layout Route 守衛 | 路由權限控制 | `AuthRoute.jsx` / `ProtectedRoute.jsx` |
| 統一匯出 | 簡化 import 路徑 | 各 `index.js` |
| 雙 Axios 實例 | 不同 baseURL 需求 | `axiosInstance.js`（`api` / `plainApi`） |
| 靜默請求 | 跳過 Loading 的 API 呼叫 | `config.silent = true` |
| 防抖通知 | 避免重複 Toast | `useNotification.js`（`toastDebounceRef`） |
| isMounted 守護 | 防止 unmount 後 setState | 路由守衛的 `useEffect` cleanup |
| 動態 Base Path | 適配不同部署環境 | `import.meta.env.BASE_URL` |
