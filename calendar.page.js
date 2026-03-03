<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>カレンダー</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
<header>
  <div class="left">
    <h1>カレンダー（タスク期限）</h1>
    <span id="storageBadge" class="badge">保存先: 判定中…</span>
  </div>
  <nav>
    <a class="btn" href="./index.html">メイン</a>
    <a class="btn" href="./settings.html">設定/バックアップ</a>
  </nav>
</header>

<main style="grid-template-columns: 1fr;">
  <section class="panel">
    <div class="calendar">
      <div class="cal-head">
        <div class="row">
          <button id="prev" class="btn">←</button>
          <input id="month" type="month" />
          <button id="next" class="btn">→</button>
        </div>
        <div class="row wrap">
          <select id="viewFilter">
            <option value="all">すべて</option>
            <option value="uncompleted">未完了のみ</option>
            <option value="important">重要期限（自動算出＋未完了）</option>
          </select>
          <span class="small">クリックすると案件を開きます（メインへ移動）</span>
        </div>
      </div>

      <div class="cal-grid" id="grid"></div>
    </div>
  </section>
</main>

<script type="module" src="./calendar.page.js"></script>
</body>
</html>
