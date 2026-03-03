import {
    ensureSettings, loadBuiltinHolidays, saveSettings,
    loadAllCases, classifyDue,
    storageSupported
  } from './app.js';

  const $ = (id)=>document.getElementById(id);
  const els = {
    storageBadge: $('storageBadge'),
    prev: $('prev'),
    next: $('next'),
    month: $('month'),
    viewFilter: $('viewFilter'),
    grid: $('grid'),
  };

  let settings = await ensureSettings();
  settings.holidays = await loadBuiltinHolidays();
  await saveSettings(settings);

  els.storageBadge.textContent = (await storageSupported()) ? '保存先: IndexedDB' : '保存先: localStorage（簡易）';

  let cases = await loadAllCases();

  function ymNow(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }

  els.month.value = ymNow();

  function buildEvents(){
    const f = els.viewFilter.value;
    const events = [];
    cases.forEach(c=>{
      // Registration milestone (hide if marked complete)
      const regISO = c.derived?.regDateAuto || c.regDate || c.derived?.regPlannedDate;
      if(regISO && !c.regDone){
        events.push({
          date: regISO,
          title: `${c.orderNo||''} 登録日`,
          caseId: c.id,
          urgency: classifyDue(regISO),
          key: '__reg__'
        });
      }
      (c.tasks||[]).forEach(t=>{
        if(!t.dueDate) return;
        if(t.done) return;
                if(f==='important'){
          // show only auto-derived key deadlines + uncompleted
          const importantKeys = new Set(['__reg__','dc_docs_submit','loan_paper_submit','payment_check_thanks','garage_cert_submit']);
          if(!importantKeys.has(t.key)) return;
        }
        events.push({
          date: t.dueDate,
          title: `${c.orderNo||''} ${t.title}`,
          caseId: c.id,
          urgency: classifyDue(t.dueDate)
        });
      });
    });
    return events;
  }

  function render(){
    const ym = els.month.value;
    if(!ym) return;
    const [Y,M] = ym.split('-').map(Number);
    const first = new Date(Y, M-1, 1);
    const start = new Date(first);
    // align to Sunday
    start.setDate(first.getDate() - first.getDay());

    const events = buildEvents();
    const byDate = new Map();
    events.forEach(e=>{
      if(!byDate.has(e.date)) byDate.set(e.date, []);
      byDate.get(e.date).push(e);
    });

    els.grid.innerHTML='';
    // 6 weeks
    for(let i=0;i<42;i++){
      const d = new Date(start);
      d.setDate(start.getDate()+i);
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

      const cell = document.createElement('div');
      cell.className = 'day';
      cell.innerHTML = `<div class="num">${d.getDate()}</div>`;

      const evs = (byDate.get(iso)||[]).slice().sort((a,b)=>a.title.localeCompare(b.title));
      evs.slice(0,5).forEach(e=>{
        const div = document.createElement('div');
        div.className = 'event ' + (e.urgency==='overdue'?'urgent': e.urgency==='soon'?'soon':'');
        div.textContent = e.title;
        div.onclick = ()=>{
          // navigate to main with hash caseId
          location.href = `./index.html#case=${encodeURIComponent(e.caseId)}`;
        };
        cell.appendChild(div);
      });
      if(evs.length>5){
        const more = document.createElement('div');
        more.className='small';
        more.style.marginTop='6px';
        more.textContent = `ほか ${evs.length-5}件`;
        cell.appendChild(more);
      }

      els.grid.appendChild(cell);
    }
  }

  function shiftMonth(delta){
    const ym = els.month.value;
    const [y,m] = ym.split('-').map(Number);
    const d = new Date(y, m-1+delta, 1);
    els.month.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    render();
  }

  els.prev.onclick = ()=>shiftMonth(-1);
  els.next.onclick = ()=>shiftMonth(1);
  els.month.onchange = render;
  els.viewFilter.onchange = render;

  render();
