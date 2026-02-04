# 專案重構總結

> 重構日期：2026-02-04  
> 清理完成：2026-02-04

---

## 📁 新的資料夾結構

```
src/
├── components/
│   ├── common/                    ← 通用元件
│   │   ├── Loading.jsx           ← 全域 Loading 元件
│   │   ├── LoadingInitializer.jsx ← Loading 控制器注入
│   │   └── index.js
│   ├── Admin/
│   │   ├── AdminHeader.jsx
│   │   ├── Pagination.jsx
│   │   ├── ProductFormModal.jsx
│   │   ├── ProductTable.jsx
│   │   └── index.js              ← 統一導出
│   ├── AuthRoute.jsx
│   ├── DeleteConfirmModal.jsx
│   ├── ProductCard.jsx
│   ├── ProductList.jsx
│   ├── ProtectedRoute.jsx
│   └── index.js                  ← 統一導出
│
├── context/
│   ├── loading/                  ← Loading Context 模組化
│   │   ├── LoadingContext.js     ← Context 定義
│   │   ├── LoadingProvider.jsx   ← Provider 元件（支援並發請求計數）
│   │   └── index.js
│   └── index.js
│
├── hooks/                        ← Hooks 模組化
│   ├── useLoading.js             ← Loading 狀態控制
│   ├── useNotification.js        ← 整合 Toast + Loading
│   └── index.js
│
├── services/                     ← API 服務層
│   ├── api/
│   │   ├── config.js             ← API 設定、Token 管理函數
│   │   ├── axiosInstance.js      ← Axios 實例 + Loading 攔截器
│   │   └── index.js
│   └── index.js
│
├── layout/
│   ├── BackendLayout.jsx
│   └── FrontendLayout.jsx
│
├── routes/
│   └── router.jsx
│
├── styles/
│   ├── Loading.css
│   └── Swiper.css
│
├── views/
│   ├── admin/
│   │   ├── AdminSetting.jsx
│   │   └── Dashboard.jsx
│   └── front/
│       ├── Cart.jsx
│       ├── Home.jsx
│       ├── Login.jsx
│       ├── NotFound.jsx
│       ├── Product.jsx
│       └── Products.jsx
│
├── assets/
│   ├── _variables-dark.scss
│   ├── _variables.scss
│   └── all.scss
│
├── App.jsx
├── App.css
└── main.jsx
```

---

## 🔄 全域 Loading 自動化

### 之前的寫法
每個元件需要手動呼叫 `showLoading()` 和 `hideLoading()`：

```jsx
import { useLoading } from "../../context/LoadingContext";

const MyComponent = () => {
  const { showLoading, hideLoading } = useLoading();

  const fetchData = async () => {
    showLoading();
    try {
      const response = await api.get("/products");
      // ...
    } catch (error) {
      // ...
    } finally {
      hideLoading();
    }
  };
};
```

### 現在的寫法
API 請求會**自動**顯示/隱藏 Loading，無需手動呼叫：

```jsx
import { api } from "@/services";

const MyComponent = () => {
  const fetchData = async () => {
    // Loading 會自動顯示/隱藏
    const response = await api.get("/products");
    // ...
  };
};
```

### 靜默請求（不顯示 Loading）
如果某些請求不需要顯示 Loading，可以使用 `silent` 選項：

```jsx
// 不會觸發全域 Loading
await api.get("/products", { silent: true });
```

---

## 🔔 Toast 與 Loading 整合

### 問題
當 Loading 還在顯示時觸發 Toast，會造成 UI 重疊，影響使用者體驗。

### 解決方案
新增 `useNotification` hook，整合 Toast 和 Loading：

```jsx
import { useNotification } from "@/hooks";

const MyComponent = () => {
  const { notifySuccess, notifyError, notifyInfo, notifyWarning } = useNotification();

  const handleSubmit = async () => {
    try {
      await api.post("/data", payload);
      // 顯示 toast 時會自動先關閉 loading
      notifySuccess("操作成功！");
    } catch (error) {
      notifyError("發生錯誤");
    }
  };
};
```

### useNotification 提供的方法

| 方法 | 說明 |
|------|------|
| `notifySuccess(message, options?)` | 成功通知（綠色） |
| `notifyError(message, options?)` | 錯誤通知（紅色） |
| `notifyInfo(message, options?)` | 資訊通知（藍色） |
| `notifyWarning(message, options?)` | 警告通知（黃色） |
| `showLoading()` | 手動顯示 Loading |
| `hideLoading()` | 手動隱藏 Loading |
| `forceHideLoading()` | 強制隱藏 Loading（重置計數器） |

---

## 📍 路徑別名設定

### vite.config.js 設定
```javascript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 使用方式

```jsx
// 之前
import { api } from "../../api/axiosInstance.js";
import ProductCard from "../../components/ProductCard.jsx";

// 現在
import { api } from "@/services";
import { ProductCard } from "@/components";
```

---

## 🔑 Token 管理統一化

### 可用函數

```jsx
import { setToken, clearToken, getTokenFromCookie } from "@/services";

// 登入時設定 Token
setToken(token, expired);

// 登出時清除 Token
clearToken();

// 取得當前 Token
const token = getTokenFromCookie();
```

---

## 📦 導入方式快速參考

### Services（API 相關）
```jsx
import { api, plainApi, setToken, clearToken } from "@/services";
```

### Hooks
```jsx
import { useLoading, useNotification } from "@/hooks";
```

### Context
```jsx
import { LoadingProvider } from "@/context/loading";
```

### Components
```jsx
import { Loading, LoadingInitializer } from "@/components/common";
import { AuthRoute, ProtectedRoute, ProductCard } from "@/components";
import { AdminHeader, ProductTable, Pagination } from "@/components/Admin";
```

---

## ⚙️ 架構說明

### Loading 運作流程

```
┌─────────────────────────────────────────────────────────────┐
│                        App.jsx                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  LoadingProvider                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              LoadingInitializer                 │  │  │
│  │  │  (注入 loading controller 到 axios)             │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  Loading 元件 + RouterProvider            │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### API 請求流程

```
元件發起請求
    ↓
axios request interceptor
    ├── 添加 Authorization header
    └── 觸發 showLoading()
    ↓
發送 HTTP 請求
    ↓
axios response interceptor
    ├── 成功: 觸發 hideLoading()
    └── 失敗: 觸發 forceHideLoading() + 處理 401
    ↓
返回結果給元件
```

---

## 📝 注意事項

1. **舊檔案保留**：原本的 `src/api/axiosInstance.js`、`src/context/LoadingContext.jsx` 等檔案仍保留，可在確認新架構穩定後刪除。

2. **並發請求處理**：`LoadingProvider` 使用計數器機制，多個並發請求時只會顯示一次 Loading，全部完成後才隱藏。

3. **錯誤處理**：API 請求失敗時會自動隱藏 Loading，無需手動處理。

4. **401 自動跳轉**：Token 過期時會自動清除並跳轉到登入頁。

---

## ✅ 已刪除的舊檔案

以下舊檔案已在重構後刪除：

- ~~`src/api/`~~ （整個資料夾，已由 `src/services/api/` 取代）
- ~~`src/context/LoadingContext.jsx`~~ （已由 `src/context/loading/` 取代）
- ~~`src/context/LoadingContextDef.js`~~ （已整合至 `src/context/loading/`）
- ~~`src/components/Loading.jsx`~~ （已移至 `src/components/common/Loading.jsx`）
