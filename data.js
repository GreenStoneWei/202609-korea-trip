const naverSearch = (query) => `https://map.naver.com/p/search/${encodeURIComponent(query)}`;

export const tripMeta = {
  title: "韓國五日遊",
  subtitle: "比賽、首爾散策與水原小旅行",
  dates: "2026.09.11 — 09.15",
  hotel: "HOMES Stay Suwon",
  hotelAddress: "경기도 수원시 팔달구 인계로 116",
  flightOut: "BR170 · TPE 07:30 → ICN 11:00",
  flightBack: "BR159 · ICN 19:45 → TPE 21:25",
};

const hotel = { name: "HOMES Stay Suwon", query: "홈즈스테이 수원", lat: 37.2636, lng: 127.0307 };
const venue = { name: "比賽會場", query: "", note: "原始行程未提供會場名稱與地址" };

export const days = [
  {
    id: 1, date: "09/11", weekday: "五", title: "抵達韓國 · 比賽練習", area: "仁川 → 水原",
    transport: "團體專車 · 機場 → 午餐 → 會場 → 晚餐 → 飯店",
    weatherNote: "出發前 7 天再確認天氣",
    summary: ["BR170", "團體專車", "三餐已含"],
    places: [
      { name: "仁川國際機場", query: "인천국제공항", lat: 37.4602, lng: 126.4407 },
      venue,
      hotel,
    ],
    events: [
      { time: "07:30", title: "桃園出發", subtitle: "長榮航空 BR170", type: "flight", meta: "桃園 T2 → 仁川 · 約 3 小時 30 分", confirmed: true },
      { time: "11:00", title: "抵達仁川國際機場", subtitle: "入境、領取行李後集合", type: "place", place: "仁川國際機場", confirmed: true },
      { time: "12:30", title: "午餐 · 石鍋拌飯＋小火鍋", subtitle: "旅行社安排", type: "food", meta: "實際餐廳待導遊公布", estimate: true },
      { time: "午後", title: "前往比賽會場練習", subtitle: "團體專車接送", type: "activity", meta: "會場與練習時間尚未提供" },
      { time: "晚間", title: "晚餐 · 韓式烤肉", subtitle: "練習後前往，旅行社安排", type: "food" },
      { time: "夜間", title: "入住 HOMES Stay Suwon", subtitle: "水原市八達區仁溪路 116", type: "hotel", mapQuery: "홈즈스테이 수원" },
    ],
  },
  {
    id: 2, date: "09/12", weekday: "六", title: "全日比賽", area: "水原",
    transport: "旅行社派車接送 · 不派導遊；路線與車程待會場地址確認",
    summary: ["全日比賽", "專車接送", "午晚餐自理"],
    places: [hotel, venue],
    events: [
      { time: "早上", title: "飯店早餐", subtitle: "飯店內享用", type: "food" },
      { time: "待確認", title: "專車前往比賽會場", subtitle: "不派導遊", type: "transport", meta: "上車時間與車程依會場位置確認" },
      { time: "中午", title: "午餐自理", subtitle: "首選：保榮餃子（仁溪店／鄰近分店）", type: "recommendation", recommendationId: "boyeong" },
      { time: "全日", title: "比賽日", subtitle: "賽程、場館尚待主辦單位提供", type: "activity" },
      { time: "晚餐", title: "晚餐自理", subtitle: "首選：佳甫亭水原排骨", type: "recommendation", recommendationId: "kabojung" },
      { time: "賽後", title: "專車返回飯店", subtitle: "HOMES Stay Suwon", type: "transport" },
    ],
  },
  {
    id: 3, date: "09/13", weekday: "日", title: "全日比賽", area: "水原",
    transport: "旅行社派車接送 · 不派導遊；路線與車程待會場地址確認",
    summary: ["全日比賽", "專車接送", "午晚餐自理"],
    places: [hotel, venue],
    events: [
      { time: "早上", title: "飯店早餐", subtitle: "飯店內享用", type: "food" },
      { time: "待確認", title: "專車前往比賽會場", subtitle: "不派導遊", type: "transport", meta: "上車時間與車程依會場位置確認" },
      { time: "中午", title: "午餐自理", subtitle: "首選：柳池會館 · 水原醒酒湯", type: "recommendation", recommendationId: "yuchi" },
      { time: "全日", title: "比賽日", subtitle: "賽程、場館尚待主辦單位提供", type: "activity" },
      { time: "晚餐", title: "晚餐自理", subtitle: "首選：真味炸雞 · 水原炸雞街", type: "recommendation", recommendationId: "jinmi" },
      { time: "賽後", title: "專車返回飯店", subtitle: "HOMES Stay Suwon", type: "transport" },
    ],
  },
  {
    id: 4, date: "09/14", weekday: "一", title: "民俗博物館 · 韓屋村", area: "首爾",
    transport: "全日團體專車 · 水原往返首爾；市區站點間由遊覽車移動",
    summary: ["團體專車", "文化散策", "午晚餐已含"],
    places: [
      hotel,
      { name: "國立民俗博物館", query: "국립민속박물관", lat: 37.5815, lng: 126.9789 },
      { name: "通仁市場", query: "통인시장", lat: 37.5807, lng: 126.9699 },
      { name: "恩平韓屋村", query: "은평한옥마을", lat: 37.6418, lng: 126.9386 },
      { name: "北漢山景觀咖啡廳", query: "은평한옥마을 북한산 뷰 카페", lat: 37.6425, lng: 126.9394, note: "原行程未指定店名" },
    ],
    events: [
      { time: "早上", title: "飯店早餐後出發", subtitle: "水原 → 首爾 · 團體專車", type: "transport", meta: "車程約 1.5–2 小時，依交通狀況" },
      { time: "上午", title: "國立民俗博物館＋7080 懷舊街", subtitle: "從生活與風俗認識韓國歷史", type: "place", mapQuery: "국립민속박물관" },
      { time: "中午", title: "通仁市場", subtitle: "午餐為旅行社安排韓式風味餐", type: "food", meta: "可逛銅錢便當 Cafe 與傳統小菜攤", mapQuery: "통인시장" },
      { time: "午後", title: "恩平韓屋村", subtitle: "以北漢山為背景的現代韓屋聚落", type: "place", mapQuery: "은평한옥마을" },
      { time: "午後", title: "北漢山全景庭園咖啡廳", subtitle: "景觀咖啡休息", type: "place", meta: "店名尚待旅行社確認", mapQuery: "은평한옥마을 북한산 뷰 카페" },
      { time: "晚間", title: "韓式風味晚餐 · 返回飯店", subtitle: "旅行社安排 · 團體專車", type: "food" },
    ],
  },
  {
    id: 5, date: "09/15", weekday: "二", title: "水原 · 仁川 · 回家", area: "水原 → 仁川",
    transport: "全日團體專車＋月尾島遊船 · 最後送往仁川機場",
    summary: ["水原華城", "月尾島", "BR159"],
    places: [
      hotel,
      { name: "水原華城", query: "수원화성 화성행궁", lat: 37.2841, lng: 127.0142 },
      { name: "星空圖書館 2.0", query: "스타필드 수원 별마당도서관", lat: 37.2874, lng: 126.9912 },
      { name: "富平地下商街", query: "부평지하상가", lat: 37.4895, lng: 126.7245 },
      { name: "月尾島文化大街", query: "월미도 문화의거리", lat: 37.4747, lng: 126.5962 },
      { name: "仁川國際機場", query: "인천국제공항", lat: 37.4602, lng: 126.4407 },
    ],
    events: [
      { time: "早上", title: "飯店早餐 · 退房", subtitle: "行李上車後開始最後一天", type: "hotel" },
      { time: "上午", title: "世界文化遺產 · 水原華城", subtitle: "城牆、華虹門與訪花隨柳亭", type: "place", mapQuery: "수원화성 화성행궁" },
      { time: "中午", title: "午餐 · 馬鈴薯燉大骨", subtitle: "旅行社安排", type: "food" },
      { time: "午後", title: "星空圖書館 2.0", subtitle: "Starfield 水原 · 四層挑高書牆", type: "place", mapQuery: "스타필드 수원 별마당도서관" },
      { time: "午後", title: "仁川富平地下商街", subtitle: "地下街自由購物", type: "place", mapQuery: "부평지하상가" },
      { time: "傍晚", title: "月尾島國際街 · 海鷗船", subtitle: "海濱散步並搭船餵海鷗", type: "activity", mapQuery: "월미도 문화의거리" },
      { time: "19:45", title: "仁川機場起飛", subtitle: "長榮航空 BR159 · 晚餐為機上餐", type: "flight", meta: "21:25 抵達桃園", confirmed: true },
    ],
  },
];

export const recommendations = {
  boyeong: {
    name: "保榮餃子 · 보영만두", tag: "快速午餐", dish: "手工餃子＋辣拌麵",
    why: "上菜快、適合比賽空檔；飯店周邊可先用 Naver Map 確認當天最近分店。",
    query: "보영만두 인계점", source: "https://www.tripadvisor.com/RestaurantsNear-g424960-d13222654-HOMES_Stay_Suwon-Suwon_Gyeonggi_do.html",
  },
  kabojung: {
    name: "佳甫亭 · 가보정", tag: "水原名物", dish: "生牛排骨／調味牛排骨",
    why: "韓國觀光公社列為水原三大排骨名店之一，距飯店區域不遠；熱門時段建議訂位。",
    address: "경기도 수원시 팔달구 장다리로 282", query: "가보정", source: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=188614",
  },
  yuchi: {
    name: "柳池會館 · 유치회관", tag: "水原老味道", dish: "牛肉醒酒湯＋白切牛肉",
    why: "在地長年經營的醒酒湯專門店，湯飯飽足且適合比賽日快速補充體力。",
    address: "경기도 수원시 팔달구 효원로292번길 67", query: "유치회관 본점", source: "https://ggc.ggcf.kr/en/p/5a6a0325afeca47471384c19",
  },
  jinmi: {
    name: "真味炸雞 · 진미통닭", tag: "賽後聚餐", dish: "原味＋甜辣半半炸雞",
    why: "位於水原炸雞街；韓國觀光公社將真味、龍城列為街區代表店家。",
    address: "경기도 수원시 팔달구 정조로800번길 21", query: "진미통닭", source: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=351&vcontsId=176166",
  },
};

export { naverSearch };
