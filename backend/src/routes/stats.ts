import { Router, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()
const DATA_DIR = path.join(process.cwd(), 'data')
const VISITS_FILE = path.join(DATA_DIR, 'visits.json')
const CLICKS_FILE = path.join(DATA_DIR, 'upgrade_clicks.json')

interface Event {
  timestamp: string
  date: string  // YYYY-MM-DD
}

function readFile(file: string): Event[] {
  try {
    if (!fs.existsSync(file)) return []
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch { return [] }
}

function writeFile(file: string, data: Event[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function groupByDate(events: Event[]): Record<string, number> {
  return events.reduce((acc: Record<string, number>, e) => {
    acc[e.date] = (acc[e.date] || 0) + 1
    return acc
  }, {})
}

// 生成最近 N 天的日期列表
function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

// POST /api/stats/visit — 记录页面访问
router.post('/visit', (_req: Request, res: Response) => {
  const events = readFile(VISITS_FILE)
  events.push({ timestamp: new Date().toISOString(), date: today() })
  writeFile(VISITS_FILE, events)
  res.json({ success: true })
})

// POST /api/stats/upgrade-click — 记录付费意向点击
router.post('/upgrade-click', (req: Request, res: Response) => {
  const { asin = '', language = 'zh' } = req.body
  const events = readFile(CLICKS_FILE) as any[]
  events.push({ timestamp: new Date().toISOString(), date: today(), asin, language })
  writeFile(CLICKS_FILE, events as Event[])
  console.log(`[Stats] Upgrade click: ASIN=${asin}, total=${events.length}`)
  res.json({ success: true, total: events.length })
})

// GET /api/stats/dashboard — 趋势数据（最近30天）
router.get('/dashboard', (_req: Request, res: Response) => {
  const days = lastNDays(30)
  const visitsByDate = groupByDate(readFile(VISITS_FILE))
  const clicksByDate = groupByDate(readFile(CLICKS_FILE))

  const series = days.map(date => ({
    date,
    visits: visitsByDate[date] || 0,
    clicks: clicksByDate[date] || 0,
  }))

  const totalVisits = readFile(VISITS_FILE).length
  const totalClicks = readFile(CLICKS_FILE).length
  const conversionRate = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0.0'

  res.json({ series, totalVisits, totalClicks, conversionRate })
})

export default router
