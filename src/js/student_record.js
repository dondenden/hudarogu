import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// HTML参照
const studentInfo = document.getElementById("studentInfo");
const matchList = document.getElementById("matchList");
const matchListTable = document.getElementById("matchListTable");
const toggleHistory = document.getElementById("toggleHistory");
const backButton = document.getElementById("backButton");

// カード要素
const matchCountEl = document.getElementById("matchCount");
const winRateText = document.getElementById("winRateText");
const avgScoreEl = document.getElementById("avgScore");

// 初期表示
studentInfo.textContent = `${schoolName}の${studentName}さん`;
toggleHistory.addEventListener("click", () => {
  matchListTable.style.display = matchListTable.style.display === 'none' ? 'table' : 'none';
});

// 戻るボタン
backButton.addEventListener("click", () => {
  window.location.href = `https://dondenden.github.io/hudarogu/student_main.html${currentParams}`;
});

// データ読み込み
async function loadMatches() {
  const matchesSnap = await getDocs(query(
    collection(db, schoolName, studentName, "matches"),
    orderBy("createdAt", "desc")
  ));

  const matches = [];
  matchesSnap.forEach(doc => matches.push(doc.data()));

  const totalMatches = matches.length;
  const totalWins = matches.filter(m=>m.result==='勝ち').length;
  const avgScore = totalMatches ? (matches.reduce((sum,m)=>sum+Number(m.score),0)/totalMatches).toFixed(1) : 0;

  // カード表示
  matchCountEl.textContent = totalMatches;
  avgScoreEl.textContent = avgScore;
  winRateText.textContent = totalMatches ? ((totalWins/totalMatches)*100).toFixed(1)+'%' : '0%';

  adjustWinRateFont();

  // 試合履歴作成
  matchList.innerHTML = '';
  matches.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.date || '日付不明'}</td>
      <td>${m.opponent}</td>
      <td>${m.score}</td>
      <td class="${m.result==='勝ち'?'win':'lose'}">${m.result}</td>
    `;
    matchList.appendChild(tr);
  });

  // グラフ描画
  createCharts(matches, totalWins, totalMatches, avgScore);
}

// 勝率円グラフ + 平均枚差線グラフ
function createCharts(matches, wins, total, avgScore){
  // 勝率円グラフ
  const winCtx = document.getElementById('winRateChart').getContext('2d');
  new Chart(winCtx, {
    type:'doughnut',
    data:{
      labels:['勝ち','負け'],
      datasets:[{data:[wins,total-wins],backgroundColor:['#10b981','#e5e7eb'], borderWidth:0}]
    },
    options:{cutout:'70%', plugins:{legend:{display:false}}}
  });

  // 平均枚差線グラフ（横スクロール対応）
  const labels = [...new Set(matches.map(m=>m.date))]; // 日付ごとの平均
  const dateAvgScores = labels.map(date=>{
    const ds = matches.filter(m=>m.date===date).map(m=>Number(m.score));
    return ds.length ? (ds.reduce((a,b)=>a+b,0)/ds.length).toFixed(1) : 0;
  });

  const avgCtx = document.getElementById('avgScoreChart').getContext('2d');
  new Chart(avgCtx,{type:'line',data:{labels,dateAvgScores:dateAvgScores,datasets:[{label:'平均枚差',data:dateAvgScores,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.2)',fill:true,tension:0.3,pointRadius:4,pointBackgroundColor:'#2563eb'}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
}

function adjustWinRateFont(){
  const wrapper = document.querySelector('#winRateCard .chart-wrapper');
  const size = wrapper.offsetWidth;
  winRateText.style.fontSize = (size*0.35)+'px';
}

// 初期ロード
loadMatches();
window.addEventListener('resize', adjustWinRateFont);