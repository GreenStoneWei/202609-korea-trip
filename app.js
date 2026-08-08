import { days, naverSearch, recommendations, tripMeta } from "./data.js";

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
    <main id="day-content"></main>
    <footer><span>韓國五日 · 旅行手帖</span><span>資料整理自旅行社 PDF · 更新 2026.08.08</span></footer>`;

  document.querySelectorAll(".day-tab").forEach(button => button.addEventListener("click", () => selectDay(Number(button.dataset.day))));
  selectDay(activeDay, false);
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
      ${query ? `<a class="map-link" href="${mapLink(query)}" target="_blank" rel="noreferrer">在 Naver Map 查看 <span>↗</span></a>` : ""}
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
      <div class="place-strip">${day.places.map((place, index) => `<a class="place-pill ${!place.query ? "is-pending" : ""}" ${place.query ? `href="${mapLink(place.query)}" target="_blank" rel="noreferrer"` : ""}><b>${index + 1}</b><span>${place.name}<small>${place.note || (place.query ? "Naver Map ↗" : "位置待確認")}</small></span></a>`).join("")}</div>
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
    canvas.innerHTML = `<div class="map-fallback"><div class="map-fallback__route">${located.map((p, i) => `<span><b>${i + 1}</b>${p.name}</span>`).join('<i>→</i>')}</div><strong>${error.message === "NO_CLIENT_ID" ? "Naver Map 尚未設定" : "Naver Map 暫時無法載入"}</strong><p>行程與導航連結仍可正常使用。部署前在 <code>config.js</code> 填入 ncpKeyId，即可顯示互動地圖。</p><a href="${mapLink(located[0]?.query || day.area)}" target="_blank" rel="noreferrer">開啟 Naver Map ↗</a></div>`;
  }
}

renderShell();
