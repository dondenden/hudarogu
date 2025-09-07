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
const currentParams = window.location.search;

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
const toggleBtn = document.getElementById("toggleMatchList");
const matchListWrapper = document.getElementById("matchListWrapper");

studentInfo.textContent = `${schoolName}の${studentName}さん`;

// 試合履歴表示/非表示
toggleBtn.addEventListener("click", () => {
  matchListWrapper.style.display = 
    matchListWrapper.style.display === "none" ? "block" : "none";
});

// データ読み込み
async function loadMatches() {
  const matchesSnap = await getDocs(query(
    collection(db, schoolName, studentName, "matches"),
    orderBy("createdAt", "desc")
  ));

  const matches = [];
  matchesSnap.forEach(doc => matches.push(doc.data()));

  const total = matches.length;
  const wins = matches.filter(m => m.result === "勝ち").length;
  const avgScore = total ? (matches.reduce((sum,m)=>sum + Number(m.score),0)/total).toFixed(1) : 0;

  overallStats.textContent = total
    ? `全体勝率: ${(wins / total * 100).toFixed(1)}% (${wins}/${total}), 平均枚差: ${avgScore}`
    : "試合データがありません";

  // 対戦相手別集計
  const opponentMap = {};
  matches.forEach(m => {
    if (!opponentMap[m.opponent]) opponentMap[m.opponent] = [];
    opponentMap[m.opponent].push(m);
  });

  perOpponentStats.innerHTML = "";
  for (const [opponent, games] of Object.entries(opponentMap)) {
    const winGames = games.filter(g => g.result === "勝ち");
    const loseGames = games.filter(g => g.result === "負け");
    const winCount = winGames.length;
    const totalGames = games.length;
    const avgWinScore = winGames.length ? (winGames.reduce((sum,g)=>sum + Number(g.score),0)/winGames.length).toFixed(1) : "-";
    const avgLoseScore = loseGames.length ? (loseGames.reduce((sum,g)=>sum + Number(g.score),0)/loseGames.length).toFixed(1) : "-";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${opponent}</td>
      <td>${totalGames}</td>
      <td>${(winCount/totalGames*100).toFixed(1)}%</td>
      <td class="win">${avgWinScore}</td>
      <td class="lose">${avgLoseScore}</td>
    `;
    perOpponentStats.appendChild(tr);
  }

  // 試合履歴
  matchList.innerHTML = "";
  const dateMap = {}; // 日付ごとの枚差
  matches.forEach(m => {
    const dateStr = m.date || "日付不明";
    const resultClass = m.result === "勝ち" ? "win" : "lose";

    // 試合履歴テーブル
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td>${m.opponent}</td>
      <td>${m.score}</td>
      <td class="${resultClass}">${m.result}</td>
    `;
    matchList.appendChild(tr);

    // 日付ごとの平均計算用
    if (!dateMap[dateStr]) dateMap[dateStr] = [];
    dateMap[dateStr].push(Number(m.score));
  });

  // 日付ごとの平均枚差ラベルとデータ
  const labels = Object.keys(dateMap);
  const scores = labels.map(date => {
    const values = dateMap[date];
    return (values.reduce((sum,v)=>sum+v,0)/values.length).toFixed(1);
  });

  createCharts(matches, opponentMap, labels, scores);
}

// Chart.js グラフ作成
function createCharts(matches, opponentMap, labels, scores) {
  const matchCtx = document.getElementById('matchChart').getContext('2d');
  new Chart(matchCtx, {
    type: 'line',
    data: { labels, datasets: [{ label:'平均枚差', data:scores, borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.2)', tension:0.3, fill:true, pointRadius:4, pointBackgroundColor:'#2563eb' }] },
    options: { responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
  });

  const opponentLabels = Object.keys(opponentMap);
  const opponentWinRates = opponentLabels.map(opponent => {
    const games = opponentMap[opponent];
    const winCount = games.filter(g => g.result==='勝ち').length;
    return ((winCount / games.length)*100).toFixed(1);
  });

  const opponentCtx = document.getElementById('opponentChart').getContext('2d');
  new Chart(opponentCtx, {
    type:'bar',
    data:{labels:opponentLabels, datasets:[{label:'勝率 (%)', data:opponentWinRates, backgroundColor:'#10b981'}]},
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, max:100}}}
  });

  const avgWinScores = opponentLabels.map(opponent => {
    const winGames = opponentMap[opponent].filter(g => g.result==='勝ち');
    return winGames.length ? (winGames.reduce((sum,g)=>sum+Number(g.score),0)/winGames.length).toFixed(1) : 0;
  });
  const avgLoseScores = opponentLabels.map(opponent => {
    const loseGames = opponentMap[opponent].filter(g => g.result==='負け');
    return loseGames.length ? (loseGames.reduce((sum,g)=>sum+Number(g.score),0)/loseGames.length).toFixed(1) : 0;
  });

  const scoreCtx = document.getElementById('scoreChart').getContext('2d');
  new Chart(scoreCtx, {
    type:'bar',
    data:{labels:opponentLabels, datasets:[
      {label:'勝ち平均枚差', data:avgWinScores, backgroundColor:'#3b82f6'},
      {label:'負け平均枚差', data:avgLoseScores, backgroundColor:'#ef4444'}
    ]},
    options:{responsive:true, plugins:{legend:{position:'top'}}}
  });
}

// 戻るボタン
backButton.addEventListener("click", () => {
  window.location.href = `https://dondenden.github.io/hudarogu/student_main.html${currentParams}`;
});

// 初期ロード
loadMatches();