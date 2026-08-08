# 韓國五日行程網站：需求與實作計畫

## 目標

- 將「韓國五日」PDF 行程轉成手機優先的前端網站。
- 頂部提供可橫向滑動的每日分頁，快速切換 Day 1–Day 5。
- 主內容用時間軸呈現每個景點、交通、用餐與備註。
- 地圖標出當日各站，並清楚顯示站點順序與交通方式。
- 對原行程中標示為自理的午餐與晚餐，補上合適的餐廳推薦及導航連結。
- 使用純前端架構，可直接部署到 GitHub Pages。

## 第一階段工作

1. 解析 PDF，建立結構化行程資料。
2. 查證景點位置、交通資訊與自理餐食附近的餐廳。
3. 確認韓國在地地圖在靜態網站及 GitHub Pages 的可行整合方式。
4. 建立手機優先 UI：日期分頁、行程摘要、時間軸、交通區段與地圖。
5. 加入桌機版響應式配置、載入／錯誤狀態與基本無障礙支援。
6. 執行建置、型別／程式碼檢查及主要互動驗證。
7. 補齊 GitHub Pages 部署設定與操作說明。

## 初步技術方向

- Vite + React + TypeScript。
- 行程資料獨立於 UI，便於後續修改或新增任務。
- 互動地圖使用 Kakao Maps JavaScript SDK；未設定 JavaScript key 時提供不會壞掉的地圖替代介面與外部導航連結。
- 導航外連優先使用 Naver Map，並保留韓文地址／搜尋關鍵字方便旅途中複製使用。

## 驗收條件

- 375px 寬度手機可順暢閱讀，不需橫向捲動頁面。
- 日期分頁可點擊與橫向滑動，切換後時間軸與地圖同步更新。
- 每段交通方式與預估時間可辨識。
- 所有自理午／晚餐至少有具體推薦，包含料理類型、推薦理由、地址或地區、Naver Map 連結。
- 未設定 Kakao JavaScript key 時仍可完整閱讀行程及開啟外部導航。
- `npm run build` 成功，並可透過 GitHub Actions 發佈到 GitHub Pages。

## 待 PDF 解析後補入

- 每日日期、航班／住宿資訊。
- 每一站的時間、地點、備註與交通區段。
- 自理餐食清單及其鄰近餐廳研究結果。
- 地圖座標與 Naver 導航查詢字串。

## PDF 解析摘要

- 去程：2026/09/11，長榮 BR170，桃園 07:30 → 仁川 11:00。
- 回程：2026/09/15，長榮 BR159，仁川 19:45 → 桃園 21:25。
- 住宿：HOMES Stay Suwon 或同級；官方地址為京畿道水原市八達區仁溪路 116。
- Day 1：抵達、午餐、比賽會場練習、晚餐、飯店。
- Day 2–3：全日比賽，旅行社派車接送、不派導遊，午晚餐自理。
- Day 4：國立民俗博物館／7080 懷舊街、通仁市場、恩平韓屋村、北漢山景觀咖啡廳。
- Day 5：水原華城、Starfield 水原星空圖書館、富平地下商街、月尾島與海鷗船、機場。

原始檔未提供比賽會場名稱與地址、Day 2–3 賽程及集合時間、Day 4 景觀咖啡廳店名。實作中不推測這些資訊，統一顯示為待確認。

## 餐廳研究與選擇

- Day 2 午餐：保榮餃子（`보영만두`），以手工餃子、辣拌麵為主，適合比賽空檔快速用餐；當天依 Naver Map 選最近分店。
- Day 2 晚餐：佳甫亭（`가보정`），韓國觀光公社列為水原三大排骨店之一，主打生牛排骨與調味牛排骨。
- Day 3 午餐：柳池會館（`유치회관`），水原在地醒酒湯老店，湯飯類適合快速且有飽足感的午餐。
- Day 3 晚餐：真味炸雞（`진미통닭`），位於水原炸雞街，適合比賽後多人分享。

推薦會因比賽會場尚未公布而先以飯店／水原市區為基準。店家營業時間與公休日可能異動，出發前應再以 Naver Map 確認。

## Naver Map 可行性結論

- 可整合。Naver Maps JavaScript API v3 支援手機與桌面瀏覽器，可在 GitHub Pages 的 HTTPS 靜態網站使用。
- 需要在 Naver Cloud Platform 建立 Maps Application、啟用 Dynamic Map，並將 GitHub Pages 網址加入允許的 Web Service URL。
- 目前載入參數是 `ncpKeyId`，不是舊版的 `ncpClientId`。
- Client ID 為瀏覽器端識別值，會公開在頁面中；必須用允許來源網域限制濫用。
- 無 Client ID 或 API 載入失敗時，網站會顯示站點順序圖；每一個 Naver Map 搜尋位置都同時提供 Google Maps 備援連結。

參考：[Naver Maps API Getting Started](https://navermaps.github.io/maps.js.en/docs/tutorial-2-Getting-Started.html)、[取得 Client ID](https://navermaps.github.io/maps.js.en/docs/tutorial-1-Getting-Client-ID.html)、[Naver Map URL Scheme](https://guide.ncloud-docs.com/docs/en/maps-url-scheme)、[HOMES Stay Suwon 官方頁](https://homes.global/en/branches/suwon)、[韓國觀光公社：佳甫亭](https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=188614)、[韓國觀光公社：水原炸雞街](https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=351&vcontsId=176166)。

## 第二階段追加內容

- 比賽影片：地板 Level 6（04:46）、單槓 Level 6（01:54）、跳馬 Level 7（01:12），YouTube 內嵌與外連皆從指定秒數開始。
- 水原美食：佳甫亭、本水原排骨、柳池會館、真味炸雞、地洞市場血腸城、保榮餃子；互動地圖與無 API key 替代介面均提供 Naver Map／Google Maps 雙外連。
- 2026 購物清單：藥妝保養、彩妝美妝、服飾配件、零食伴手禮、生活與紀念品五類；各分類附來源並在瀏覽器保存勾選狀態。
- 美食研究優先採用韓國觀光公社、水原市官方旅遊資料與店家官方資訊；購物研究採近期 2026 指南、韓國觀光公社及 MUSINSA 官方資料。

## Kakao Map 遷移

- 互動地圖供應商已由 Naver Maps JavaScript API 改為 Kakao Maps JavaScript SDK。
- 每日地圖支援編號標記、站點順序虛線、縮放控制與自動縮放至當日所有地點。
- 水原美食地圖支援編號標記、點擊餐廳卡片定位，以及含推薦餐點與外部導航的資訊窗。
- `config.js` 使用瀏覽器端 `KAKAO_MAP_JAVASCRIPT_KEY`；必須在 Kakao Developers 登記 `http://localhost:4173` 與 GitHub Pages 網域。
- 未填 key、SDK 載入失敗或網域未授權時，仍顯示路線摘要及 Naver Map／Google Maps 雙外連。

參考：[Kakao Maps JavaScript API Guide](https://apis.map.kakao.com/web/guide/)、[Kakao Maps JavaScript API Documentation](https://apis.map.kakao.com/web/documentation/)、[Kakao Platform Key 設定](https://developers.kakao.com/docs/en/app-setting/app#platform-key)。
