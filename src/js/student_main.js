window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const schoolName = params.get("school");
  const studentName = params.get("student");

  if (!schoolName || !studentName) {
    alert("ログイン情報がありません。ログインし直してください。");
    window.location.href = 'index.html';
    return;
  }

  const currentParams = window.location.search;

  // h1 に表示（改行対応済み）
  const h1 = document.getElementById("studentHeader");
  h1.textContent = `${schoolName}の${studentName}さんの\nメインフォーム`;

  // ボタン取得
  const recordBtn = document.getElementById("record");
  const watchBtn = document.getElementById("watch");
  const backBtn = document.getElementById("backButton");

  // 結果の記録
  recordBtn.addEventListener("click", () => {
    window.location.href = `https://dondenden.github.io/hudarogu/student_match.html${currentParams}`;
  });

  // 結果を見る
  watchBtn.addEventListener("click", () => {
    window.location.href = `https://dondenden.github.io/hudarogu/student_record${currentParams}`;
  });

  // 戻る
  backBtn.addEventListener("click", () => {
    window.location.href = 'https://dondenden.github.io/hudarogu/index.html';
  });
});