import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BarChart3, Users, Package, TrendingUp, DollarSign, Award, Download, Calendar } from 'lucide-react'

export default async function AdminReportsPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const supabase = await createClient()

  // Fetch all data for reports
  const [
    { data: orders },
    { data: trays },
    { data: yieldRecords },
    { data: growers },
    { data: restaurants },
    { data: feedback },
    { data: invoices },
  ] = await Promise.all([
    supabase.from('orders').select('*'),
    supabase.from('tray_assignments').select('*'),
    supabase.from('yield_records').select('*, tray_assignments(crop_name, grower_id)'),
    supabase.from('profiles').select('id, full_name, email, created_at').eq('role', 'grower'),
    supabase.from('profiles').select('id, full_name, email, created_at').eq('role', 'restaurant'),
    supabase.from('feedback').select('*, orders(restaurant_id)'),
    supabase.from('invoices').select('*'),
  ])

  // Calculate metrics
  const metrics = calculateMetrics(orders || [], trays || [], yieldRecords || [], growers || [], restaurants || [], feedback || [], invoices || [])
  const chartsData = prepareChartsData(orders || [], trays || [], yieldRecords || [], growers || [], invoices || [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Export PDF
          </button>
          <button className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5 transition-colors">
            <Calendar className="h-4 w-4 mr-2 inline" />
            Custom Range
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.revenueChange}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Orders Fulfilled"
          value={metrics.ordersFulfilled}
          change={metrics.fulfillmentChange}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Active Growers"
          value={metrics.activeGrowers}
          change={metrics.growersChange}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Avg Quality Score"
          value={`${metrics.avgQuality}/5`}
          change={metrics.qualityChange}
          icon={Award}
          color="yellow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <ChartCard title="Revenue Trend (Last 30 Days)" icon={TrendingUp}>
          <RevenueChart data={chartsData.revenue} />
        </ChartCard>

        {/* Orders by Status */}
        <ChartCard title="Orders by Status" icon={Package}>
          <StatusChart data={chartsData.ordersByStatus} />
        </ChartCard>

        {/* Crop Performance */}
        <ChartCard title="Top Crops by Yield" icon={Award}>
          <CropChart data={chartsData.cropYield} />
        </ChartCard>

        {/* Grower Performance */}
        <ChartCard title="Grower Performance" icon={Users}>
          <GrowerChart data={chartsData.growerPerformance} />
        </ChartCard>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Growers Table */}
        <TableCard title="Top Growers by Yield" icon={Users}>
          <TopGrowersTable data={chartsData.growerPerformance} />
        </TableCard>

        {/* Recent Feedback */}
        <TableCard title="Recent Feedback" icon={Award}>
          <FeedbackTable data={feedback || []} />
        </TableCard>
      </div>

      {/* Financial Summary */}
      <FinancialSummaryCard data={chartsData.financial} />
    </div>
  )
}

function calculateMetrics(orders: any[], trays: any[], yieldRecords: any[], growers: any[], restaurants: any[], feedback: any[], invoices: any[]) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const recentOrders = orders?.filter(o => new Date(o.created_at) > thirtyDaysAgo) || []
  const previousOrders = orders?.filter(o => {
    const date = new Date(o.created_at)
    return date < thirtyDaysAgo && date > new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  }) || []

  const deliveredOrders = orders?.filter(o => o.status === 'delivered') || []
  const recentDelivered = deliveredOrders.filter(o => new Date(o.updated_at) > thirtyDaysAgo)
  const previousDelivered = deliveredOrders.filter(o => {
    const date = new Date(o.updated_at)
    return date < thirtyDaysAgo && date > new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  })

  const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total_amount), 0) || 0
  const recentRevenue = invoices?.filter(i => i.status === 'paid' && new Date(i.paid_at) > thirtyDaysAgo).reduce((sum, i) => sum + Number(i.total_amount), 0) || 0
  const previousRevenue = invoices?.filter(i => {
    if (i.status !== 'paid') return false
    const date = new Date(i.paid_at)
    return date < thirtyDaysAgo && date > new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  }).reduce((sum, i) => sum + Number(i.total_amount), 0) || 0

  const activeGrowers = growers?.filter(g => {
    const growerTrays = trays?.filter(t => t.grower_id === g.id) || []
    return growerTrays.some(t => ['growing', 'qc_pending', 'approved', 'completed'].includes(t.status))
  }).length || 0

  const avgQuality = yieldRecords && yieldRecords.length > 0
    ? yieldRecords.reduce((sum, r) => sum + r.quality_rating, 0) / yieldRecords.length
    : 0

  return {
    totalRevenue,
    revenueChange: previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : '0',
    ordersFulfilled: recentDelivered.length,
    fulfillmentChange: previousDelivered.length > 0 ? ((recentDelivered.length - previousDelivered.length) / previousDelivered.length * 100).toFixed(1) : '0',
    activeGrowers,
    growersChange: '0',
    avgQuality: avgQuality.toFixed(1),
    qualityChange: '0',
  }
}

function prepareChartsData(orders: any[], trays: any[], yieldRecords: any[], growers: any[], invoices: any[]) {
  // Revenue chart - last 30 days
  const revenueData = generateRevenueData(orders, invoices)

  // Orders by status
  const ordersByStatus = orders?.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Crop yield
  type CropYieldData = { totalWeight: number; count: number; avgQuality: number }

  const cropYield = (yieldRecords || []).reduce((acc: Record<string, CropYieldData>, r) => {
    const crop = r.tray_assignments?.crop_name || 'Unknown'
    if (!acc[crop]) acc[crop] = { totalWeight: 0, count: 0, avgQuality: 0 }
    acc[crop].totalWeight += Number(r.weight_grams)
    acc[crop].count += 1
    acc[crop].avgQuality += r.quality_rating
    return acc
  }, {} as Record<string, CropYieldData>)

  const cropYieldArray = (Object.entries(cropYield) as [string, CropYieldData][]).map(([crop, data]) => ({
    crop,
    totalWeight: data.totalWeight,
    avgWeight: data.totalWeight / data.count,
    avgQuality: data.avgQuality / data.count,
    trays: data.count,
  })).sort((a, b) => b.totalWeight - a.totalWeight)

  // Grower performance
  const growerPerformance = growers?.map(g => {
    const growerTrays = trays?.filter(t => t.grower_id === g.id) || []
    const completedTrays = growerTrays.filter(t => t.status === 'completed' || t.status === 'approved')
    const growerYields = yieldRecords?.filter(r => r.tray_assignments?.grower_id === g.id) || []
    const totalWeight = growerYields.reduce((sum, r) => sum + Number(r.weight_grams), 0)
    const avgQuality = growerYields.length > 0
      ? growerYields.reduce((sum, r) => sum + r.quality_rating, 0) / growerYields.length
      : 0

    return {
      id: g.id,
      name: g.full_name,
      email: g.email,
      totalTrays: growerTrays.length,
      completedTrays: completedTrays.length,
      totalYield: totalWeight,
      avgQuality: avgQuality.toFixed(1),
      completionRate: growerTrays.length > 0 ? (completedTrays.length / growerTrays.length * 100).toFixed(1) : '0',
    }
  }).sort((a, b) => b.totalYield - a.totalYield) || []

  // Financial summary
  const paidInvoices = invoices?.filter(i => i.status === 'paid') || []
  const pendingInvoices = invoices?.filter(i => ['sent', 'overdue'].includes(i.status)) || []
  const overdueInvoices = invoices?.filter(i => i.status === 'overdue') || []

  const financial = {
    totalInvoiced: invoices?.reduce((sum, i) => sum + Number(i.total_amount), 0) || 0,
    totalPaid: paidInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0),
    totalPending: pendingInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0),
    totalOverdue: overdueInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0),
    invoiceCount: invoices?.length || 0,
    paidCount: paidInvoices.length,
    pendingCount: pendingInvoices.length,
    overdueCount: overdueInvoices.length,
  }

  return {
    revenue: revenueData,
    ordersByStatus,
    cropYield: cropYieldArray,
    growerPerformance,
    financial,
  }
}

function generateRevenueData(orders: any[], invoices: any[]) {
  const days = 30
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const dayInvoices = invoices?.filter(inv => {
      const paidDate = inv.paid_at ? new Date(inv.paid_at) : null
      return paidDate && paidDate >= dayStart && paidDate <= dayEnd && inv.status === 'paid'
    }) || []

    const revenue = dayInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0)

    data.push({
      date: dayStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue,
    })
  }

  return data
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

function MetricCard({ title, value, change, icon: Icon, color }: { title: string; value: string | number; change: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  const changeNum = parseFloat(change)
  const isPositive = changeNum >= 0

  return (
    <div className={`rounded-2xl border p-5 ${colors[color] || colors.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="p-3 rounded-xl">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(changeNum).toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">vs last period</span>
      </div>
    </div>
  )
}

function ChartCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-sprout-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="h-64">{children}</div>
    </div>
  )
}

function TableCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-sprout-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function RevenueChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)

  return (
    <div className="h-full flex items-end justify-between gap-1 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div
            className="w-full bg-sprout-500/30 rounded-t transition-all hover:bg-sprout-500"
            style={{ height: `${(d.revenue / maxRevenue) * 200}px` }}
            title={`${d.date}: ${formatCurrency(d.revenue)}`}
          />
          <span className="text-[10px] text-muted-foreground">{d.date}</span>
        </div>
      ))}
    </div>
  )
}

function StatusChart({ data }: { data: Record<string, number> }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-500',
    assigned_to_growers: 'bg-blue-500',
    growing: 'bg-yellow-500',
    ready_for_harvest: 'bg-orange-500',
    delivered: 'bg-green-500',
  }

  const labels = Object.entries(data).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
    color: statusColors[key] || 'bg-gray-500',
  }))

  const total = labels.reduce((sum, l) => sum + l.value, 0)

  return (
    <div className="h-full flex flex-col justify-center gap-3">
      {labels.map((l, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-24 text-sm text-muted-foreground">{l.label}</div>
          <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${l.color} rounded-full transition-all`}
              style={{ width: total > 0 ? `${(l.value / total) * 100}%` : '0%' }}
            />
          </div>
          <div className="w-16 text-right text-sm font-medium text-white">{l.value}</div>
        </div>
      ))}
    </div>
  )
}

function CropChart({ data }: { data: Array<{ crop: string; totalWeight: number; avgWeight: number; avgQuality: number; trays: number }> }) {
  const topCrops = data.slice(0, 8)
  const maxWeight = Math.max(...topCrops.map(d => d.totalWeight), 1)

  return (
    <div className="h-full flex flex-col justify-center gap-3">
      {topCrops.map((crop, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-28 text-sm font-medium text-white">{crop.crop}</div>
          <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-sprout-500 rounded-full transition-all"
              style={{ width: `${(crop.totalWeight / maxWeight) * 100}%` }}
            />
          </div>
          <div className="w-24 text-right text-sm text-white">{formatNumber(Math.round(crop.totalWeight))}g</div>
          <div className="w-16 text-right text-sm text-yellow-400">{crop.avgQuality}★</div>
        </div>
      ))}
    </div>
  )
}

function GrowerChart({ data }: { data: Array<any> }) {
  const topGrowers = data.slice(0, 8)
  const maxYield = Math.max(...topGrowers.map(d => d.totalYield), 1)

  return (
    <div className="h-full flex flex-col justify-center gap-3">
      {topGrowers.map((grower, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-28 text-sm font-medium text-white truncate">{grower.name}</div>
          <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${(grower.totalYield / maxYield) * 100}%` }}
            />
          </div>
          <div className="w-20 text-right text-sm text-white">{formatNumber(Math.round(grower.totalYield))}g</div>
          <div className="w-16 text-right text-sm text-green-400">{grower.completionRate}%</div>
        </div>
      ))}
    </div>
  )
}

function TopGrowersTable({ data }: { data: Array<any> }) {
  const topGrowers = data.slice(0, 10)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Rank</th>
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Grower</th>
            <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Trays</th>
            <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Yield (g)</th>
            <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Quality</th>
            <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Completion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {topGrowers.map((grower, i) => (
            <tr key={grower.id} className="hover:bg-white/[0.02]">
              <td className="px-3 py-2 font-bold text-sprout-400">#{i + 1}</td>
              <td className="px-3 py-2 text-white">{grower.name}</td>
              <td className="px-3 py-2 text-right text-muted-foreground">{grower.completedTrays}/{grower.totalTrays}</td>
              <td className="px-3 py-2 text-right text-white font-medium">{formatNumber(Math.round(grower.totalYield))}</td>
              <td className="px-3 py-2 text-right text-yellow-400">{grower.avgQuality}★</td>
              <td className="px-3 py-2 text-right text-green-400">{grower.completionRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FeedbackTable({ data }: { data: Array<any> }) {
  const recentFeedback = data.slice(0, 10)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Rating</th>
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Comment</th>
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Restaurant</th>
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {recentFeedback.map((f) => (
            <tr key={f.id} className="hover:bg-white/[0.02]">
              <td className="px-3 py-2 text-yellow-400">{'★'.repeat(f.rating)}</td>
              <td className="px-3 py-2 text-white max-w-xs truncate">{f.comment || 'No comment'}</td>
              <td className="px-3 py-2 text-muted-foreground">{f.orders?.restaurant_id || 'Unknown'}</td>
              <td className="px-3 py-2 text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FinancialSummaryCard({ data }: { data: any }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-sprout-400" />
          <h3 className="text-lg font-semibold text-white">Financial Summary</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FinancialStat title="Total Invoiced" value={formatCurrency(data.totalInvoiced)} color="blue" />
        <FinancialStat title="Paid" value={formatCurrency(data.totalPaid)} color="green" />
        <FinancialStat title="Pending" value={formatCurrency(data.totalPending)} color="yellow" />
        <FinancialStat title="Overdue" value={formatCurrency(data.totalOverdue)} color="red" />
      </div>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <FinancialCount title="Total Invoices" value={data.invoiceCount} />
        <FinancialCount title="Paid" value={data.paidCount} color="green" />
        <FinancialCount title="Pending" value={data.pendingCount} color="yellow" />
        <FinancialCount title="Overdue" value={data.overdueCount} color="red" />
      </div>
    </div>
  )
}

const financialColors: Record<string, string> = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
}

function FinancialStat({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">{title}</p>
      <p className={`text-xl font-bold ${financialColors[color] || 'text-white'}`}>{value}</p>
    </div>
  )
}

function FinancialCount({ title, value, color }: { title: string; value: number; color?: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color ? financialColors[color] : 'text-white'}`}>{value}</p>
    </div>
  )
}