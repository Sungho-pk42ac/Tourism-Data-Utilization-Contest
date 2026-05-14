import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, CheckCircle2, Loader2, MessageCircle, Minimize2, Send, Trash2 } from 'lucide-react'

const MAX_CONTEXT_MESSAGES = 20
const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '제주 여행지 추천과 Google 지도 조정을 도와드립니다. 먼저 추천을 받은 뒤, 원하는 후보를 선택하면 그 항목만 일정에 반영됩니다.',
  toolCalls: [],
}

const SAMPLE_COMMANDS = [
  '이 루트 근처 가족 여행지 5곳 추천해줘',
  '아이와 가기 좋은 카페를 이 루트 안에서 찾아줘',
  '맛집 추천만 지도에 보여줘',
  '성산일출봉으로 지도 이동해줘',
]

function describeToolCall(name, args = {}) {
  const map = {
    searchAndMarkLocations: () => `"${args.keyword}" 추천 후보 검색`,
    setMapCenter: () => `Google 지도 이동: ${args.lat?.toFixed?.(4)}, ${args.lng?.toFixed?.(4)}`,
    showCongestionHeatmap: () => `${args.hour}시 교통 레이어 표시`,
    buildOptimalRoute: () => '선택 루트 기반 추천 후보 생성',
    filterByCategory: () => `카테고리 필터: ${args.category}`,
    clearMarkers: () => 'AI 추천 마커 초기화',
  }
  return map[name]?.() || name
}

function textFromToolCall(tc) {
  if (tc.name === 'buildOptimalRoute') return tc.args.preferences?.filter(Boolean).join(', ') || '제주 추천 루트'
  return tc.args.keyword || '제주 추천 여행지'
}

function summarizeToolCalls(toolCalls = []) {
  if (toolCalls.some((tc) => tc.name === 'searchAndMarkLocations' || tc.name === 'buildOptimalRoute')) {
    return '추천 후보를 찾았습니다. 원하는 항목을 선택하면 일정에 반영됩니다.'
  }
  if (toolCalls.some((tc) => tc.name === 'setMapCenter')) return 'Google 지도를 요청한 위치로 이동했습니다.'
  if (toolCalls.length) return '지도 명령을 처리했습니다.'
  return '요청을 처리했습니다.'
}

function trimMessages(messages) {
  return [INITIAL_MESSAGE, ...messages.filter((msg) => msg !== INITIAL_MESSAGE).slice(-MAX_CONTEXT_MESSAGES)]
}

function MessageBubble({ msg, onSelectRecommendation }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser ? (
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-[#58A6FF]/40 bg-[#58A6FF]/15">
          <Bot className="h-3.5 w-3.5 text-[#58A6FF]" />
        </div>
      ) : null}
      <div className="max-w-[84%] space-y-1">
        {msg.content ? (
          <div
            className={`whitespace-pre-wrap px-3 py-2 text-xs leading-relaxed ${
              isUser
                ? 'bg-[#58A6FF] text-[#0D1117]'
                : 'border border-[#30363D] bg-[#161B22] text-[#C9D1D9]'
            }`}
          >
            {msg.content}
          </div>
        ) : null}
        {msg.recommendations?.length ? (
          <div className="space-y-1">
            {msg.recommendations.map((location) => {
              const selected = msg.appliedRecommendationId === location.id
              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => onSelectRecommendation?.(msg.id, location, msg.recommendationMeta)}
                  disabled={Boolean(msg.appliedRecommendationId)}
                  className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 border px-2 py-2 text-left transition-colors ${
                    selected
                      ? 'border-[#3FB950]/45 bg-[#3FB950]/10 text-[#C9D1D9]'
                      : 'border-[#30363D] bg-[#0D1117] text-[#C9D1D9] hover:border-[#58A6FF]/45'
                  } disabled:cursor-default disabled:opacity-80`}
                >
                  <span className="flex h-6 w-6 items-center justify-center border border-[#58A6FF]/30 text-[10px] font-black text-[#58A6FF]">
                    {location.rank}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-black">{location.title}</span>
                    <span className="block truncate text-[10px] text-[#8B949E]">{location.address || '주소 확인 필요'}</span>
                  </span>
                  {selected ? <CheckCircle2 className="h-4 w-4 text-[#3FB950]" /> : null}
                </button>
              )
            })}
          </div>
        ) : null}
        {msg.toolCalls?.length ? (
          <div className="space-y-1">
            {msg.toolCalls.map((tc) => (
              <div
                key={tc.id}
                className="border border-[#58A6FF]/25 bg-[#58A6FF]/10 px-2 py-1 text-[10px] leading-snug text-[#8B949E]"
              >
                {describeToolCall(tc.name, tc.args)}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function AgentChatPanel({ onMapCommand, routeOptions = [] }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [noKey, setNoKey] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState(routeOptions[0]?.id || '')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const selectedRoute = routeOptions.find((route) => route.id === selectedRouteId) || routeOptions[0] || null

  useEffect(() => {
    if (!selectedRouteId && routeOptions[0]?.id) {
      setSelectedRouteId(routeOptions[0].id)
    }
  }, [routeOptions, selectedRouteId])

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [messages, open])

  const showRecommendationChoices = useCallback((locations, meta) => {
    const choices = locations.slice(0, 5).map((location, index) => ({
      ...location,
      rank: index + 1,
      routeId: meta.routeId,
      routeTitle: meta.routeTitle,
    }))

    onMapCommand?.({ command: 'markLocations', args: { locations: choices, routeId: meta.routeId } })

    setMessages((prev) => trimMessages([
      ...prev,
      {
        id: `recommendation-choice-${Date.now()}`,
        role: 'assistant',
        content: choices.length
          ? '어떤 추천을 선택하시겠습니까? 선택한 항목 1개만 일정에 반영됩니다.'
          : '선택한 루트 근처에서 추천 후보를 찾지 못했습니다.',
        toolCalls: [],
        recommendations: choices,
        recommendationMeta: meta,
      },
    ]))
  }, [onMapCommand])

  const executeToolCall = useCallback(async (tc) => {
    if (!onMapCommand) return

    if (tc.name === 'searchAndMarkLocations' || tc.name === 'buildOptimalRoute') {
      try {
        const keyword =
          tc.args.keyword ||
          tc.args.preferences?.filter(Boolean).join(' ') ||
          '제주 가족 여행지'
        const category = tc.args.contentTypeId === '39' ? 'meal' : tc.args.contentTypeId === '32' ? 'stay' : 'activity'
        const res = await fetch('/api/tour/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword,
            areaCode: tc.args.areaCode || '39',
            contentTypeId: tc.args.contentTypeId || '',
            numOfRows: tc.args.maxCount || 5,
            route: selectedRoute,
          }),
        })
        const data = await res.json()
        setNoKey(Boolean(data.isMock))
        showRecommendationChoices(data.items || [], {
          query: textFromToolCall(tc),
          category,
          routeId: selectedRoute?.id || null,
          routeTitle: selectedRoute?.title || null,
        })
      } catch (err) {
        setMessages((prev) => trimMessages([
          ...prev,
          {
            role: 'assistant',
            content: `추천 검색 오류: ${err.message || 'TourAPI 추천 요청을 처리하지 못했습니다.'}`,
            toolCalls: [],
          },
        ]))
        onMapCommand({ command: 'markLocations', args: { locations: [] } })
      }
      return
    }

    if (tc.name === 'setMapCenter') {
      onMapCommand({ command: 'setCenter', args: tc.args })
    } else if (tc.name === 'showCongestionHeatmap') {
      onMapCommand({ command: 'showHeatmap', args: tc.args })
    } else if (tc.name === 'filterByCategory') {
      onMapCommand({ command: 'filterByCategory', args: tc.args })
    } else if (tc.name === 'clearMarkers') {
      onMapCommand({ command: 'clearSearchMarkers', args: {} })
    }
  }, [onMapCommand, selectedRoute, showRecommendationChoices])

  const selectRecommendation = useCallback((messageId, location, meta = {}) => {
    setMessages((prev) => trimMessages(prev.map((msg) =>
      msg.id === messageId && !msg.appliedRecommendationId
        ? { ...msg, appliedRecommendationId: location.id }
        : msg,
    )))

    onMapCommand?.({
      command: 'markLocations',
      args: {
        locations: [{ ...location, routeId: meta.routeId, routeTitle: meta.routeTitle }],
        routeId: meta.routeId,
      },
    })
    onMapCommand?.({
      command: 'applyRecommendations',
      args: {
        locations: [{ ...location, routeId: meta.routeId, routeTitle: meta.routeTitle }],
        query: meta.query || location.title,
        category: meta.category || location.category || 'activity',
        routeId: meta.routeId || null,
      },
    })

    setMessages((prev) => trimMessages([
      ...prev,
      {
        role: 'assistant',
        content: `"${location.title}"을 선택했습니다. 이 항목만 일정과 지도 루트에 반영했습니다.`,
        toolCalls: [],
      },
    ]))
  }, [onMapCommand])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const history = messages
      .filter((msg) => ['user', 'assistant'].includes(msg.role) && msg.content)
      .slice(-MAX_CONTEXT_MESSAGES)
      .map(({ role, content }) => ({ role, content }))

    setInput('')
    setLoading(true)
    setMessages((prev) => trimMessages([...prev, { role: 'user', content: text, toolCalls: [] }]))

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          routeContext: selectedRoute
            ? {
                id: selectedRoute.id,
                title: selectedRoute.title,
                dayId: selectedRoute.dayId,
              }
            : null,
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.details || data.error || 'AI 응답을 가져오지 못했습니다.')
      }

      setNoKey(Boolean(data.isMock))
      const assistantMsg = {
        role: 'assistant',
        content: data.reply || summarizeToolCalls(data.toolCalls),
        toolCalls: data.toolCalls || [],
      }
      setMessages((prev) => trimMessages([...prev, assistantMsg]))

      for (const tc of data.toolCalls || []) {
        await executeToolCall(tc)
      }
    } catch (err) {
      setMessages((prev) => trimMessages([
        ...prev,
        {
          role: 'assistant',
          content: `연결 오류: ${err.message || 'API 서버가 실행 중인지 확인해주세요. npm run server 또는 npm run dev:all을 사용하세요.'}`,
          toolCalls: [],
        },
      ]))
    } finally {
      setLoading(false)
    }
  }, [executeToolCall, input, loading, messages, selectedRoute])

  const resetConversation = () => {
    setMessages([INITIAL_MESSAGE])
    setNoKey(false)
    onMapCommand?.({ command: 'clearSearchMarkers', args: {} })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-12 items-center justify-center border border-[#58A6FF]/45 bg-[#0D1117] text-[#58A6FF] shadow-[0_0_24px_rgba(88,166,255,0.22)] transition-colors hover:border-[#58A6FF] hover:bg-[#161B22]"
        aria-label="AI 여행 가이드 열기"
        title="AI 여행 가이드"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    )
  }

  return (
    <section className="flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-[#30363D] bg-[#0D1117] shadow-[0_20px_60px_rgba(0,0,0,0.42)]">
      <header className="flex items-center justify-between border-b border-[#30363D] bg-[#161B22] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Bot className="h-4 w-4 shrink-0 text-[#58A6FF]" />
          <div className="min-w-0">
            <div className="truncate text-xs font-black uppercase text-[#C9D1D9]">AI Travel Guide</div>
            <div className="text-[10px] text-[#8B949E]">Route scoped recommendations</div>
          </div>
          {noKey ? <span className="border border-[#D29922]/40 px-1.5 py-0.5 text-[9px] text-[#D29922]">MOCK</span> : null}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={resetConversation} className="p-1.5 text-[#8B949E] hover:text-[#C9D1D9]" aria-label="대화 초기화">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setOpen(false)} className="p-1.5 text-[#8B949E] hover:text-[#C9D1D9]" aria-label="AI 여행 가이드 접기">
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id || `${msg.role}-${index}`}
            msg={msg}
            onSelectRecommendation={selectRecommendation}
          />
        ))}
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
            <Loader2 className="h-4 w-4 animate-spin text-[#58A6FF]" />
            추천지와 지도 명령을 분석 중입니다.
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#30363D] p-3">
        {routeOptions.length ? (
          <label className="mb-2 block">
            <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.18em] text-[#8B949E]">Route Scope</span>
            <select
              value={selectedRoute?.id || ''}
              onChange={(event) => setSelectedRouteId(event.target.value)}
              className="w-full border border-[#30363D] bg-[#080A0F] px-2 py-1.5 text-xs text-[#C9D1D9] focus:border-[#58A6FF]/70 focus:outline-none"
            >
              {routeOptions.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="mb-2 flex flex-wrap gap-1">
          {SAMPLE_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                setInput(cmd)
                inputRef.current?.focus()
              }}
              className="max-w-[170px] truncate border border-[#30363D] bg-[#161B22] px-2 py-1 text-[10px] text-[#8B949E] hover:border-[#58A6FF]/40 hover:text-[#C9D1D9]"
              title={cmd}
            >
              {cmd}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="여행지 추천 또는 지도 조정 요청..."
            disabled={loading}
            className="min-w-0 flex-1 border border-[#30363D] bg-[#080A0F] px-3 py-2 text-xs text-[#C9D1D9] placeholder:text-[#6E7681] focus:border-[#58A6FF]/70 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#58A6FF] text-[#0D1117] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="메시지 보내기"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
