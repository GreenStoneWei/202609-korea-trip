import { competitionVideos, culinaryRestaurants, days, feiboSaves, googleSearch, hongdaeSaves, jinzhenguSaves, laotaoSaves, naverSearch, recommendations, seoulAreas, sharedFoodFinds, shoppingCategories, suwonFood, threadsResearch, travelPrep, tripMeta } from "./data.js";
import { initializeSoloAccess } from "./solo.js";

const app = document.querySelector("#app");
let activeDay = Number(sessionStorage.getItem("activeDay")) || 1;
const featureIds = ["trip", "guide", "food", "prep", "competition"];
let activeFeature = featureIds.includes(sessionStorage.getItem("activeFeature")) ? sessionStorage.getItem("activeFeature") : "trip";
const featureMapsStarted = new Set();
const featureMapInstances = { guide: [], food: [] };
let mapInstance = null;
let markers = [];

const icons = {
  flight: "✈", place: "⌖", food: "●", activity: "◇", hotel: "⌂", transport: "→", recommendation: "★",
};

function mapLink(query) {
  return query ? naverSearch(query) : "#";
}

function googleMapLink(query) {
  return query ? googleSearch(query) : "#";
}

function mapProviderLinks(query, labelPrefix = "在") {
  return `<a class="map-link provider-naver" href="${mapLink(query)}" target="_blank" rel="noreferrer">${labelPrefix} Naver Map 查看 <span>↗</span></a><a class="map-link provider-google" href="${googleMapLink(query)}" target="_blank" rel="noreferrer">${labelPrefix} Google Maps 查看 <span>↗</span></a>`;
}

function renderShell() {
  app.innerHTML = `
    <header class="hero">
      <div class="hero__topline"><span>2026 · KOREA</span><span>5 DAYS</span></div>
      <div class="hero__content">
        <p class="eyebrow">OUR TRAVEL NOTE</p>
        <h1>${tripMeta.title}</h1>
        <p>${tripMeta.subtitle}</p>
        <div class="hero__stamp"><strong>SEP</strong><span>11—15</span></div>
      </div>
      <div class="hero__facts">
        <span>${tripMeta.dates}</span><span>${tripMeta.hotel}</span>
      </div>
    </header>
    <nav class="app-nav" aria-label="切換主要功能" role="tablist">
      <button type="button" role="tab" data-feature="trip"><span>01</span>團體行程</button>
      <button type="button" role="tab" data-feature="guide"><span>02</span>首爾逛街</button>
      <button type="button" role="tab" data-feature="food"><span>03</span>美食收藏</button>
      <button type="button" role="tab" data-feature="prep"><span>04</span>購物準備</button>
      <button type="button" role="tab" data-feature="competition"><span>05</span>比賽影片</button>
    </nav>
    <section class="feature-view trip-view" data-feature-view="trip" role="tabpanel">
      <nav class="day-tabs" aria-label="切換行程日期"><div class="day-tabs__track">
        ${days.map(day => `<button class="day-tab" data-day="${day.id}" aria-selected="false"><small>DAY ${day.id}</small><strong>${day.date}</strong><span>週${day.weekday}</span></button>`).join("")}
      </div></nav>
      <main id="day-content"></main>
    </section>
    <div id="extras" class="extras"></div>
    <div id="solo-access-root"></div>
    <footer><span>韓國五日 · 旅行手帖</span><span>資料整理自旅行社 PDF、官方旅遊資訊與旅伴心得 · 更新 2026.09.02</span></footer>`;

  renderExtras();
  document.querySelectorAll(".day-tab").forEach(button => button.addEventListener("click", () => selectDay(Number(button.dataset.day))));
  document.querySelectorAll("[data-feature]").forEach(button => button.addEventListener("click", () => selectFeature(button.dataset.feature)));
  selectFeature(activeFeature, false);
  selectDay(activeDay, false);
  initializeSoloAccess(document.querySelector("#solo-access-root"));
}

function extrasHeading(kicker, title, note) {
  return `<div class="extras-heading"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div><p>${note}</p></div>`;
}

const featureSections = {
  guide: ["seoul-guide", "threads-research"],
  food: ["culinary-restaurants", "shared-food", "hongdae-saves", "feibo-saves", "laotao-saves", "jinzhengu-saves", "suwon-food"],
  prep: ["travel-prep", "shopping-list"],
  competition: ["competition-videos"],
};

function organizeFeatureViews() {
  const extras = document.querySelector("#extras");
  Object.entries(featureSections).forEach(([feature, ids]) => {
    const panel = document.createElement("section");
    panel.className = `feature-view ${feature}-view`;
    panel.dataset.featureView = feature;
    panel.setAttribute("role", "tabpanel");
    ids.forEach(id => {
      const section = document.getElementById(id);
      if (section) panel.appendChild(section);
    });
    extras.appendChild(panel);
  });
}

function initializeFeatureMaps(feature) {
  if (!featureMapsStarted.has(feature)) {
    featureMapsStarted.add(feature);
    if (feature === "guide") initializeSeoulAreaMap();
    if (feature === "food") {
      initializeCulinaryMap();
      initializeSharedFoodMap();
      initializeFoodMap();
    }
    return;
  }
  window.setTimeout(() => featureMapInstances[feature]?.forEach(map => map.relayout?.()), 0);
}

function selectFeature(feature, scroll = true) {
  if (!featureIds.includes(feature)) feature = "trip";
  activeFeature = feature;
  sessionStorage.setItem("activeFeature", feature);
  document.querySelectorAll("[data-feature]").forEach(button => {
    const selected = button.dataset.feature === feature;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  document.querySelectorAll("[data-feature-view]").forEach(panel => {
    const selected = panel.dataset.featureView === feature;
    panel.hidden = !selected;
    panel.classList.toggle("is-active", selected);
  });
  if (feature === "trip") renderDay(days.find(day => day.id === activeDay));
  else initializeFeatureMaps(feature);
  if (scroll) document.querySelector(".app-nav")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function sharedFoodCard(place, index) {
  const collectionTags = [...new Set([
    ...(place.collectionTag || "").split(/\s+/).filter(Boolean),
    ...(place.area.startsWith("望遠") ? ["#農夫冠冠"] : []),
  ])];
  return `<article class="shared-food-card" data-shared-food-index="${index}">
    <div class="shared-food-card__meta"><span>${place.area}</span><em>${place.type}</em><b>${String(index + 1).padStart(2, "0")}</b></div>
    <h3>${place.name}<small>${place.korean}</small></h3>${collectionTags.map(tag => `<span class="collection-tag">${tag}</span>`).join("")}
    <div class="dish-list">${place.dishes.map(dish => `<span>${dish}</span>`).join("")}</div>
    <p>${place.note}</p>
    <div class="solo-status solo-${place.soloLevel}">${place.solo}</div>
    <div class="restaurant-actions"><a href="${place.naverUrl || mapLink(place.query)}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a>${place.sourceUrl ? `<a href="${place.sourceUrl}" target="_blank" rel="noreferrer">參考資料 ↗</a>` : ""}</div>
  </article>`;
}

function sharedFoodCollection() {
  const groups = [
    { title: "明洞", test: place => place.area.startsWith("明洞") },
    { title: "新村・安國・益善洞・鐘路", test: place => ["新村", "安國", "益善洞", "鐘路", "鐘路三街"].includes(place.area) },
    { title: "西村・景福宮", test: place => place.area === "西村／景福宮" },
    { title: "合井・弘大・延南", test: place => ["合井", "合井／弘大", "延南洞", "弘大／延南"].includes(place.area) },
    { title: "恩平・西大門", test: place => ["恩平", "弘濟／西大門", "北加佐／西大門", "延禧／西大門"].includes(place.area) },
    { title: "藥水・乙支路・東大門・南大門", test: place => ["藥水", "乙支路三街", "乙支路／鐘路", "東大門 DDP", "南大門"].includes(place.area) },
    { title: "漢南・新沙", test: place => ["漢南", "新沙"].includes(place.area) },
    { title: "聖水・瑞草・江南", test: place => ["聖水", "瑞草", "江南"].includes(place.area) },
    { title: "三角地・龍山", test: place => place.area === "三角地／龍山" },
    { title: "狎鷗亭羅德奧", test: place => place.area === "狎鷗亭羅德奧" },
    { title: "韓式炸雞・文來洞", test: place => ["首爾各區", "文來洞"].includes(place.area) },
    { title: "望遠市場", test: place => place.area.startsWith("望遠") },
  ];
  return groups.map((group, groupIndex) => {
    const places = sharedFoodFinds.filter(group.test);
    return `<details class="shared-food-group" ${groupIndex === 0 || group.title === "望遠市場" ? "open" : ""}>
      <summary><span>${group.title}${group.title === "望遠市場" ? " · #農夫冠冠" : ""}</span><b>${places.length} 間／攤</b></summary>
      <div class="shared-food-grid">${places.map(place => sharedFoodCard(place, sharedFoodFinds.indexOf(place))).join("")}</div>
    </details>`;
  }).join("");
}

function renderExtras() {
  const extras = document.querySelector("#extras");
  extras.innerHTML = `
    <section class="extra-section seoul-guide" id="seoul-guide">
      ${extrasHeading("SEOUL NEIGHBORHOOD GUIDE", "首爾區域指南", "8 個逛街區域 · 旅伴實訪心得＋行程判讀")}
      <div class="friend-context"><span>旅伴觀察</span><p>這些評價反映一次實際旅行的逛街感受，不是店家數量的客觀排名。店舖更替很快，出發前請再用 Naver Map 確認目的店。</p></div>
      <div id="seoul-area-map" class="map-canvas seoul-area-map"><div class="map-loading">首爾區域地圖載入中…</div></div>
      <div class="area-legend"><span><i class="legend-west"></i>西側／機場線方便</span><span><i class="legend-center"></i>市中心</span><span><i class="legend-east"></i>東側／品牌街區</span></div>
      <div class="seoul-area-grid">${seoulAreas.map((area, index) => `
        <article class="area-card" data-area-index="${index}">
          <div class="area-card__top"><b>${String(index + 1).padStart(2, "0")}</b><div><span>${area.tag}</span><em>${area.stay}</em></div></div>
          <h3>${area.name}<small>${area.korean}</small></h3>
          <p class="area-character">${area.character}</p>
          <blockquote><strong>朋友怎麼說</strong>${area.friendNote}</blockquote>
          <p class="area-planning"><strong>怎麼排</strong>${area.planning}</p>
          <div class="restaurant-actions"><a href="${mapLink(area.query)}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(area.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a></div>
        </article>`).join("")}</div>
      <p class="research-note">地圖標記為街區中心，方便理解相對位置，不代表單一店家入口。漢江以南的漢南、狎鷗亭、新沙，及東側的聖水、蠶室，跨區移動前請先看尖峰車程。</p>
    </section>
    <section class="extra-section culinary-guide" id="culinary-restaurants">
      ${extrasHeading("CULINARY CLASS WARS", "黑白大廚首爾餐廳", `第一、二季與朋友加碼共 ${culinaryRestaurants.length} 間 · 依路線與獨旅可行性整理`)}
      <div class="culinary-alert"><b>先訂位，再排行程</b><p>多數熱門店透過 CATCHTABLE Global 開放座位，放位規則、訂金與最低人數各店不同。第二季冠軍崔康祿原經營的 Neo 已於 2025 年初歇業，請勿照舊清單前往。</p></div>
      <div id="culinary-map" class="map-canvas culinary-map"><div class="map-loading">黑白大廚餐廳地圖載入中…</div></div>
      <div class="culinary-filters" role="tablist" aria-label="篩選黑白大廚餐廳">
        <button class="culinary-filter is-active" type="button" data-culinary-filter="all" aria-selected="true">全部</button>
        <button class="culinary-filter" type="button" data-culinary-filter="第一季" aria-selected="false">第一季</button>
        <button class="culinary-filter" type="button" data-culinary-filter="第二季" aria-selected="false">第二季</button>
        <button class="culinary-filter" type="button" data-culinary-filter="朋友加碼" aria-selected="false">朋友加碼</button>
        <button class="culinary-filter" type="button" data-culinary-filter="single" aria-selected="false">單點較友善</button>
      </div>
      <div class="culinary-grid">${culinaryRestaurants.map((place, index) => `
        <article class="culinary-card" data-culinary-index="${index}" data-season="${place.season}" data-single="${place.price.includes("單點") || place.price.includes("早餐") || place.price.includes("Casual")}">
          <div class="culinary-card__meta"><span>${place.season}</span><em>${place.price}</em><b>${place.area}</b></div>
          <h3>${place.name}<small>${place.korean}</small></h3>
          <p class="culinary-chef">${place.chef}<span>${place.role}</span></p>
          <div class="culinary-signature"><small>推薦體驗</small>${place.signature}</div>
          <p>${place.why}</p>
          <dl><div><dt>怎麼順路排</dt><dd>${place.route}</dd></div><div><dt>一人用餐</dt><dd>${place.solo}</dd></div></dl>
          <div class="culinary-actions">${place.booking ? `<a href="${place.booking}" target="_blank" rel="noreferrer">Catchtable 訂位 ↗</a>` : ""}<a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a><a href="${place.source}" target="_blank" rel="noreferrer">參考來源 ↗</a>${place.officialSource ? `<a href="${place.officialSource}" target="_blank" rel="noreferrer">官方資料 ↗</a>` : ""}</div>
        </article>`).join("")}</div>
      <aside class="culinary-picks"><strong>依這趟路線，我會先看</strong><span>弘大日：Osteria Sam Kim</span><span>市中心：Congdu Myeongdong</span><span>乙支路晚間：Deepin</span><span>獨食麵食：麵首爾</span><span>正式紀念餐：Yun Seoul／Soul</span><span>南大門：卡梅谷辣味包子</span><span>明洞：明洞餃子本店</span><span>廣藏市場：麻藥飯卷＋綠豆煎餅</span></aside>
      <p class="research-note">節目主廚與餐廳關聯參考韓國觀光公社、首爾市政府與 CATCHTABLE；菜單、價位、主廚是否當日在店及營業狀態均可能變動，請以預約頁當日資訊為準。</p>
    </section>
    <section class="extra-section shared-food-guide" id="shared-food">
      ${extrasHeading("SEOUL FOOD SAVES", "團體共享・首爾美食收藏", `${sharedFoodFinds.length} 間餐廳、咖啡、麵包店與市場攤位 · 旅遊影片、朋友與社群推薦`)}
      <div class="shared-food-alert"><b>美食公開，私人動線仍保密</b><p>這裡只共享店名、推薦品項、獨食難度與地圖連結，不包含 9/16–9/19 的私人日期、住宿或行程順序。</p></div>
      <div id="shared-food-map" class="map-canvas shared-food-map"><div class="map-loading">正在定位全部美食收藏…</div></div>
      <div class="shared-food-map-status" id="shared-food-map-status" aria-live="polite"><span>地圖載入中</span><small>首次開啟會搜尋 Kakao Places；定位結果會快取在這支手機。</small></div>
      <div class="solo-key"><span class="solo-good">◎ 獨食／一人進店友善</span><span class="solo-maybe">△ 先確認份數或份量</span><span class="solo-snack">— 麵包／咖啡，非正餐</span></div>
      ${sharedFoodCollection()}
      <p class="research-note">影片中的寄物所、醫美、香氛與選物店不屬於美食，因此沒有混入本清單。望遠市場攤號與店家營業狀態可能變動，請出發前用韓文店名在 Naver Map 再確認。市場介紹參考 <a href="https://english.visitseoul.net/MapoArea/Mangwon-Market/ENP037950" target="_blank" rel="noreferrer">Visit Seoul</a>。</p>
    </section>
    <section class="extra-section hongdae-guide" id="hongdae-saves">
      ${extrasHeading("HONGDAE & YEONNAM SAVES", "弘大・延南公開收藏", `${hongdaeSaves.length} 個吃喝、逛街與體驗地點 · #陪沈團`)}
      <div class="hongdae-alert"><span>#陪沈團</span><p>這一批由同一組推薦整理，全部公開給隊友查看。三個只有描述、沒有正式店名的地點以「待核對」標示，請直接保留原始 Naver 連結導航。</p></div>
      <div class="hongdae-grid">${hongdaeSaves.map((place, index) => `
        <article class="hongdae-card">
          <div class="hongdae-card__meta"><span>${place.category}</span><b>#陪沈團</b><em>${String(index + 1).padStart(2, "0")}</em></div>
          <h3>${place.name}<small>${place.korean}</small></h3>
          <p>${place.note}</p>
          ${place.pending ? '<div class="hongdae-pending">! 店名／位置待核對</div>' : ""}
          <div class="restaurant-actions"><a href="${place.naverUrl}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a></div>
        </article>`).join("")}</div>
      <p class="research-note">Naver 短連結已確認可導向店家頁；因 Naver 限制自動擷取，未從頁面顯示的正式店名不自行猜測。營業時間、低消、候位及分店狀態請以當日店家頁為準。</p>
    </section>
    <section class="extra-section feibo-guide" id="feibo-saves">
      ${extrasHeading("YOUTUBE FOOD SAVES", "肥波首爾二刷收藏", `${feiboSaves.length} 間影片推薦 · #肥波`)}
      <div class="feibo-alert"><span>#肥波</span><p>二刷指數與價格照影片提供資訊整理；不是本網站評分，菜單與價格可能調整。時間碼保留作為回看影片的索引。</p></div>
      <div class="feibo-grid">${feiboSaves.map((place, index) => `
        <article class="feibo-card">
          <div class="feibo-card__top"><span>${place.area}</span><b>#肥波</b><em>${String(index + 1).padStart(2, "0")}</em></div>
          <h3>${place.name}<small>${place.korean}</small></h3>
          <div class="feibo-score"><span><small>影片時間碼</small>${place.timecode}</span><span><small>很想二刷指數</small>${place.rating}</span></div>
          <div class="dish-list">${place.menu.map(item => `<span>${item}</span>`).join("")}</div>
          <div class="restaurant-actions"><a href="${place.naverUrl}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a></div>
        </article>`).join("")}</div>
      <p class="research-note">獨食難度與候位提醒已同步整理到上方「首爾美食收藏」。風川鰻魚與既有推薦為同一家，因此美食總表合併顯示 <code>#陪沈團 #肥波</code>，不重複建立店家卡。</p>
    </section>
    <section class="extra-section source-saves-guide" id="laotao-saves">
      ${extrasHeading("LOCAL FOOD & STAY SAVES", "老饕首爾收藏", `${laotaoSaves.length} 個美食、住宿與體驗地點 · #老饕`)}
      <div class="source-saves-alert"><span>#老饕</span><p>地址與營業時間依推薦者提供資料整理；有推定店名、分店未定或來源衝突的項目已標示「待核對」。重複餐廳只會在上方美食總表出現一次。</p></div>
      <div class="source-saves-grid">${laotaoSaves.map((place, index) => `
        <article class="source-save-card">
          <div class="source-save-card__meta"><span>${place.station}</span><b>#老饕</b><em>${String(index + 1).padStart(2, "0")}</em></div>
          <h3>${place.name}<small>${place.korean}</small></h3>
          <div class="source-save-facts"><span>${place.category}</span>${place.recommended ? "<strong>✨ 推薦</strong>" : ""}${place.pending ? "<strong>! 待核對</strong>" : ""}</div>
          <p>${place.note}</p><dl><div><dt>地址</dt><dd>${place.address}</dd></div><div><dt>提供時間</dt><dd>${place.hours}</dd></div></dl>
          <div class="restaurant-actions"><a href="${place.naverUrl || mapLink(place.query)}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a>${place.sourceUrl ? `<a href="${place.sourceUrl}" target="_blank" rel="noreferrer">官方／參考 ↗</a>` : ""}${place.extraUrl ? `<a href="${place.extraUrl}" target="_blank" rel="noreferrer">HafH ↗</a>` : ""}</div>
        </article>`).join("")}</div>
      <p class="research-note">Rabbit Hole Burger 的近期營業資訊互相衝突；「最好吃豬腳」店名依地址推定，橋村炸雞尚未指定分店。這三項出發前務必以 Naver Map 當日頁面為準。</p>
    </section>
    <section class="extra-section source-saves-guide jinzhengu-guide" id="jinzhengu-saves">
      ${extrasHeading("SUMMER FOOD & BEAUTY SAVES", "金針菇韓國收藏", `${jinzhenguSaves.food.length} 間夏日美食＋${jinzhenguSaves.beauty.length} 項藥妝 · #金針菇`)}
      <div class="source-saves-alert"><span>#金針菇</span><p>時間碼是回看影片的索引。美食已同步進上方公開美食總表；藥妝名稱依提供文字整理，拼寫或完整品名不確定者標為「待核對」。</p></div>
      <h3 class="source-saves-subtitle">夏日美食</h3>
      <div class="source-saves-grid">${jinzhenguSaves.food.map((place, index) => `
        <article class="source-save-card">
          <div class="source-save-card__meta"><span>${place.area}</span><b>#金針菇</b><em>${String(index + 1).padStart(2, "0")}</em></div>
          <h3>${place.name}<small>${place.korean}</small></h3>
          <div class="source-save-facts"><strong>${place.timecode}</strong><span>${place.detail}</span></div>
          <p>${place.address}</p>
          <div class="restaurant-actions"><a href="${place.naverUrl}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a></div>
        </article>`).join("")}</div>
      <h3 class="source-saves-subtitle">藥妝・彩妝・飲品</h3>
      <div class="beauty-save-grid">${jinzhenguSaves.beauty.map((item, index) => `
        <article class="beauty-save-card">
          <div><span>${item.category}</span><b>${item.timecode}</b><em>${String(index + 1).padStart(2, "0")}</em></div>
          <h3>${item.name}</h3><p>${item.note}</p>${item.pending ? '<strong class="source-save-pending">! 品名待核對</strong>' : ""}
        </article>`).join("")}</div>
      <p class="research-note">CANMAKE 為日本品牌，因此只列作影片推薦，不標示為韓國限定。保養與彩妝請依膚質試用；產品版本、色號與庫存以現場為準。</p>
    </section>
    <section class="extra-section threads-guide" id="threads-research">
      ${extrasHeading("THREADS COMMUNITY NOTES", "Threads 網友旅行情報", "高互動貼文與留言整理 · 景點、美食、購物、藥妝與伴手禮")}
      <div class="threads-alert"><b>社群情報不是即時店家資料</b><p>以下是網友主觀經驗，可能含個人口味、業配或過時資訊。網站已加入動線判讀，但店名、營業時間、價格與是否仍營業，請在出發當天用 Naver Map 確認；藥品內容不構成醫療建議。</p></div>
      <div class="threads-principles"><strong>先記住兩件事</strong><span>一天專注一個區域，減少跨城通勤</span><span>零食購買前翻背面確認原產地</span></div>
      <div class="threads-grid">${threadsResearch.map((group, groupIndex) => `
        <details class="threads-card" ${groupIndex < 2 ? "open" : ""}>
          <summary><span class="threads-icon">${group.icon}</span><span><small>${group.subtitle}</small><strong>${group.title}</strong></span><b>${group.items.length}</b></summary>
          <div class="threads-card__body">${group.items.map(item => `
            <article><h3>${item.name}</h3><p>${item.detail}</p><div>${mapProviderLinks(item.query)} </div></article>`).join("")}
            <a class="threads-source" href="${group.source}" target="_blank" rel="noreferrer">查看 Threads 主要來源 ↗</a>
          </div>
        </details>`).join("")}</div>
      <p class="research-note">研究門檻為貼文本文至少 100 讚或 25 則留言；留言僅整理載入範圍內的較高讚內容。完整擷取方法、更多店名與限制見專案內的 <code>docs/threads-research.md</code>。</p>
    </section>
    <section class="extra-section travel-prep" id="travel-prep">
      ${extrasHeading("BEFORE YOU FLY", "行前與入境準備", "從 eSIM、入境申報到付款、交通卡與退稅")}
      <div class="prep-alert"><b>支付方式修正</b><p>一般台灣旅客請以「信用卡＋實體 T-money＋少量韓元」為主。Apple 官方目前註明：從 Apple Wallet 購買或加值 T-money，需要韓國發行的信用卡或金融卡。</p></div>
      <div class="prep-grid">${travelPrep.map(item => `
        <details class="prep-card" id="prep-${item.id}" ${["esim", "payment", "tmoney"].includes(item.id) ? "open" : ""}>
          <summary><span class="prep-step">${item.step}</span><span class="prep-summary"><small>${item.timing}</small><strong>${item.title}</strong></span><em>${item.priority}</em></summary>
          <div class="prep-card__body"><p>${item.summary}</p><ul>${item.checklist.map(check => `<li>${check}</li>`).join("")}</ul>${item.source ? `<a class="source-link" href="${item.source}" target="_blank" rel="noreferrer">${item.sourceLabel} ↗</a>` : ""}</div>
        </details>`).join("")}</div>
      <aside class="prep-downloads"><strong>手機先下載</strong><span>Naver Map</span><span>Papago</span><span>仁川機場 SmartPass</span><span>航空公司 App</span><span>保險電子保單</span></aside>
      <div class="official-links"><a href="https://www.e-arrivalcard.go.kr/portal/main/index.do?locale=E" target="_blank" rel="noreferrer"><small>入境</small>官方 e-Arrival Card ↗</a><a href="https://airinfo.airport.kr/ap_en/1415/subview.do" target="_blank" rel="noreferrer"><small>離境</small>仁川 SmartPass ↗</a><a href="https://support.apple.com/en-us/105079" target="_blank" rel="noreferrer"><small>交通卡</small>Apple T-money 限制 ↗</a><a href="https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=929&vcontsId=248765" target="_blank" rel="noreferrer"><small>購物</small>韓國退稅指南 ↗</a></div>
      <p class="research-note">依 2026-08-09 官方資訊整理；入境資格、App 支援、機場櫃檯與退稅規則可能變動，請在出發前一週再次確認。</p>
    </section>
    <section class="extra-section videos-section" id="competition-videos">
      ${extrasHeading("COMPETITION REFERENCES", "比賽影片", "已設定從指定動作時間開始播放")}
      <div class="video-grid">${competitionVideos.map(video => `
        <article class="video-card accent-${video.accent}">
          <div class="video-frame"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${video.videoId}?start=${video.start}&rel=0" title="${video.apparatus} ${video.level} 比賽影片，從 ${video.startLabel} 開始" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
          <div class="video-card__body"><div><span>${video.level}</span><h3>${video.apparatus}</h3></div><a href="https://www.youtube.com/watch?v=${video.videoId}&t=${video.start}s" target="_blank" rel="noreferrer">從 ${video.startLabel} 開始 ↗</a></div>
        </article>`).join("")}</div>
    </section>
    <section class="extra-section food-guide" id="suwon-food">
      ${extrasHeading("SUWON FOOD MAP", "水原美食地圖", "6 個經典選擇 · 出發前再確認營業時間")}
      <div id="food-map" class="map-canvas food-map"><div class="map-loading">美食地圖載入中…</div></div>
      <div class="food-guide__grid">${suwonFood.map((place, index) => `
        <article class="restaurant-card" data-food-index="${index}">
          <div class="restaurant-card__number">${String(index + 1).padStart(2, "0")}</div>
          <div class="restaurant-card__top"><span>${place.category}</span><span>${place.price}</span></div>
          <h3>${place.name}<small>${place.korean}</small></h3><p>${place.intro}</p>
          <div class="dish-list">${place.dishes.map(dish => `<span>${dish}</span>`).join("")}</div>
          <div class="restaurant-tip"><b>推薦要點</b>${place.tip}</div>
          <div class="restaurant-actions"><a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a><a href="${place.source}" target="_blank" rel="noreferrer">參考來源 ↗</a></div>
        </article>`).join("")}</div>
      <p class="research-note">餐廳座標供行前規劃；實際入口、分店與營業狀態請以 Naver Map 當日資訊為準。</p>
    </section>
    <section class="extra-section shopping-guide" id="shopping-list">
      ${extrasHeading("2026 SHOPPING EDIT", "韓國購物清單", "點選品項可打勾，進度會保存在這支手機")}
      <div class="shopping-tabs" role="tablist">${shoppingCategories.map((category, index) => `<button role="tab" aria-selected="${index === 0}" class="shopping-tab ${index === 0 ? "is-active" : ""}" data-category="${category.id}"><span>${category.icon}</span>${category.name}</button>`).join("")}</div>
      <div id="shopping-panels">${shoppingCategories.map((category, index) => shoppingPanel(category, index === 0)).join("")}</div>
      <aside class="shopping-tips"><strong>購物前記得</strong><span>帶護照辦理即時退稅</span><span>保養活性成分先局部測試</span><span>確認有效期限與台灣入境限制</span><span>服飾先試穿並詢問退換規則</span></aside>
      <p class="research-note">清單依 2026 年近期旅遊與零售資料整理，庫存、促銷及熱門排行會變動；以店內當日標示為準。</p>
    </section>`;

  document.querySelectorAll(".shopping-tab").forEach(tab => tab.addEventListener("click", () => selectShoppingCategory(tab.dataset.category)));
  document.querySelectorAll(".culinary-filter").forEach(button => button.addEventListener("click", () => selectCulinaryFilter(button.dataset.culinaryFilter)));
  document.querySelectorAll(".shopping-check input").forEach(input => {
    input.checked = localStorage.getItem(`shopping:${input.value}`) === "1";
    input.addEventListener("change", () => localStorage.setItem(`shopping:${input.value}`, input.checked ? "1" : "0"));
  });
  organizeFeatureViews();
}

function selectCulinaryFilter(filter) {
  document.querySelectorAll(".culinary-filter").forEach(button => {
    const active = button.dataset.culinaryFilter === filter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".culinary-card").forEach(card => {
    const visible = filter === "all" || card.dataset.season.includes(filter) || (filter === "single" && card.dataset.single === "true");
    card.hidden = !visible;
  });
}

function shoppingPanel(category, active) {
  return `<div class="shopping-panel ${active ? "is-active" : ""}" data-panel="${category.id}" ${active ? "" : "hidden"}>
    <div class="shopping-panel__header"><div><strong>${category.name}</strong><span>${category.note}</span></div><a href="${category.source}" target="_blank" rel="noreferrer">分類參考來源 ↗</a></div>
    <div class="shopping-items">${category.items.map((item, index) => `<div class="shopping-check ${item.image ? "has-image" : ""}">${item.image ? `<a class="shopping-image" href="${item.image}" target="_blank" rel="noreferrer" aria-label="放大查看 ${item.name}"><img src="${item.image}" alt="${item.name} 商品參考圖" loading="lazy" decoding="async"></a>` : ""}<label class="shopping-check__label"><input type="checkbox" value="${category.id}:${index}"><span class="checkmark">✓</span><span class="shopping-check__copy"><b>${item.name}</b><small>${item.detail}</small></span><em>${item.priority}</em></label></div>`).join("")}</div>
  </div>`;
}

function selectShoppingCategory(id) {
  document.querySelectorAll(".shopping-tab").forEach(tab => { const active = tab.dataset.category === id; tab.classList.toggle("is-active", active); tab.setAttribute("aria-selected", String(active)); });
  document.querySelectorAll(".shopping-panel").forEach(panel => { const active = panel.dataset.panel === id; panel.classList.toggle("is-active", active); panel.hidden = !active; });
}

function selectDay(id, scroll = true) {
  activeDay = id;
  sessionStorage.setItem("activeDay", String(id));
  document.querySelectorAll(".day-tab").forEach(button => {
    const selected = Number(button.dataset.day) === id;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
    if (selected) button.scrollIntoView({ behavior: scroll ? "smooth" : "auto", inline: "center", block: "nearest" });
  });
  renderDay(days.find(day => day.id === id));
  if (scroll && window.scrollY > 360) document.querySelector(".day-tabs").scrollIntoView({ behavior: "smooth" });
}

function eventCard(event, index, isLast) {
  const recommendation = event.recommendationId ? recommendations[event.recommendationId] : null;
  const query = event.mapQuery || recommendation?.query;
  return `<article class="timeline-item ${isLast ? "is-last" : ""}">
    <div class="timeline-item__rail"><span class="event-icon type-${event.type}">${icons[event.type]}</span></div>
    <div class="timeline-item__body">
      <div class="time-row"><time>${event.time}</time>${event.status ? `<span class="status confirmed">${event.status}</span>` : event.confirmed ? '<span class="status confirmed">航班確認</span>' : ""}${event.estimate ? '<span class="status estimate">暫估</span>' : ""}</div>
      <h3>${event.title}</h3><p>${event.subtitle}</p>
      ${event.meta ? `<div class="event-note">${event.meta}</div>` : ""}
      ${recommendation ? recommendationCard(recommendation) : ""}
      ${query ? `<div class="map-links">${mapProviderLinks(query)}</div>` : ""}
    </div>
  </article>`;
}

function recommendationCard(item) {
  return `<div class="food-card">
    <div class="food-card__top"><span>${item.tag}</span><a href="${item.source}" target="_blank" rel="noreferrer">資料來源 ↗</a></div>
    <strong>${item.name}</strong><em>${item.dish}</em><p>${item.why}</p>
    ${item.address ? `<small>${item.address}</small>` : ""}
  </div>`;
}

function renderDay(day) {
  const content = document.querySelector("#day-content");
  content.innerHTML = `
    <section class="day-intro">
      <div><p class="eyebrow">DAY ${String(day.id).padStart(2, "0")} · ${day.area}</p><h2>${day.title}</h2></div>
      <div class="day-number">${day.id}</div>
      <div class="chips">${day.summary.map(item => `<span>${item}</span>`).join("")}</div>
    </section>
    <section class="map-section" aria-labelledby="map-title">
      <div class="section-heading"><div><p class="eyebrow">TODAY'S ROUTE</p><h2 id="map-title">今日路線</h2></div><span>${day.places.filter(p => p.lat).length} 個地點</span></div>
      <div id="map" class="map-canvas"><div class="map-loading">地圖載入中…</div></div>
      <div class="transport-summary"><span>→</span><div><strong>今日交通</strong><p>${day.transport}</p></div></div>
      <div class="place-strip">${day.places.map((place, index) => `<div class="place-pill ${!place.query ? "is-pending" : ""}"><b>${index + 1}</b><span>${place.name}<small>${place.note || (place.query ? "選擇地圖開啟" : "位置待確認")}</small>${place.query ? `<span class="place-pill__links"><a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google ↗</a>${place.officialUrl ? `<a href="${place.officialUrl}" target="_blank" rel="noreferrer">場館官網 ↗</a>` : ""}</span>` : ""}</span></div>`).join("")}</div>
      <p class="map-disclaimer">虛線僅表示拜訪順序，不代表實際道路導航。</p>
    </section>
    <section class="schedule" aria-labelledby="schedule-title">
      <div class="section-heading"><div><p class="eyebrow">ITINERARY</p><h2 id="schedule-title">行程時間軸</h2></div><span>${day.events.length} 個安排</span></div>
      <div class="timeline">${day.events.map((event, index) => eventCard(event, index, index === day.events.length - 1)).join("")}</div>
    </section>
    <aside class="notice"><span>!</span><div><strong>行程資料提醒</strong><p>${day.id <= 3 ? "場館與賽程已依比賽通知更新；專車集合、檢錄及臨時異動仍以主辦單位與旅行社最新通知為準。" : "交通時間僅為規劃參考，未公布的集合與店家資訊不自行猜測，請以導遊與當日路況為準。"}</p></div></aside>`;
  if (activeFeature === "trip") initializeMap(day);
}

function loadKakaoMaps(appKey) {
  if (window.kakao?.maps?.Map && window.kakao?.maps?.services?.Places) return Promise.resolve();
  if (!appKey) return Promise.reject(new Error("NO_APP_KEY"));
  if (window.__kakaoMapsPromise) return window.__kakaoMapsPromise;
  window.__kakaoMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services,clusterer`;
    script.onload = () => {
      if (!window.kakao?.maps?.load) {
        reject(new Error("LOAD_FAILED"));
        return;
      }
      window.kakao.maps.load(resolve);
    };
    script.onerror = () => reject(new Error("LOAD_FAILED"));
    document.head.appendChild(script);
  });
  return window.__kakaoMapsPromise;
}

function createNumberedMarker(map, position, number, className = "", onClick) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.className = `map-marker ${className}`.trim();
  marker.textContent = number;
  marker.setAttribute("aria-label", `地圖站點 ${number}`);
  if (onClick) marker.addEventListener("click", event => {
    event.stopPropagation();
    onClick(event);
  });
  const overlay = new window.kakao.maps.CustomOverlay({
    map, position, content: marker, xAnchor: 0.5, yAnchor: 0.5, zIndex: 2,
  });
  return overlay;
}

async function initializeMap(day) {
  const canvas = document.querySelector("#map");
  const located = day.places.filter(place => Number.isFinite(place.lat));
  try {
    await loadKakaoMaps(window.KAKAO_MAP_JAVASCRIPT_KEY);
    if (!document.body.contains(canvas) || activeDay !== day.id) return;
    const { maps } = window.kakao;
    mapInstance = new maps.Map(canvas, {
      center: new maps.LatLng(located[0].lat, located[0].lng), level: 8,
    });
    mapInstance.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
    markers = located.map((place, index) => createNumberedMarker(
      mapInstance,
      new maps.LatLng(place.lat, place.lng),
      index + 1,
    ));
    if (located.length > 1) {
      new maps.Polyline({
        map: mapInstance,
        path: located.map(place => new maps.LatLng(place.lat, place.lng)),
        strokeColor: "#ef674f", strokeWeight: 3, strokeOpacity: 0.8, strokeStyle: "shortdash",
      });
      const bounds = new maps.LatLngBounds();
      located.forEach(place => bounds.extend(new maps.LatLng(place.lat, place.lng)));
      mapInstance.setBounds(bounds, 40, 40, 40, 40);
    } else {
      mapInstance.setLevel(5);
    }
  } catch (error) {
    const fallbackQuery = located[0]?.query || day.area;
    canvas.innerHTML = `<div class="map-fallback"><div class="map-fallback__route">${located.map((p, i) => `<span><b>${i + 1}</b>${p.name}</span>`).join('<i>→</i>')}</div><strong>${error.message === "NO_APP_KEY" ? "Kakao Map 尚未設定" : "Kakao Map 暫時無法載入"}</strong><p>行程與導航連結仍可正常使用。請在 <code>config.js</code> 填入 JavaScript key，並於 Kakao Developers 登記目前網域。</p><div class="map-links map-links--center">${mapProviderLinks(fallbackQuery, "開啟")}</div></div>`;
  }
}

function kakaoPlaceSearch(places, query) {
  return new Promise(resolve => {
    const timeout = window.setTimeout(() => resolve({ result: null, status: "TIMEOUT" }), 2500);
    places.keywordSearch(query, (results, status) => {
      window.clearTimeout(timeout);
      if (status !== window.kakao.maps.services.Status.OK) {
        resolve({ result: null, status });
        return;
      }
      const inSeoul = results.find(result => {
        const lat = Number(result.y);
        const lng = Number(result.x);
        return lat >= 37.30 && lat <= 37.75 && lng >= 126.70 && lng <= 127.30;
      });
      resolve({ result: inSeoul || null, status });
    });
  });
}

const pause = milliseconds => new Promise(resolve => window.setTimeout(resolve, milliseconds));

function sharedFoodAreaFallback(area) {
  const fallbacks = [
    [/^明洞/, 37.5626, 126.9857], [/新村/, 37.5551, 126.9368], [/安國/, 37.5766, 126.9850], [/益善洞|鐘路/, 37.5728, 126.9910],
    [/西村|景福宮/, 37.5788, 126.9710], [/合井/, 37.5496, 126.9139], [/弘大|延南|延禧/, 37.5598, 126.9233], [/望遠/, 37.5561, 126.9055],
    [/恩平/, 37.6105, 126.9292], [/弘濟|北加佐|西大門/, 37.5820, 126.9368], [/藥水/, 37.5542, 127.0100], [/乙支路/, 37.5660, 126.9920],
    [/東大門/, 37.5650, 127.0070], [/南大門/, 37.5593, 126.9775], [/漢南/, 37.5345, 127.0000], [/新沙/, 37.5163, 127.0200],
    [/聖水/, 37.5445, 127.0557], [/瑞草/, 37.4919, 127.0077], [/江南/, 37.4979, 127.0276], [/三角地|龍山/, 37.5340, 126.9727],
    [/狎鷗亭/, 37.5273, 127.0385], [/文來洞/, 37.5170, 126.8950], [/首爾各區/, 37.5665, 126.9780],
  ];
  const match = fallbacks.find(([pattern]) => pattern.test(area));
  return match ? { lat: match[1], lng: match[2] } : { lat: 37.5665, lng: 126.9780 };
}

async function locateSharedFoodPlaces(maps, onProgress) {
  const cacheKey = "korea-trip:shared-food-locations:v1";
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(cacheKey) || "{}"); } catch {}
  const located = new Array(sharedFoodFinds.length);
  const places = new maps.services.Places();
  let cursor = 0;
  let completed = 0;
  while (cursor < sharedFoodFinds.length) {
    const index = cursor++;
    const place = sharedFoodFinds[index];
    const cached = cache[place.query];
    if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lng)) {
      located[index] = { ...place, ...cached, index };
    } else {
      let response = await kakaoPlaceSearch(places, place.query || place.korean);
      if (!response.result && response.status !== maps.services.Status.ZERO_RESULT) {
        await pause(300);
        response = await kakaoPlaceSearch(places, place.query || place.korean);
      }
      if (!response.result && place.korean && place.korean !== place.query) {
        await pause(120);
        response = await kakaoPlaceSearch(places, place.korean);
      }
      if (response.result) {
        const result = response.result;
        const point = { lat: Number(result.y), lng: Number(result.x), kakaoName: result.place_name, kakaoUrl: result.place_url };
        cache[place.query] = point;
        located[index] = { ...place, ...point, index };
      } else {
        located[index] = { ...place, ...sharedFoodAreaFallback(place.area), index, approximate: true };
      }
    }
    completed += 1;
    onProgress(completed);
    await pause(90);
  }
  try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch {}
  return located;
}

async function initializeSharedFoodMap() {
  const canvas = document.querySelector("#shared-food-map");
  const statusNode = document.querySelector("#shared-food-map-status");
  if (!canvas || !statusNode) return;
  try {
    await loadKakaoMaps(window.KAKAO_MAP_JAVASCRIPT_KEY);
    if (!document.body.contains(canvas)) return;
    const { maps } = window.kakao;
    const sharedMap = new maps.Map(canvas, {
      center: new maps.LatLng(37.555, 126.995), level: 9,
    });
    featureMapInstances.food.push(sharedMap);
    sharedMap.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
    const located = await locateSharedFoodPlaces(maps, completed => {
      const loading = canvas.querySelector(".map-loading");
      if (loading) loading.textContent = `正在定位美食收藏 ${completed}／${sharedFoodFinds.length}…`;
      statusNode.querySelector("span").textContent = `定位中 ${completed}／${sharedFoodFinds.length}`;
    });
    if (!document.body.contains(canvas)) return;
    const bounds = new maps.LatLngBounds();
    const markerCluster = new maps.MarkerClusterer({
      map: sharedMap, averageCenter: true, minLevel: 7, minClusterSize: 2,
      styles: [{ width: "38px", height: "38px", color: "#fff", background: "#d75b48", border: "3px solid #fff", borderRadius: "50%", boxShadow: "0 4px 14px rgba(0,0,0,.25)", textAlign: "center", lineHeight: "32px", fontSize: "11px", fontWeight: "700" }],
    });
    let activeInfo = null;
    const markers = located.map(place => {
      const position = new maps.LatLng(place.lat, place.lng);
      bounds.extend(position);
      const approximateImage = place.approximate ? new maps.MarkerImage(
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="38" viewBox="0 0 32 38"><path d="M16 1C8.3 1 2 7.3 2 15c0 10 14 22 14 22s14-12 14-22C30 7.3 23.7 1 16 1z" fill="#d8a13b" stroke="#fff" stroke-width="2"/><circle cx="16" cy="15" r="5" fill="#fff"/></svg>')}`,
        new maps.Size(32, 38),
      ) : null;
      const marker = new maps.Marker({ position, title: `${place.name}${place.approximate ? "（區域近似位置）" : ""}`, ...(approximateImage ? { image: approximateImage } : {}) });
      const tags = [...new Set([...(place.collectionTag || "").split(/\s+/).filter(Boolean), ...(place.area.startsWith("望遠") ? ["#農夫冠冠"] : [])])];
      const infoContent = document.createElement("div");
      infoContent.className = "food-info shared-food-info";
      infoContent.innerHTML = `<b>${place.name}</b><span>${place.korean}</span><small>${place.area} · ${place.type}${tags.length ? ` · ${tags.join(" ")}` : ""}${place.approximate ? " · ⚠ 區域近似位置" : ""}</small><div><a href="${place.kakaoUrl || `https://map.kakao.com/link/search/${encodeURIComponent(place.query)}`}" target="_blank" rel="noreferrer">Kakao ↗</a><a href="${place.naverUrl || mapLink(place.query)}" target="_blank" rel="noreferrer">Naver ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google ↗</a></div>`;
      infoContent.addEventListener("click", event => event.stopPropagation());
      const info = new maps.CustomOverlay({ position, content: infoContent, xAnchor: 0.5, yAnchor: 1.35, zIndex: 5 });
      const showInfo = (scrollToCard = false) => {
        if (activeInfo && activeInfo !== info) activeInfo.setMap(null);
        info.setMap(sharedMap);
        activeInfo = info;
        sharedMap.panTo(position);
        if (scrollToCard) {
          const card = document.querySelector(`[data-shared-food-index="${place.index}"]`);
          if (card) {
            card.closest("details")?.setAttribute("open", "");
            card.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      };
      maps.event.addListener(marker, "click", () => showInfo(true));
      document.querySelector(`[data-shared-food-index="${place.index}"]`)?.addEventListener("click", event => {
        if (event.target.closest("a")) return;
        showInfo();
      });
      return marker;
    });
    markerCluster.addMarkers(markers);
    maps.event.addListener(sharedMap, "click", () => {
      activeInfo?.setMap(null);
      activeInfo = null;
    });
    if (located.length) sharedMap.setBounds(bounds, 45, 45, 45, 45);
    const approximate = located.filter(place => place.approximate);
    statusNode.innerHTML = `<span>${located.length}／${sharedFoodFinds.length} 間皆已標記</span><small>${located.length - approximate.length} 間為 Kakao POI 精確位置；${approximate.length} 間因攤位、暫名或 Kakao 搜尋不到而使用黃色「區域近似位置」。點卡片仍可使用 Naver／Google 導航。</small>`;
  } catch (error) {
    console.error("Shared food map failed", error);
    canvas.innerHTML = `<div class="map-fallback food-fallback"><strong>${error.message === "NO_APP_KEY" ? "填入 Kakao JavaScript key 後顯示收藏地圖" : "Kakao 美食收藏地圖暫時無法載入"}</strong><p>全部店家仍可從下方卡片使用 Naver Map 或 Google Maps 導航。</p></div>`;
    statusNode.dataset.error = error.message;
    statusNode.innerHTML = `<span>地圖未載入</span><small>店家卡片與導航連結仍可正常使用。</small>`;
  }
}

async function initializeFoodMap() {
  const canvas = document.querySelector("#food-map");
  if (!canvas) return;
  try {
    await loadKakaoMaps(window.KAKAO_MAP_JAVASCRIPT_KEY);
    if (!document.body.contains(canvas)) return;
    const { maps } = window.kakao;
    const foodMap = new maps.Map(canvas, {
      center: new maps.LatLng(37.278, 127.025), level: 6,
    });
    featureMapInstances.food.push(foodMap);
    foodMap.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
    const bounds = new maps.LatLngBounds();
    let activeInfo = null;
    suwonFood.forEach((place, index) => {
      const position = new maps.LatLng(place.lat, place.lng);
      bounds.extend(position);
      const infoContent = document.createElement("div");
      infoContent.className = "food-info";
      infoContent.innerHTML = `<b>${place.name}</b><span>${place.korean}</span><small>${place.dishes.join(" · ")}</small><div><a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a></div>`;
      infoContent.addEventListener("click", event => event.stopPropagation());
      const info = new maps.CustomOverlay({
        position, content: infoContent, xAnchor: 0.5, yAnchor: 1.25, zIndex: 3,
      });
      const showInfo = () => {
        if (activeInfo && activeInfo !== info) activeInfo.setMap(null);
        info.setMap(foodMap);
        activeInfo = info;
        foodMap.panTo(position);
      };
      createNumberedMarker(foodMap, position, index + 1, "food-marker", () => {
        showInfo();
        document.querySelector(`[data-food-index="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      document.querySelector(`[data-food-index="${index}"]`)?.addEventListener("click", event => {
        if (event.target.closest("a")) return;
        showInfo();
      });
    });
    maps.event.addListener(foodMap, "click", () => {
      activeInfo?.setMap(null);
      activeInfo = null;
    });
    foodMap.setBounds(bounds, 45, 45, 45, 45);
  } catch (error) {
    canvas.innerHTML = `<div class="map-fallback food-fallback"><div class="food-fallback__pins">${suwonFood.map((place, index) => `<div><b>${index + 1}</b><span>${place.name}</span><a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google</a></div>`).join("")}</div><strong>${error.message === "NO_APP_KEY" ? "填入 Kakao JavaScript key 後顯示互動美食地圖" : "Kakao 美食地圖暫時無法載入"}</strong><p>現在仍可透過 Naver Map 或 Google Maps 查看餐廳位置。</p></div>`;
  }
}

async function initializeSeoulAreaMap() {
  const canvas = document.querySelector("#seoul-area-map");
  if (!canvas) return;
  try {
    await loadKakaoMaps(window.KAKAO_MAP_JAVASCRIPT_KEY);
    if (!document.body.contains(canvas)) return;
    const { maps } = window.kakao;
    const areaMap = new maps.Map(canvas, {
      center: new maps.LatLng(37.548, 126.995), level: 9,
    });
    featureMapInstances.guide.push(areaMap);
    areaMap.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
    const bounds = new maps.LatLngBounds();
    let activeInfo = null;
    seoulAreas.forEach((area, index) => {
      const position = new maps.LatLng(area.lat, area.lng);
      bounds.extend(position);
      const infoContent = document.createElement("div");
      infoContent.className = "food-info area-info";
      infoContent.innerHTML = `<b>${area.name}</b><span>${area.korean}</span><small>${area.tag} · ${area.stay}</small><div><a href="${mapLink(area.query)}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(area.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a></div>`;
      infoContent.addEventListener("click", event => event.stopPropagation());
      const info = new maps.CustomOverlay({
        position, content: infoContent, xAnchor: 0.5, yAnchor: 1.25, zIndex: 3,
      });
      const showInfo = () => {
        if (activeInfo && activeInfo !== info) activeInfo.setMap(null);
        info.setMap(areaMap);
        activeInfo = info;
        areaMap.panTo(position);
      };
      const zoneClass = area.lng < 126.97 ? "area-marker-west" : area.lng < 127.02 ? "area-marker-center" : "area-marker-east";
      createNumberedMarker(areaMap, position, index + 1, zoneClass, () => {
        showInfo();
        document.querySelector(`[data-area-index="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      document.querySelector(`[data-area-index="${index}"]`)?.addEventListener("click", event => {
        if (event.target.closest("a")) return;
        showInfo();
      });
    });
    maps.event.addListener(areaMap, "click", () => {
      activeInfo?.setMap(null);
      activeInfo = null;
    });
    areaMap.setBounds(bounds, 45, 45, 45, 45);
  } catch (error) {
    canvas.innerHTML = `<div class="map-fallback area-fallback"><div class="food-fallback__pins">${seoulAreas.map((area, index) => `<div><b>${index + 1}</b><span>${area.name}</span><a href="${mapLink(area.query)}" target="_blank" rel="noreferrer">Naver</a><a href="${googleMapLink(area.query)}" target="_blank" rel="noreferrer">Google</a></div>`).join("")}</div><strong>${error.message === "NO_APP_KEY" ? "填入 Kakao JavaScript key 後顯示區域地圖" : "Kakao 首爾區域地圖暫時無法載入"}</strong><p>區域介紹與兩種地圖連結仍可正常使用。</p></div>`;
  }
}

async function initializeCulinaryMap() {
  const canvas = document.querySelector("#culinary-map");
  if (!canvas) return;
  try {
    await loadKakaoMaps(window.KAKAO_MAP_JAVASCRIPT_KEY);
    if (!document.body.contains(canvas)) return;
    const { maps } = window.kakao;
    const restaurantMap = new maps.Map(canvas, {
      center: new maps.LatLng(37.548, 127.000), level: 8,
    });
    featureMapInstances.food.push(restaurantMap);
    restaurantMap.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
    const bounds = new maps.LatLngBounds();
    let activeInfo = null;
    culinaryRestaurants.forEach((place, index) => {
      const position = new maps.LatLng(place.lat, place.lng);
      bounds.extend(position);
      const infoContent = document.createElement("div");
      infoContent.className = "food-info culinary-info";
      infoContent.innerHTML = `<b>${place.name}</b><span>${place.chef}</span><small>${place.area} · ${place.price}</small><div>${place.booking ? `<a href="${place.booking}" target="_blank" rel="noreferrer">訂位 ↗</a>` : ""}<a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google ↗</a></div>`;
      infoContent.addEventListener("click", event => event.stopPropagation());
      const info = new maps.CustomOverlay({
        position, content: infoContent, xAnchor: 0.5, yAnchor: 1.25, zIndex: 3,
      });
      const showInfo = () => {
        if (activeInfo && activeInfo !== info) activeInfo.setMap(null);
        info.setMap(restaurantMap);
        activeInfo = info;
        restaurantMap.panTo(position);
      };
      createNumberedMarker(restaurantMap, position, index + 1, "culinary-marker", () => {
        showInfo();
        document.querySelector(`[data-culinary-index="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      document.querySelector(`[data-culinary-index="${index}"]`)?.addEventListener("click", event => {
        if (event.target.closest("a")) return;
        showInfo();
      });
    });
    maps.event.addListener(restaurantMap, "click", () => {
      activeInfo?.setMap(null);
      activeInfo = null;
    });
    restaurantMap.setBounds(bounds, 45, 45, 45, 45);
  } catch (error) {
    canvas.innerHTML = `<div class="map-fallback area-fallback"><div class="food-fallback__pins">${culinaryRestaurants.map((place, index) => `<div><b>${index + 1}</b><span>${place.name}</span><a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google</a></div>`).join("")}</div><strong>${error.message === "NO_APP_KEY" ? "填入 Kakao JavaScript key 後顯示餐廳地圖" : "Kakao 餐廳地圖暫時無法載入"}</strong><p>餐廳介紹、訂位與導航連結仍可正常使用。</p></div>`;
  }
}

renderShell();
