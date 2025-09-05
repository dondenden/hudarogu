import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyAHb1pT_SgqolYZdpOsmQdLK-OMjNVpVYA",
  authDomain: "hudarogu-71a4f.firebaseapp.com",
  projectId: "hudarogu-71a4f",
  storageBucket: "hudarogu-71a4f.appspot.com",
  messagingSenderId: "453627568918",
  appId: "1:453627568918:web:85f634cfa2d0ca358e2637",
  measurementId: "G-EVDBZ70E5C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URLパラメータ取得
const params = new URLSearchParams(window.location.search);
const schoolName = params.get("school");
const studentName = params.get("student");

if (!schoolName || !studentName) {
  alert("ログイン情報がありません。");
  window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", async () => {
  const studentInfo = document.getElementById("studentInfo");
  const matchList = document.getElementById("matchList");

  studentInfo.textContent = `${schoolName}の${studentName}さんの試合結果`;

  // 試合結果取得
  async function loadMatches() {
    matchList.innerHTML = "<tr><td colspan='4'>読み込み中...</td></tr>";
    const q = query(collection(db, schoolName, studentName, "matches"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      matchList.innerHTML = "<tr><td colspan='4'>まだ試合結果がありません</td></tr>";
      return;
    }

    matchList.innerHTML = "";
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement("tr");

      const date = data.date || "";
      const opponent = data.opponent || "";
      const score = data.score !== undefined ? data.score : "";
      const result = data.result || "";

      tr.innerHTML = `<td>${date}</td><td>${opponent}</td><td>${score}</td><td>${result}</td>`;
      matchList.appendChild(tr);
    });
  }

  await loadMatches();
});