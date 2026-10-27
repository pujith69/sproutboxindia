

import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sprout } from "lucide-react"

export default async function GrowerDashboardOverview() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "grower") redirect("/login")

  const supabase = await createClient()

  const { data: activeTray } = await supabase
    .from("tray_assignments")
    .select("*")
    .eq("grower_id", profile.id)
    .in("status", ["assigned", "growing", "qc_pending"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const { data: allTrays } = await supabase
    .from("tray_assignments")
    .select("id, status")
    .eq("grower_id", profile.id)

  const assignedCount = allTrays?.filter((t) => t.status === "assigned").length || 0
  const growingCount = allTrays?.filter((t) => t.status === "growing" || t.status === "qc_pending").length || 0

  const completedTrayIds = allTrays
    ?.filter(t => t.status === "completed" || t.status === "approved")
    .map(t => t.id) || []

  const { data: yields } = completedTrayIds.length > 0
    ? await supabase
        .from("yield_records")
        .select("weight_grams, tray_id")
        .in("tray_id", completedTrayIds)
    : { data: [] }

  const PRICE_PER_KG = 120
  const totalYieldKg = (yields || []).reduce((s, y) => s + y.weight_grams / 1000, 0)
  const estimatedEarnings = totalYieldKg * PRICE_PER_KG

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-sprout-400">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">General overview and today's focused task.</p>
      </div>

       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
           <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Incoming</p>
           <p className="text-2xl font-bold">{assignedCount} <span className="text-base font-normal text-muted-foreground">trays</span></p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
           <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Active</p>
           <p className="text-2xl font-bold text-sprout-400">{growingCount} <span className="text-base font-normal opacity-70">trays</span></p>
        </div>
        <div className="col-span-2 md:col-span-1 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Est. Earnings</p>
          <p className="text-2xl font-bold text-emerald-400">
            ₹{estimatedEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{totalYieldKg.toFixed(2)} kg harvested</p>
        </div>
      </div>

      {!activeTray ? (
        <div className="mt-12 text-center p-12 border border-white/[0.06] rounded-2xl bg-white/[0.02]">
          <Sprout className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">No active trays</h2>
          <p className="mt-1 text-sm text-muted-foreground">You have no growing tasks at the moment.</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-sprout-500/20 bg-gradient-to-br from-sprout-500/[0.08] to-sprout-500/[0.02] p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-sprout-400">
                  Today's Priority
                </span>
                <h2 className="mt-2 text-2xl font-bold">{activeTray.crop_name}</h2>
                <p className="mt-1 text-sm text-muted-foreground font-mono">
                  Tray Code: {activeTray.tray_code}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-sprout-400">
                  Day {activeTray.current_day}
                </p>
              </div>
            </div>
            
            <div className="mt-6 border-t border-white/10 pt-4 text-sm text-muted-foreground">
               <span className="font-semibold text-white">Harvest Date: </span> 
               {new Date(activeTray.expected_harvest_date).toLocaleDateString()}
            </div>
          </div>

          {activeTray.current_day <= 1 && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 hover:bg-blue-500/[0.06] hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 shrink-0">
                  <Sprout className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-blue-400">Strict Seed Usage Instructions</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">Type</span>
                      <p className="text-sm font-semibold">{activeTray.seed_type}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">Target Batch</span>
                      <p className="text-sm font-mono text-blue-400 font-semibold">#{activeTray.seed_batch_id}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">Quantity</span>
                      <p className="text-sm font-semibold">{activeTray.seed_quantity_grams}g per tray</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
