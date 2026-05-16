import puppeteer from 'puppeteer'

const BASE = 'http://localhost:5173'
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

// ── 초기화 ──
console.log('\n=== 1. 페이지 로드 ===')
await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 15000 })
await sleep(1000)
PASS('페이지 로드')

const onItinerary = await page.evaluate(() =>
  document.body.innerText.includes('TRAVEL UNITS') || document.body.innerText.includes('Travel units')
)
onItinerary ? PASS('이티너리 페이지 확인') : FAIL('이티너리 페이지 없음')

// ── TRAVEL UNITS 가족 버튼 (min-w-0 flex-1 text-left 클래스) ──
console.log('\n=== 2. TRAVEL UNITS 가족 버튼 확인 ===')
const travelBtns = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button'))
    .filter(b => b.className?.includes('min-w-0') && b.className?.includes('flex-1') && b.className?.includes('text-left'))
    .map(b => b.textContent?.trim().slice(0, 40))
)
console.log('TRAVEL UNITS 버튼:', travelBtns)
travelBtns.length > 0 ? PASS(`${travelBtns.length}개 가족 버튼 발견`) : FAIL('가족 버튼 없음')

// ── 타임라인 아이템 수 (전체) ──
const allItemsCount = await page.evaluate(() =>
  document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
)
console.log('전체 보기 타임라인 아이템 수:', allItemsCount)

// ── 첫 번째 TRAVEL UNITS 가족 클릭 ──
console.log('\n=== 3. 첫 번째 가족 클릭 (TRAVEL UNITS) ===')
const familyId = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button'))
    .find(b => b.className?.includes('min-w-0') && b.className?.includes('flex-1') && b.className?.includes('text-left'))
  if (!btn) return null
  btn.click()
  return btn.textContent?.trim().slice(0, 20)
})
console.log('클릭한 가족:', familyId)
await sleep(700)

// ── FOCUS 배지 확인 (span 안에 정확히 'FOCUS' 텍스트 있는지) ──
console.log('\n=== 4. FOCUS 배지 확인 ===')
const hasFocusBadge = await page.evaluate(() =>
  Array.from(document.querySelectorAll('span')).some(s => s.textContent?.trim() === 'FOCUS')
)
hasFocusBadge ? PASS('FOCUS 배지 (span) 표시됨') : FAIL('FOCUS 배지 없음')

// ── ✕ ALL 버튼 확인 ──
const hasAllButton = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button')).some(b =>
    b.textContent?.includes('✕') && b.textContent?.includes('ALL')
  )
)
hasAllButton ? PASS('✕ ALL 버튼 존재') : FAIL('✕ ALL 버튼 없음')

// ── localStorage 확인 ──
console.log('\n=== 5. localStorage focusFamilyId 확인 ===')
await sleep(300)
const focusedFamilyId = await page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('trip-command-center/v5-korea'))?.ui?.map?.focusFamilyId } catch { return null }
})
console.log('focusFamilyId:', focusedFamilyId)
focusedFamilyId && focusedFamilyId !== 'all'
  ? PASS(`focusFamilyId 설정됨: ${focusedFamilyId}`)
  : FAIL(`focusFamilyId 미설정: ${focusedFamilyId}`)

// ── 타임라인 필터링 효과 확인 ──
console.log('\n=== 6. 타임라인 필터링 확인 ===')
const focusedItemsCount = await page.evaluate(() =>
  document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
)
console.log(`타임라인 아이템: 전체=${allItemsCount}, 포커스=${focusedItemsCount}`)
focusedItemsCount <= allItemsCount
  ? PASS(`포커스 시 타임라인 아이템 감소 또는 유지 (${allItemsCount} → ${focusedItemsCount})`)
  : FAIL(`포커스 시 아이템이 오히려 증가: ${focusedItemsCount} > ${allItemsCount}`)

// ── ✕ ALL 버튼으로 초기화 ──
console.log('\n=== 7. ✕ ALL 버튼으로 초기화 ===')
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent?.includes('✕') && b.textContent?.includes('ALL'))
  if (btn) btn.click()
})
await sleep(600)

const afterResetItemsCount = await page.evaluate(() =>
  document.querySelectorAll('[class*="absolute flex cursor-pointer"]').length
)
const afterResetFocusBadge = await page.evaluate(() =>
  Array.from(document.querySelectorAll('span')).some(s => s.textContent?.trim() === 'FOCUS')
)
console.log(`초기화 후 타임라인 아이템: ${afterResetItemsCount}`)
afterResetItemsCount >= focusedItemsCount
  ? PASS(`초기화 후 타임라인 아이템 복원 (${focusedItemsCount} → ${afterResetItemsCount})`)
  : FAIL(`초기화 후 아이템 수 이상: ${afterResetItemsCount}`)
!afterResetFocusBadge ? PASS('초기화 후 FOCUS 배지 사라짐') : FAIL('초기화 후 FOCUS 배지 남아있음')

// ── 토글 테스트: 같은 가족 재클릭 ──
console.log('\n=== 8. 토글 테스트 (같은 가족 재클릭) ===')
await page.evaluate(() => {
  Array.from(document.querySelectorAll('button'))
    .find(b => b.className?.includes('min-w-0') && b.className?.includes('flex-1') && b.className?.includes('text-left'))
    ?.click()
})
await sleep(400)
const afterFirstClick = await page.evaluate(() =>
  Array.from(document.querySelectorAll('span')).some(s => s.textContent?.trim() === 'FOCUS')
)
afterFirstClick ? PASS('1번째 클릭 → FOCUS 배지 ON') : FAIL('1번째 클릭 → FOCUS 배지 없음')

// 같은 가족 재클릭 (토글 OFF)
await page.evaluate(() => {
  // 이번엔 FOCUS 배지가 있는 버튼 (focused 상태의 가족)
  Array.from(document.querySelectorAll('button'))
    .find(b => b.className?.includes('min-w-0') && b.className?.includes('flex-1') && b.className?.includes('text-left'))
    ?.click()
})
await sleep(400)
const afterSecondClick = await page.evaluate(() =>
  Array.from(document.querySelectorAll('span')).some(s => s.textContent?.trim() === 'FOCUS')
)
!afterSecondClick ? PASS('2번째 클릭 → FOCUS 배지 OFF (토글)') : FAIL('2번째 클릭 → 토글 안 됨')

// ── 타임라인 행 레이블 확인 ──
console.log('\n=== 9. 타임라인 행 레이블 확인 ===')
const rowLabels = await page.evaluate(() =>
  Array.from(document.querySelectorAll('div'))
    .filter(d => ['Transit', 'Main Ops', 'Support'].includes(d.textContent?.trim()))
    .map(d => d.textContent?.trim())
)
console.log('타임라인 행:', rowLabels)
rowLabels.length >= 3 ? PASS('Transit / Main Ops / Support 행 확인') : FAIL(`행 부족: ${rowLabels.join(', ')}`)

await browser.close()
console.log('\n=== 완료 ===')
