// Firebase v12 SDK の読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDL9CzmI06XvMnq4EfpOT8NL9qYsK5lNVQ",
  authDomain: "karuta-hudarogu.firebaseapp.com",
  projectId: "karuta-hudarogu",
  storageBucket: "karuta-hudarogu.firebasestorage.app",
  messagingSenderId: "525208021622",
  appId: "1:525208021622:web:0933511140a811cc9b8d57",
  measurementId: "G-WFWKJT470E"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// URLパラメータから学校名取得
const urlParams = new URLSearchParams(window.location.search);
const schoolName = urlParams.get("school");

if (!schoolName) {
  alert("学校名がURLパラメータに指定されていません");
  throw new Error("学校名がURLパラメータに指定されていません");
}

// schoolIdを取得して表示
async function loadSchoolId() {
  try {
    const initDocRef = doc(db, schoolName, "_init");
    const initDocSnap = await getDoc(initDocRef);

    if (initDocSnap.exists()) {
      const data = initDocSnap.data();
      document.getElementById("schoolId").textContent = data.schoolId || "(未設定)";
    } else {
      document.getElementById("schoolId").textContent = "(未登録)";
    }
  } catch (err) {
    console.error("schoolId取得エラー:", err);
    document.getElementById("schoolId").textContent = "(取得失敗)";
  }
}

// 認証チェック
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    userInfo.textContent = `${user.displayName} さんでログイン中`;
    logoutBtn.style.display = "inline";
    loadSchoolId();
  } else {
    alert("ログインが必要です");
    window.location.href =
      "https://dondenden.github.io/kanadon-karuta/implement/teach_index.html";
  }
});

// ログアウト処理
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href =
    "https://dondenden.github.io/kanadon-karuta/implement/teach_index.html";
});

// 戻るボタン
document.getElementById("backBtn").addEventListener("click", () => {
  history.back();
});

// 名前一覧のリアルタイム取得
document.addEventListener("DOMContentLoaded", () => {
  const nameList = document.getElementById("nameList");

  onSnapshot(collection(db, schoolName), (snapshot) => {
    nameList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      if (docSnap.id.endsWith("_init")) return;

      const li = document.createElement("li");
      const nameSpan = document.createElement("span");
      nameSpan.textContent = docSnap.id;
      li.appendChild(nameSpan);

      const delBtn = document.createElement("button");
      delBtn.textContent = "削除";
      delBtn.style.marginLeft = "10px";
      delBtn.addEventListener("click", async () => {
        if (confirm(`「${docSnap.id}」を削除しますか？`)) {
          await deleteDoc(doc(db, schoolName, docSnap.id));
        }
      });
      li.appendChild(delBtn);

      nameList.appendChild(li);
    });
  });

  // 名前追加
  document.getElementById("saveBtn").addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    if (!name) return alert("名前を入力してください");
    if (/[\/\[\]\*\#\?]/.test(name)) {
      alert("名前に / [ ] * # ? は使えません");
      return;
    }
    await setDoc(doc(db, schoolName, name), {
      createdAt: serverTimestamp(),
      note: "初期ドキュメント"
    });
    document.getElementById("name").value = "";
  });
});

// 学校全削除ボタン（学校ID確認付き）
document.getElementById("deleteSchoolBtn").addEventListener("click", async () => {
  try {
    const initDocRef = doc(db, schoolName, "_init");
    const initDocSnap = await getDoc(initDocRef);

    if (!initDocSnap.exists()) {
      alert("この学校は存在しません");
      return;
    }

    const data = initDocSnap.data();
    const correctSchoolId = data.schoolId;

    const enteredId = prompt(`削除確認のため、学校IDを入力してください（${schoolName}）:`);
    if (enteredId === null) return;

    if (enteredId !== correctSchoolId) {
      alert("学校IDが一致しません。削除できません。");
      return;
    }

    if (!confirm(`学校「${schoolName}」の全データを削除します。よろしいですか？`)) return;

    const colRef = collection(db, schoolName);
    const snapshot = await getDocs(colRef);

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, schoolName, docSnap.id));
    }

    alert(`学校「${schoolName}」のデータを削除しました`);
    window.location.href =
      "https://dondenden.github.io/kanadon-karuta/implement/teach_index.html";
  } catch (err) {
    console.error("削除エラー:", err);
    alert("削除中にエラーが発生しました");
  }
});