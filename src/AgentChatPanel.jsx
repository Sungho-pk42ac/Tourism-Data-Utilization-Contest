import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, ChevronDown, ChevronUp, Loader2, Send, X } from 'lucide-react'

/** AI 에이전트 tool_call → 사람이 읽을 수 있는 설명 변환 */
function describeToolCall(name, args) {
  const map = {
    searchAndMarkLocations: () => `🔍 "${args.keyword}" 검색 중${args.areaCode ? ` (지역코드: ${args.areaCode})` : ''}`,
    setMapCenter:           () => `📍 지도 이동: (${args.lat?.toFixed(4)}, ${args.lng?.toFixed(4)})`,
    showCongestionHeatmap:  () => `🌡️ ${args.hour}시 혼잡도 히트맵 표시`,
    buildOptimalRoute:      () => `🗺️ 최적 경로 생성${args.availableHours ? ` (${args.availableHours}시간)` : ''}`,
    filterByCategory:       () => `🏷️ 카테고리 필터: ${args.category}`,
    clearMarkers:           () => '🗑️ 마커 초기화',
  }
  return map[name]?.() || `⚙️ ${name}`
}

/** 단일 메시지 버블 */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  const isSystem = msg.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {msg.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] space-y-1`}>
        {/* 텍스트 응답 */}
        {msg.content && (
          <div className={`
            text-xs px-3 py-2 rounded-lg leading-relaxed
            ${isUser
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 border border-slate-200'}
          `}>
            {msg.content}
          </div>
        )}
        {/* 실행된 도구 목록 */}
        {msg.toolCalls?.length > 0 && (
          <div className="space-y-0.5">
            {msg.toolCalls.map((tc) => (
              <div key={tc.id} className="text-[10px] text-slate-500 bg-blue-50 border border-blue-100 px-2 py-1 rounded flex items-center gap-1.5">
                <span className="text-blue-400">›</span>
                {describeToolCall(tc.name, tc.args)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** 예시 명령어 버튼 */
const SAMPLE_COMMANDS = [
  '제주도 혼잡도 낮은 카페 3곳 지도에 표시해줘',
  '오늘 오후 2시 기준 최적 경로 만들어줘',
  '성산일출봉 지도에서 보여줘',
  '서귀포 숙박 검색해줘',
]

export default function AgentChatPanel({ onMapCommand }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! 제주도 가족여행 AI 가이드입니다. 자연어로 지도 명령을 내려보세요.',
      toolCalls: [],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [noKey, setNoKey] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const historyRef = useRef([])

  // 새 메시지 시 스크롤
  useEffect(() => {
    if (!collapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, collapsed])

  /** TourAPI 검색 후 마커 표시 — tool_call 후처리 */
  const executeToolCall = useCallback(async (tc) => {
    if (!onMapCommand) return

    if (tc.name === 'searchAndMarkLocations') {
      try {
        const params = new URLSearchParams({
          keyword: tc.args.keyword || '',
          ...(tc.args.areaCode && { areaCode: tc.args.areaCode }),
          ...(tc.args.contentTypeId && { contentTypeId: tc.args.contentTypeId }),
          numOfRows: String(tc.args.maxCount || 5),
        })
        const res = await fetch(`/api/tour/search?${params}`)
        const data = await res.json()
        onMapCommand({ command: 'markLocations', args: { locations: data.items || [] } })
      } catch (_) { /* 무시 */ }
    } else if (tc.name === 'setMapCenter') {
      onMapCommand({ command: 'setCenter', args: tc.args })
    } else if (tc.name === 'showCongestionHeatmap') {
      onMapCommand({ command: 'showHeatmap', args: tc.args })
    } else if (tc.name === 'clearMarkers') {
      onMapCommand({ command: 'clearSearchMarkers', args: {} })
    }
  }, [onMapCommand])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setLoading(true)

    const userMsg = { role: 'user', content: text, toolCalls: [] }
    setMessages((prev) => [...prev, userMsg])

    // history에 추가 (system/assistant 형식으로)
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: text },
    ]

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyRef.current.slice(-10),
        }),
      })
      const data = await res.json()

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `오류: ${data.error}`, toolCalls: [] },
        ])
        setLoading(false)
        return
      }

      if (data.isMock) {
        setNoKey(true)
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        toolCalls: data.toolCalls || [],
      }
      setMessages((prev) => [...prev, assistantMsg])

      historyRef.current = [
        ...historyRef.current,
        { role: 'assistant', content: data.reply || '' },
      ]

      // 지도 명령 실행
      for (const tc of data.toolCalls || []) {
        await executeToolCall(tc)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '네트워크 오류가 발생했습니다. API 서버가 실행 중인지 확인해주세요.', toolCalls: [] },
      ])
    }

    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [input, loading, executeToolCall])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-blue-600 cursor-pointer"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">AI 여행 가이드</span>
          {noKey && (
            <span className="text-[10px] bg-blue-500 text-blue-100 px-1.5 py-0.5 rounded">
              API키 미설정
            </span>
          )}
        </div>
        <button className="text-blue-200 hover:text-white transition-colors">
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: '280px' }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                </div>
                <div className="bg-slate-100 border border-slate-200 text-slate-400 text-xs px-3 py-2 rounded-lg">
                  분석 중...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 예시 명령어 */}
          <div className="px-3 pb-2">
            <div className="flex gap-1 flex-wrap">
              {SAMPLE_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => { setInput(cmd); inputRef.current?.focus() }}
                  className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 transition-colors truncate max-w-[150px]"
                  title={cmd}
                >
                  {cmd.length > 12 ? cmd.slice(0, 12) + '…' : cmd}
                </button>
              ))}
            </div>
          </div>

          {/* 입력창 */}
          <div className="flex items-center gap-2 px-3 pb-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="자연어로 지도 명령..."
              disabled={loading}
              className="flex-1 text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
