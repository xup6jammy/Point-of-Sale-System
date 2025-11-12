# 📦 Point of Sale System (POS 系統)
體驗 : https://xup6jammy.github.io/Point-of-Sale-System/
一個功能完整的銷售時點情報系統（POS），專為零售與批發業務設計，採用純前端技術開發，無需伺服器即可運行。
<img width="1902" height="1227" alt="image" src="https://github.com/user-attachments/assets/635e9562-8325-45b4-8e78-fa3240105db8" />
<img width="1043" height="1208" alt="image" src="https://github.com/user-attachments/assets/e5fae870-5585-4900-88f0-ff07142a7165" />

## ✨ 功能特色

### 主要功能
- 🛒 **商品選購** - 直覺的商品網格介面，快速選取商品
- 🔍 **即時搜尋** - 商品名稱快速搜尋功能
- 💰 **購物車管理** - 即時計算總額、應收金額、找零
- 🏷️ **折扣系統** - 支援百分比折扣與固定金額折扣
- ✏️ **價格調整** - 可修改單項商品價格
- 📊 **營業統計** - 今日營收、訂單數量即時顯示
- 💾 **本地儲存** - 使用瀏覽器 localStorage 持久化資料

### 管理後台
- 📝 **商品管理** - 新增、編輯、刪除商品
- 📥 **資料匯入/匯出** - JSON 格式資料管理
- 📤 **CSV 匯出** - 支援匯出至 Excel 進行分析
- 📈 **銷售歷史** - 查看過往交易記錄
- 🗑️ **快取清除** - 重置系統資料功能

## 🛠️ 使用技術

### 前端技術棧
- **HTML5** - 結構與標記
- **CSS3** - 樣式設計與響應式佈局
  - CSS Grid & Flexbox
  - 現代化 UI/UX 設計
- **Vanilla JavaScript (ES6+)** - 應用邏輯
  - LocalStorage API（資料持久化）
  - FileReader API（檔案處理）
  - 模組化程式碼結構

### 特點
- ✅ 無框架依賴（Pure JavaScript）
- ✅ 無需建置工具
- ✅ 無需伺服器
- ✅ 無需資料庫
- ✅ 開箱即用

## 📁 專案結構

```
Point-of-Sale-System/
│
├── index.html          # 主要 POS 收銀介面
├── app.js              # 主程式邏輯 (818 行)
├── admin.html          # 管理後台介面
├── admin.js            # 後台管理邏輯 (390 行)
├── styles.css          # 全域樣式表
├── data.json           # 商品資料庫 (89 筆商品)
└── README.md           # 專案說明文件
```

## 🚀 安裝與使用

### 環境需求
- 現代瀏覽器（Chrome、Firefox、Edge、Safari）
- 無需安裝任何依賴套件
- 無需 Node.js 或 Python

### 快速開始

1. **下載專案**
   ```bash
   git clone https://github.com/your-username/Point-of-Sale-System.git
   cd Point-of-Sale-System
   ```

2. **開啟應用程式**
   - 方式一：直接在瀏覽器中開啟 `index.html`
   - 方式二：使用本地伺服器（可選）
     ```bash
     # 使用 Python
     python -m http.server 8000

     # 使用 Node.js http-server
     npx http-server
     ```
   - 開啟瀏覽器訪問 `http://localhost:8000`

3. **初次設定**
   - 開啟 `admin.html` 進入管理後台
   - 點擊「匯入資料」載入 `data.json` 檔案
   - 商品資料將儲存至瀏覽器 localStorage

4. **開始使用**
   - 返回 `index.html` 開始使用 POS 系統
   - 選擇商品、輸入金額、完成交易

## 📖 使用說明

### POS 收銀介面 (index.html)

1. **選擇商品**
   - 點擊商品卡片將商品加入購物車
   - 使用搜尋框快速找到商品

2. **修改訂單**
   - 點擊商品可增加數量
   - 使用「-」按鈕減少數量
   - 點擊「修改價格」調整單項價格
   - 點擊「刪除」移除商品

3. **套用折扣**
   - 輸入百分比折扣（例如：10 = 9折）
   - 或輸入固定折扣金額

4. **完成交易**
   - 輸入客戶付款金額
   - 點擊「完成交易」
   - 查看找零金額
   - 確認後交易記錄將被保存

### 管理後台 (admin.html)

1. **商品管理**
   - 查看所有商品列表
   - 編輯商品資訊（名稱、價格、類別）
   - 刪除不需要的商品

2. **資料管理**
   - **匯入 JSON**：上傳 JSON 檔案更新商品資料
   - **匯出 JSON**：下載當前商品資料
   - **匯出 CSV**：匯出至 Excel 進行分析

3. **銷售記錄**
   - 查看所有交易歷史
   - 查看交易詳情
   - 清除歷史記錄

## 💾 資料儲存

### LocalStorage 結構
系統使用瀏覽器的 localStorage 儲存資料，key 為 `posData`：

```javascript
{
  "products": [
    {
      "id": "1",
      "name": "商品名稱",
      "price": 100,
      "category": "類別"
    }
  ],
  "sales": [
    {
      "id": "timestamp",
      "items": [...],
      "total": 1000,
      "discount": 0,
      "payment": 1000,
      "change": 0,
      "date": "2025-11-10T10:30:00"
    }
  ]
}
```

### 資料備份建議
- 定期使用管理後台匯出 JSON 檔案備份
- 資料儲存在瀏覽器中，清除瀏覽器資料會遺失記錄
- 建議將重要資料匯出至雲端或外部儲存裝置

## 🌐 瀏覽器相容性

| 瀏覽器 | 最低版本 |
|--------|----------|
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 11+ |
| Edge | 79+ |

## 📝 data.json 格式說明

商品資料格式範例：

```json
[
  {
    "id": "1",
    "name": "MAX地瓜油",
    "price": 9999,
    "category": "機油"
  },
  {
    "id": "2",
    "name": "WINNER沙拉油",
    "price": 9999,
    "category": "齒輪油"
  }
]
```

### 必要欄位
- `id`: 商品唯一識別碼（字串）
- `name`: 商品名稱（字串）
- `price`: 商品價格（數字）
- `category`: 商品類別（字串）

## 🔧 自訂與擴充

### 修改樣式
編輯 `styles.css` 檔案以客製化外觀：
- 顏色主題
- 字體大小
- 佈局樣式

### 新增功能
修改 `app.js` 或 `admin.js` 以擴充功能：
- 更多折扣類型
- 會員系統
- 列印收據
- 庫存管理

## ⚠️ 注意事項

1. **資料安全**
   - 本系統使用瀏覽器 localStorage，資料儲存在客戶端
   - 不適合處理敏感資料
   - 建議定期備份資料

2. **多裝置使用**
   - 每個瀏覽器的資料獨立
   - 無法跨裝置同步
   - 建議搭配雲端儲存服務使用

3. **效能限制**
   - localStorage 容量限制約 5-10MB
   - 商品數量建議不超過 1000 筆
   - 銷售記錄建議定期清理

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

### 開發指南
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送至分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 📧 聯絡方式

如有任何問題或建議，歡迎透過以下方式聯繫：
- Email: a0925281767s@gmail.com


---

**注意**：本系統為示範專案，如需用於生產環境，建議增加以下功能：
- 使用者認證與授權
- 後端 API 與資料庫整合
- 更完善的資料驗證
- 交易加密與安全性強化
- 列印收據功能
- 庫存管理系統
