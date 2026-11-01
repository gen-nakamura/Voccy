# Voccy：変更ブロックごとのコード解説

作成日：2026年11月1日。対象はオフライン版2.0.0、作業ブランチ `offline/windows-20261031` です。

「どのコードが何をするか」「なぜ変更したか」を後から追うための資料です。以下のファイル名は、配布したソースZIP内の `Voccy/` を基準にしています。関数名・設定名で検索すると該当箇所に移動できます。

## 1. 全体のつながり

旧版は「画面 → HTTPリクエスト → Express → SQLite」という構成でした。新版はHTTPを使わず、Electron内部のIPCで画面と保存処理をつなぎます。

```text
src/OfflineApp.vue       画面・入力・結果の表示
        ↓ window.voccy.add(...) など
electron/preload.cjs    画面に公開する操作を7つに限定
        ↓ ipcRenderer.invoke(...)
electron/main.cjs       送信元を確認して処理を振り分ける
        ↓
electron/database.cjs   入力検証・SQLiteへの保存
        ├─ dates.cjs      日時・復習結果・次回予定
        └─ records       登録・学習の履歴

electron/reminders.cjs  設定時刻に復習対象を調べ、main側へ通知を依頼
```

たとえば単語を保存すると、画面の `save()` → preloadの `add` → mainの `voccy:add` → DBの `add()` の順に進みます。成功してから画面の入力欄を空にします。

## 2. 起動・安全設定：electron/main.cjs

| ブロック／検索語 | 何をしているか | 変更理由 |
|---|---|---|
| `app.setName('voccy')` | 旧版と同じアプリ名を設定 | 既定のデータ保存先 `%APPDATA%\voccy` を引き継ぐため |
| `requestSingleInstanceLock` / `second-instance` | 同じ保存先での多重起動を防ぎ、既存ウィンドウを前面に出す | 複数の画面・通知タイマーが競合するのを防ぐため |
| `app.commandLine.appendSwitch` | Chromiumの背景通信、同期、コンポーネント更新などを抑止 | 単語学習に不要な通信を減らすため |
| `no-proxy-server` / `setProxy({ mode: 'direct' })` | Windowsのプロキシ自動検出を使わせない | 実行ログで検出したWPADの不要な名前解決を止めるため |
| `createWindow()` / `webPreferences` | Node統合を無効化し、contextIsolation・sandbox・webSecurityを有効化 | 画面側のJavaScriptがPCのファイルやNode機能を直接操作するのを防ぐため |
| `setWindowOpenHandler` / `will-navigate` / `will-attach-webview` | 新規ウィンドウ、別ページへの遷移、WebViewの追加を拒否 | ローカル学習画面から別の実行環境へ移動させないため |
| `loadFile(indexPath)` | 同梱したHTMLを開く | 実行時のWebサーバー・CDN・開発サーバーを不要にするため |
| `setPermissionRequestHandler` / `setPermissionCheckHandler` / `will-download` | 権限要求とダウンロードを拒否 | カメラ等の権限やダウンロードは、このアプリに不要なため |
| `webRequest.onBeforeRequest` | `dist/` 内の配布アセット以外のChromiumリクエストを遮断 | 外部サイトだけでなくlocalhostへの接続も不要にするため |
| `openDatabase(...)` → `createReminders(...)` → `createWindow()` | DBを準備してから通知・画面を起動 | DB準備前に画面が問い合わせる競合を避けるため |
| `ipcMain.handle(...)` | 7つの操作をDBの関数へ振り分ける | ExpressのAPIルートを内部通信へ置き換えるため |
| IPC内の `event.sender` / `senderFrame` / `indexURL` 比較 | 自分のウィンドウのメインフレームから来た要求か確認 | 別ウィンドウや別ページからの要求を受け付けないため |
| `changeSettings` 後の `reminders.schedule()` | 通知設定を変えた直後に予約を作り直す | 古い時刻・有効状態で通知し続けないため |
| `powerMonitor.on('resume', ...)` | スリープ復帰時に次の通知を計算し直す | スリープ前の待ち時間をそのまま使わないため |
| `catch(...)` / `will-quit` | 起動エラーを表示し、終了時にタイマーとDBを閉じる | 失敗したまま画面を動かしたり、処理を残したりしないため |

`main` は画面とDBの「受付・調整役」です。SQLや復習間隔の計算そのものは、別ファイルに分けています。

## 3. 画面に公開する操作：electron/preload.cjs

| ブロック | 何をしているか／理由 |
|---|---|
| `methods = [...]` | `list`・`quiz`・`add`・`edit`・`remove`・`review`・`changeSettings` のみ公開。任意の操作名は受け付けない |
| `contextBridge.exposeInMainWorld('voccy', ...)` | 画面に `window.voccy` という専用窓口を渡す。Electronの全機能や `ipcRenderer` 自体は渡さない |
| `ipcRenderer.invoke('voccy:...')` | mainへ要求を送り、結果を待つ。HTTP通信の代わり |
| `!result.ok` の場合の `throw` | mainのエラーを画面へ伝える。失敗を成功扱いして入力を消さないため |
| `Object.freeze` | 公開APIのオブジェクトを固定する。画面内での意図しない変更を抑えるためで、これ単独をセキュリティ境界にはしていない |

## 4. データ保存：electron/database.cjs

| ブロック／関数 | 何をしているか | 変更理由・注意点 |
|---|---|---|
| `require('node:sqlite')` | 更新済みNode内蔵のSQLiteを使用 | 旧native sqlite3依存をなくし、同梱Nodeと一緒に実行基盤を管理するため |
| `text()` / `id()` | 文字列の空白・長さ、IDの整数・範囲を確認 | 画面の検証だけを信用せず、保存直前にも不正入力を止めるため |
| `validateSettings()` | 通知時刻、件数、有効フラグを確認。重複時刻を除去 | 不正時刻・過大件数・有効なのに時刻なし、といった状態を防ぐため |
| `busy_timeout = 5000` | DBが一時的に使用中の場合、最大5秒待つ | 一瞬のロックですぐ失敗させないため |
| `foreign_keys = OFF` | 旧sqlite3と同じく外部キー強制を無効化 | 単語を削除しても、そのIDの過去の学習履歴を残す互換性のため。参照先が消えた履歴は残り得る |
| `openDatabase()` 内の `backup(...)` | 既存DBをスキーマ処理前にバックアップ | 単純なファイルコピーと違い、WAL内のコミット済み内容も含めるため |
| `PRAGMA integrity_check` | バックアップと元DBの整合性を検査 | 壊れたDBをそのまま処理しないため。失敗したら起動を中止 |
| `CREATE TABLE IF NOT EXISTS` | 旧版と同じ4テーブルを、存在しない場合だけ作成 | 既存テーブルやIDを消さないため |
| `INSERT OR IGNORE INTO settings` | 初期設定がない場合だけ追加 | 既存の通知設定を上書きしないため。サンプル単語の再挿入はしない |
| `run` / `get` / `all` | SQL実行、1件取得、複数件取得の共通処理 | 同じSQLite呼び出しを各操作で繰り返さないため。値は `?` に渡し、SQL文字列へ直接連結しない |
| `transaction()` | `BEGIN IMMEDIATE` → 処理 → `COMMIT`、失敗時は `ROLLBACK` | 単語だけ保存されて履歴が保存されない、といった途中状態を避けるため |
| `card()` / `settings()` / `log()` | 対象単語の取得、設定の取得、履歴の記録 | 取得・不存在の確認・履歴形式を共通化するため |
| `list()` | ID順の単語一覧と設定を返す | 一覧画面の初期データをまとめて渡すため |
| `quiz()` | 未習得かつ期限到来済みの単語を、期限順・上限件数付きで取得 | ローカル日時とSQLiteのUTCを混ぜた旧比較を修正。期限と同じ分も `<=` で対象にする |
| `add()` | 質問・回答、最初の復習予定、登録履歴をまとめて保存 | 登録の完全性を保ち、新しいIDをDBに発行させるため |
| `edit()` | 質問と回答だけ更新 | 画面から渡された学習結果・期限で履歴を上書きしないため |
| `remove()` | 対象単語を削除し、過去のrecordsは残す | 単語の削除と履歴の削除を混同しないため |
| `review()` | 現在のDB状態を確認し、今回の結果・次回予定・学習履歴をまとめて更新 | 履歴や日時を画面任せにせず、main側で決定するため |
| `expected_previous` 等の比較 | 画面が見ていた結果・日時とDBを比較 | 更新前の古い画面からの回答を検出する補助。日時は分単位なので、あらゆる重複送信を一意に識別する仕組みではない。画面側のbusy制御も併用 |
| `changeSettings()` | 検証済みの設定だけ更新 | 設定変更時に全単語の期限を再ランダム化する旧処理をやめ、既存予定を保持するため |

## 5. 日時・復習判定：electron/dates.cjs

| 関数 | 処理と理由 |
|---|---|
| `formatLocal()` | PCのローカル日時を旧形式 `YYYY-MM-DD HH:mm` に整形。既存DBと同じ形式で比較するため |
| `parseLocal()` | 年月日時分を明示してDateを生成し、整形し直して元と一致するか確認。2月30日などが自動補正されて通るのを防ぐ |
| `nextTimestamp()` | 前回・今回の結果から基準日数を選び、従来の0.5倍係数と0.8〜1.3倍のばらつきを適用。経過時間を加えて次回予定を返す。doneなら予定なしの `null` |
| `reviewResult()` | 今回cross/circle/checkのいずれかを受け取り、今回もcheckで過去2回もcheckの場合だけdoneを返す |

習得済み判定の重要部分は次です。

```js
return result === 'check'
  && card.previous_result === 'check'
  && card.latest_result === 'check'
  ? 'done'
  : result;
```

旧版は過去2回のcheckだけで判定していたため、今回不正解でもdoneになり得ました。先頭の `result === 'check'` が今回の回答を確認する条件です。

日時は互換性のため「ローカルの壁時計時刻」のままです。旧データにはタイムゾーンがないので、推測でUTCへ書き換えていません。復習間隔は経過時間、日々の通知は指定したローカル時刻を基準にするため、夏時間切替日の扱いはそれぞれ異なります。

## 6. 通知予約：electron/reminders.cjs

| ブロック／関数 | 処理と理由 |
|---|---|
| `nextDelay()` | 今日の通知候補を計算し、過ぎていれば翌日へ送り、最も近い候補までの待ち時間を返す |
| `let timer = null` | 実際のタイマーハンドルを保持。旧版のように環境変数へ文字列として格納しない |
| `stop()` | タイマーを解除し、世代番号 `generation` を進める |
| `schedule()` の先頭 `stop()` | 新しい予約の前に古い予約を解除。通知タイマーが増殖しないようにする |
| 設定検証・`remind_enabled` 判定 | 旧データの不正な設定や通知無効の場合は予約しない。空配列などで即時ループしないため |
| `token !== generation` | 設定変更前の古いコールバックなら処理を中止。解除と発火が重なった場合にも備える |
| タイマー内の設定再取得・`database.quiz()` | 発火時点で有効か、対象の単語があるかを再確認。対象がある場合だけmainへ通知を依頼 |
| 発火後の `schedule()` | 次の通知を1回だけ予約。古い世代から予約を復活させない |

通知はアプリが起動している間だけ動作します。バックグラウンド常駐サービスやOSへの永続タスク登録は追加していません。

## 7. 画面：src/OfflineApp.vue / src/renderer.js

| ブロック | 処理と理由 |
|---|---|
| `ref()` | 入力、一覧、画面、復習位置、編集中データなどを保持。値が変わるとVueが表示を更新 |
| `computed(active / filtered)` | 現在の復習カードと検索結果を算出。検索は質問・回答の部分一致で、英字の大小文字を区別しない |
| `act(fn)` | 処理中フラグ、成功・エラー表示を共通管理。処理中の連打を抑え、finallyで必ず操作可能へ戻す |
| `load()` / `navigate()` | IPCで一覧や復習対象を取得して画面を切り替える。HTTPリクエストは使わない |
| `save()` | 保存完了後だけ入力を空にする。保存失敗時に入力内容を失わないため |
| `review()` | 選んだ回答と画面が見ている状態を送信。保存成功後にだけ次のカードへ進む |
| `editing = { ...c }` / `edit()` | 編集用コピーを作り、確定時に保存。キャンセルでDBや元データを書き換えないため |
| `remove()` | 確認ダイアログで承諾した場合のみ削除を依頼し、一覧を再取得 |
| `saveSettings()` | 通知・件数設定を送信し、mainが受理した設定を表示に戻す |
| `<template>` / `{{ ... }}` | 登録・復習・一覧・設定を描画。入力されたHTML風文字列を生HTMLとして実行せず、文字として表示 |
| `<style>` | 画面、表、入力欄、ボタンの見た目をローカルCSSで定義。外部CSSやアイコンCDNを不要にする |
| `src/renderer.js` | VueアプリをHTMLの `#app` に取り付ける起点 |

旧4画面部品はこの1ファイルへ整理しました。外部AIによる自動回答生成と更新情報ダイアログは撤去し、通常の単語学習機能は維持しています。

## 8. HTML・ビルド・依存設定

| ファイル／設定ブロック | 役割と変更理由 |
|---|---|
| `index.html` のCSP | `script-src 'self'` で同梱スクリプトだけ、`connect-src 'none'` で画面の通信を禁止。ほかにもフレーム・フォーム送信等を制限 |
| `vite.config.mjs` の `base: './'` | 同梱ファイルを相対パスで参照し、HTTPサーバーなしで開けるようにする |
| `publicDir: false` / `sourcemap: false` | 旧public内の不要ファイルを自動同梱しない。配布用ソースマップは生成しない |
| `package.json` の `main` / `scripts` | Electronの新起点を指定。ビルド・lint・テストを用意し、配布ビルドは `--publish never` に固定 |
| `devDependencies` / `engines` / `.nvmrc` | 使用する修正版ツールと開発用Node/npmを指定。実行時は同梱Electronを使い、利用者のNode/npmは不要 |
| `overrides` | minimatch、asar、glob、dir-compareを監査で指摘された問題への対応版へ指定。実ビルドで互換性を確認 |
| `build.files` / `asar` | 配布対象をdist、Electron処理、アイコン、package.jsonに限定し、アーカイブへまとめる |
| `publish: null` | 自動公開先を設定しない。実行時の自動更新機能も別途撤去済み |
| `nsis.deleteAppDataOnUninstall: false` | アンインストールしても学習DBを消さない。実機試験でDBのハッシュ不変を確認 |
| `win.signAndEditExecutable: false` | 今回は署名とEXE資源編集を省略。配布物は未署名で、会社への配布時は署名・許可運用の検討が残る |
| `package-lock.json` | 正確な依存ツリーと整合性情報を固定。大量の差分は主に旧ビルド基盤と通信依存の撤去、修正版への解決し直しによるもの |
| `eslint.config.mjs` | Vueの基本規則と未使用変数・未定義参照を検査。生成物、依存、テスト証跡は検査対象外 |
| `.gitignore` | DB、依存、生成物、キャッシュ、実機証跡をGitへ混入させない |
| `src/build/icon.png` | PNGという名前で中身がJPEGだった既存画像を、内容を変えずPNGへ再エンコード。インストーラー生成エラーへの対応 |

Vueはビルド時の依存に置いていますが、生成した画面JSにはVueの実行コードが入ります。「実行時npm依存なし」は「Vueのコードも一切入っていない」という意味ではありません。

## 9. 削除した旧コードと移行先

| 旧ファイル | 削除・置き換えの理由／移行先 |
|---|---|
| `src/background.js` | 自動更新・拡張ダウンロード・Express起動・axiosを撤去。起動処理は `electron/main.cjs` へ |
| `src/server/server.js` | ExpressのAPIとCORSを廃止。固定IPCハンドラーへ |
| `src/server/api.js` / `chatGPTcommands.md` | ChatGPT APIとそのプロンプトをオフライン要件により撤去 |
| `src/server/db.js` | 新DB層へ。旧テスト用DROP TABLE処理も配布コードから除去 |
| `src/server/logic.js` / `notify.js` | 日時・復習は `dates.cjs`、通知は `reminders.cjs` へ |
| `src/server/test.js` | 旧テスト補助を撤去し、一時DBを使う独立テストへ |
| `src/server/releaseNotes.js` | 更新情報ダイアログの撤去に伴い不要化。既存notified_versionsテーブルは互換性のため残す |
| `src/App.vue` / `src/components/*.vue` / `src/main.js` | 新しいローカル画面とrenderer.jsへ整理 |
| `public/index.html` | 外部Bootstrap・Font AwesomeのCDN参照を含む旧HTMLを撤去。新index.htmlへ |
| `vue.config.js` / `babel.config.js` | Vue CLI/webpackからViteへ移行し、旧ビルド設定を撤去 |

## 10. テストと説明資料の追加

| ファイル／ブロック | 役割 |
|---|---|
| `tests/core.test.cjs` | 習得判定、日時、CRUD・履歴、旧スキーマ/WALバックアップ、設定検証、タイマー管理を一時DB・模擬タイマーで検証 |
| `tests/electron-smoke.cjs` | 実Electronの隔離された画面・IPC・DBをまとめて検証。専用プロファイルを使い、画面画像・結果・通信ログを保存 |
| 受入試験スクリプト（証跡ZIP内） | 最終配布EXE・導入版を実際に起動し、画面操作、再起動、実時刻通知などを検証。製品へは同梱しない |
| 証跡・梱包スクリプト | ZIP作成とSHA-256生成の作業用コード。アプリ機能とは別のもの |
| `README.md` と各報告書 | 保存先、バックアップ、ビルド手順、検証結果、未確認事項を記録。実行動作を変更しない |

今回この資料を追加するために、製品の動作コードは変更していません。インストーラーとポータブル版の再ビルドも不要です。

## 読む順番の目安

全体を把握するなら、本書の1 → 2 → 3 → 4の順がおすすめです。復習の仕様を知りたいときは5、通知の重複対策なら6、ボタンを押してから保存されるまでを追いたいときは7 → 3 → 2 → 4を読むとつながります。
