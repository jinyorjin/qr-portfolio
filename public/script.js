const firebaseConfig = {
  apiKey: "AIzaSyDV_T31W-_FV95paA6v9tICDLjtU4qO2zY",
  authDomain: "qrportfolio-dca92.firebaseapp.com",
  projectId: "qrportfolio-dca92",
  storageBucket: "qrportfolio-dca92.firebasestorage.app",
  messagingSenderId: "1038363567989",
  appId: "1:1038363567989:web:c6920f62ca9cdb8ccc553c",
  measurementId: "G-D63KS5JNJ7",
};

// ================================
// Firebase 초기화
// ================================
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// firebase.analytics(); // 필요 시만 활성화

// ================================
// 국가코드 → Twemoji 국기 아이콘 변환
// ================================
function countryCodeToFlagIcon(code) {
  if (!code) return "🌍"; // 기본 지구본
  const cc = String(code).trim().toUpperCase();
  if (cc.length !== 2) return cc;

  // 국기 이모지 생성
  const emoji = cc.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt())
  );

  // Twemoji → SVG 이미지 변환
  return twemoji.parse(emoji, { folder: "svg", ext: ".svg" });
}

// ================================
// Firestore에 저장
// ================================
async function saveVisitor() {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (!data || data.success === false) throw new Error("Geo lookup failed");

    await db.collection("visitors").add({
      country: data.country,
      country_code: data.country_code,
      lat: data.latitude,
      lng: data.longitude,
      timestamp: new Date(),
    });
  } catch (e) {
    console.error("Error saving visitor:", e);
  }
}

// ================================
// Firestore에서 불러오기
// ================================
async function loadVisitors() {
  try {
    const snapshot = await db.collection("visitors").get();

    let total = 0;
    let today = 0;
    const todayDate = new Date().toDateString();

    snapshot.forEach((doc) => {
      const v = doc.data();
      total++;

      const ts =
        v.timestamp && typeof v.timestamp.toDate === "function"
          ? v.timestamp.toDate()
          : new Date(v.timestamp || Date.now());

      if (ts.toDateString() === todayDate) today++;

      if (v.lat && v.lng) {
        const flagIcon = countryCodeToFlagIcon(v.country_code);

        const customIcon = L.divIcon({
          className: "flag-icon",
          html: `<div style="font-size:22px; text-align:center;">${flagIcon}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.marker([v.lat, v.lng], { icon: customIcon }).addTo(map).bindPopup(`
            <div style="text-align:center; font-size:16px;">
              ${flagIcon} ${v.country}<br/>
              ${ts.toLocaleString()}
            </div>
          `);
      }
    });

    // ✅ 합계 표시
    const totalEl = document.getElementById("total-visitors");
    const todayEl = document.getElementById("today-visitors");
    if (totalEl) totalEl.innerText = total;
    if (todayEl) todayEl.innerText = today;
  } catch (e) {
    console.error("Error loading visitors:", e);
  }
}

// ================================
// 지도 초기화
// ================================
const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// ================================
// 실행
// ================================
saveVisitor().then(loadVisitors);
