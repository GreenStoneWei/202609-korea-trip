import { competitionVideos, days, googleSearch, naverSearch, recommendations, shoppingCategories, suwonFood, tripMeta } from "./data.js";

const app = document.querySelector("#app");
let activeDay = Number(sessionStorage.getItem("activeDay")) || 1;
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
    <nav class="day-tabs" aria-label="切換行程日期"><div class="day-tabs__track">
      ${days.map(day => `<button class="day-tab" data-day="${day.id}" aria-selected="false"><small>DAY ${day.id}</small><strong>${day.date}</strong><span>週${day.weekday}</span></button>`).join("")}
    </div></nav>
    <nav class="feature-nav" aria-label="旅行工具快速連結">
      <a href="#competition-videos">比賽影片</a><a href="#suwon-food">水原美食</a><a href="#shopping-list">購物清單</a>
    </nav>
    <main id="day-content"></main>
    <div id="extras" class="extras"></div>
    <footer><span>韓國五日 · 旅行手帖</span><span>資料整理自旅行社 PDF · 更新 2026.08.08</span></footer>`;

  document.querySelectorAll(".day-tab").forEach(button => button.addEventListener("click", () => selectDay(Number(button.dataset.day))));
  selectDay(activeDay, false);
  renderExtras();
}

function extrasHeading(kicker, title, note) {
  return `<div class="extras-heading"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div><p>${note}</p></div>`;
}

function renderExtras() {
  const extras = document.querySelector("#extras");
  extras.innerHTML = `
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
  document.querySelectorAll(".shopping-check input").forEach(input => {
    input.checked = localStorage.getItem(`shopping:${input.value}`) === "1";
    input.addEventListener("change", () => localStorage.setItem(`shopping:${input.value}`, input.checked ? "1" : "0"));
  });
  initializeFoodMap();
}

function shoppingPanel(category, active) {
  return `<div class="shopping-panel ${active ? "is-active" : ""}" data-panel="${category.id}" ${active ? "" : "hidden"}>
    <div class="shopping-panel__header"><div><strong>${category.name}</strong><span>${category.note}</span></div><a href="${category.source}" target="_blank" rel="noreferrer">分類參考來源 ↗</a></div>
    <div class="shopping-items">${category.items.map((item, index) => `<label class="shopping-check"><input type="checkbox" value="${category.id}:${index}"><span class="checkmark">✓</span><span class="shopping-check__copy"><b>${item.name}</b><small>${item.detail}</small></span><em>${item.priority}</em></label>`).join("")}</div>
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
      <div class="time-row"><time>${event.time}</time>${event.confirmed ? '<span class="status confirmed">航班確認</span>' : ""}${event.estimate ? '<span class="status estimate">暫估</span>' : ""}</div>
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
      <div class="place-strip">${day.places.map((place, index) => `<div class="place-pill ${!place.query ? "is-pending" : ""}"><b>${index + 1}</b><span>${place.name}<small>${place.note || (place.query ? "選擇地圖開啟" : "位置待確認")}</small>${place.query ? `<span class="place-pill__links"><a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google ↗</a></span>` : ""}</span></div>`).join("")}</div>
      <p class="map-disclaimer">虛線僅表示拜訪順序，不代表實際道路導航。</p>
    </section>
    <section class="schedule" aria-labelledby="schedule-title">
      <div class="section-heading"><div><p class="eyebrow">ITINERARY</p><h2 id="schedule-title">行程時間軸</h2></div><span>${day.events.length} 個安排</span></div>
      <div class="timeline">${day.events.map((event, index) => eventCard(event, index, index === day.events.length - 1)).join("")}</div>
    </section>
    <aside class="notice"><span>!</span><div><strong>行程資料提醒</strong><p>PDF 未提供比賽場館、賽程及多數集合時間；頁面保留「待確認」而不猜測。交通時間僅為規劃參考，請以導遊與當日路況為準。</p></div></aside>`;
  initializeMap(day);
}

function loadNaverMaps(clientId) {
  if (window.naver?.maps) return Promise.resolve();
  if (!clientId) return Promise.reject(new Error("NO_CLIENT_ID"));
  if (window.__naverMapsPromise) return window.__naverMapsPromise;
  window.__naverMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.onload = resolve;
    script.onerror = () => reject(new Error("LOAD_FAILED"));
    document.head.appendChild(script);
  });
  return window.__naverMapsPromise;
}

async function initializeMap(day) {
  const canvas = document.querySelector("#map");
  const located = day.places.filter(place => Number.isFinite(place.lat));
  try {
    await loadNaverMaps(window.NAVER_MAP_CLIENT_ID);
    if (!document.body.contains(canvas) || activeDay !== day.id) return;
    mapInstance = new naver.maps.Map(canvas, { center: new naver.maps.LatLng(located[0].lat, located[0].lng), zoom: 10, zoomControl: true, zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT } });
    markers = located.map((place, index) => new naver.maps.Marker({
      position: new naver.maps.LatLng(place.lat, place.lng), map: mapInstance,
      title: place.name,
      icon: { content: `<div class="naver-marker">${index + 1}</div>`, anchor: new naver.maps.Point(17, 17) },
    }));
    if (located.length > 1) {
      new naver.maps.Polyline({ map: mapInstance, path: located.map(p => new naver.maps.LatLng(p.lat, p.lng)), strokeColor: "#ef674f", strokeWeight: 3, strokeOpacity: .8, strokeStyle: "shortdash" });
      const bounds = new naver.maps.LatLngBounds(); located.forEach(p => bounds.extend(new naver.maps.LatLng(p.lat, p.lng))); mapInstance.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  } catch (error) {
    const fallbackQuery = located[0]?.query || day.area;
    canvas.innerHTML = `<div class="map-fallback"><div class="map-fallback__route">${located.map((p, i) => `<span><b>${i + 1}</b>${p.name}</span>`).join('<i>→</i>')}</div><strong>${error.message === "NO_CLIENT_ID" ? "Naver Map 尚未設定" : "Naver Map 暫時無法載入"}</strong><p>行程與導航連結仍可正常使用。部署前在 <code>config.js</code> 填入 ncpKeyId，即可顯示互動地圖。</p><div class="map-links map-links--center">${mapProviderLinks(fallbackQuery, "開啟")}</div></div>`;
  }
}

async function initializeFoodMap() {
  const canvas = document.querySelector("#food-map");
  if (!canvas) return;
  try {
    await loadNaverMaps(window.NAVER_MAP_CLIENT_ID);
    if (!document.body.contains(canvas)) return;
    const foodMap = new naver.maps.Map(canvas, {
      center: new naver.maps.LatLng(37.278, 127.025), zoom: 13,
      zoomControl: true, zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
    });
    const bounds = new naver.maps.LatLngBounds();
    suwonFood.forEach((place, index) => {
      const position = new naver.maps.LatLng(place.lat, place.lng);
      bounds.extend(position);
      const marker = new naver.maps.Marker({
        position, map: foodMap, title: `${index + 1}. ${place.name}`,
        icon: { content: `<div class="naver-marker food-marker">${index + 1}</div>`, anchor: new naver.maps.Point(18, 18) },
      });
      const info = new naver.maps.InfoWindow({
        content: `<div class="food-info"><b>${place.name}</b><span>${place.korean}</span><small>${place.dishes.join(" · ")}</small><div><a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver Map ↗</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google Maps ↗</a></div></div>`,
        borderWidth: 0, backgroundColor: "transparent", disableAnchor: true,
      });
      naver.maps.Event.addListener(marker, "click", () => {
        info.open(foodMap, marker);
        document.querySelector(`[data-food-index="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      document.querySelector(`[data-food-index="${index}"]`)?.addEventListener("click", event => {
        if (event.target.closest("a")) return;
        foodMap.panTo(position); info.open(foodMap, marker);
      });
    });
    foodMap.fitBounds(bounds, { top: 45, right: 45, bottom: 45, left: 45 });
  } catch (error) {
    canvas.innerHTML = `<div class="map-fallback food-fallback"><div class="food-fallback__pins">${suwonFood.map((place, index) => `<div><b>${index + 1}</b><span>${place.name}</span><a href="${mapLink(place.query)}" target="_blank" rel="noreferrer">Naver</a><a href="${googleMapLink(place.query)}" target="_blank" rel="noreferrer">Google</a></div>`).join("")}</div><strong>${error.message === "NO_CLIENT_ID" ? "設定完成後顯示互動美食地圖" : "美食地圖暫時無法載入"}</strong><p>現在仍可透過 Naver Map 或 Google Maps 查看餐廳位置。</p></div>`;
  }
}

renderShell();
