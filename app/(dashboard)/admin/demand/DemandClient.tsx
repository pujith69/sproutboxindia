"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts"
import { TrendingUp, PackageCheck, ListChecks, CheckCircle, XCircle } from "lucide-react"

export default function DemandClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [processing, setProcessing] = useState<string | null>(null)

  // MACRO STATS
  const totalOrders = orders.length
  const totalTrays = orders.reduce((sum, o) => sum + o.total_trays, 0)
  const totalKg = orders.reduce((sum, o) => {
    const items = o.items as any[]
    return sum + items.reduce((iSum, item) => iSum + item.quantity_kg, 0)
  }, 0)

  // BREAKDOWN BY CROP
  const cropBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    orders.forEach((o) => {
      ;(o.items as any[]).forEach((item) => {
        map[item.crop_name] = (map[item.crop_name] || 0) + item.quantity_kg
      })
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [orders])

  // BREAKDOWN BY DATE FOR GRAPH
  const graphData = useMemo(() => {
    const map: Record<string, number> = {}
    orders.forEach((o) => {
      const d = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      map[d] = (map[d] || 0) + o.total_trays
    })
    // Ensure chronological mock sort roughly
    return Object.entries(map).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()).map(([name, trays]) => ({ name, trays }))
  }, [orders])

  // APPROVAL SYSTEM MUTATION
  async function completeOrderAction(id: string, newStatus: string) {
    setProcessing(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id)
      
      if (error) throw error
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    } catch (error) {
      console.error(error)
      alert("Failed to update order status")
    } finally {
      setProcessing(null)
    }
  }

  async function deleteOrder(id: string) {
    setProcessing(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("orders").delete().eq("id", id)
      if (error) throw error
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch (error) {
      console.error(error)
      alert("Failed to reject order")
    } finally {
      setProcessing(null)
    }
  }

  // Pending orders
  const pendingQueue = orders.filter(o => o.status === "pending")

  return (
    <div className="space-y-6">
      
      {/* MACRO STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: totalOrders, icon: ListChecks, color: "text-blue-400" },
          { label: "Total Yield (kg)", value: totalKg.toFixed(2), icon: TrendingUp, color: "text-sprout-400" },
          { label: "Total Trays Required", value: totalTrays, icon: PackageCheck, color: "text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 opacity-20 ${stat.color}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl lg:col-span-2">
          <h3 className="text-base font-semibold mb-6">Trays Demanded Over Time</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorTrays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Area type="monotone" dataKey="trays" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorTrays)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CROP BREAKDOWN */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl">
          <h3 className="text-base font-semibold mb-4">Demand by Crop</h3>
          <div className="space-y-4">
            {cropBreakdown.map(([crop, kg], i) => (
              <div key={crop}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{crop}</span>
                  <span className="text-muted-foreground">{kg.toFixed(2)} kg</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (kg / totalKg) * 100)}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-sprout-500 to-sprout-300 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* APPROVAL SYSTEM */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h3 className="text-lg font-semibold text-white">Pending Approvals</h3>
          {pendingQueue.length > 0 && (
            <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/20">
              {pendingQueue.length} Orders Pending
            </span>
          )}
        </div>

        {pendingQueue.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
            <span className="text-4xl opacity-50 block mb-3">📦</span>
            <p className="text-sm font-semibold text-white">No incoming orders</p>
            <p className="text-xs text-muted-foreground mt-1">All recent demand has been allocated and approved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.04] text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-tl-lg">ID</th>
                  <th className="px-4 py-3 font-semibold">Restaurant</th>
                  <th className="px-4 py-3 font-semibold">Trays</th>
                  <th className="px-4 py-3 font-semibold">Delivery Date</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                <AnimatePresence>
                  {pendingQueue.map((order) => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{order.id.slice(0,8)}</td>
                      <td className="px-4 py-3 font-medium">{order.restaurant_name}</td>
                      <td className="px-4 py-3 font-bold text-sprout-400">{order.total_trays}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(order.delivery_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button 
                          disabled={processing === order.id}
                          onClick={() => completeOrderAction(order.id, 'assigned_to_growers')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-sprout-500/30 bg-sprout-500/10 text-sprout-400 hover:bg-sprout-500/20 transition-all"
                        >
                          Approve & Assign
                        </button>
                        <button 
                          disabled={processing === order.id}
                          onClick={() => deleteOrder(order.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          Reject
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
