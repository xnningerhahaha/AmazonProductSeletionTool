import { useEffect, useRef, useState } from 'react'

interface DayStat {
  date: string
  visits: number
  clicks: number
  analyzeClicks: number
}

interface DashboardData {
  series: DayStat[]
  totalVisits: number
  totalClicks: number
  totalAnalyzeClicks: number
  conversionRate: string
}

const API = 'https://api.amazonai.online'

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetch(`${API}/api/stats/dashboard`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data || !canvasRef.current) return
    drawChart(canvasRef.current, data.series)
  }, [data])

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  if (!data) return <div className="flex items-center justify-center h-screen text-red-500">Failed to load data</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 数据看板</h1>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="总访问量" value={data.totalVisits} color="blue" icon="👥" />
        <StatCard label="开始分析点击" value={data.totalAnalyzeClicks} color="purple" icon="🔍" />
        <StatCard label="升级点击" value={data.totalClicks} color="amber" icon="🔓" />
        <StatCard label="点击转化率" value={`${data.conversionRate}%`} color="green" icon="📈" />
      </div>

      {/* 趋势图 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">最近 30 天趋势</h2>
        <canvas ref={canvasRef} width={900} height={300} className="w-full" />
        <div className="flex gap-6 mt-3 justify-center text-sm">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />每日访问</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />开始分析</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />升级点击</span>
        </div>
      </div>

      {/* 明细表 */}
      <div className="bg-white rounded-xl shadow mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">日期</th>
              <th className="px-4 py-3 text-right">访问量</th>
              <th className="px-4 py-3 text-right">开始分析</th>
              <th className="px-4 py-3 text-right">升级点击</th>
              <th className="px-4 py-3 text-right">转化率</th>
            </tr>
          </thead>
          <tbody>
            {[...data.series].reverse().filter(d => d.visits > 0 || d.clicks > 0).map(d => (
              <tr key={d.date} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{d.date}</td>
                <td className="px-4 py-2 text-right text-blue-600 font-medium">{d.visits}</td>
                <td className="px-4 py-2 text-right text-purple-600 font-medium">{d.analyzeClicks}</td>
                <td className="px-4 py-2 text-right text-amber-600 font-medium">{d.clicks}</td>
                <td className="px-4 py-2 text-right text-gray-500">
                  {d.visits > 0 ? `${((d.clicks / d.visits) * 100).toFixed(1)}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1 opacity-75">{label}</div>
    </div>
  )
}

function drawChart(canvas: HTMLCanvasElement, series: DayStat[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height
  const PAD = { top: 20, right: 20, bottom: 40, left: 40 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  ctx.clearRect(0, 0, W, H)

  const maxVal = Math.max(...series.map(d => Math.max(d.visits, d.clicks)), 1)
  const step = chartW / (series.length - 1 || 1)

  const xOf = (i: number) => PAD.left + i * step
  const yOf = (v: number) => PAD.top + chartH - (v / maxVal) * chartH

  // Grid lines
  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + (chartH / 4) * i
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + chartW, y); ctx.stroke()
    ctx.fillStyle = '#9ca3af'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(String(Math.round(maxVal * (1 - i / 4))), PAD.left - 6, y + 4)
  }

  // Draw line helper
  const drawLine = (color: string, getValue: (d: DayStat) => number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.beginPath()
    series.forEach((d, i) => {
      const x = xOf(i), y = yOf(getValue(d))
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    // Dots
    series.forEach((d, i) => {
      const v = getValue(d)
      if (v === 0) return
      ctx.beginPath()
      ctx.arc(xOf(i), yOf(v), 3, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })
  }

  drawLine('#3b82f6', d => d.visits)
  drawLine('#a855f7', d => d.analyzeClicks)
  drawLine('#f59e0b', d => d.clicks)

  // X-axis labels (every 5 days)
  ctx.fillStyle = '#9ca3af'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  series.forEach((d, i) => {
    if (i % 5 === 0 || i === series.length - 1) {
      ctx.fillText(d.date.slice(5), xOf(i), H - 8)
    }
  })
}
