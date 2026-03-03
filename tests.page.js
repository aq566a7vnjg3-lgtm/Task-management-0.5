import {
  loadBuiltinHolidays,
  toISODate,
  calcDCDocsDue,
  calcHqSubmitFromRegDate,
  calcRegPlannedDate,
  calcHopeNoApplyDue,
  calcGarageCertDue,
  validateForGenerate,
} from './app.js';

function el(tag, attrs={}, children=[]){
  const x = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k==='class') x.className = v;
    else if(k==='text') x.textContent = v;
    else x.setAttribute(k, v);
  }
  for(const c of children) x.appendChild(c);
  return x;
}

function row({ok, name, input, expected, actual}){
  const badge = el('span', { class: `badge ${ok ? 'ok':'ng'}`, text: ok ? 'OK' : 'NG' });
  return el('tr', {}, [
    el('td', {}, [badge]),
    el('td', { text: name }),
    el('td', { }, [el('div', { class:'muted', text: input })]),
    el('td', {}, [el('code', { text: expected ?? '' })]),
    el('td', {}, [el('code', { text: actual ?? '' })]),
  ]);
}

function normalize(v){
  if(v==null) return null;
  return String(v);
}

async function buildSettings({reloadHolidays=false}={}){
  // tests should not depend on the user's saved settings.
  // Keep it minimal & deterministic.
  const holidays = await loadBuiltinHolidays();
  return {
    keepManualOverrideOnRecalc: true,
    hqNonWorkingDates: [],
    dcNonWorkingByMonth: {},
    defaultGarageLeadBusinessDays: null,
    holidays: holidays || [],
    __testReload: reloadHolidays ? Date.now() : 0,
  };
}

function runCoreTests(settings){
  const tests = [];

  // 1) Example fixed in the handoff: reg 2026/04/13 -> HQ submit 2026/04/07 when blankDays=2
  {
    const reg = '2026-04-13';
    const blankDays = 2;
    const actual = calcHqSubmitFromRegDate(reg, blankDays, settings);
    const expected = '2026-04-07';
    tests.push({
      name: '本社便 逆算（中2）',
      input: `登録日=${reg}, 中日=${blankDays}`,
      expected,
      actual,
      ok: normalize(actual) === normalize(expected),
    });
  }

  // 2) Forward: arrival 2026/04/07 with blankDays=2 -> reg 2026/04/13 (2nd Wed off is considered)
  {
    const arrival = '2026-04-07';
    const blankDays = 2;
    const actual = calcRegPlannedDate(arrival, blankDays, settings);
    const expected = '2026-04-13';
    tests.push({
      name: '登録日 算出（中2）',
      input: `書類到着/提出=${arrival}, 中日=${blankDays}`,
      expected,
      actual,
      ok: normalize(actual) === normalize(expected),
    });
  }

  // 3) 希望番号：登録日=完成日、申請期限=中4（JP営業日）
  {
    const reg = '2026-04-13';
    const hope = '希望番号';
    const actual = calcHopeNoApplyDue(reg, hope, settings);
    const expected = '2026-04-06';
    tests.push({
      name: '希望番号 申請期限（中4）',
      input: `完成/登録=${reg}, 種別=${hope}`,
      expected,
      actual,
      ok: normalize(actual) === normalize(expected),
    });
  }

  // 4) 納車センター書類期限：曜日別オフセット（Mon=6日前）※DC非稼働のみで調整
  {
    const delivery = '2026-04-20'; // Mon
    const actual = calcDCDocsDue(delivery, settings);
    const expected = '2026-04-14';
    tests.push({
      name: 'DC書類期限（曜日別）',
      input: `納車日=${delivery} (月)`,
      expected,
      actual,
      ok: normalize(actual) === normalize(expected),
    });
  }

  // 5) DC非稼働日に当たったら前倒し（設定日付のみ）
  {
    const delivery = '2026-04-20'; // Mon -> base 4/14
    const s2 = structuredClone(settings);
    s2.dcNonWorkingByMonth = { '2026-04': ['2026-04-14'] };
    const actual = calcDCDocsDue(delivery, s2);
    const expected = '2026-04-13';
    tests.push({
      name: 'DC非稼働 前倒し',
      input: `納車日=${delivery}, DC休み=2026-04-14`,
      expected,
      actual,
      ok: normalize(actual) === normalize(expected),
    });
  }

  // 6) 車庫証明：納車日から営業日で逆算（lead=3）
  {
    const delivery = '2026-04-20';
    const lead = 3;
    const actual = calcGarageCertDue(delivery, lead, settings);
    const expected = '2026-04-15';
    tests.push({
      name: '車庫証明 期限（営業日逆算）',
      input: `納車日=${delivery}, 必要営業日=${lead}`,
      expected,
      actual,
      ok: normalize(actual) === normalize(expected),
    });
  }

  // 7) validateForGenerate：オーダー番号が5桁必須
  {
    const c = { orderNo: '1234' };
    const missing = validateForGenerate(c);
    const actual = Array.isArray(missing) ? missing.join(' / ') : String(missing);
    const expected = 'オーダー番号(5桁)';
    tests.push({
      name: '必須チェック（オーダー番号）',
      input: `orderNo=1234`,
      expected,
      actual,
      ok: actual.includes(expected),
    });
  }

  return tests;
}

async function render({reloadHolidays=false}={}){
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = '';
  const settings = await buildSettings({reloadHolidays});

  const tests = runCoreTests(settings);
  const okCount = tests.filter(t=>t.ok).length;

  for(const t of tests){
    tbody.appendChild(row(t));
  }

  // summary row
  tbody.appendChild(el('tr', {}, [
    el('td', { colspan:'5' }, [
      el('div', { class:'muted', text: `結果: ${okCount}/${tests.length} OK` })
    ])
  ]));
}

document.getElementById('runBtn')?.addEventListener('click', ()=>render({reloadHolidays:false}));
document.getElementById('runBtnNoCache')?.addEventListener('click', ()=>render({reloadHolidays:true}));

// Auto-run once
render({reloadHolidays:false});
