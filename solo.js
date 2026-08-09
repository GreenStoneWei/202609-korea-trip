import { googleSearch, naverSearch } from "./data.js";

const privateRoute = "#solo";
const allowedEventTypes = new Set(["flight", "place", "food", "activity", "hotel", "transport", "recommendation"]);
const eventIcons = {
  flight: "✈", place: "⌖", food: "●", activity: "◇", hotel: "⌂", transport: "→", recommendation: "★",
};

let root = null;
let encryptedPayload = null;
let unlockedTrip = null;
let activeSoloDay = 0;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function fromBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function deriveKey(password, payload) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: payload.kdf.hash,
      salt: fromBase64(payload.salt),
      iterations: payload.kdf.iterations,
    },
    material,
    { name: "AES-GCM", length: payload.cipher.length },
    false,
    ["decrypt"],
  );
}

async function decryptTrip(password, payload) {
  const key = await deriveKey(password, payload);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.ciphertext),
  );
  const trip = JSON.parse(new TextDecoder().decode(plaintext));
  if (trip.version !== 1 || !Array.isArray(trip.days)) throw new Error("INVALID_DATA");
  return trip;
}

function closeSoloAccess(clearRoute = true) {
  unlockedTrip = null;
  encryptedPayload = null;
  activeSoloDay = 0;
  document.body.classList.remove("solo-open");
  root.replaceChildren();
  if (clearRoute && location.hash === privateRoute) {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
  }
}

function frame(content, className = "") {
  return `<section class="solo-page ${className}" aria-label="私人行程"><button class="solo-close" type="button" aria-label="關閉私人行程">×</button>${content}</section>`;
}

function renderLoading() {
  root.innerHTML = frame('<div class="solo-gate"><div class="solo-lock-mark">◇</div><p>正在準備私人行程…</p></div>', "is-gate");
  bindClose();
}

function renderNotConfigured() {
  root.innerHTML = frame(`<div class="solo-gate"><div class="solo-lock-mark">◇</div><p class="eyebrow">PRIVATE TRIP</p><h1>私人行程尚未建立</h1><p>解鎖介面已經準備完成。將明文行程放入 <code>.private/solo-trip.json</code> 並執行加密工具後，這裡才會出現密碼欄位。</p><div class="solo-privacy-note">目前公開網站沒有任何私人日期、地點或行程內容。</div></div>`, "is-gate");
  bindClose();
}

function renderLoadError() {
  root.innerHTML = frame(`<div class="solo-gate"><div class="solo-lock-mark">!</div><p class="eyebrow">PRIVATE TRIP</p><h1>無法讀取加密行程</h1><p>請稍後重試；公開行程不受影響。</p><button class="solo-secondary" type="button" data-solo-retry>重新讀取</button></div>`, "is-gate");
  bindClose();
  root.querySelector("[data-solo-retry]")?.addEventListener("click", openSoloAccess);
}

function renderUnlock(message = "") {
  root.innerHTML = frame(`<div class="solo-gate"><div class="solo-lock-mark">◇</div><p class="eyebrow">PRIVATE TRIP</p><h1>解鎖我的私人行程</h1><p>行程已加密。密碼只在這個瀏覽器分頁中用於解密，不會傳送或儲存。</p><form class="solo-unlock-form"><label for="solo-password">私人行程密碼</label><div><input id="solo-password" name="password" type="password" minlength="12" autocomplete="current-password" required autofocus><button type="submit">解鎖</button></div><p class="solo-error" role="alert">${escapeHtml(message)}</p></form><div class="solo-privacy-note">關閉或重新整理頁面後需要再次輸入密碼。</div></div>`, "is-gate");
  bindClose();
  root.querySelector(".solo-unlock-form")?.addEventListener("submit", unlock);
}

async function unlock(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const password = new FormData(form).get("password");
  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "解密中…";
  try {
    unlockedTrip = await decryptTrip(String(password), encryptedPayload);
    activeSoloDay = 0;
    form.reset();
    renderUnlockedTrip();
  } catch (error) {
    unlockedTrip = null;
    renderUnlock(error.message === "INVALID_DATA" ? "加密檔內容格式不正確。" : "密碼不正確，請再試一次。 ");
  }
}

function soloMapLinks(query) {
  if (!query) return "";
  return `<div class="map-links"><a class="map-link provider-naver" href="${naverSearch(query)}" target="_blank" rel="noreferrer">Naver Map 查看 <span>↗</span></a><a class="map-link provider-google" href="${googleSearch(query)}" target="_blank" rel="noreferrer">Google Maps 查看 <span>↗</span></a></div>`;
}

function renderSoloEvent(event, index, length) {
  const type = allowedEventTypes.has(event.type) ? event.type : "place";
  return `<article class="timeline-item ${index === length - 1 ? "is-last" : ""}"><div class="timeline-item__rail"><span class="event-icon type-${type}">${eventIcons[type]}</span></div><div class="timeline-item__body"><div class="time-row"><time>${escapeHtml(event.time || "待定")}</time></div><h3>${escapeHtml(event.title || "待規劃")}</h3>${event.subtitle ? `<p>${escapeHtml(event.subtitle)}</p>` : ""}${event.meta ? `<div class="event-note">${escapeHtml(event.meta)}</div>` : ""}${soloMapLinks(event.mapQuery)}</div></article>`;
}

function renderSoloDay(day) {
  const events = Array.isArray(day.events) ? day.events : [];
  return `<section class="solo-day-intro"><p class="eyebrow">SOLO DAY ${activeSoloDay + 1} · ${escapeHtml(day.area || "待規劃")}</p><h2>${escapeHtml(day.title || "獨旅行程")}</h2><div class="chips">${(day.summary || []).map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></section><section class="solo-schedule"><div class="section-heading"><div><p class="eyebrow">PRIVATE ITINERARY</p><h2>${escapeHtml(day.date || "")} · 週${escapeHtml(day.weekday || "")}</h2></div><span>${events.length} 個安排</span></div>${day.transport ? `<div class="transport-summary"><span>→</span><div><strong>今日交通</strong><p>${escapeHtml(day.transport)}</p></div></div>` : ""}<div class="timeline solo-timeline">${events.length ? events.map((item, index) => renderSoloEvent(item, index, events.length)).join("") : '<div class="solo-empty">這一天還沒有安排。</div>'}</div></section>`;
}

function renderUnlockedTrip() {
  const days = unlockedTrip.days;
  const day = days[activeSoloDay];
  root.innerHTML = frame(`<header class="solo-header"><div><p>PRIVATE · DECRYPTED LOCALLY</p><h1>${escapeHtml(unlockedTrip.title || "韓國獨旅")}</h1><span>${escapeHtml(unlockedTrip.subtitle || unlockedTrip.dates || "")}</span></div><button class="solo-lock" type="button">立即鎖定</button></header><nav class="solo-tabs" aria-label="切換私人行程日期">${days.map((item, index) => `<button type="button" data-solo-day="${index}" aria-selected="${index === activeSoloDay}" class="${index === activeSoloDay ? "is-active" : ""}"><small>SOLO ${index + 1}</small><strong>${escapeHtml(item.date || "")}</strong><span>週${escapeHtml(item.weekday || "")}</span></button>`).join("")}</nav><main class="solo-content">${day ? renderSoloDay(day) : '<div class="solo-empty">私人行程尚未加入日期。</div>'}</main>`, "is-unlocked");
  bindClose();
  root.querySelector(".solo-lock")?.addEventListener("click", () => {
    unlockedTrip = null;
    activeSoloDay = 0;
    renderUnlock();
  });
  root.querySelectorAll("[data-solo-day]").forEach(button => button.addEventListener("click", () => {
    activeSoloDay = Number(button.dataset.soloDay);
    renderUnlockedTrip();
  }));
}

function bindClose() {
  root.querySelector(".solo-close")?.addEventListener("click", closeSoloAccess);
}

async function openSoloAccess() {
  document.body.classList.add("solo-open");
  renderLoading();
  if (unlockedTrip) {
    renderUnlockedTrip();
    return;
  }
  try {
    const response = await fetch("./solo-trip.enc.json", { cache: "no-store" });
    if (!response.ok) throw new Error("LOAD_FAILED");
    encryptedPayload = await response.json();
    if (location.hash !== privateRoute) return;
    if (!encryptedPayload.configured) {
      renderNotConfigured();
      return;
    }
    renderUnlock();
  } catch (error) {
    if (location.hash === privateRoute) renderLoadError();
  }
}

function handleRoute() {
  if (location.hash === privateRoute) openSoloAccess();
  else if (document.body.classList.contains("solo-open")) closeSoloAccess(false);
}

export function initializeSoloAccess(container) {
  root = container;
  window.addEventListener("hashchange", handleRoute);
  window.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("solo-open")) closeSoloAccess();
  });
  handleRoute();
}
