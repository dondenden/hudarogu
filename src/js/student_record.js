import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Firebase 設定
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
const currentParams = window.location.search; // ←追加

if (!schoolName || !studentName) {
  alert("ログイン情報がありません。");
  window.location.href = 'index.html';
}

// HTML要素参照
const studentInfo = document.getElementById("studentInfo");
const matchList = document.getElementById("matchList");
const overallStats = document.getElementById("overallStats");
const perOpponentStats = document.getElementById("perOpponentStats");
const backButton = document.getElementById("backButton");

studentInfo.textContent = `${schoolName}の${studentName}さん`;

// データ読み込み
async function loadMatches() {
  const matchesSnap = await getDocs(query(
    collection(db, schoolName, studentName, "matches"),
    orderBy("createdAt", "desc")
  ));

  const matches = [];
  matchesSnap.forEach(doc => matches.push(doc.data()));

  // 全体勝率
  const total = matches.length;
  const wins = matches.filter(m => m.result === "勝ち").length; // ←修正
  overallStats.textContent = total
    ? `全体勝率: ${(wins / total * 100).toFixed(1)}% (${wins}/${total})`
    : "試合データがありません";

  // 対戦相手別集計
  const opponentMap = {};
  matches.forEach(m => {
    if (!opponentMap[m.opponent]) opponentMap[m.opponent] = [];
    opponentMap[m.opponent].push(m);
  });

  perOpponentStats.innerHTML = "";
  for (const [opponent, games] of Object.entries(opponentMap)) {
    const winCount = games.filter(g => g.result === "勝ち").length;
    const totalGames = games.length;
    const avgScore = (games.reduce((sum,g)=>sum+g.score,0)/totalGames).toFixed(1);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${opponent}</td>
      <td>${totalGames}</td>
      <td>${(winCount/totalGames*100).toFixed(1)}%</td>
      <td>${avgScore}</td>
    `;
    perOpponentStats.appendChild(tr);
  }

  // 試合履歴（最新順）
  matchList.innerHTML = "";
  matches.forEach(m => {
    const dateStr = m.date || "日付不明";
    const li = document.createElement("li");
    li.textContent = `${dateStr} - 対戦相手: ${m.opponent}, 枚差: ${m.score}, 結果: ${m.result}`;
    matchList.appendChild(li);
  });
}

// 戻るボタン
backButton.addEventListener("click", () => {
  window.location.href = `https://dondenden.github.io/hudarogu/src/student_main.html${currentParams}`;
});

// 初期ロード
loadMatches();