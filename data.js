const naverSearch = (query) => `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
const googleSearch = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

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

export const competitionVideos = [
  { apparatus: "地板", level: "LEVEL 6", videoId: "tInZgppayUw", start: 286, startLabel: "04:46", accent: "coral" },
  { apparatus: "單槓", level: "LEVEL 6", videoId: "yO_a5AxhztI", start: 114, startLabel: "01:54", accent: "green" },
  { apparatus: "跳馬", level: "LEVEL 7", videoId: "JdTx52W1Gn8", start: 72, startLabel: "01:12", accent: "sand" },
];

export const suwonFood = [
  {
    name: "佳甫亭", korean: "가보정", category: "水原王排骨", price: "高價位・適合聚餐",
    dishes: ["生牛排骨", "調味牛排骨", "大醬湯"],
    intro: "韓國觀光公社列出的水原三大排骨名店之一，規模大、配菜完整，是第一次吃水原王排骨的穩妥選擇。",
    tip: "熱門晚餐時段先訂位；想控制預算可查看平日午間套餐。",
    address: "경기도 수원시 팔달구 장다리로 282", query: "수원 가보정",
    lat: 37.2748, lng: 127.0316,
    source: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=188614",
  },
  {
    name: "本水原排骨", korean: "본수원갈비", category: "50 年老店", price: "高價位・多人分享",
    dishes: ["水原王排骨", "調味排骨", "排骨湯"],
    intro: "超過 50 年歷史，同樣名列水原三大排骨店；可比較原味生排骨與甜鹹調味排骨。",
    tip: "排骨份量適合多人分享；平日午餐可留意限定排骨湯。",
    address: "경기도 수원시 팔달구 중부대로223번길 41", query: "본수원갈비",
    lat: 37.2804, lng: 127.0433,
    source: "https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=86767",
  },
  {
    name: "柳池會館", korean: "유치회관", category: "在地湯飯", price: "平價・快速用餐",
    dishes: ["牛肉醒酒湯", "白切牛肉", "蘿蔔泡菜"],
    intro: "水原代表性的清爽牛肉醒酒湯老店，湯裡有牛肉與白菜，血腸可依喜好另外加入。",
    tip: "適合比賽日補充體力；不吃牛血可在點餐時先說明。",
    address: "경기도 수원시 팔달구 효원로292번길 67", query: "유치회관 본점",
    lat: 37.2622, lng: 127.0346,
    source: "https://ggc.ggcf.kr/en/p/5a6a0325afeca47471384c19",
  },
  {
    name: "真味炸雞", korean: "진미통닭", category: "水原炸雞街", price: "中價位・適合分享",
    dishes: ["原味炸雞", "甜辣炸雞", "半半炸雞"],
    intro: "位於水原炸雞街的代表店家，以大鍋現炸、外脆內嫩的老式全雞聞名，適合賽後多人分享。",
    tip: "點半半可一次比較原味與甜辣；週末用餐尖峰可能需要候位。",
    address: "경기도 수원시 팔달구 정조로800번길 21", query: "수원 진미통닭",
    lat: 37.2794, lng: 127.0182,
    source: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=351&vcontsId=176166",
  },
  {
    name: "地洞市場血腸城", korean: "지동시장 순대타운", category: "傳統市場", price: "平價・在地小吃",
    dishes: ["綜合血腸", "炒血腸", "豬雜湯"],
    intro: "地洞市場美食巷聚集約 20 間血腸專門店，可一次體驗水原庶民市場料理與熱鬧氣氛。",
    tip: "內臟接受度因人而異；第一次可點小份綜合血腸多人分食。",
    address: "경기도 수원시 팔달구 팔달문로 19", query: "지동시장 순대타운",
    lat: 37.2777, lng: 127.0197,
    source: "https://www.suwon.go.kr/webcontent/ckeditor/2025/11/10/b36115dd-5223-49f8-80af-cf2906c6055a.pdf",
  },
  {
    name: "保榮餃子", korean: "보영만두 북문본점", category: "餃子與辣拌麵", price: "平價・快速用餐",
    dishes: ["蒸餃", "炸餃", "辣拌麵"],
    intro: "水原北門一帶廣為人知的餃子店，現做餃子配酸辣爽口的拌麵，是比賽空檔容易安排的一餐。",
    tip: "辣拌麵有辣度；可搭配蒸餃平衡味道，並先用 Naver Map 確認最近分店。",
    address: "경기도 수원시 장안구 팔달로 271", query: "보영만두 북문본점",
    lat: 37.2917, lng: 127.0122,
    source: "https://www.diningcode.com/profile.php?rid=qiiPwhoYeuEZ",
  },
];

export const shoppingCategories = [
  {
    id: "beauty", icon: "✦", name: "藥妝保養", note: "Olive Young／大創",
    source: "https://www.seoultourism.org/k-beauty-shopping-guide-seoul/",
    items: [
      { name: "Round Lab 白樺樹防曬", detail: "輕盈日常防曬；購買前依膚質試用。", priority: "人氣防曬" },
      { name: "Torriden Dive-In 精華", detail: "以補水為主的玻尿酸精華。", priority: "乾燥肌" },
      { name: "Mediheal／Biodance 面膜", detail: "單片好分送，留意 1+1 或多入組。", priority: "伴手禮" },
      { name: "VT Reedle Shot 100", detail: "有刺激感的入門版本，敏感肌先局部測試。", priority: "先試再買" },
    ],
  },
  {
    id: "makeup", icon: "●", name: "彩妝美妝", note: "先試色再結帳",
    source: "https://www.seoultourism.org/k-beauty-shopping-guide-seoul/",
    items: [
      { name: "Rom&nd／Peripera 唇彩", detail: "體積小、色號多，適合自用或送禮。", priority: "小禮物" },
      { name: "HERA／CLIO 氣墊粉餅", detail: "現場確認色階並一起購買補充蕊。", priority: "試色必須" },
      { name: "CLIO／Etude 眉筆", detail: "韓系自然眉色，確認髮色後挑選。", priority: "實用" },
      { name: "Laneige 唇膜", detail: "經典保濕小物，機場免稅也常有組合。", priority: "經典款" },
    ],
  },
  {
    id: "fashion", icon: "◇", name: "服飾配件", note: "Musinsa／聖水／弘大",
    source: "https://about.musinsa.com/newsroom/k-fashion-edit",
    items: [
      { name: "MUSINSA STANDARD 基本款", detail: "男女、童裝與運動線齊全，實穿且容易搭配。", priority: "基本款" },
      { name: "韓國設計師／街頭品牌", detail: "Musinsa Store 可一次看多個本地品牌。", priority: "K-Fashion" },
      { name: "帽子、襪子與帆布袋", detail: "體積小、價位相對親切，適合伴手禮。", priority: "好攜帶" },
      { name: "富平地下街服飾", detail: "Day 5 行程內可逛；先比價、確認尺寸與退換規則。", priority: "行程順買" },
    ],
  },
  {
    id: "snacks", icon: "□", name: "零食伴手禮", note: "超市／便利商店",
    source: "https://www.seoultourism.org/what-to-buy-in-korea/",
    items: [
      { name: "HBAF 杏仁", detail: "蜂蜜奶油等多口味，小包裝容易分送。", priority: "熱門" },
      { name: "韓國海苔／海苔脆片", detail: "輕巧好帶，注意包裝避免行李擠壓。", priority: "家庭禮" },
      { name: "限定口味泡麵與零食", detail: "超市通常比觀光區選擇多；留意肉類成分入境限制。", priority: "限定款" },
      { name: "柚子茶／傳統茶包", detail: "玻璃罐較重，優先挑補充包或茶包。", priority: "長輩禮" },
    ],
  },
  {
    id: "goods", icon: "+", name: "生活與紀念品", note: "大創／仁寺洞／官方店",
    source: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?dataSetId=120&menuSn=929&vcontsId=251858",
    items: [
      { name: "Daiso 收納與旅行小物", detail: "收納袋、旅行分裝瓶、文具實用且平價。", priority: "高 CP" },
      { name: "韓紙文具／傳統紋樣小物", detail: "書籤、卡片、杯墊適合有韓國特色的禮物。", priority: "文化紀念" },
      { name: "正版 K-pop 專輯與周邊", detail: "優先官方商店或大型唱片行，避免非官方商品。", priority: "認明正版" },
      { name: "水原限定點心", detail: "可留意水原藥果、華城造型餅乾等地方紀念品。", priority: "水原限定" },
    ],
  },
];

export { googleSearch, naverSearch };
