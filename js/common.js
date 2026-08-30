/* =========================================================
   二丁目町内会サイト 共通スクリプト
   ・背景のきらきら演出
   ・お知らせ/議事録データの保存・読込（localStorage）
   ・カードの描画
   ========================================================= */

const STORAGE_KEY = "nichome_chonaikai_entries_v1";

/* ---------- きらきら背景 ---------- */
function initSparkleField(count = 18){
  const field = document.querySelector(".sparkle-field");
  if(!field) return;
  for(let i = 0; i < count; i++){
    const s = document.createElement("span");
    const size = 6 + Math.random() * 10;
    s.style.width = size + "px";
    s.style.height = size + "px";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = 60 + Math.random() * 40 + "%";
    s.style.animationDuration = (7 + Math.random() * 8) + "s";
    s.style.animationDelay = (Math.random() * 8) + "s";
    field.appendChild(s);
  }
}

/* ---------- ナビの現在地ハイライト ---------- */
function markActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(a => {
    const href = a.getAttribute("href");
    if(href === path){ a.classList.add("is-active"); }
  });
}

/* ---------- データ入出力 ---------- */
function loadEntries(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error("読み込みに失敗しました", e);
    return [];
  }
}

function saveEntries(entries){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function addEntry(entry){
  const entries = loadEntries();
  entry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  entries.unshift(entry);
  saveEntries(entries);
  return entry;
}

function deleteEntry(id){
  const entries = loadEntries().filter(e => e.id !== id);
  saveEntries(entries);
}

/* ---------- 日付整形 ---------- */
function formatDate(dateStr){
  if(!dateStr) return "";
  const d = new Date(dateStr);
  if(isNaN(d)) return dateStr;
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}

function escapeHTML(str = ""){
  return str.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

/* ---------- カードHTML生成 ---------- */
function renderCard(entry){
  const img = entry.image
    ? `<img class="notice-photo" src="${entry.image}" alt="${escapeHTML(entry.title)}の写真">`
    : `<div class="notice-photo" style="display:flex;align-items:center;justify-content:center;color:#b3a68a;font-size:13px;">画像なし</div>`;

  const badge = entry.type === "gijiroku" ? "議事録" : "お知らせ";

  return `
    <article class="notice-card">
      <div class="washi-tape"></div>
      ${img}
      <div class="notice-meta">
        <span class="badge">${badge}</span>
        <span>${formatDate(entry.date)}</span>
      </div>
      <h3>${escapeHTML(entry.title)}</h3>
      <p class="desc">${escapeHTML(entry.desc)}</p>
    </article>
  `;
}

/* ---------- 一覧の描画（type: "notice" | "gijiroku"） ---------- */
function renderBoard(containerSelector, type, emptyMessage){
  const el = document.querySelector(containerSelector);
  if(!el) return;
  const entries = loadEntries().filter(e => e.type === type)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  if(entries.length === 0){
    el.innerHTML = `<div class="empty-note"><span>📌</span>${emptyMessage}</div>`;
    return;
  }
  el.innerHTML = entries.map(renderCard).join("");
}

/* ---------- トップページ用：最新プレビュー ---------- */
function renderPreview(containerSelector, type, limit = 3, emptyMessage){
  const el = document.querySelector(containerSelector);
  if(!el) return;
  const entries = loadEntries().filter(e => e.type === type)
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);

  if(entries.length === 0){
    el.innerHTML = `<div class="empty-note"><span>📌</span>${emptyMessage}</div>`;
    return;
  }
  el.innerHTML = entries.map(renderCard).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initSparkleField();
  markActiveNav();
});
