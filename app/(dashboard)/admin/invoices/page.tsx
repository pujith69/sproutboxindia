import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Eye, Edit, Trash2, Download, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_ICONS: Record<string, any> = {
  draft: FileText,
  sent: Clock,
  paid: CheckCircle,
  overdue: AlertCircle,
  cancelled: XCircle,
}

function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AdminInvoicesPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      orders!inner (
        id,
        restaurant_id,
        items,
        total_trays,
        status,
        delivery_date
      ),
      restaurant:profiles!invoices_restaurant_id_fkey (
        id,
        full_name,
        email
      ),
      grower:profiles!invoices_grower_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all invoices</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="inline-flex items-center gap-2 rounded-xl bg-sprout-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sprout-500/25 transition-all hover:bg-sprout-400"
        >
          <FileText className="h-4 w-4" />
          Create Invoice
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Invoices"
          value={invoices?.length || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Draft"
          value={invoices?.filter(i => i.status === 'draft').length || 0}
          icon={FileText}
          color="gray"
        />
        <StatCard
          title="Sent"
          value={invoices?.filter(i => i.status === 'sent').length || 0}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Paid"
          value={invoices?.filter(i => i.status === 'paid').length || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Overdue"
          value={invoices?.filter(i => i.status === 'overdue').length || 0}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Invoice #</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Restaurant</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Order</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Due Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Created</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {invoices?.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-mono text-sm text-white">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{invoice.restaurant?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{invoice.restaurant?.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${invoice.order_id}`}
                      className="font-mono text-sm text-sprout-400 hover:underline"
                    >
                      {invoice.orders.id.slice(0, 8)}...
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {invoice.orders.total_trays} trays
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">
                    {formatCurrency(invoice.total_amount, invoice.currency)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      status={invoice.status}
                      icon={STATUS_ICONS[invoice.status]}
                    />
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {formatDate(invoice.due_date)}
                    {invoice.status === 'overdue' && (
                      <span className="ml-2 text-xs text-red-400 font-medium">OVERDUE</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {formatDate(invoice.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.05] transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/invoices/${invoice.id}/edit`}
                        className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.05] transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <a
                        href={`/api/invoices/${invoice.id}/download`}
                        className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/[0.05] transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {!invoices?.length && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    No invoices found. Create your first invoice to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    gray: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  }

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
    </div>
  )
}

function StatusBadge({ status, icon: Icon }: { status: string; icon: any }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${STATUS_COLORS[status] || STATUS_COLORS.draft}`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}