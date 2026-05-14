import { useCallback, useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import AttractionCard from './AttractionCard'

const AREA_CODES = [
  { code: '39', name: '제주도' },
  { code: '1',  name: '서울' },
  { code: '6',  name: '부산' },
  { code: '4',  name: '대구' },
  { code: '2',  name: '인천' },
]

const CONTENT_TYPES = [
  { id: '',   name: '전체' },
  { id: '12', name: '관광지' },
  { id: '39', name: '음식점' },
  { id: '32', name: '숙박' },
  { id: '28', name: '레포츠' },
]

/** 혼잡도 레벨 — 간단한 mock 매핑 */
function mockCongestionLevel(title) {
  if (['성산일출봉', '한라산'].some((t) => title.includes(t))) return 'very-high'
  if (['중문', '협재'].some((t) => title.includes(t))) return 'high'
  if (['함덕', '동문'].some((t) => title.includes(t))) return 'medium'
  return 'low'
}

export default function AttractionSearchPanel({ onSelectLocation }) {
  const [areaCode, setAreaCode] = useState('39')
  const [contentTypeId, setContentTypeId] = useState('')
  const [keyword, setKeyword] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [isMock, setIsMock] = useState(false)

  const search = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        areaCode,
        ...(contentTypeId && { contentTypeId }),
        ...(keyword && { keyword }),
        numOfRows: '12',
      })
      const res = await fetch(`/api/tour/search?${params}`)
      const data = await res.json()
      setItems(data.items || [])
      setIsMock(!!data.isMock)
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [areaCode, contentTypeId, keyword])

  // 초기 로드
  useEffect(() => {
    search()
  }, [areaCode, contentTypeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 지역 선택 */}
      <div className="flex gap-1.5 flex-wrap">
        {AREA_CODES.map((area) => (
          <button
            key={area.code}
            onClick={() => setAreaCode(area.code)}
            className={`
              text-xs px-2.5 py-1 rounded border transition-colors
              ${areaCode === area.code
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}
            `}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* 콘텐츠 타입 */}
      <div className="flex gap-1.5 flex-wrap">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setContentTypeId(ct.id)}
            className={`
              text-xs px-2 py-0.5 rounded border transition-colors
              ${contentTypeId === ct.id
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}
            `}
          >
            {ct.name}
          </button>
        ))}
      </div>

      {/* 키워드 검색 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="키워드로 검색..."
          className="flex-1 text-xs border border-slate-200 rounded px-3 py-1.5 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={search}
          disabled={loading}
          className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {/* mock 표시 */}
      {isMock && (
        <p className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          TourAPI 키 미설정 — 샘플 데이터 표시 중
        </p>
      )}

      {/* 카드 그리드 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <AttractionCard
              key={item.id}
              location={item}
              congestionLevel={mockCongestionLevel(item.title)}
              onSelect={onSelectLocation}
            />
          ))}
        </div>
      )}
    </div>
  )
}
