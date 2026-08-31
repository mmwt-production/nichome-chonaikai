/* =========================================================
   お問い合わせページ専用スクリプト
   ・フォームの内容を Google Apps Script(GAS) の Web アプリへ送信
   ・送信は「隠しiframeへのフォーム送信」という昔ながらの方式を使うことで、
     ブラウザのCORS制限に引っかからずに送信できるようにしています
   ========================================================= */

/* ▼▼ ここをご自身のGAS WebアプリのURLに書き換えてください ▼▼ */
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwMw7k7QsyQW8t-t_N0jNy653vS81d209SmLFmULXDp38GzcromT-aXNL3w1l1wdn4K/exec";
/* ▲▲ ここをご自身のGAS WebアプリのURLに書き換えてください ▲▲ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  const iframe = document.querySelector("#hidden_iframe");
  const formWrap = document.querySelector("#form-wrap");
  const successPanel = document.querySelector("#success-panel");
  const configWarning = document.querySelector("#config-warning");
  let submitted = false;

  if(!form) return;

  form.setAttribute("action", GAS_WEB_APP_URL);

  if(!GAS_WEB_APP_URL || GAS_WEB_APP_URL.indexOf("ここに") !== -1){
    if(configWarning) configWarning.style.display = "block";
  }

  form.addEventListener("submit", () => {
    submitted = true;
  });

  iframe.addEventListener("load", () => {
    if(!submitted) return; // 初回の空読み込みは無視
    formWrap.style.display = "none";
    successPanel.style.display = "block";
  });
});
