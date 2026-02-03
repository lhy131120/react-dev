# 🌴 熱帶調味料電商 - 設計主題指南

## 色彩調色盤

### 主要色彩
- **主色（Primary）**: `#d97706` - 暖橘色
  - 用於主要按鈕、連結和重點元素
- **次色（Secondary）**: `#f59e0b` - 琥珀色
  - 用於強調和漸層色
- **成功（Success）**: `#059669` - 深綠色
  - 用於成功訊息、勾選和正面反饋
- **危險（Danger）**: `#dc2626` - 紅色
  - 用於錯誤訊息、警告和危險操作
- **資訊（Info）**: `#0891b2` - 青藍色
  - 用於資訊提示和註解

### 文字色彩
- **深棕色（Dark）**: `#78350f` - 主要文字色
- **深棕色（Brown）**: `#92400e` - 標題色

### 背景色
- **淡米色（Light）**: `rgba(255, 247, 237, 0.95)` - 卡片和淺色背景

### 補助色彩
- **珊瑚橙**: `#f97316`
- **青檸綠**: `#84cc16`
- **沙子米色**: `#f5deb3`
- **溫暖黃**: `#fcd34d`

## 設計元素特色

### 1. 背景
- 使用溫暖的米色漸層背景
- 帶有熱帶植物的柔和圓形漸層裝飾
- 動態浮動粒子效果（橙色、綠色主題）

### 2. 卡片設計
- 白色漸層背景帶毛玻璃效果
- 熱帶橘色邊框和陰影
- Hover時上升動畫和圖片縮放效果
- 頂部動畫條紋

### 3. 按鈕
- 漸層背景（橘→琥珀、綠色等）
- 白色流動效果 hover 動畫
- 柔和陰影和縮放效果

### 4. 導航列
- 淡色半透明背景
- 熱帶色系邊框
- 懸停時顯示漸層底線效果

### 5. 表單元素
- 白色背景，熱帶橘色邊框
- Focus時邊框和陰影更明顯
- 圓角設計

### 6. 徽章
- 漸層背景（配合主題色）
- 圓形邊角設計

## 使用示例

### 在 JSX 中使用顏色

```jsx
// 使用主要顏色
<h1 style={{ color: '#92400e' }}>標題</h1>

// 使用漸層
<div style={{
  background: 'linear-gradient(90deg, #d97706, #f59e0b)',
  padding: '1rem',
  borderRadius: '8px'
}}>
  漸層內容
</div>

// 使用 Bootstrap 類別
<button className="btn btn-primary">主要按鈕</button>
<button className="btn btn-success">成功按鈕</button>
<span className="badge bg-primary">熱銷</span>
```

### 在 SCSS 中使用變數

```scss
// 在 all.scss 中定義的變數
$primary: #d97706;           // 主色
$secondary: #f59e0b;         // 次色
$success: #059669;           // 成功
$danger: #dc2626;            // 危險
$dark: #78350f;              // 深色
$tropical-brown: #92400e;    // 棕色
```

## 動畫效果

### 1. 卡片淡入
```css
opacity: 0;
transform: translateY(30px);
animation: cardFadeIn 0.8s ease-out forwards;
```

### 2. Hover 上升
```css
transform: translateY(-8px);
box-shadow: 0 25px 50px rgba(217, 119, 6, 0.2);
```

### 3. 漸層邊框
```css
background: linear-gradient(white, white) padding-box, 
            linear-gradient(90deg, #d97706, #f59e0b) border-box;
border: 2px solid transparent;
```

## 響應式設計

所有元素都支援以下斷點：
- **大螢幕** (992px+): 完整設計
- **中等螢幕** (768px-991px): 調整寬度和間距
- **小螢幕** (576px-767px): 堆疊布局
- **超小螢幕** (<576px): 優化文字大小和分頁

## 特殊組件樣式

### 購物車數量選擇器
- 熱帶橘色邊框和漸層
- 自訂下拉箭頭
- Hover 時發光效果

### 分頁
- 熱帶色系按鈕
- 活躍頁碼顯示漸層背景
- 平滑的懸停和點擊動畫

### 導航連結
- 下劃線動畫效果
- Hover 時漸層顏色顯示

## 最佳實踐

1. **保持一致性**: 使用預定義的色彩變數
2. **可讀性**: 文字充分對比（深棕色文字在淡米色背景上）
3. **漸層使用**: 優先使用橘→琥珀和綠色漸層
4. **間距**: 使用 Bootstrap 的間距實用程式（p, m, g 類別）
5. **動畫**: 使用 `transition: all 0.3s ease` 創建平滑效果

## 更新主題

若要改變整個應用的主題色，修改以下文件：

1. **[src/assets/all.scss](src/assets/all.scss)** - 更改 SCSS 變數
2. **[src/App.css](src/App.css)** - 更新 CSS 色碼
3. **JSX 組件** - 更新內聯 `style` 屬性

## 色彩參考資源

- **Tailwind**: 提供的顏色靈感來自 Tailwind CSS 的熱帶色系
- **Bootstrap 5.3**: 完全相容 Bootstrap 的色彩系統

---

🌶️ 享受設計！
