import { useEffect, useState } from 'react'
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Users, X } from 'lucide-react'

/** 혼잡도 레벨 → 배지 스타일 */
function CongestionBadge({ level }) {
  const map = {
    'very-high': { label: '매우혼잡', className: 'bg-red-100 text-red-700 border-red-200' },
    high:        { label: '혼잡',     className: 'bg-orange-100 text-orange-700 border-orange-200' },
    medium:      { label: '보통',     className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    low:         { label: '여유',     className: 'bg-green-100 text-green-700 border-green-200' },
  }
  const { label, className } = map[level] || map.medium
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${className}`}>
      {label}
    </span>
  )
}

/** 월별 방문객 바 차트 툴팁 */
function VisitorTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'domestic' ? '내국인' : '외국인'}: {(p.value / 10000).toFixed(0)}만명
        </p>
      ))}
    </div>
  )
}

/** 시간대별 혼잡도 툴팁 */
function CongestionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-white border border-slate-200 rounded shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{label}시</p>
      <p className="text-blue-600">혼잡도 {val}%</p>
    </div>
  )
}

export default function VisitorStatsPanel({ areaCode = '39', onClose }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/tour/stats?areaCode=${areaCode}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [areaCode])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  const hourlyData = stats.hourlyPattern?.map((h) => ({
    ...h,
    label: `${h.hour}`,
  }))

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">
            {stats.areaName} 방문객 통계
          </span>
          <span className="text-xs text-slate-400">{stats.year}</span>
          {stats.isMock && (
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
              샘플
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* 월별 방문객 바 차트 */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            월별 방문객
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={stats.monthlyVisitors} barSize={8} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis hide />
              <Tooltip content={<VisitorTooltip />} />
              <Bar dataKey="domestic" name="domestic" fill="#1D4ED8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="foreign"  name="foreign"  fill="#93C5FD" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1 justify-end">
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-700 inline-block" /> 내국인
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-300 inline-block" /> 외국인
            </span>
          </div>
        </div>

        {/* 시간대별 혼잡도 라인 차트 */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            시간대별 혼잡도 패턴
          </p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                interval={1}
                tickFormatter={(v) => `${v}시`}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<CongestionTooltip />} />
              <Line
                type="monotone"
                dataKey="congestion"
                stroke="#D97706"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 주요 관광지 혼잡도 */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            주요 관광지 혼잡도
          </p>
          <div className="space-y-1.5">
            {stats.topAttractions?.map((attr) => (
              <div key={attr.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-600 truncate">{attr.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {(attr.visitors / 10000).toFixed(0)}만
                  </span>
                  <CongestionBadge level={attr.congestionLevel} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
