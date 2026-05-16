import puppeteer from 'puppeteer'

const BASE = 'http://localhost:5173'
const TIME_SLOTS_LEN = 4  // ['00', '06', '12', '18']
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

const safeEval = async (fn) => {
  try { return await page.evaluate(fn) } catch (e) { console.log('  [eval error]', e.message.slice(0, 60)); return null }
}

// 이티너리 탭으로 이동하는 헬퍼
const goToItinerary = async () => {
  await safeEval(() => {
    const navBtns = Array.from(document.querySelectorAll('button'))
    const itinBtn = navBtns.find(b => b.title === '이티너리' || b.title === '일정' || b.getAttribute('title')?.includes('이티너리'))
    if (itinBtn) { itinBtn.click(); return }
    // fallback: nav item title
    const allTitles = navBtns.map(b => b.title).filter(Boolean)
    console.log('nav buttons titles:', JSON.stringify(allTitles.slice(0, 10)))
  })
  await sleep(500)
}

const getScenarioDays = () => safeEval(() =>
  Array.from(document.querySelectorAll('button'))
    .filter(b => {
      const t = b.textContent?.trim() ?? ''
      const cls = b.className ?? ''
      return cls.includes('tracking-wider') && cls.includes('uppercase') && cls.includes('px-2.5') && t.length > 0 && t.length <= 8
    })
    .map(b => b.textContent?.trim())
)

// ── 1. 페이지 로드 ──
console.log('\n=== 1. 페이지 로드 ===')
await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 15000 })
await sleep(1500)
PASS('페이지 로드')

// NAV 버튼 확인
const navTitles = await safeEval(() =>
  Array.from(document.querySelectorAll('button')).map(b => b.title).filter(Boolean)
)
console.log('NAV 버튼 titles:', navTitles?.slice(0, 10))

await goToItinerary()
await sleep(500)
const onItinerary = await safeEval(() => document.body.innerText.includes('TRAVEL UNITS'))
onItinerary ? PASS('이티너리 페이지 확인') : console.log('INFO: 이티너리 탭 이동 시도 중')

// ── 2. TIME SCRUB 기본 확인 ──
console.log('\n=== 2. TIME SCRUB 날짜 버튼 확인 ===')
const initialDays = await getScenarioDays()
console.log('날짜 버튼:', initialDays)
initialDays?.length > 0 ? PASS(`${initialDays.length}일 버튼 확인`) : FAIL('날짜 버튼 없음')

// ── 3. 타임라인 아이템 수 ──
const allItems = await safeEval(() =>
  document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
) ?? 0
console.log('전체 타임라인 아이템:', allItems)
allItems > 0 ? PASS(`타임라인 아이템 ${allItems}개`) : FAIL('타임라인 아이템 없음')

// ── 4. 가족 포커스 — 덮어쓰기 없는지 ──
console.log('\n=== 3. 가족 포커스 필터링 ===')
await safeEval(() => {
  Array.from(document.querySelectorAll('button'))
    .find(b => b.className?.includes('min-w-0') && b.className?.includes('flex-1') && b.className?.includes('text-left'))
    ?.click()
})
await sleep(700)

const focusedItems = await safeEval(() =>
  document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
) ?? 0
console.log(`포커스 후: ${focusedItems}개 (전체: ${allItems})`)
focusedItems > 0 && focusedItems <= allItems
  ? PASS(`TRANSIT strict 필터 + 글로벌 아이템 유지 (${allItems}→${focusedItems})`)
  : focusedItems === 0
    ? FAIL('아이템 0개 — 필터 너무 엄격')
    : FAIL(`포커스 후 아이템 증가 (${focusedItems}) — 덮어쓰기 발생`)

const hasFocus = await safeEval(() =>
  Array.from(document.querySelectorAll('span')).some(s => s.textContent?.trim() === 'FOCUS')
)
hasFocus ? PASS('FOCUS 배지') : FAIL('FOCUS 배지 없음')

// 초기화
await safeEval(() => {
  Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent?.includes('✕') && b.textContent?.includes('ALL'))?.click()
})
await sleep(400)

// ── 5. 4일 일정 시뮬레이션 ──
console.log('\n=== 4. 4일 일정 — TIME SCRUB 확장 시뮬레이션 ===')
// Day 3 (4일차) 시작 슬롯 = 3 * TIME_SLOTS_LEN = 12
const DAY4_SLOT = 3 * TIME_SLOTS_LEN  // = 12

const lsData = await safeEval(() => localStorage.getItem('trip-command-center/v5-korea'))
if (lsData) {
  const injected = await safeEval((day4Slot) => {
    try {
      const doc = JSON.parse(localStorage.getItem('trip-command-center/v5-korea'))
      // 4일차 아이템 추가 (globalActivity, familyIds 없음)
      if (!doc.itineraryItems.find(i => i.id === '__test-day4__')) {
        doc.itineraryItems.push({
          id: '__test-day4__',
          type: 'itineraryItem',
          rowId: 'activities',
          title: '4일차 TEST 일정',
          startSlot: day4Slot + 2,
          span: 1,
          color: 'blue',
          familyIds: [],
        })
        localStorage.setItem('trip-command-center/v5-korea', JSON.stringify(doc))
      }
      return true
    } catch (e) { return String(e) }
  }, DAY4_SLOT)
  console.log('4일차 주입:', injected)

  if (injected === true) {
    await page.reload({ waitUntil: 'networkidle2' })
    await sleep(1500)
    await goToItinerary()
    await sleep(500)

    const daysAfter = await getScenarioDays()
    console.log('4일 아이템 후 TIME SCRUB:', daysAfter)
    daysAfter?.length >= 4
      ? PASS(`TIME SCRUB ${daysAfter.length}일로 확장됨!`)
      : FAIL(`TIME SCRUB ${daysAfter?.length}일 — 확장 안 됨 (예상 4+)`)

    const itemsAfter = await safeEval(() =>
      document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
    )
    console.log('4일 후 타임라인 아이템:', itemsAfter)
    itemsAfter > allItems ? PASS('4일차 아이템 타임라인에 추가됨') : console.log('INFO: 4일차 아이템은 visible range 밖일 수 있음')

    // 4일차 TIME SCRUB 버튼 클릭
    console.log('\n=== 5. TIME SCRUB 마지막 날 클릭 ===')
    const finalDays = await getScenarioDays()
    if (finalDays?.length > 1) {
      const beforeSlot = await safeEval(() => {
        try { return JSON.parse(localStorage.getItem('trip-command-center/v5-korea'))?.ui?.timeline?.cursorSlot } catch { return null }
      })
      await safeEval(() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => {
          const t = b.textContent?.trim() ?? ''
          const cls = b.className ?? ''
          return cls.includes('tracking-wider') && cls.includes('uppercase') && cls.includes('px-2.5') && t.length > 0 && t.length <= 8
        })
        if (btns.length > 0) btns[btns.length - 1].click()
      })
      await sleep(500)
      const afterSlot = await safeEval(() => {
        try { return JSON.parse(localStorage.getItem('trip-command-center/v5-korea'))?.ui?.timeline?.cursorSlot } catch { return null }
      })
      console.log(`cursorSlot: ${beforeSlot?.toFixed?.(1)} → ${afterSlot?.toFixed?.(1)}`)
      afterSlot !== beforeSlot ? PASS('TIME SCRUB 클릭 시 cursorSlot 변경') : FAIL('cursorSlot 변경 없음')
    }

    // 테스트 아이템 정리
    await safeEval(() => {
      try {
        const doc = JSON.parse(localStorage.getItem('trip-command-center/v5-korea'))
        doc.itineraryItems = doc.itineraryItems.filter(i => i.id !== '__test-day4__')
        localStorage.setItem('trip-command-center/v5-korea', JSON.stringify(doc))
      } catch {}
    })
  }
} else {
  FAIL('localStorage에 trip 데이터 없음')
}

// ── 6. Transit/Main Ops/Support 행 ──
console.log('\n=== 6. 타임라인 행 구조 ===')
const rows = await safeEval(() =>
  Array.from(document.querySelectorAll('div'))
    .filter(d => ['Transit', 'Main Ops', 'Support'].includes(d.textContent?.trim()))
    .map(d => d.textContent?.trim())
)
console.log('타임라인 행:', rows)
rows?.length >= 3 ? PASS('Transit / Main Ops / Support 행 확인') : FAIL('행 부족')

await browser.close()
console.log('\n=== 완료 ===')
