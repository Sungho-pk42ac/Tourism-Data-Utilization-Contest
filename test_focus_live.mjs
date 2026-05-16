import puppeteer from 'puppeteer'

const BASE = 'http://localhost:5173'
const TIME_SLOTS_LEN = 4
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PASS = (msg) => console.log('✓', msg)
const FAIL = (msg) => console.log('✗ FAIL:', msg)

const browser = await puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const safe = async (fn, fb=null) => { try { return await page.evaluate(fn) } catch { return fb } }

// ── 1. 기본 세션 로드 ──
console.log('\n=== 1. 기본 세션 로드 + 플래너 가족 주입 ===')
await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 15000 })
await sleep(1000)

// localStorage에 플래너가 만든 가족 + 아이템 주입 (page reload 전)
const FAMILY_ID = 'planner-family-test-001'
const injected = await safe(() => {
  const raw = localStorage.getItem('trip-command-center/v5-korea')
  if (!raw) return false
  const doc = JSON.parse(raw)

  // 가족 추가
  if (!doc.families.find(f => f.id === 'planner-family-test-001')) {
    doc.families.push({
      id: 'planner-family-test-001',
      type: 'family',
      title: '테스트 가족',
      name: '테스트 가족',
      headcount: '3인',
      shortOrigin: 'GMP',
      origin: '서울',
      status: '예정',
    })
  }

  // 기존 테스트 아이템 제거
  doc.itineraryItems = doc.itineraryItems.filter(i => !i.id.startsWith('planner-ops-planner-family-test'))

  // 3일 일정 아이템 추가 (각각 다른 startSlot)
  const TIME_SLOTS_LEN = 4
  ;[0, 1, 2].forEach(i => {
    doc.itineraryItems.push({
      id: `planner-ops-planner-family-test-001-${i}`,
      type: 'itineraryItem',
      title: `테스트 ${i+1}일차 일정`,
      rowId: 'activities',
      startSlot: i * TIME_SLOTS_LEN,
      span: TIME_SLOTS_LEN,
      color: ['red', 'amber', 'green'][i],
      familyIds: ['planner-family-test-001'],
      status: '예정',
      riskLevel: 'Low',
      taskIds: [],
      linkedEntityKeys: [],
    })
  })

  localStorage.setItem('trip-command-center/v5-korea', JSON.stringify(doc))
  return true
}, false)
console.log('주입 결과:', injected ? '성공' : '실패')

// 페이지 리로드 (tripModel이 어떻게 처리하는지 확인)
await page.reload({ waitUntil: 'networkidle2' })
await sleep(1500)

// 주입된 아이템이 살아있는지 확인
const survived = await safe(() => {
  const raw = localStorage.getItem('trip-command-center/v5-korea')
  if (!raw) return null
  const doc = JSON.parse(raw)
  return {
    hasFamily: doc.families?.some(f => f.id === 'planner-family-test-001'),
    plannerItems: doc.itineraryItems?.filter(i => i.id.startsWith('planner-ops-planner-family-test')).map(i=>({
      id: i.id.slice(0,35), startSlot: i.startSlot, familyIds: i.familyIds
    })),
    totalItems: doc.itineraryItems?.length,
  }
})
console.log('리로드 후 상태:', JSON.stringify(survived, null, 2))

if (!survived?.hasFamily) {
  FAIL('리로드 후 테스트 가족 사라짐 (refreshSeededDoc이 드롭함)')
} else {
  PASS('리로드 후 테스트 가족 유지')
}

if (!survived?.plannerItems?.length) {
  FAIL('리로드 후 플래너 아이템 사라짐')
} else {
  const hasDistinct = survived.plannerItems.some((it, i) => i > 0 && it.startSlot !== survived.plannerItems[0].startSlot)
  hasDistinct
    ? PASS(`플래너 아이템 ${survived.plannerItems.length}개, startSlot 다름: ${survived.plannerItems.map(i=>i.startSlot).join(', ')}`)
    : FAIL(`플래너 아이템 startSlot 전부 같음: ${survived.plannerItems.map(i=>i.startSlot).join(', ')}`)
}

// ── 2. 이티너리 탭 이동 ──
console.log('\n=== 2. 이티너리 탭 이동 ===')
await safe(() => document.querySelector('button[title="일정"]')?.click())
await sleep(500)

// ── 3. 타임라인 전체 아이템 수 ──
const allItems = await safe(() =>
  document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
, 0)
console.log('전체 타임라인 아이템:', allItems)
allItems > 0 ? PASS(`${allItems}개 아이템`) : FAIL('아이템 없음')

// ── 4. 테스트 가족 클릭 → 필터링 ──
console.log('\n=== 3. 테스트 가족 클릭 → 필터링 확인 ===')
const clickResult = await safe(() => {
  const btns = Array.from(document.querySelectorAll('button'))
    .filter(b => b.className?.includes('min-w-0') && b.className?.includes('flex-1') && b.className?.includes('text-left'))
  const testBtn = btns.find(b => b.textContent?.includes('테스트 가족'))
  if (testBtn) { testBtn.click(); return '테스트 가족' }
  // 마지막 가족 클릭 (AI 가족이 뒤에 있음)
  if (btns.length > 0) { btns[btns.length-1].click(); return btns[btns.length-1].textContent?.trim().slice(0,20) }
  return null
})
console.log('클릭:', clickResult)
await sleep(700)

const focusedItems = await safe(() =>
  document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
, 0)
console.log(`포커스 후: ${focusedItems}개 (전체: ${allItems})`)

if (survived?.hasFamily && survived?.plannerItems?.length > 0) {
  // 테스트 가족 아이템이 살아있을 때
  focusedItems > 0 && focusedItems <= allItems
    ? PASS(`필터링 성공: ${allItems}→${focusedItems}`)
    : focusedItems === 0
      ? FAIL('아이템 0개 — 가족 아이템이 보이지 않음')
      : FAIL(`필터링 안 됨 (${focusedItems} = ${allItems})`)
} else {
  // 테스트 가족 아이템이 사라진 경우 (refreshSeededDoc이 드롭)
  console.log('INFO: 테스트 가족/아이템이 리로드 후 사라져서 필터링 효과 미측정')
  focusedItems < allItems
    ? PASS(`기존 가족 포커스로 필터링됨 (${allItems}→${focusedItems})`)
    : FAIL(`필터링 효과 없음 (${focusedItems} = ${allItems})`)
}

const hasFocus = await safe(() =>
  Array.from(document.querySelectorAll('span')).some(s => s.textContent?.trim() === 'FOCUS')
)
hasFocus ? PASS('FOCUS 배지') : FAIL('FOCUS 배지 없음')

// ── 5. 초기화 ──
await safe(() => {
  Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent?.includes('✕') && b.textContent?.includes('ALL'))?.click()
})
await sleep(400)
const resetItems = await safe(() =>
  document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
, 0)
resetItems >= focusedItems ? PASS(`초기화 후 복원 (${resetItems})`) : FAIL('복원 실패')

// ── 6. TIME SCRUB ──
console.log('\n=== 4. TIME SCRUB 날짜 버튼 ===')
const dayBtns = await safe(() =>
  Array.from(document.querySelectorAll('button'))
    .filter(b => {
      const t = b.textContent?.trim() ?? ''
      const cls = b.className ?? ''
      return cls.includes('tracking-wider') && cls.includes('px-2.5') &&
             (t.includes('일차') || /^\d+\/\d+/.test(t) || /^D\d/.test(t))
    })
    .map(b => b.textContent?.trim())
, [])
console.log('TIME SCRUB 날짜:', dayBtns)
dayBtns.length > 0 ? PASS(`${dayBtns.length}일 버튼`) : FAIL('날짜 버튼 없음')

// ── 7. Transit/Main Ops/Support ──
console.log('\n=== 5. 타임라인 행 ===')
const rows = await safe(() =>
  Array.from(document.querySelectorAll('div'))
    .filter(d => ['Transit', 'Main Ops', 'Support'].includes(d.textContent?.trim()))
    .map(d => d.textContent?.trim())
, [])
rows?.length >= 3 ? PASS(`${rows.join(', ')} 확인`) : FAIL(`행 부족: ${rows?.join(', ')}`)

// ── 정리 ──
console.log('\n=== 정리: 테스트 가족 제거 ===')
await safe(() => {
  try {
    const doc = JSON.parse(localStorage.getItem('trip-command-center/v5-korea'))
    doc.families = doc.families.filter(f => f.id !== 'planner-family-test-001')
    doc.itineraryItems = doc.itineraryItems.filter(i => !i.id.startsWith('planner-ops-planner-family-test'))
    localStorage.setItem('trip-command-center/v5-korea', JSON.stringify(doc))
  } catch {}
})

await browser.close()
console.log('\n=== 완료 ===')
