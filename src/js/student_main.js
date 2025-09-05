window.addEventListener("DOMContentLoaded", () => {
  // URLパラメータ取得
  const params = new URLSearchParams(window.location.search);
  const schoolName = params.get("school");
  const studentName = params.get("student");

  if (!schoolName || !studentName) {
    alert("ログイン情報がありません。ログインし直してください。");
    window.location.href = 'index.html';
    return;
  }

  const currentParams = window.location.search; // 現在のURLパラメータを保持

  // h1 に表示
  const h1 = document.getElementById("name");
  if (h1) {
    h1.textContent = `${schoolName}の${studentName}さんのメインフォーム`;
  }

  // ボタン処理
  const recordBtn = document.getElementById("record");
  const watchBtn = document.getElementById("watch");

  recordBtn.addEventListener("click", () => {
      window.location.href = `https://dondenden.github.io/hudarogu/src/student_match_record.html${currentParams}`;
  });

  watchBtn.addEventListener("click", () => {
      window.location.href = `https://dondenden.github.io/hudarogu/src/student_match_view.html${currentParams}`;
  });
});