# 韓國五日行程 Web App

這個專案把「韓國五日」旅行社 PDF 整理成適合手機閱讀、可部署到 GitHub Pages 的前端網站。

功能包含：

- 可橫向滑動的 Day 1–Day 5 日期分頁。
- 每日時間軸、用餐、住宿與團體交通提示。
- Kakao Map 互動地圖、依序編號的站點，以及 Naver Map／Google Maps 雙導航連結。
- Day 2、Day 3 自理午晚餐的水原餐廳推薦。
- 四支競賽參考影片，包含女生平衡木；有指定時間的影片會從動作處開始播放。
- 旅行社手冊的緊急聯絡、住宿電話、行李、安檢、出入境與當地提醒集中於「旅遊須知」分頁。
- 六個水原代表美食的獨立地圖、推薦餐點與研究來源。
- 依藥妝、彩妝、服飾、零食與生活紀念品分類的 2026 購物清單；勾選進度會保存在裝置中。
- 未設定 Kakao JavaScript key 時仍可使用的路線摘要。
- `/#solo` 私人行程入口；日期、地點與行程以密碼在瀏覽器內解密，一般網址不顯示入口。

## 本機預覽

這是零建置的靜態網站，可用任何靜態伺服器預覽：

```bash
python3 -m http.server 4173
```

接著開啟 `http://localhost:4173`。請勿直接用 `file://` 開啟，瀏覽器可能阻擋 ES modules。

## 設定 Kakao Map

韓國的空間資料法規讓 Google Maps 在境內缺少道路導航與部分店家資訊。Kakao Map 是韓國使用量最大的在地地圖，POI／餐廳資料最完整，而且只要一支前端 script 就能串接；申請門檻也低於需要信用卡驗證的 Naver Cloud Platform。以下步驟依 [Kakao Maps API 官方文件](https://apis.map.kakao.com/web/guide/)整理。

1. 到 [Kakao Developers](https://developers.kakao.com/) 用 Kakao 帳號登入。帳號可用 email 註冊；**海外門號的驗證流程本專案未實測**，若卡在驗證步驟屬正常狀況。
2. **내 애플리케이션 → 애플리케이션 추가하기** 建立應用程式，填入 `앱 이름`（應用名稱）與 `사업자명`（個人用途填自己的名字即可）。
3. 進入該應用的 **Platform Key** 分頁，複製 **JavaScript key**。注意不是 `REST API key`，也不是 `Native app key`。
4. 左側選單 **앱 설정 → 플랫폼 → Web → 사이트 도메인 등록**，逐一加入會用到的網域：
   - `http://localhost:4173`（對應上方本機預覽指令）
   - `https://你的帳號.github.io`（GitHub Pages，只需登記到網域層級，不含路徑）

   未登記的網域呼叫 SDK 會被直接拒絕，這是 Kakao 唯一的存取控制手段，務必兩個都加。

JavaScript key 必然會出現在前端原始碼，這是 JS 地圖的正常用法，安全性完全依靠上一步的網域白名單。REST API key 與 Admin key 具備伺服器端權限，**絕對不要**放進前端或提交進這個 repo。

5. 把 JavaScript key 貼入 [`config.js`](config.js)：

```js
window.KAKAO_MAP_JAVASCRIPT_KEY = "你的_JavaScript_key";
```

本站會以 `autoload=false` 動態載入 SDK，再等待 `kakao.maps.load()` 完成。沒有填 key、網域未登記或 SDK 暫時載入失敗時，頁面會自動改顯示輕量路線摘要，Naver Map 與 Google Maps 外連仍可使用。

[`data.js`](data.js) 的每個地點已內含 WGS84 的 `lat` / `lng`，直接用於 `new kakao.maps.LatLng(lat, lng)`，不需要額外座標轉換。

## 私人行程

一般網址只顯示 9/11–9/15 團體行程。私人入口為：

```text
https://greenstonewei.github.io/202609-korea-trip/#solo
```

私人資料不會以明文提交；`.private/solo-trip.json` 由本機加密工具轉成公開可部署的 `solo-trip.enc.json` 密文。密碼不會保存至瀏覽器儲存空間。資料格式、加密方式與更新步驟請見 [`docs/SOLO_TRIP.md`](docs/SOLO_TRIP.md)。

## 部署 GitHub Pages

1. 建立 GitHub repository 並推送到 `main` 分支。
2. Repository → **Settings → Pages → Source** 選擇 **GitHub Actions**。
3. 內建的 `Deploy static site to GitHub Pages` workflow 會自動發佈。

## 已知待補資料

旅行社新版手冊已提供出發日機場集合時間；目前尚未提供 Day 2–3 每日上車時間，以及 Day 4 景觀咖啡廳店名。網站刻意標示為「待確認」，取得資料後只需更新 [`data.js`](data.js)。

需求、研究與驗收計畫請見 [`docs/PLAN.md`](docs/PLAN.md)。
