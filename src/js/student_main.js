const currentParams = window.location.search; // 現在のURLパラメータを取得

document.getElementById("teacher").addEventListener("click", () => {
    // teacher_hub にパラメータを引き継ぐ
    window.location.href = `https://dondenden.github.io/hudarogu/src/teacher_hub${currentParams}`;
});

document.getElementById("student").addEventListener("click", () => {
    // student_hub にパラメータを引き継ぐ
    window.location.href = `https://dondenden.github.io/hudarogu/src/student_hub${currentParams}`;
});