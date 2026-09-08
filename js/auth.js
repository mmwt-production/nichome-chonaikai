/* =========================================================
   投稿・管理ページ専用スクリプト
   ・簡易パスワードロック（この用途向けの簡易的な仕組みです。
     本格的な会員管理が必要な場合はサーバー側の認証をご検討ください）
   ・お知らせ／議事録の投稿・削除
   ========================================================= */

/* ▼▼ ここを書き換えると合言葉を変更できます ▼▼ */
const ADMIN_PASSWORD = "nichome2024";
/* ▲▲ ここを書き換えると合言葉を変更できます ▲▲ */

const SESSION_KEY = "chonaikai_admin_unlocked";

function isUnlocked(){
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function unlock(){
  sessionStorage.setItem(SESSION_KEY, "1");
}

function lock(){
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}

function showToast(msg){
  const t = document.querySelector(".toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function readFileAsDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderAdminList(){
  const list = document.querySelector("#admin-entry-list");
  if(!list) return;
  const entries = loadEntries().sort((a,b) => new Date(b.date) - new Date(a.date));

  if(entries.length === 0){
    list.innerHTML = `<p style="color:#8a7c60;font-size:13.5px;">まだ投稿がありません。上のフォームから最初のお知らせや議事録を投稿してみましょう。</p>`;
    return;
  }

  list.innerHTML = entries.map(e => `
    <div class="entry-row" data-id="${e.id}">
      ${e.image ? `<img src="${e.image}" alt="">` : `<div style="width:76px;height:76px;background:#eee2cc;border-radius:8px;flex:none;"></div>`}
      <div class="info">
        <h4>${escapeHTML(e.title)} <span style="font-weight:400;color:#b3a68a;">（${e.type === "gijiroku" ? "議事録" : "お知らせ"}）</span></h4>
        <p>${formatDate(e.date)}</p>
      </div>
      <button class="del-btn" data-id="${e.id}">削除</button>
    </div>
  `).join("");

  list.querySelectorAll(".del-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if(confirm("この投稿を削除します。よろしいですか？")){
        deleteEntry(btn.dataset.id);
        renderAdminList();
        showToast("削除しました");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const lockScreen = document.querySelector("#lock-screen");
  const adminArea = document.querySelector("#admin-area");
  const loginForm = document.querySelector("#login-form");
  const errorMsg = document.querySelector("#login-error");
  const postForm = document.querySelector("#post-form");
  const logoutBtn = document.querySelector("#logout-btn");
  const fileInput = document.querySelector("#img-input");
  const preview = document.querySelector("#img-preview");
  const dateInput = document.querySelector("#date-input");

  function showAdmin(){
    lockScreen.style.display = "none";
    adminArea.style.display = "block";
    renderAdminList();
  }

  if(isUnlocked()){
    showAdmin();
  }

  if(loginForm){
    loginForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const value = document.querySelector("#password-input").value;
      if(value === ADMIN_PASSWORD){
        unlock();
        errorMsg.textContent = "";
        showAdmin();
      }else{
        errorMsg.textContent = "合言葉が違うようです。もう一度お試しください。";
      }
    });
  }

  if(logoutBtn){
    logoutBtn.addEventListener("click", lock);
  }

  if(dateInput && !dateInput.value){
    dateInput.value = new Date().toISOString().slice(0,10);
  }

  if(fileInput){
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if(!file) return;
      const dataURL = await readFileAsDataURL(file);
      preview.innerHTML = `<img src="${dataURL}" alt="プレビュー" style="width:100%;border-radius:8px;">`;
      fileInput.dataset.dataUrl = dataURL;
    });
  }

  if(postForm){
    postForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const type = document.querySelector("#type-input").value;
      const title = document.querySelector("#title-input").value.trim();
      const date = dateInput.value;
      const desc = document.querySelector("#desc-input").value.trim();
      const dataUrl = fileInput.dataset.dataUrl || "";

      if(!title || !desc){
        showToast("タイトルと説明文を入力してください");
        return;
      }

      addEntry({ type, title, date, desc, image: dataUrl });
      postForm.reset();
      dateInput.value = new Date().toISOString().slice(0,10);
      preview.innerHTML = "";
      delete fileInput.dataset.dataUrl;
      renderAdminList();
      showToast("投稿しました！");
    });
  }
});
