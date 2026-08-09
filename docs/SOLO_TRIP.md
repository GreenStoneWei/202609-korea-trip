# 私人獨旅行程

## 隱私模型

- 隊友使用一般網址，只會看到 9/11–9/15 公開行程。
- 私人入口是 `/#solo`，一般導覽列不會顯示連結。
- 私人行程的日期、地點與內容全部以 AES-256-GCM 加密；公開 repository 與 GitHub Pages 只保存 `solo-trip.enc.json` 密文。
- 密碼不寫入程式、不放在網址，也不保存至 localStorage 或 sessionStorage。解鎖資料只存在目前分頁的記憶體，重新整理或關閉後即清除。
- `.private/` 已加入 `.gitignore`，避免明文私人行程被提交。

這個設計能保護行程內容，但無法隱藏「網站存在一個加密檔案」這件事。密文可以被下載，因此應使用至少 12 個字元、最好由 5 個以上隨機單字組成的密碼，降低離線猜測風險。

## 私人行程資料格式

完整範例請見 [`solo-trip.example.json`](solo-trip.example.json)。主要結構：

```json
{
  "version": 1,
  "title": "韓國獨旅",
  "subtitle": "只會在解鎖後顯示的副標題",
  "dates": "YYYY.MM.DD — MM.DD",
  "days": []
}
```

每個 `day` 可使用：

- `id`、`date`、`weekday`、`area`、`title`
- `summary`：當日摘要字串陣列
- `transport`：當日主要交通說明
- `places`：保留 `name`、`query`、`lat`、`lng`，供後續私人 Kakao 地圖使用
- `events`：時間軸內容

每個 `event` 可使用：

- `time`
- `type`：`flight`、`place`、`food`、`activity`、`hotel`、`transport` 或 `recommendation`
- `title`、`subtitle`、`meta`
- `mapQuery`：解鎖後產生 Naver Map 與 Google Maps 外部連結

## 建立與更新加密檔

1. 建立不會被 Git 追蹤的私人來源檔：

   ```bash
   mkdir -p .private
   cp docs/solo-trip.example.json .private/solo-trip.json
   ```

2. 編輯 `.private/solo-trip.json`。
3. 在互動式終端機執行：

   ```bash
   node scripts/encrypt-solo.mjs
   ```

   工具會隱藏密碼輸入，使用 PBKDF2-SHA-256（600,000 次）及隨機 salt 派生 AES-256-GCM 金鑰，並更新 `solo-trip.enc.json`。

4. 本機開啟 `http://localhost:4173/#solo` 測試密碼。
5. 只提交 `solo-trip.enc.json`；絕對不要強制加入 `.private/solo-trip.json`。

每次修改私人行程，都必須重新執行加密工具並提交新的密文。若更換密碼，直接以新密碼再次加密即可。
