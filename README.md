# 韓國五日行程 Web App

這個專案把「韓國五日」旅行社 PDF 整理成適合手機閱讀、可部署到 GitHub Pages 的前端網站。

功能包含：

- 可橫向滑動的 Day 1–Day 5 日期分頁。
- 每日時間軸、用餐、住宿與團體交通提示。
- Naver Map 互動地圖、依序編號的站點，以及 Naver Map／Google Maps 雙導航連結。
- Day 2、Day 3 自理午晚餐的水原餐廳推薦。
- 三支指定時間開始播放的競賽參考影片。
- 六個水原代表美食的獨立地圖、推薦餐點與研究來源。
- 依藥妝、彩妝、服飾、零食與生活紀念品分類的 2026 購物清單；勾選進度會保存在裝置中。
- 未設定地圖 Client ID 時仍可使用的路線摘要。

## 本機預覽

這是零建置的靜態網站，可用任何靜態伺服器預覽：

```bash
python3 -m http.server 4173
```

接著開啟 `http://localhost:4173`。請勿直接用 `file://` 開啟，瀏覽器可能阻擋 ES modules。

## 設定 Naver Map

1. 在 [Naver Cloud Platform](https://www.ncloud.com/) 建立 Maps Application。
2. 啟用 **Dynamic Map**。
3. 將 GitHub Pages 網址加入 Web Service URL，例如 `https://你的帳號.github.io/你的專案/`。
4. 把取得的 `ncpKeyId` 填入 [`config.js`](config.js)：

```js
window.NAVER_MAP_CLIENT_ID = "你的_ncpKeyId";
```

Client ID 會出現在前端原始碼，這是 JavaScript 地圖的正常用法；安全性依靠 Naver Cloud Console 的網域白名單。未填入時，網站會顯示輕量路線圖，並保留 Naver Map 與 Google Maps 外連。

## 部署 GitHub Pages

1. 建立 GitHub repository 並推送到 `main` 分支。
2. Repository → **Settings → Pages → Source** 選擇 **GitHub Actions**。
3. 內建的 `Deploy static site to GitHub Pages` workflow 會自動發佈。

## 已知待補資料

原 PDF 沒有提供比賽會場名稱／地址、Day 2–3 賽程、每日集合時間，以及 Day 4 景觀咖啡廳店名。網站刻意標示為「待確認」，取得資料後只需更新 [`data.js`](data.js)。

需求、研究與驗收計畫請見 [`docs/PLAN.md`](docs/PLAN.md)。
