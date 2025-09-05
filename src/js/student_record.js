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

// HTML要素
const studentInfo = document.getElementById("studentInfo");
const matchList = document.getElementById("matchList");
const overallStats = document.getElementById("overallStats");
const perOpponentStats = document.getElementById("perOpponentStats");
const backButton = document.getElementById("backButton");

const matchChartCanvas = document.getElementById("matchChart").getContext('2d');
const opponentChartCanvas = document.getElementById("opponentChart").getContext('2d');
const scoreChartCanvas = document.getElementById("scoreChart").getContext('2d');

studentInfo.textContent = `${schoolName}の${studentName}さん`;

async function loadMatches() {
  const matchesSnap = await getDocs(query(
    collection(db, schoolName, studentName, "matches"),
    orderBy("createdAt", "desc")
  ));

  const matches = [];
  matchesSnap.forEach(doc => matches.push(doc.data()));

  const total = matches.length;
  const wins = matches.filter(m => m.result === "勝ち").length;

  const avgScore = total
    ? (matches.reduce((sum,m)=>sum + Number(m.score || 0),0)/total).toFixed(1)
    : 0;

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
  const opponentLabels = [];
  const opponentWinRates = [];
  const winScores = [];
  const loseScores = [];

  for (const [opponent, games] of Object.entries(opponentMap)) {
    const winGames = games.filter(g => g.result === "勝ち");
    const loseGames = games.filter(g => g.result === "負け");

    const winCount = winGames.length;
    const totalGames = games.length;

    const avgWinScore = winGames.length
      ? (winGames.reduce((sum,g)=>sum + Number(g.score || 0),0)/winGames.length).toFixed(1)
      : 0;
    const avgLoseScore = loseGames.length
      ? (loseGames.reduce((sum,g)=>sum + Number(g.score || 0),0)/loseGames.length).toFixed(1)
      : 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${opponent}</td>
      <td>${totalGames}</td>
      <td>${(winCount/totalGames*100).toFixed(1)}%</td>
      <td class="win">${avgWinScore}</td>
      <td class="lose">${avgLoseScore}</td>
    `;
    perOpponentStats.appendChild(tr);

    opponentLabels.push(opponent);
    opponentWinRates.push((winCount/totalGames*100).toFixed(1));
    winScores.push(avgWinScore);
    loseScores.push(avgLoseScore);
  }

  // 試合履歴
  matchList.innerHTML = "";
  matches.forEach(m => {
    const dateStr = m.date || "日付不明";
    const resultClass = m.result === "勝ち" ? "win" : "lose";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td>${m.opponent}</td>
      <td>${m.score}</td>
      <td class="${resultClass}">${m.result}</td>
    `;
    matchList.appendChild(tr);
  });

  // 日付ごとの枚差バー
  new Chart(matchChartCanvas, {
    type: 'bar',
    data: {
      labels: matches.map(m=>m.date||"不明"),
      datasets: [{
        label: '枚差',
        data: matches.map(m=>Number(m.score||0)),
        backgroundColor: matches.map(m=>m.result==="勝ち"?"rgba(16,185,129,0.5)":"rgba(239,68,68,0.5)"),
        borderColor: matches.map(m=>m.result==="勝ち"?"rgba(16,185,129,1)":"rgba(239,68,68,1)"),
        borderWidth:1
      }]
    },
    options: {
      responsive:true,
      plugins:{ legend:{ display:false } },
      scales: { y:{ beginAtZero:true, title:{ display:true, text:"枚差" } }, x:{ title:{ display:true, text:"日付" } } }
    }
  });

  // 対戦相手別 勝率円グラフ
  new Chart(opponentChartCanvas, {
    type:'doughnut',
    data:{
      labels:opponentLabels,
      datasets:[{
        label:'勝率',
        data:opponentWinRates,
        backgroundColor:opponentLabels.map(_=>`hsl(${Math.random()*360},70%,60%)`)
      }]
    },
    options:{ responsive:true, plugins:{ legend:{ position:'bottom' } } }
  });

  // 対戦相手別 勝ち/負け平均枚差棒グラフ
  new Chart(scoreChartCanvas, {
    type:'bar',
    data:{
      labels:opponentLabels,
      datasets:[
        { label:'勝ち平均枚差', data:winScores, backgroundColor:'rgba(16,185,129,0.7)' },
        { label:'負け平均枚差', data:loseScores, backgroundColor:'rgba(239,68,68,0.7)' }
      ]
    },
    options:{
      responsive:true,
      plugins:{ legend:{ position:'bottom' } },
      scales:{ y:{ beginAtZero:true, title:{ display:true, text:"平均枚差" } } }
    }
  });
}

// 戻る
backButton.addEventListener("click", () => {
  window.location.href = `https://dondenden.github.io/hudarogu/src/student_main.html${currentParams}`;
});

loadMatches();