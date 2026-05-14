import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Loader2, MessageCircle, Minimize2, Send, Trash2 } from 'lucide-react'

const MAX_CONTEXT_MESSAGES = 20
const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '제주 여행지를 추천하고 Google 지도를 조정할 수 있습니다. 원하는 장소, 음식, 동선을 말해주세요.',
  toolCalls: [],
}

const SAMPLE_COMMANDS = [
  '제주도 가족 여행지 5곳 추천하고 지도에 표시해줘',
  '함덕 근처 아이와 가기 좋은 카페 찾아줘',
  '성산일출봉으로 지도 이동해줘',
  '음식점 추천만 지도에 표시해줘',
]

function describeToolCall(name, args = {}) {
  const map = {
    searchAndMarkLocations: () => `"${args.keyword}" 추천지를 Google 지도에 표시`,
    setMapCenter: () => `Google 지도 이동: ${args.lat?.toFixed?.(4)}, ${args.lng?.toFixed?.(4)}`,
    showCongestionHeatmap: () => `${args.hour}시 교통 레이어 표시`,
    buildOptimalRoute: () => '선호 조건 기반 추천 동선 생성',
    filterByCategory: () => `카테고리 필터: ${args.category}`,
    clearMarkers: () => 'AI 추천 마커 초기화',
  }
  return map[name]?.() || name
}

function textFromToolCall(tc) {
  if (tc.name === 'buildOptimalRoute') return tc.args.preferences?.filter(Boolean).join(', ') || '제주 추천 동선'
  return tc.args.keyword || '제주 추천 여행지'
}

function summarizeToolCalls(toolCalls = []) {
  if (toolCalls.some((tc) => tc.name === 'searchAndMarkLocations' || tc.name === 'buildOptimalRoute')) {
    return '추천지를 Google 지도와 일정에 반영했습니다.'
  }
  if (toolCalls.some((tc) => tc.name === 'setMapCenter')) return 'Google 지도를 요청한 위치로 이동했습니다.'
  if (toolCalls.length) return '지도 명령을 처리했습니다.'
  return '요청을 처리했습니다.'
}

function trimMessages(messages) {
  return [INITIAL_MESSAGE, ...messages.filter((msg) => msg !== INITIAL_MESSAGE).slice(-MAX_CONTEXT_MESSAGES)]
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser ? (
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-[#58A6FF]/40 bg-[#58A6FF]/15">
          <Bot className="h-3.5 w-3.5 text-[#58A6FF]" />
        </div>
      ) : null}
      <div className="max-w-[82%] space-y-1">
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

export default function AgentChatPanel({ onMapCommand }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [noKey, setNoKey] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [messages, open])

  const executeToolCall = useCallback(async (tc) => {
    if (!onMapCommand) return

    if (tc.name === 'searchAndMarkLocations' || tc.name === 'buildOptimalRoute') {
      try {
        const keyword =
          tc.args.keyword ||
          tc.args.preferences?.filter(Boolean).join(' ') ||
          '제주 가족 여행지'
        const params = new URLSearchParams({
          keyword,
          areaCode: tc.args.areaCode || '39',
          ...(tc.args.contentTypeId && { contentTypeId: tc.args.contentTypeId }),
          numOfRows: String(tc.args.maxCount || 5),
        })
        const res = await fetch(`/api/tour/search?${params}`)
        const data = await res.json()
        const locations = data.items || []
        onMapCommand({ command: 'markLocations', args: { locations } })
        onMapCommand({
          command: 'applyRecommendations',
          args: {
            locations,
            query: textFromToolCall(tc),
            category: tc.args.contentTypeId === '39' ? 'meal' : tc.args.contentTypeId === '32' ? 'stay' : 'activity',
          },
        })
      } catch {
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
        body: JSON.stringify({ message: text, history }),
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
  }, [executeToolCall, input, loading, messages])

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
    <section className="flex h-[460px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-[#30363D] bg-[#0D1117] shadow-[0_20px_60px_rgba(0,0,0,0.42)]">
      <header className="flex items-center justify-between border-b border-[#30363D] bg-[#161B22] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Bot className="h-4 w-4 shrink-0 text-[#58A6FF]" />
          <div className="min-w-0">
            <div className="truncate text-xs font-black uppercase text-[#C9D1D9]">AI Travel Guide</div>
            <div className="text-[10px] text-[#8B949E]">Google Maps control · last 20 messages</div>
          </div>
          {noKey ? <span className="border border-[#D29922]/40 px-1.5 py-0.5 text-[9px] text-[#D29922]">NO KEY</span> : null}
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
        {messages.map((msg, index) => <MessageBubble key={`${msg.role}-${index}`} msg={msg} />)}
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
            <Loader2 className="h-4 w-4 animate-spin text-[#58A6FF]" />
            추천지와 지도 명령을 분석 중입니다.
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#30363D] p-3">
        <div className="mb-2 flex flex-wrap gap-1">
          {SAMPLE_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                setInput(cmd)
                inputRef.current?.focus()
              }}
              className="max-w-[160px] truncate border border-[#30363D] bg-[#161B22] px-2 py-1 text-[10px] text-[#8B949E] hover:border-[#58A6FF]/40 hover:text-[#C9D1D9]"
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
