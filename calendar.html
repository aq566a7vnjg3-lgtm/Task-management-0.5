/* Contract Task App (Static Web / GitHub Pages)
 * Data: IndexedDB (fallback localStorage)
 */

const DB_NAME = 'contract_task_app';
const DB_VER = 1;
const STORE_CASES = 'cases';
const STORE_SETTINGS = 'settings';

const TASK_DEFS = [
  { key: 'hope_no_apply', title: '希望番号の申請', optional: false, dueType: 'none' },
  { key: 'reg_docs_submit', title: '登録書類の提出', optional: false, dueType: 'hq_submit' },
  { key: 'dc_reserve', title: '納車センター予約', optional: false, dueType: 'dc_reserve_suggest' },
  { key: 'dc_docs_submit', title: '納車センター書類の提出', optional: false, dueType: 'dc_docs' },
  { key: 'loan_paper_submit', title: 'ローン用紙提出', optional: false, dueType: 'loan' },
  { key: 'debt_transfer_req', title: '残債振込依頼', optional: false, dueType: 'none' },
  { key: 'insurance_proc', title: '保険手続き', optional: false, dueType: 'none' },
  { key: 'free_1m_check_schedule', title: '無料1か月点検日程決め', optional: false, dueType: 'none' },
  { key: 'garage_cert_submit', title: '車庫証明提出', optional: false, dueType: 'garage' },
  { key: 'payment_check_thanks', title: '入金確認　お礼電話', optional: true, dueType: 'payment' },
];

const HOPE_NO_TYPES = [
  '希望番号なし',
  '希望番号',
  '希望図柄（モノトーン）',
  '希望図柄（カラー）',
];

// --- Utilities ---
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function todayStr(){
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d){
  const z = new Date(d);
  z.setHours(0,0,0,0);
  const y = z.getFullYear();
  const m = String(z.getMonth()+1).padStart(2,'0');
  const da = String(z.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}

export function parseISODate(s){
  if(!s) return null;
  const [y,m,d] = s.split('-').map(Number);
  if(!y||!m||!d) return null;
  const dt = new Date(y, m-1, d);
  dt.setHours(0,0,0,0);
  return dt;
}

export function addDays(date, n){
  const d = new Date(date);
  d.setDate(d.getDate()+n);
  d.setHours(0,0,0,0);
  return d;
}

export function fmtJP(d){
  if(!d) return '';
  const z = typeof d === 'string' ? parseISODate(d) : d;
  if(!z) return '';
  return `${z.getFullYear()}/${String(z.getMonth()+1).padStart(2,'0')}/${String(z.getDate()).padStart(2,'0')}`;
}

export function weekdayJP(d){
  const z = typeof d === 'string' ? parseISODate(d) : d;
  const w = z.getDay();
  return ['日','月','火','水','木','金','土'][w];
}

export function clampStr(s, n){
  if(!s) return '';
  return s.length>n ? s.slice(0,n-1)+'…' : s;
}

// --- IndexedDB wrapper ---
function openDB(){
  return new Promise((resolve, reject)=>{
    if(!('indexedDB' in window)) return reject(new Error('indexedDB not supported'));
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = ()=>{
      const db = req.result;
      if(!db.objectStoreNames.contains(STORE_CASES)){
        const s = db.createObjectStore(STORE_CASES, { keyPath: 'id' });
        s.createIndex('updatedAt', 'updatedAt');
      }
      if(!db.objectStoreNames.contains(STORE_SETTINGS)){
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function idbGetAll(store){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readonly');
    const st = tx.objectStore(store);
    const req = st.getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}

async function idbPut(store, value){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readwrite');
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
    tx.objectStore(store).put(value);
  });
}

async function idbDelete(store, key){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readwrite');
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
    tx.objectStore(store).delete(key);
  });
}

async function idbGet(store, key){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(store,'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
  });
}

// --- Storage fallback (localStorage) ---
const LS_CASES = 'cta_cases_v1';
const LS_SETTINGS = 'cta_settings_v1';
function lsLoad(key, fallback){
  try{ const v = localStorage.getItem(key); return v? JSON.parse(v): fallback; }catch{ return fallback; }
}
function lsSave(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

export async function storageSupported(){
  try{ await openDB(); return true; }catch{ return false; }
}

export async function loadAllCases(){
  const useIDB = await storageSupported();
  if(useIDB){
    const rows = await idbGetAll(STORE_CASES);
    return rows.sort((a,b)=> (b.updatedAt||0)-(a.updatedAt||0));
  }
  const rows = lsLoad(LS_CASES, []);
  return rows.sort((a,b)=> (b.updatedAt||0)-(a.updatedAt||0));
}

export async function saveCase(caseObj){
  const now = Date.now();
  const obj = { ...caseObj, updatedAt: now };
  const useIDB = await storageSupported();
  if(useIDB){
    await idbPut(STORE_CASES, obj);
  }else{
    const all = lsLoad(LS_CASES, []);
    const idx = all.findIndex(x=>x.id===obj.id);
    if(idx>=0) all[idx]=obj; else all.push(obj);
    lsSave(LS_CASES, all);
  }
  return obj;
}

export async function deleteCase(id){
  const useIDB = await storageSupported();
  if(useIDB){
    await idbDelete(STORE_CASES, id);
  }else{
    const all = lsLoad(LS_CASES, []).filter(x=>x.id!==id);
    lsSave(LS_CASES, all);
  }
}

export async function loadSettings(){
  const useIDB = await storageSupported();
  if(useIDB){
    const row = await idbGet(STORE_SETTINGS,'settings');
    return row?.value || null;
  }
  return lsLoad(LS_SETTINGS, null);
}

export async function saveSettings(settings){
  const useIDB = await storageSupported();
  if(useIDB){
    await idbPut(STORE_SETTINGS,{key:'settings', value: settings});
  }else{
    lsSave(LS_SETTINGS, settings);
  }
  return settings;
}

// --- Default settings ---
export async function ensureSettings(){
  let s = await loadSettings();
  if(s) return s;
  s = {
    keepManualOverrideOnRecalc: true,
    hqNonWorkingDates: [
      '2026-03-01','2026-03-08','2026-03-11','2026-03-14','2026-03-15','2026-03-20','2026-03-22','2026-03-28','2026-03-29'
    ],
    dcNonWorkingByMonth: {}, // { 'YYYY-MM': ['YYYY-MM-DD', ...] }
    // Garage certificate lead time (business days, police weekdays) can be set per case; optional default here
    defaultGarageLeadBusinessDays: null,
    holidays: [], // loaded from json
  };
  await saveSettings(s);
  return s;
}

export async function loadBuiltinHolidays(){
  // GitHub Pages (project pages) でも壊れないように、相対パスで解決する
  // 互換のため、ルート配置と /data 配下の両方を試す
  const candidates = [
    new URL('./holidays_2026_2030.json', window.location.href).toString(),
    new URL('./data/holidays_2026_2030.json', window.location.href).toString(),
  ];

  for(const url of candidates){
    try{
      const res = await fetch(url, { cache: 'no-store' });
      if(!res.ok) continue;
      const json = await res.json();
      // 想定: [{date:'YYYY-MM-DD', name:'...'}, ...]
      if(Array.isArray(json)) return json;
    }catch(e){
      // try next
    }
  }

  console.warn('祝日データ(holidays_2026_2030.json)を読み込めませんでした。祝日判定なしで動作します。');
  return [];
}

// --- Calendars ---
export function isWeekend(d){
  const w = d.getDay();
  return w===0 || w===6;
}

export function isHolidayISO(iso, settings){
  return settings.holidays?.some(h=>h.date===iso);
}

export function isJPBusinessDay(d, settings){
  const iso = toISODate(d);
  if(isWeekend(d)) return false;
  if(isHolidayISO(iso, settings)) return false;
  return true;
}

// Registration division business day: NOT weekend, NOT holiday, NOT 2nd Wednesday
export function isRegBusinessDay(d, settings){
  if(!isJPBusinessDay(d, settings)) return false;
  // 2nd Wednesday
  if(d.getDay()===3){
    const day = d.getDate();
    const week = Math.floor((day-1)/7)+1;
    if(week===2) return false;
  }
  return true;
}

// HQ courier business day: JP business day minus user-defined nonworking dates
export function isHQWorkingDay(d, settings){
  if(!isJPBusinessDay(d, settings)) return false;
  const iso = toISODate(d);
  return !(settings.hqNonWorkingDates||[]).includes(iso);
}

// Delivery center working day: assume all days except month-specific nonworking overrides (and maybe holidays?)
// We treat nonworking list as authoritative. If empty, any day is working.
export function isDCWorkingDay(d, settings){
  const iso = toISODate(d);
  const ym = iso.slice(0,7);
  const arr = settings.dcNonWorkingByMonth?.[ym] || [];
  return !arr.includes(iso);
}

export function nextWorkingDay(d, fn){
  let x = new Date(d);
  x.setHours(0,0,0,0);
  for(let i=0;i<370;i++){
    if(fn(x)) return x;
    x = addDays(x,1);
  }
  return x;
}

export function prevWorkingDay(d, fn){
  let x = new Date(d);
  x.setHours(0,0,0,0);
  for(let i=0;i<370;i++){
    if(fn(x)) return x;
    x = addDays(x,-1);
  }
  return x;
}

// Add N business days forward using fn
export function addBusinessDays(d, n, fn){
  let x = new Date(d);
  x.setHours(0,0,0,0);
  let added = 0;
  while(added < n){
    x = addDays(x,1);
    if(fn(x)) added++;
  }
  return x;
}


// Subtract N business days backward using fn (counts previous days)
export function subBusinessDays(d, n, fn){
  let x = new Date(d);
  x.setHours(0,0,0,0);
  let sub = 0;
  while(sub < n){
    x = addDays(x,-1);
    if(fn(x)) sub++;
  }
  return x;
}

// Hope number application: registration date is completion date.
// NeedBlankDays uses "中N日" => completion is (N+1) business days after application (B-style gap), so application = completion - (N+1) business days.
export function calcHopeNoApplyDue(regISO, hopeNoType, settings){
  if(!regISO) return null;
  if(!hopeNoType || hopeNoType==='希望番号なし') return null;
  const isFig = hopeNoType.startsWith('希望図柄');
  const blank = isFig ? 8 : 4; // 希望番号=中4, 図柄=中8
  const completion = parseISODate(regISO);
  if(!completion) return null;
  const fn = (d)=>isJPBusinessDay(d, settings); // weekdays excluding JP holidays
  // ensure completion itself is a business day (if not, shift to previous business day)
  const comp = prevWorkingDay(completion, fn);
  const apply = subBusinessDays(comp, blank+1, fn);
  return toISODate(apply);
}

// --- Rules ---
export function requiredRegBlankDays(caseObj){
  const carType = caseObj.carType;
  const regMethod = caseObj.regMethod;
  const hope = caseObj.hopeNoType;
  const isFig = hope && hope.startsWith('希望図柄');

  // Light car cannot be OSS
  if(carType==='軽' && regMethod==='OSS') return null;

  if(isFig) return 8;

  if(regMethod==='OSS'){
    return 4; // normal / hope both 4
  }
  // 書類代行
  if(hope==='希望番号') return 4;
  return 2; // 希望番号なし
}

export function calcRegPlannedDate(arrivalISO, blankDays, settings){
  if(!arrivalISO || !blankDays) return null;
  const arrival = parseISODate(arrivalISO);
  if(!arrival) return null;

  // ensure arrival itself is a reg business day? arrival is "delivered" date; if delivered on non-business day, shift to next reg business day.
  let base = nextWorkingDay(arrival, d=>isRegBusinessDay(d, settings));

  // B definition: "間にN日空ける" counted in reg business days
  let d = base;
  for(let i=0;i<blankDays;i++){
    d = nextWorkingDay(addDays(d,1), x=>isRegBusinessDay(x, settings));
  }
  const reg = nextWorkingDay(addDays(d,1), x=>isRegBusinessDay(x, settings));
  return toISODate(reg);
}

export function calcHqArrivalFromSubmit(submitISO, settings){
  if(!submitISO) return null;
  const submit = parseISODate(submitISO);
  if(!submit) return null;
  // If submit day is not HQ working day, shift to next HQ working day
  const arrived = nextWorkingDay(submit, d=>isHQWorkingDay(d, settings));
  return toISODate(arrived);
}


export function calcHqSubmitFromRegDate(regISO, blankDays, settings){
  // Reverse-calc HQ submit date (= arrival date) from registration date.
  // "中◯日" definition B: there must be blankDays registration-business-days strictly BETWEEN submit/arrival and reg date.
  if(!regISO || !blankDays) return null;
  const reg = parseISODate(regISO);
  if(!reg) return null;

  // Find the N-th previous registration business day before reg date (excluding reg date)
  let d = addDays(reg, -1);
  let count = 0;
  for(let i=0;i<370;i++){
    if(isRegBusinessDay(d, settings)) count += 1;
    if(count === blankDays) break;
    d = addDays(d, -1);
  }
  if(count !== blankDays) return null;
  const nthPrev = new Date(d);

  // Arrival/submit date is the previous registration business day before that N-th day
  const arrivalCandidate = prevWorkingDay(addDays(nthPrev, -1), x=>isRegBusinessDay(x, settings));

  // HQ submit must be a HQ working day; also require registration business day because arrival is same-day
  const submit = prevWorkingDay(arrivalCandidate, x=>isHQWorkingDay(x, settings) && isRegBusinessDay(x, settings));
  return toISODate(submit);
}

export function calcDCDocsDue(deliveryISO, settings){
  if(!deliveryISO) return null;
  const d = parseISODate(deliveryISO);
  if(!d) return null;
  const w = d.getDay();
  // Sun 0, Mon1, Tue2, Wed3, Thu4, Fri5, Sat6
  let days;
  if(w===1) days = 6; // Mon
  else if(w===2) days = 5; // Tue
  else if(w===3) days = 6; // Wed exception: 6
  else if(w===4) days = 7; // Thu
  else if(w===5) days = 7; // Fri
  else if(w===6) days = 6; // Sat
  else days = 6; // Sun

  let due = addDays(d, -days);
  // adjust to previous DC working day if nonworking
  due = prevWorkingDay(due, x=>isDCWorkingDay(x, settings));
  return toISODate(due);
}


function calcRegDateFromDelivery(deliveryISO, settings){
  // 納車日逆算: 納車センター書類到着日 = 登録期限(=登録日) として算出する
  // 1) 納車日から曜日ルール+納車センター独自カレンダーで「到着日(仮)」を計算
  let regISO = calcDCDocsDue(deliveryISO, settings);
  if(!regISO) return null;
  let x = parseISODate(regISO);
  if(!x) return null;

  // 2) 登録課稼働日でなければ直前の登録可能日に前倒し
  x = prevWorkingDay(x, d=>isRegBusinessDay(d, settings));

  // 3) 本社便が稼働していない日だと当日到着できないため、直前の本社便稼働日まで前倒し
  //    ＝登録日もその日に合わせて前倒し（登録課稼働日も同時に満たす）
  while(true){
    const okHQ = isHQWorkingDay(x, settings);
    const okReg = isRegBusinessDay(x, settings);
    const okDC = isDCWorkingDay(x, settings);
    if(okHQ && okReg && okDC) break;
    x = addDays(x, -1);
  }
  return toISODate(x);
}


export function calcLoanDue(paymentStartMonth){
  if(!paymentStartMonth) return null;
  // paymentStartMonth: YYYY-MM
  const [y,m] = paymentStartMonth.split('-').map(Number);
  if(!y||!m) return null;
  const prev = new Date(y, m-2, 10); // month-1, day 10
  prev.setHours(0,0,0,0);
  return toISODate(prev);
}

export function calcPaymentCheckDue(deliveryISO){
  if(!deliveryISO) return null;
  const d = parseISODate(deliveryISO);
  if(!d) return null;
  return toISODate(addDays(d, -10));
}

export function calcGarageCertDue(deliveryISO, leadBusinessDays, settings){
  if(!deliveryISO || !leadBusinessDays) return null;
  const d = parseISODate(deliveryISO);
  if(!d) return null;
  // "提出"期限を納車日から leadBusinessDays 前の警察署稼働日にする（平日＋祝日除外）
  let x = d;
  let remaining = leadBusinessDays;
  while(remaining>0){
    x = addDays(x,-1);
    if(isJPBusinessDay(x, settings)) remaining--;
  }
  // If lands on non-business day, move further back
  while(!isJPBusinessDay(x, settings)) x = addDays(x,-1);
  return toISODate(x);
}

// Generate tasks and deadlines
export function generateTasks(caseObj, settings){
  const tasks = TASK_DEFS.map(def=>{
    const existing = (caseObj.tasks||[]).find(t=>t.key===def.key);
    const base = existing ? { ...existing } : {
      id: uuid(),
      key: def.key,
      title: def.title,
      optional: def.optional,
      done: false,
      doneAt: null,
      dueDate: null,
      dueDateSource: 'auto',
      memo: '',
    };
    // Keep manual overrides on recalc
    if(existing && settings.keepManualOverrideOnRecalc && existing.dueDateSource==='manual'){
      base.dueDateSource = 'manual';
    }else{
      base.dueDateSource = 'auto';
      base.dueDate = null;
    }
    return base;
  });

// Calculate derived dates
const deliveryISO = caseObj.deliveryDate;
const payMonth = caseObj.paymentStartMonth;

const blank = requiredRegBlankDays(caseObj);

// 納車日逆算モードでは「納車センター書類到着日＝登録期限（＝登録日）」として、登録日と登録書類提出日を自動算出する
let hqSubmitISO = caseObj.hqSubmitDate;
let regFixedISO = null;

if(caseObj.mode==='納車日逆算' && deliveryISO){
  const regFromDeliveryISO = calcRegDateFromDelivery(deliveryISO, settings);
  regFixedISO = regFromDeliveryISO;
  if(regFromDeliveryISO){
    // 登録日（手入力欄）は未入力なら自動で入れる（手動で上書き可）
    if(!caseObj.regDate) caseObj.regDate = regFromDeliveryISO;

    // 登録書類の提出日（本社便へ渡す日）は、登録日から「中◯日(B定義)」を逆算して算出
    // 未入力なら自動で入れる（手動で上書き可）
    if(!hqSubmitISO && blank){
      const submitISO = calcHqSubmitFromRegDate(regFromDeliveryISO, blank, settings);
      if(submitISO){
        hqSubmitISO = submitISO;
        caseObj.hqSubmitDate = submitISO;
      }
    }
  }
}

// 登録日が手入力されていて、本社便提出日が未入力の場合は逆算して補完
if(!hqSubmitISO && caseObj.regDate && blank){
  const submitISO = calcHqSubmitFromRegDate(caseObj.regDate, blank, settings);
  if(submitISO){
    hqSubmitISO = submitISO;
    caseObj.hqSubmitDate = submitISO;
  }
}

const hqArrivalISO = regFixedISO || calcHqArrivalFromSubmit(hqSubmitISO, settings);
const regPlannedISO = regFixedISO || ((hqArrivalISO && blank) ? calcRegPlannedDate(hqArrivalISO, blank, settings) : null);
  const dcDocsDueISO = calcDCDocsDue(deliveryISO, settings);
  const loanDueISO = calcLoanDue(payMonth);
  const payCheckISO = calcPaymentCheckDue(deliveryISO);
  const garageLead = (caseObj.garageRequired==='不要') ? null : (caseObj.garageLeadBusinessDays ?? settings.defaultGarageLeadBusinessDays);
  const garageDueISO = calcGarageCertDue(deliveryISO, garageLead, settings);

  const regForHopeISO = (caseObj.mode==='納車日逆算' ? (caseObj.regDate || regFixedISO) : (regPlannedISO));
  const hopeApplyISO = calcHopeNoApplyDue(regForHopeISO, caseObj.hopeNoType, settings);

  // write back to case derived fields
  const derived = {
    hqArrivalDate: hqArrivalISO,
    regPlannedDate: regPlannedISO,
    // 納車日逆算で自動入力された登録日（手入力欄へ反映）
    regDateAuto: (caseObj.mode==='納車日逆算' ? (caseObj.regDate || null) : null),
    dcDocsDueDate: dcDocsDueISO,
    loanDueDate: loanDueISO,
    paymentCheckDueDate: payCheckISO,
    garageCertDueDate: garageDueISO,
    hopeNoApplyDueDate: hopeApplyISO,
  };

  // Apply task due dates (if not manual)
  function setDue(key, iso){
    const t = tasks.find(x=>x.key===key);
    if(!t) return;
    if(t.dueDateSource==='manual') return;
    t.dueDate = iso || null;
    t.dueDateSource = 'auto';
  }

  setDue('reg_docs_submit', caseObj.hqSubmitDate || null);
  setDue('dc_docs_submit', dcDocsDueISO);
  // Reserve suggest: day before dc docs due
  if(dcDocsDueISO){
    const sug = toISODate(addDays(parseISODate(dcDocsDueISO), -1));
    setDue('dc_reserve', sug);
  }
  setDue('loan_paper_submit', loanDueISO);
  setDue('payment_check_thanks', payCheckISO);
  setDue('garage_cert_submit', garageDueISO);

  setDue('hope_no_apply', hopeApplyISO);

  // Return
  return { tasks, derived };
}

// KPI / urgency
export function classifyDue(dueISO){
  if(!dueISO) return 'none';
  const due = parseISODate(dueISO);
  const now = new Date();
  now.setHours(0,0,0,0);
  const diff = Math.round((due - now) / (1000*60*60*24));
  if(diff < 0) return 'overdue';
  if(diff <= 3) return 'soon';
  return 'ok';
}

export function topDeadlines(caseObj){
  const list = [];
  const tasks = caseObj.tasks || [];
  const isOpen = (key)=>{
    const t = tasks.find(x=>x.key===key);
    return !(t && t.done);
  };
  const push = (label, iso)=>{ if(iso) list.push({label, iso}); };
  // Registration date (milestone). Hide if user marked registration complete.
  const regISO = caseObj.derived?.regDateAuto || caseObj.regDate || caseObj.derived?.regPlannedDate;
  if(!caseObj.regDone) push('登録日', regISO);

  // High priority task-driven deadlines (hide if task is completed)
  if(isOpen('dc_docs_submit')) push('納車センター書類', caseObj.derived?.dcDocsDueDate);
  if(isOpen('hope_no_apply')){
    const hopeISO = caseObj.derived?.hopeNoApplyDueDate || tasks.find(t=>t.key==='hope_no_apply')?.dueDate;
    push('希望番号申請', hopeISO);
  }

  // Lower priority (hide if completed)
  if(isOpen('loan_paper_submit')) push('ローン用紙', caseObj.derived?.loanDueDate);
  if(caseObj.garageRequired!=='不要' && isOpen('garage_cert_submit')) push('車庫証明', caseObj.derived?.garageCertDueDate);
  if(isOpen('payment_check_thanks')) push('入金確認', caseObj.derived?.paymentCheckDueDate);

  // sort by date
  list.sort((a,b)=> (a.iso||'').localeCompare(b.iso||''));
  return list.slice(0,5);
}

export function validateForGenerate(caseObj){
  // Hard requirements to enable "期限を生成"
  const missing = [];
  const order = (caseObj.orderNo || '').trim();
  if(!order) missing.push('オーダー番号');
  else if(!/^\d{5}$/.test(order)) missing.push('オーダー番号(5桁)');
  if(!caseObj.carType) missing.push('車種区分');
  if(!caseObj.regMethod) missing.push('登録方法');
  if(caseObj.carType==='軽' && caseObj.regMethod==='OSS') missing.push('軽はOSS不可（登録方法を変更）');
  if(!caseObj.hopeNoType) missing.push('希望番号種別');
  if(!caseObj.deliveryPlace) missing.push('納車場所');
  if(!caseObj.mode) missing.push('算出モード');
  if(caseObj.mode==='出庫日基準'){
    if(!caseObj.factoryOutDate) missing.push('メーカー出庫日');
  }
  if(caseObj.mode==='納車日逆算'){
    if(!caseObj.deliveryDate) missing.push('納車日');
  }
  // NOTE: 本社便提出日(hqSubmitDate)が未入力でも、算出できる期限は生成する（登録関連のみ未算出）
  return missing;
}


// Backup / restore
export async function exportAll(){
  const cases = await loadAllCases();
  const settings = await loadSettings();
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    cases,
    settings,
  };
}

export async function importAll(payload){
  // write settings then cases
  if(payload.settings) await saveSettings(payload.settings);
  if(Array.isArray(payload.cases)){
    for(const c of payload.cases){
      await saveCase(c);
    }
  }
}

export { HOPE_NO_TYPES, TASK_DEFS };
