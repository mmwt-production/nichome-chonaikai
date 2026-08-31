/**
 * 二丁目町内会 お問い合わせフォーム 連携スクリプト
 * ------------------------------------------------------------
 * 使い方は同じフォルダの GAS_SETUP.md を参照してください。
 *
 * 仕組み：
 * 1. お問い合わせフォーム(contact.html)から送信されたデータを doPost で受け取る
 * 2. 「問い合わせ一覧」シートに1行追記する（全件の履歴一覧）
 * 3. 「テンプレート」シートを複製して、1件ごとの専用シートを作成する
 *    （テンプレートは事前にA4縦にぴったり収まるよう作っておくと、
 *      複製されたシートにもそのページ設定がそのまま引き継がれます）
 * 4. 複製したシート内のプレースホルダー（{{お名前}} など）を
 *    実際の内容に置き換える
 * ------------------------------------------------------------
 */

// ▼▼ ここにスプレッドシートのIDを入力してください ▼▼
// スプレッドシートのURLの
// https://docs.google.com/spreadsheets/d/【ここの部分】/edit
// にある文字列をコピーします。
const SHEET_ID = "ここにスプレッドシートのIDを入力";

// シート名（変更した場合はここも合わせて変更してください）
const LOG_SHEET_NAME = "問い合わせ一覧";
const TEMPLATE_SHEET_NAME = "テンプレート";

/**
 * フォームから送信されたデータを受け取る本体処理
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const params = e.parameter;
    const now = new Date();
    const timestamp = Utilities.formatDate(now, "Asia/Tokyo", "yyyy/MM/dd HH:mm");

    const name = params.name || "";
    const contact = params.contact || "";
    const subject = params.subject || "";
    const message = params.message || "";

    // 1) 一覧シートへ追記（無ければ自動作成）
    let logSheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!logSheet) {
      logSheet = ss.insertSheet(LOG_SHEET_NAME);
      logSheet.appendRow(["受付日時", "お名前", "ご連絡先", "件名", "内容", "詳細シート名"]);
      logSheet.setFrozenRows(1);
    }

    // 2) 新しいシート名を採番（同じ日時に複数来ても重複しないようにする）
    const serial = Utilities.formatDate(now, "Asia/Tokyo", "yyyyMMdd_HHmmss");
    const newSheetName = "問い合わせ_" + serial;

    // 3) テンプレートシートを複製（ページ設定=A4縦なども一緒に複製されます）
    const template = ss.getSheetByName(TEMPLATE_SHEET_NAME);
    if (!template) {
      throw new Error("「" + TEMPLATE_SHEET_NAME + "」という名前のシートが見つかりません。先にテンプレートシートを作成してください。");
    }
    const newSheet = template.copyTo(ss).setName(newSheetName);

    // 4) プレースホルダーを実際の値に置き換える
    const replacements = {
      "{{受付日時}}": timestamp,
      "{{お名前}}": name,
      "{{連絡先}}": contact,
      "{{件名}}": subject,
      "{{内容}}": message
    };
    replacePlaceholders_(newSheet, replacements);

    // 5) 一覧シートに1行追記
    logSheet.appendRow([timestamp, name, contact, subject, message, newSheetName]);

    // 6) 新しいシートを一覧シートの隣（先頭付近）に移動
    ss.setActiveSheet(newSheet);
    ss.moveActiveSheet(2);

    return HtmlService.createHtmlOutput("<p>送信ありがとうございました。</p>");
  } catch (err) {
    return HtmlService.createHtmlOutput("<p>エラーが発生しました: " + err.message + "</p>");
  }
}

/**
 * シート内の全セルを走査して {{プレースホルダー}} を実際の値に置き換える
 */
function replacePlaceholders_(sheet, replacements) {
  const range = sheet.getDataRange();
  const values = range.getValues();

  for (let r = 0; r < values.length; r++) {
    for (let c = 0; c < values[r].length; c++) {
      let cell = values[r][c];
      if (typeof cell === "string" && cell.indexOf("{{") !== -1) {
        Object.keys(replacements).forEach(function (key) {
          if (cell.indexOf(key) !== -1) {
            cell = cell.split(key).join(replacements[key]);
          }
        });
        values[r][c] = cell;
      }
    }
  }
  range.setValues(values);
}

/**
 * ブラウザで直接このURLを開いたときの確認用（動作テストに使えます）
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(
    "二丁目町内会 お問い合わせ連携スクリプトは正常に動作しています。" +
    "このURLはフォームからのPOST専用です。"
  );
}
