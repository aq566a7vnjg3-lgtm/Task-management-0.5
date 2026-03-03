import {
    uuid, todayStr, fmtJP, weekdayJP, clampStr,
    ensureSettings, loadBuiltinHolidays, saveSettings,
    loadAllCases, saveCase, deleteCase,
    HOPE_NO_TYPES, TASK_DEFS,
    validateForGenerate, generateTasks,
    classifyDue, topDeadlines,
    storageSupported,
    parseISODate
  } from './app.js';

  const $ = (id)=>document.getElementById(id);
  const els = {
    storageBadge: $('storageBadge'),
    search: $('search'),
    filter: $('filter'),
    sort: $('sort'),
    newCase: $('newCase'),
    caseList: $('caseList'),
    listSummary: $('listSummary'),

    emptyState: $('emptyState'),
    form: $('form'),
    kpis: $('kpis'),
    topCards: $('topCards'),
    missingHint: $('missingHint'),

    btnGenerate: $('btnGenerate'),
    btnRecalc: $('btnRecalc'),
    btnDelete: $('btnDelete'),

    // fields
    orderNo: $('orderNo'),
    userName: $('userName'),
    tel: $('tel'),
    orderDate: $('orderDate'),
    carType: $('carType'),
    regMethod: $('regMethod'),
    regMethodHint: $('regMethodHint'),
    hopeNoType: $('hopeNoType'),
    deliveryPlace: $('deliveryPlace'),
    mode: $('mode'),
    factoryOutDate: $('factoryOutDate'),
    deliveryDate: $('deliveryDate'),
    deliveryTime: $('deliveryTime'),
    frameNo: $('frameNo'),
    hopeNo: $('hopeNo'),
    noteNo: $('noteNo'),
    tradeIn: $('tradeIn'),

    hqSubmitDate: $('hqSubmitDate'),
    docsCollectDate: $('docsCollectDate'),
    garageRequired: $('garageRequired'),
    garageDaysField: $('garageDaysField'),
    garageLeadBusinessDays: $('garageLeadBusinessDays'),
    hqArrivalDate: $('hqArrivalDate'),
    regPlannedDate: $('regPlannedDate'),
    regDate: $('regDate'),
    regDone: $('regDone'),

    dcReserved: $('dcReserved'),
    dcReserveAt: $('dcReserveAt'),
    dcDocsDueDate: $('dcDocsDueDate'),
    dcDocsSent: $('dcDocsSent'),
    dcDocsSentDate: $('dcDocsSentDate'),

    contractType: $('contractType'),
    paymentStartMonth: $('paymentStartMonth'),
    loanDueDate: $('loanDueDate'),

    debtExists: $('debtExists'),
    debtTransferRequested: $('debtTransferRequested'),

    insuranceType: $('insuranceType'),
    insuranceContact: $('insuranceContact'),

    taskBody: $('taskBody'),
    memo: $('memo'),
  };

  let settings = await ensureSettings();
  const builtin = await loadBuiltinHolidays();
  settings.holidays = builtin;
  await saveSettings(settings);

  els.storageBadge.textContent = (await storageSupported()) ? '保存先: IndexedDB' : '保存先: localStorage（簡易）';

  // populate select
  HOPE_NO_TYPES.forEach(v=>{
    const opt=document.createElement('option'); opt.value=v; opt.textContent=v;
    els.hopeNoType.appendChild(opt);
  });
  els.hopeNoType.insertAdjacentHTML('afterbegin','<option value="">選択</option>');

  let cases = await loadAllCases();
  let activeId = null;
  let activeCase = null;

  function nextDueISO(caseObj){
    const dueList = [];
    (caseObj.tasks||[]).forEach(t=>{ if(!t.done && t.dueDate) dueList.push(t.dueDate); });
    if(caseObj.deliveryDate) dueList.push(caseObj.deliveryDate);
    if(dueList.length===0) return null;
    dueList.sort();
    return dueList[0];
  }

  function bindCheckbox(el, key){
    el.onchange = async ()=>{
      if(!activeCase) return;
      activeCase[key] = !!el.checked;
      await persist();
      renderList();
      renderTopCards();
    };
  }

  function applySort(list){
    const s = els.sort.value;
    const arr = [...list];
    if(s==='updated'){
      arr.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    }else if(s==='delivery'){
      arr.sort((a,b)=>{
        const ad=a.deliveryDate||'9999-12-31';
        const bd=b.deliveryDate||'9999-12-31';
        return ad.localeCompare(bd);
      });
    }else if(s==='nextDue'){
      arr.sort((a,b)=>{
        const ad=nextDueISO(a)||'9999-12-31';
        const bd=nextDueISO(b)||'9999-12-31';
        return ad.localeCompare(bd);
      });
    }
    return arr;
  }  function applyFilter(list){
    const f = els.filter.value;
    if(f==='all') return list;
    if(f==='uncompleted') return list.filter(c=>(c.tasks||[]).some(t=>!t.done));
    if(f==='overdue') return list.filter(c=> (c.tasks||[]).some(t=>!t.done && classifyDue(t.dueDate)==='overdue'));
    if(f==='soon') return list.filter(c=> (c.tasks||[]).some(t=>!t.done && classifyDue(t.dueDate)==='soon'));
    return list;
  }  function applySearch(list){
    const q = (els.search.value||'').trim();
    if(!q) return list;
    const qq = q.toLowerCase();
    return list.filter(c=>{
      const hay = [c.orderNo,c.frameNo,c.hopeNo,c.userName].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(qq);
    });
  }  function renderList(){
    const base = applySearch(applyFilter(applySort(cases)));
    els.caseList.innerHTML='';

    // summary
    const overdueCount = cases.filter(c=> (c.tasks||[]).some(t=>!t.done && classifyDue(t.dueDate)==='overdue')).length;
    const soonCount = cases.filter(c=> (c.tasks||[]).some(t=>!t.done && classifyDue(t.dueDate)==='soon')).length;
    els.listSummary.innerHTML = `<strong>全${cases.length}件</strong> ／ 期限切れ <strong style="color:var(--danger)">${overdueCount}</strong> ／ 3日以内 <strong style="color:var(--warn)">${soonCount}</strong>`;

    if(base.length===0){
      els.caseList.innerHTML = `<div class="hint">該当する案件がありません。</div>`;
      return;
    }

    base.forEach(c=>{
      const div=document.createElement('div');
      div.className='case-item'+(c.id===activeId?' active':'');
      const nd = nextDueISO(c);
      const ndClass = classifyDue(nd);
      const badge = nd ? `<span class="badge ${ndClass==='overdue'?'danger':ndClass==='soon'?'warn':''}">${fmtJP(nd)}(${weekdayJP(nd)})</span>` : `<span class="badge">期限なし</span>`;
      div.innerHTML = `
        <div>
          <div class="title">${c.orderNo||'(未入力)'} <span class="small">${clampStr(c.userName||'',10)}</span></div>
          <div class="meta">登録: ${(()=>{if(c.regDone) return '-'; const r=c.derived?.regDateAuto||c.regDate||c.derived?.regPlannedDate; return r?`${fmtJP(r)}(${weekdayJP(r)})`:'-';})()} ／ 納車センター書類: ${(()=>{const done=(c.tasks||[]).find(t=>t.key==='dc_docs_submit')?.done; if(done) return '-'; const d=c.derived?.dcDocsDueDate; return d?`${fmtJP(d)}(${weekdayJP(d)})`:'-';})()} ／ 希望番号申請: ${(()=>{const t=(c.tasks||[]).find(x=>x.key==='hope_no_apply'); if(t?.done) return '-'; const h=(c.derived?.hopeNoApplyDueDate)||t?.dueDate; return h?`${fmtJP(h)}(${weekdayJP(h)})`:'-';})()}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          ${badge}
          <span class="small">更新: ${new Date(c.updatedAt||0).toLocaleDateString('ja-JP')}</span>
        </div>
      `;
      div.onclick=()=>selectCase(c.id);
      els.caseList.appendChild(div);
    });
  }  function setRegMethodRules(){
    if(els.carType.value==='軽' && els.regMethod.value==='OSS'){
      els.regMethodHint.textContent='軽自動車はOSS不可のため「書類代行」に変更してください。';
      els.regMethodHint.style.color='var(--danger)';
    }else{
      els.regMethodHint.textContent='';
      els.regMethodHint.style.color='';
    }
  }  function renderKpis(){
    if(!activeCase){ els.kpis.innerHTML=''; return; }
    const overdue = (activeCase.tasks||[]).filter(t=>!t.done && classifyDue(t.dueDate)==='overdue').length;
    const soon = (activeCase.tasks||[]).filter(t=>!t.done && classifyDue(t.dueDate)==='soon').length;
    const unDone = (activeCase.tasks||[]).filter(t=>!t.done).length;
    els.kpis.innerHTML = `
      <span class="badge">未完了: <strong>${unDone}</strong></span>
      <span class="badge danger">期限切れ: <strong>${overdue}</strong></span>
      <span class="badge warn">3日以内: <strong>${soon}</strong></span>
      <span class="badge">最終更新: <strong>${new Date(activeCase.updatedAt||0).toLocaleString('ja-JP')}</strong></span>
    `;
  }  function renderTopCards(){
    if(!activeCase){ els.topCards.innerHTML=''; return; }
    const tops = topDeadlines(activeCase);
    if(tops.length===0){
      els.topCards.innerHTML = `<div class="card"><div class="t">重要期限TOP5</div><div class="d">—</div><div class="p">期限を生成すると表示されます</div></div>`;
      return;
    }
    els.topCards.innerHTML='';
    tops.forEach(x=>{
      const cls = classifyDue(x.iso);
      const card=document.createElement('div');
      card.className='card '+(cls==='overdue'?'danger':cls==='soon'?'warn':'');
      card.innerHTML = `<div class="t">${x.label}</div><div class="d">${fmtJP(x.iso)}(${weekdayJP(x.iso)})</div><div class="p">${cls==='overdue'?'期限切れ':cls==='soon'?'まもなく':' '}</div>`;
      els.topCards.appendChild(card);
    });
  }  function renderTasks(){
    els.taskBody.innerHTML='';
    (activeCase.tasks||[]).forEach(t=>{
      const tr=document.createElement('tr');
      const cls = classifyDue(t.dueDate);
      const badgeClass = t.dueDateSource==='manual'?'manual':'auto';
      const warnBadge = cls==='overdue' ? '<span class="badge danger">期限切れ</span>' : cls==='soon' ? '<span class="badge warn">3日以内</span>' : '';
      tr.innerHTML = `
        <td><input type="checkbox" ${t.done?'checked':''} /></td>
        <td><div style="font-weight:650;">${t.title}${t.optional? ' <span class="badge">任意</span>':''}</div></td>
        <td>
          <div class="row">
            <input type="date" value="${t.dueDate||''}" />
          </div>
        </td>
        <td>
          <span class="badge ${badgeClass}">${t.dueDateSource==='manual'?'手動':'自動'}</span>
          ${warnBadge}
        </td>
        <td><input type="text" value="${t.memo||''}" placeholder="メモ" /></td>
      `;
      const [chk, due, memo] = tr.querySelectorAll('input');
      chk.onchange = async ()=>{
        t.done = chk.checked;
        t.doneAt = chk.checked ? new Date().toISOString() : null;
        await persist();
      };
      due.onchange = async ()=>{
        t.dueDate = due.value || null;
        t.dueDateSource = t.dueDate ? 'manual' : 'auto';
        await persist();
      };
      memo.onchange = async ()=>{
        t.memo = memo.value;
        await persist();
      };
      els.taskBody.appendChild(tr);
    });
  }  function fillForm(){
    if(!activeCase){
      els.form.style.display='none';
      els.emptyState.style.display='block';
      return;
    }
    els.emptyState.style.display='none';
    els.form.style.display='block';

    // base
    els.orderNo.value = activeCase.orderNo||'';
    els.userName.value = activeCase.userName||'';
    els.tel.value = activeCase.tel||'';
    els.orderDate.value = activeCase.orderDate||'';
    els.carType.value = activeCase.carType||'';
    els.regMethod.value = activeCase.regMethod||'';
    els.hopeNoType.value = activeCase.hopeNoType||'';
    els.deliveryPlace.value = activeCase.deliveryPlace||'';
    els.mode.value = activeCase.mode||'';
    els.factoryOutDate.value = activeCase.factoryOutDate||'';
    els.deliveryDate.value = activeCase.deliveryDate||'';
    els.deliveryTime.value = activeCase.deliveryTime||'';
    els.frameNo.value = activeCase.frameNo||'';
    els.hopeNo.value = activeCase.hopeNo||'';
    els.noteNo.value = activeCase.noteNo||'';
    els.tradeIn.value = activeCase.tradeIn||'';

    // docs
    els.hqSubmitDate.value = activeCase.hqSubmitDate||'';
    els.docsCollectDate.value = activeCase.docsCollectDate||'';
    els.garageRequired.value = activeCase.garageRequired||'';
    els.garageLeadBusinessDays.value = (activeCase.garageLeadBusinessDays ?? '') ;
    // 車庫証明：不要なら入力欄を非表示
    if(els.garageRequired.value==='不要'){
      if(els.garageDaysField) els.garageDaysField.style.display='none';
    }else{
      if(els.garageDaysField) els.garageDaysField.style.display='';
    }
    els.hqArrivalDate.value = activeCase.derived?.hqArrivalDate||'';
    els.regPlannedDate.value = activeCase.derived?.regPlannedDate||'';
    els.regDate.value = activeCase.regDate||'';
    els.regDone.checked = !!activeCase.regDone;

    // dc
    els.dcReserved.value = activeCase.dcReserved||'';
    els.dcReserveAt.value = activeCase.dcReserveAt||'';
    els.dcDocsDueDate.value = activeCase.derived?.dcDocsDueDate||'';
    els.dcDocsSent.value = activeCase.dcDocsSent||'';
    els.dcDocsSentDate.value = activeCase.dcDocsSentDate||'';

    // loan
    els.contractType.value = activeCase.contractType||'';
    els.paymentStartMonth.value = activeCase.paymentStartMonth||'';
    els.loanDueDate.value = activeCase.derived?.loanDueDate||'';

    // debt
    els.debtExists.value = activeCase.debtExists||'';
    els.debtTransferRequested.value = activeCase.debtTransferRequested||'';

    // insurance
    els.insuranceType.value = activeCase.insuranceType||'';
    els.insuranceContact.value = activeCase.insuranceContact||'';

    // memo
    els.memo.value = activeCase.memo||'';

    setRegMethodRules();
    renderTasks();
    renderKpis();
    renderTopCards();

    updateGenerateButtons();
  }

  async function persist(){
    if(!activeCase) return;
    activeCase = await saveCase(activeCase);
    // refresh list state
    cases = await loadAllCases();
    renderList();
    renderKpis();
    renderTopCards();
    updateGenerateButtons();
  }  function bindField(el, key, transform=(v)=>v){
    el.onchange = async ()=>{
      if(!activeCase) return;
      activeCase[key] = transform(el.value);
      setRegMethodRules();
      await persist();
    };
  }  function updateGenerateButtons(){
    if(!activeCase){
      els.btnGenerate.disabled = true;
      els.btnRecalc.disabled = true;
      els.btnDelete.disabled = true;
      els.missingHint.textContent='';
      return;
    }
    els.btnDelete.disabled=false;

    const missing = validateForGenerate(activeCase);
    const can = missing.length===0;
    els.btnGenerate.disabled = !can;
    els.btnRecalc.disabled = !can;
    els.missingHint.textContent = can ? '' : `不足: ${missing.join('、')}`;
  }

  async function selectCase(id){
    activeId = id;
    activeCase = cases.find(c=>c.id===id) || null;
    fillForm();
    renderList();
  }

  async function createNew(){
    const c = {
      id: uuid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      orderNo: '',
      userName: '',
      tel: '',
      orderDate: todayStr(),
      carType: '普通車',
      regMethod: '書類代行',
      hopeNoType: '希望番号なし',
      deliveryPlace: '拠点',
      mode: '出庫日基準',
      factoryOutDate: '',
      deliveryDate: '',
      deliveryTime: '',
      frameNo: '',
      hopeNo: '',
      noteNo: '',
      tradeIn: '',

      hqSubmitDate: '',
      docsCollectDate: '',
      garageRequired: '必要',
      garageLeadBusinessDays: null,
      regDate: '',

      dcReserved: '',
      dcReserveAt: '',
      dcDocsSent: '',
      dcDocsSentDate: '',

      contractType: '現金',
      paymentStartMonth: '',

      debtExists: '',
      debtTransferRequested: '',

      insuranceType: '',
      insuranceContact: '',

      memo: '',

      tasks: [],
      derived: {},
    };
    c.tasks = TASK_DEFS.map(d=>({
      id: uuid(), key:d.key, title:d.title, optional:d.optional,
      done:false, doneAt:null,
      dueDate:null, dueDateSource:'auto', memo:''
    }));

    const saved = await saveCase(c);
    cases = await loadAllCases();
    activeId = saved.id;
    activeCase = saved;
    renderList();
    fillForm();
  }

  async function doGenerate(isRecalc){
    const missing = validateForGenerate(activeCase);
    if(missing.length){
      alert('不足項目があります:\n' + missing.join('\n'));
      return;
    }
    const { tasks, derived } = generateTasks(activeCase, settings);
    activeCase.tasks = tasks;
    activeCase.derived = derived;
    await persist();
    alert(isRecalc ? '再計算しました' : '期限を生成しました');
  }

  async function doDelete(){
    if(!activeCase) return;
    const ok = confirm(`案件 ${activeCase.orderNo||''} を削除します。よろしいですか？`);
    if(!ok) return;
    await deleteCase(activeCase.id);
    cases = await loadAllCases();
    activeId = null;
    activeCase = null;
    renderList();
    fillForm();
  }

  // bind general list UI
  els.newCase.onclick = createNew;
  els.search.oninput = renderList;
  els.filter.onchange = renderList;
  els.sort.onchange = renderList;

  // buttons
  els.btnGenerate.onclick = ()=>doGenerate(false);
  els.btnRecalc.onclick = ()=>doGenerate(true);
  els.btnDelete.onclick = doDelete;

  // bind fields
  bindField(els.orderNo,'orderNo', v=>v.trim());
  bindField(els.userName,'userName', v=>v.trim());
  bindField(els.tel,'tel', v=>v.trim());
  bindField(els.orderDate,'orderDate');
  bindField(els.carType,'carType');
  bindField(els.regMethod,'regMethod');
  bindField(els.hopeNoType,'hopeNoType');
  bindField(els.deliveryPlace,'deliveryPlace');
  bindField(els.mode,'mode');
  bindField(els.factoryOutDate,'factoryOutDate');
  bindField(els.deliveryDate,'deliveryDate');
  bindField(els.deliveryTime,'deliveryTime');
  bindField(els.frameNo,'frameNo');
  bindField(els.hopeNo,'hopeNo');
  bindField(els.noteNo,'noteNo');
  bindField(els.tradeIn,'tradeIn');

  bindField(els.hqSubmitDate,'hqSubmitDate');
  bindField(els.docsCollectDate,'docsCollectDate');

  // 車庫証明 必要/不要（不要なら営業日をクリアして非表示）
  els.garageRequired.onchange = async ()=>{
    if(!activeCase) return;
    activeCase.garageRequired = els.garageRequired.value;
    if(els.garageRequired.value==='不要'){
      activeCase.garageLeadBusinessDays = null;
      if(els.garageLeadBusinessDays) els.garageLeadBusinessDays.value = '';
      if(els.garageDaysField) els.garageDaysField.style.display='none';
    }else{
      if(els.garageDaysField) els.garageDaysField.style.display='';
    }
    await persist();
  };

  bindField(els.garageLeadBusinessDays,'garageLeadBusinessDays', v=> v? Number(v): null);
  bindField(els.regDate,'regDate');
  bindCheckbox(els.regDone,'regDone');

  bindField(els.dcReserved,'dcReserved');
  bindField(els.dcReserveAt,'dcReserveAt');
  bindField(els.dcDocsSent,'dcDocsSent');
  bindField(els.dcDocsSentDate,'dcDocsSentDate');

  bindField(els.contractType,'contractType');
  bindField(els.paymentStartMonth,'paymentStartMonth');

  bindField(els.debtExists,'debtExists');
  bindField(els.debtTransferRequested,'debtTransferRequested');

  bindField(els.insuranceType,'insuranceType');
  bindField(els.insuranceContact,'insuranceContact');

  bindField(els.memo,'memo');

  // initial
  renderList();
  fillForm();

  // open case from calendar link
  try{
    const h = location.hash || '';
    if(h.startsWith('#case=')){
      const id = decodeURIComponent(h.slice(6));
      const found = cases.find(c=>c.id===id);
      if(found) selectCase(found.id);
    }
  }catch{}
