import { useState } from 'react'
import { Loader2, MapPin, Users, CalendarDays, Sparkles, ChevronDown, ChevronUp, Clock, Utensils, Bed, Car, Landmark, Map } from 'lucide-react'

const EXAMPLE_QUERIES = [
  '부부 2명, 제주도, 3박 4일',
  '가족 4명 (아이 2명), 부산, 2박 3일',
  '친구 3명, 경주, 1박 2일',
  '혼자, 전주 한옥마을, 1박 2일',
]

const SLOT_TYPE_CONFIG = {
  attraction:    { icon: Landmark, color: '#58A6FF', label: '관광',  mapCategory: 'activity' },
  restaurant:    { icon: Utensils, color: '#D29922', label: '식사',  mapCategory: 'meal' },
  meal:          { icon: Utensils, color: '#D29922', label: '식사',  mapCategory: 'meal' },
  accommodation: { icon: Bed,      color: '#3FB950', label: '숙소',  mapCategory: 'stay' },
  stay:          { icon: Bed,      color: '#3FB950', label: '숙소',  mapCategory: 'stay' },
  transport:     { icon: Car,      color: '#8B949E', label: '이동',  mapCategory: 'logistics' },
}

const BUDGET_CATEGORY_COLORS = {
  숙박: '#58A6FF', 식비: '#D29922', 교통: '#A371F7',
  입장료: '#3FB950', 쇼핑: '#F78166', 기타: '#8B949E',
  '현지교통': '#A371F7', '왕복 교통비': '#F0883E', '쇼핑/기타': '#F78166',
}

function formatWon(n) {
  if (!n || n === 0) return '무료'
  if (n >= 10000) return `${Math.floor(n / 10000)}만원`
  return `${n.toLocaleString()}원`
}

function BudgetSection({ budget }) {
  const [open, setOpen] = useState(false)
  const total = budget.total ?? budget.grandTotal ?? 0
  const perPerson = budget.perPerson ?? budget.perPersonTotal ?? 0
  const breakdown = budget.breakdown ?? {}
  const entries = Object.entries(breakdown).filter(([, v]) => v > 0)

  return (
    <div className="border-t border-[#30363D]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#161b22] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8B949E]">💰 예산</span>
          <span className="text-[11px] font-bold text-[#3FB950]">{total.toLocaleString()}원</span>
          <span className="text-[9px] text-[#4B5563]">1인 {perPerson.toLocaleString()}원</span>
        </div>
        {open ? <ChevronUp size={11} className="text-[#8B949E]" /> : <ChevronDown size={11} className="text-[#8B949E]" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {entries.map(([label, amount]) => {
            const pct = total > 0 ? amount / total : 0
            const color = BUDGET_CATEGORY_COLORS[label] ?? '#8B949E'
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-[#C9D1D9]">{label}</span>
                  <span className="text-[10px] font-semibold" style={{ color }}>
                    {formatWon(amount)}
                    <span className="ml-1 text-[9px] text-[#4B5563]">({Math.round(pct * 100)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#21262d] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(pct * 100)}%`, background: color }}
                  />
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-between pt-1 border-t border-[#30363D] mt-1">
            <span className="text-[10px] font-bold text-[#C9D1D9]">합계</span>
            <span className="text-[11px] font-bold text-[#3FB950]">{total.toLocaleString()}원</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TripPlannerPanel({ onMarkLocations }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [expandedDay, setExpandedDay] = useState(0)
  const [showRestaurants, setShowRestaurants] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [mapScope, setMapScope] = useState('day') // 'day' | 'all'
  const [mapApplied, setMapApplied] = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResult(null)
    setExpandedDay(0)
    setMapApplied(false)
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '서버 오류')
      setResult(data.itinerary ?? data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleApplyToMap() {
    if (!result || !onMarkLocations) return

    const daysToUse = mapScope === 'all'
      ? (result.days ?? [])
      : [(result.days ?? [])[expandedDay]].filter(Boolean)

    const locations = daysToUse
      .flatMap((day) => (day.slots ?? []))
      .map((slot, i) => ({
        id: `planner-${i}-${slot.name}`,
        title: slot.name,
        coordinates: {
          lat: Number(slot.coordinates?.lat),
          lng: Number(slot.coordinates?.lng),
        },
        address: slot.address ?? '',
        category: (SLOT_TYPE_CONFIG[slot.type] ?? SLOT_TYPE_CONFIG.attraction).mapCategory,
      }))
      .filter((loc) => Number.isFinite(loc.coordinates.lat) && Number.isFinite(loc.coordinates.lng))

    if (!locations.length) return
    onMarkLocations(locations)
    setMapApplied(true)
    setTimeout(() => setMapApplied(false), 2000)
  }

  return (
    <div className="rounded border border-[#30363D] bg-[#0d1117] text-[#C9D1D9] text-xs">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#30363D]">
        <Sparkles size={12} className="text-[#D29922]" />
        <span className="font-bold text-[11px] uppercase tracking-widest text-[#8B949E]">AI 여행 플래너</span>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 space-y-2">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          placeholder={'누구랑, 어디로, 며칠 가는지 입력하세요\n예) 부부 2명, 제주도, 3박 4일'}
          rows={3}
          className="w-full resize-none rounded border border-[#30363D] bg-[#161b22] px-2 py-2 text-[11px] text-[#C9D1D9] placeholder-[#4B5563] focus:border-[#58A6FF] focus:outline-none leading-relaxed"
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-1">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuery(q)}
              className="rounded px-2 py-0.5 text-[10px] bg-[#161b22] border border-[#30363D] text-[#8B949E] hover:border-[#58A6FF] hover:text-[#58A6FF] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full flex items-center justify-center gap-2 rounded bg-[#238636] py-1.5 text-[11px] font-bold text-white hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {loading ? '일정 생성 중...' : '여행 일정 생성'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mx-3 mb-3 rounded border border-[#F85149]/40 bg-[#F85149]/10 px-2 py-2 text-[10px] text-[#F85149]">
          ⚠ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="border-t border-[#30363D]">

          {/* Summary strip */}
          <div className="flex items-center gap-3 px-3 py-2 bg-[#161b22]">
            <div className="flex items-center gap-1 text-[10px] text-[#58A6FF]">
              <MapPin size={10} />
              <span className="font-semibold">{result.summary?.destination}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#8B949E]">
              <CalendarDays size={10} />
              <span>{result.summary?.days}박 {(result.summary?.days ?? 0) + 1}일</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#8B949E]">
              <Users size={10} />
              <span>{result.summary?.travelers}</span>
            </div>
          </div>

          {/* Budget section */}
          {result.budget && <BudgetSection budget={result.budget} />}

          {/* Day tabs */}
          <div className="flex overflow-x-auto border-y border-[#30363D]">
            {(result.days ?? []).map((day, i) => (
              <button
                key={i}
                onClick={() => { setExpandedDay(i); setMapApplied(false) }}
                className={`shrink-0 px-3 py-1.5 text-[10px] font-semibold transition-colors border-b-2 ${
                  expandedDay === i
                    ? 'border-[#58A6FF] text-[#58A6FF]'
                    : 'border-transparent text-[#8B949E] hover:text-[#C9D1D9]'
                }`}
              >
                {day.dayNumber}일차
              </button>
            ))}
          </div>

          {/* Active day slots */}
          {result.days?.[expandedDay] && (
            <div className="px-3 py-2 space-y-2 max-h-64 overflow-y-auto">
              <div className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                {result.days[expandedDay].title}
              </div>
              {(result.days[expandedDay].slots ?? []).map((slot, i) => {
                const cfg = SLOT_TYPE_CONFIG[slot.type] ?? SLOT_TYPE_CONFIG.attraction
                const Icon = cfg.icon
                return (
                  <div key={i} className="flex gap-2">
                    <div className="flex flex-col items-center w-10 shrink-0">
                      <span className="text-[9px] font-mono text-[#8B949E]">{slot.time}</span>
                      <div className="mt-0.5 rounded-full p-1" style={{ background: cfg.color + '22' }}>
                        <Icon size={9} style={{ color: cfg.color }} />
                      </div>
                      {i < (result.days[expandedDay].slots.length - 1) && (
                        <div className="flex-1 w-px bg-[#30363D] mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-[11px] text-[#C9D1D9] leading-tight">{slot.name}</span>
                        <span
                          className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold"
                          style={{ background: cfg.color + '22', color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      {slot.address && (
                        <div className="text-[9px] text-[#4B5563] mt-0.5 leading-tight">{slot.address}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {slot.duration && slot.duration !== '-' && (
                          <span className="flex items-center gap-0.5 text-[9px] text-[#4B5563]">
                            <Clock size={8} /> {slot.duration}
                          </span>
                        )}
                        {slot.cost > 0 && (
                          <span className="text-[9px] text-[#4B5563]">{formatWon(slot.cost)}</span>
                        )}
                      </div>
                      {slot.tip && (
                        <div className="mt-1 rounded bg-[#D29922]/10 border border-[#D29922]/20 px-1.5 py-1 text-[9px] text-[#D29922] leading-snug">
                          💡 {slot.tip}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── 지도에 반영 버튼 ── */}
          <div className="px-3 py-2 border-t border-[#30363D] space-y-2">
            {/* scope toggle */}
            <div className="flex rounded overflow-hidden border border-[#30363D]">
              {[['day', '이 날만'], ['all', '전체 일정']].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMapScope(val)}
                  className="flex-1 py-1 text-[10px] font-semibold transition-colors"
                  style={{
                    background: mapScope === val ? 'rgba(88,166,255,0.18)' : 'transparent',
                    color: mapScope === val ? '#58A6FF' : '#8B949E',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleApplyToMap}
              className="w-full flex items-center justify-center gap-2 rounded py-1.5 text-[11px] font-bold transition-all"
              style={{
                background: mapApplied ? 'rgba(63,185,80,0.18)' : 'rgba(88,166,255,0.15)',
                border: `1px solid ${mapApplied ? '#3FB950' : '#58A6FF'}`,
                color: mapApplied ? '#3FB950' : '#58A6FF',
              }}
            >
              <Map size={12} />
              {mapApplied ? '✓ 지도에 반영됨' : '지도에 반영'}
            </button>
          </div>

          {/* Restaurants accordion */}
          {result.restaurants?.length > 0 && (
            <div className="border-t border-[#30363D]">
              <button
                onClick={() => setShowRestaurants((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-[#8B949E] hover:text-[#C9D1D9] transition-colors"
              >
                <span>🍽 추천 맛집 ({result.restaurants.length}곳)</span>
                {showRestaurants ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              {showRestaurants && (
                <div className="px-3 pb-3 space-y-2">
                  {result.restaurants.map((r, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 rounded border border-[#30363D] bg-[#161b22] px-2 py-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[11px] text-[#C9D1D9] truncate">{r.name}</div>
                        <div className="text-[9px] text-[#8B949E]">{r.cuisine} · {r.address}</div>
                        {r.recommendation && (
                          <div className="text-[9px] text-[#D29922] mt-0.5">⭐ {r.recommendation}</div>
                        )}
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-[#3FB950]">{r.priceRange}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips accordion */}
          {result.tips?.length > 0 && (
            <div className="border-t border-[#30363D]">
              <button
                onClick={() => setShowTips((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-[#8B949E] hover:text-[#C9D1D9] transition-colors"
              >
                <span>💡 여행 팁 ({result.tips.length}개)</span>
                {showTips ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              {showTips && (
                <ul className="px-3 pb-3 space-y-1">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex gap-1.5 text-[10px] text-[#8B949E]">
                      <span className="shrink-0 text-[#D29922]">·</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
