import {
    ensureSettings, loadBuiltinHolidays, saveSettings,
    loadSettings, exportAll, importAll,
    storageSupported
  } from './app.js';

  const $ = (id)=>document.getElementById(id);
  const els = {
    storageBadge: $('storageBadge'),
    hqAdd: $('hqAdd'),
    hqAddBtn: $('hqAddBtn'),
    hqList: $('hqList'),
    dcMonth: $('dcMonth'),
    dcAdd: $('dcAdd'),
    dcAddBtn: $('dcAddBtn'),
    dcCal: $('dcCal'),
    dcList: $('dcList'),
    dcClearBtn: $('dcClearBtn'),
    dcCopyBtn: $('dcCopyBtn'),
    keepManual: $('keepManual'),
    garageDefault: $('garageDefault'),
    btnExport: $('btnExport'),
    fileImport: $('fileImport'),
  };

  let settings = await ensureSettings();
  const builtin = await loadBuiltinHolidays();
  settings.holidays = builtin;
  await saveSettings(settings);

  els.storageBadge.textContent = (await storageSupported()) ? '保存先: IndexedDB' : '保存先: localStorage（簡易）';

  function renderHQ(){
    const arr = (settings.hqNonWorkingDates||[]).slice().sort();
    els.hqList.innerHTML = arr.length ? arr.map(d=>
      `<span class="badge">${d} <button data-d="${d}" class="btn ghost" style="padding:2px 6px;">×</button></span>`
    ).join(' ') : '未設定';
    els.hqList.querySelectorAll('button[data-d]').forEach(b=>{
      b.onclick = async ()=>{
        const d = b.getAttribute('data-d');
        settings.hqNonWorkingDates = (settings.hqNonWorkingDates||[]).filter(x=>x!==d);
        await saveSettings(settings);
        renderHQ();
      };
    });
  }

function getClosedSetForMonth(ym){
  settings.dcNonWorkingByMonth = settings.dcNonWorkingByMonth || {};
  const arr = settings.dcNonWorkingByMonth[ym] || [];
  return new Set(arr);
}

function setClosedSetForMonth(ym, set){
  settings.dcNonWorkingByMonth = settings.dcNonWorkingByMonth || {};
  settings.dcNonWorkingByMonth[ym] = Array.from(set).sort();
}

function buildMonthGrid(ym){
  const [y,m] = ym.split('-').map(Number);
  const first = new Date(y, m-1, 1);
  const last = new Date(y, m, 0);
  const startW = first.getDay(); // 0..6
  const days = last.getDate();
  const cells = [];
  for(let i=0;i<startW;i++) cells.push(null);
  for(let d=1; d<=days; d++) cells.push(new Date(y, m-1, d));
  while(cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function renderDC(){
  const ym = els.dcMonth.value;
  if(!ym){
    els.dcList.textContent = '対象月を選んでください';
    els.dcCal.innerHTML = '';
    return;
  }

  const closed = getClosedSetForMonth(ym);

  // List
  const arr = Array.from(closed).slice().sort();
  els.dcList.innerHTML = arr.length ? arr.map(d=>
    `<span class="badge">${d} <button data-d="${d}" class="btn ghost" style="padding:2px 6px;">×</button></span>`
  ).join(' ') : '未設定';

  els.dcList.querySelectorAll('button[data-d]').forEach(b=>{
    b.onclick = async ()=>{
      const d = b.getAttribute('data-d');
      closed.delete(d);
      setClosedSetForMonth(ym, closed);
      await saveSettings(settings);
      renderDC();
    };
  });

  // Calendar
  const week = ['日','月','火','水','木','金','土'];
  const cells = buildMonthGrid(ym);
  const today = new Date(); today.setHours(0,0,0,0);

  const head = `<div class="mini-cal-head">` + week.map(w=>`<div class="mini-cal-w">${w}</div>`).join('') + `</div>`;
  const body = `<div class="mini-cal-grid">` + cells.map(dt=>{
    if(!dt) return `<div class="mini-cal-cell empty"></div>`;
    const iso = dt.toISOString().slice(0,10);
    const isClosed = closed.has(iso);
    const isToday = dt.getTime()===today.getTime();
    const cls = ['mini-cal-cell', isClosed?'closed':'', isToday?'today':''].filter(Boolean).join(' ');
    const badge = isClosed ? '<span class="mini-cal-badge">休</span>' : '';
    return `<button type="button" class="${cls}" data-iso="${iso}"><div class="n">${dt.getDate()}</div>${badge}</button>`;
  }).join('') + `</div>`;

  els.dcCal.innerHTML = head + body;

  els.dcCal.querySelectorAll('button[data-iso]').forEach(btn=>{
    btn.onclick = async ()=>{
      const iso = btn.getAttribute('data-iso');
      if(closed.has(iso)) closed.delete(iso); else closed.add(iso);
      setClosedSetForMonth(ym, closed);
      await saveSettings(settings);
      renderDC();
    };
  });
}

// initial form

  els.keepManual.value = String(!!settings.keepManualOverrideOnRecalc);
  els.garageDefault.value = settings.defaultGarageLeadBusinessDays ?? '';

  renderHQ();
  renderDC();

  els.hqAddBtn.onclick = async ()=>{
    const d = els.hqAdd.value;
    if(!d) return;
    settings.hqNonWorkingDates = Array.from(new Set([...(settings.hqNonWorkingDates||[]), d]));
    await saveSettings(settings);
    els.hqAdd.value='';
    renderHQ();
  };

    els.dcMonth.onchange = ()=>{
    // month選択時、追加日付の初期値もその月の1日に合わせる
    const ym = els.dcMonth.value;
    if(ym){
      els.dcAdd.value = `${ym}-01`;
    }
    renderDC();
  };

  els.dcAddBtn.onclick = async ()=>{
    const ym = els.dcMonth.value;
    const d = els.dcAdd.value;
    if(!ym || !d) return;
    const closed = getClosedSetForMonth(ym);
    closed.add(d);
    setClosedSetForMonth(ym, closed);
    await saveSettings(settings);
    renderDC();
  };

  els.dcClearBtn.onclick = async ()=>{
    const ym = els.dcMonth.value;
    if(!ym) return;
    if(!confirm('この月の休み設定をすべて削除します。よろしいですか？')) return;
    settings.dcNonWorkingByMonth = settings.dcNonWorkingByMonth || {};
    delete settings.dcNonWorkingByMonth[ym];
    await saveSettings(settings);
    renderDC();
  };

  els.dcCopyBtn.onclick = async ()=>{
    const ym = els.dcMonth.value;
    if(!ym) return;
    const arr = (settings.dcNonWorkingByMonth?.[ym]||[]).slice().sort();
    const text = arr.join('
');
    try{
      await navigator.clipboard.writeText(text);
      alert('コピーしました（Excelに貼り付けできます）');
    }catch{
      // fallback
      prompt('コピーしてください（Excelに貼り付けできます）', text);
    }
  };

    const cur = settings.dcNonWorkingByMonth[ym] || [];
    settings.dcNonWorkingByMonth[ym] = Array.from(new Set([...cur, d]));
    await saveSettings(settings);
    els.dcAdd.value='';
    renderDC();
  };

  els.keepManual.onchange = async ()=>{
    settings.keepManualOverrideOnRecalc = els.keepManual.value === 'true';
    await saveSettings(settings);
  };

  els.garageDefault.onchange = async ()=>{
    const v = els.garageDefault.value;
    settings.defaultGarageLeadBusinessDays = v ? Number(v) : null;
    await saveSettings(settings);
  };

  els.btnExport.onclick = async ()=>{
    const payload = await exportAll();
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-task-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  els.fileImport.onchange = async ()=>{
    const file = els.fileImport.files?.[0];
    if(!file) return;
    const text = await file.text();
    let payload;
    try{ payload = JSON.parse(text); }catch{ alert('JSONの形式が不正です'); return; }
    await importAll(payload);
    settings = await loadSettings();
    alert('インポートしました（既存データに追加/上書き）');
    renderHQ();
    renderDC();
  };
