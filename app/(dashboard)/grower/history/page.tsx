import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/auth"
import { redirect } from "next/navigation"

const PRICE_PER_KG = 120 // ₹ per kg — adjust to your rate

export default async function GrowerHistoryPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "grower") redirect("/login")

  const supabase = await createClient()

  const { data: history } = await supabase
    .from("tray_assignments")
    .select(`
      *,
      yield_records (
        id,
        weight_grams,
        quality_rating,
        notes,
        recorded_at
      )
    `)
    .eq("grower_id", profile.id)
    .in("status", ["completed", "approved"])
    .order("created_at", { ascending: false })

  const trays = history || []

  // Earnings summary
  const totalWeightKg = trays.reduce((sum, tray) => {
    const yieldKg = (tray.yield_records as any[])?.reduce(
      (s: number, y: any) => s + y.weight_grams / 1000, 0
    ) || 0
    return sum + yieldKg
  }, 0)
  const totalEarnings = totalWeightKg * PRICE_PER_KG

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold">Growing History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Records of all approved and completed trays with your earnings
        </p>
      </div>

      {/* Earnings summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">
            Trays Completed
          </p>
          <p className="text-2xl font-bold text-sprout-400">{trays.length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">
            Total Yield
          </p>
          <p className="text-2xl font-bold text-blue-400">{totalWeightKg.toFixed(2)} kg</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">
            Estimated Earnings
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            ₹{totalEarnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">@ ₹{PRICE_PER_KG}/kg</p>
        </div>
      </div>

      {/* Tray history table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.04] text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-semibold">Tray Code</th>
              <th className="px-6 py-4 font-semibold">Crop</th>
              <th className="px-6 py-4 font-semibold">Yield (kg)</th>
              <th className="px-6 py-4 font-semibold">Quality</th>
              <th className="px-6 py-4 font-semibold">Earnings</th>
              <th className="px-6 py-4 font-semibold text-right">Harvest Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {trays.map((tray) => {
              const yieldRecords = (tray.yield_records as any[]) || []
              const yieldKg = yieldRecords.reduce((s: number, y: any) => s + y.weight_grams / 1000, 0)
              const avgQuality = yieldRecords.length
                ? yieldRecords.reduce((s: number, y: any) => s + y.quality_rating, 0) / yieldRecords.length
                : null
              const earnings = yieldKg * PRICE_PER_KG

              return (
                <tr key={tray.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{tray.tray_code}</td>
                  <td className="px-6 py-4 font-medium">{tray.crop_name}</td>
                  <td className="px-6 py-4">
                    {yieldKg > 0 ? (
                      <span className="text-blue-400 font-semibold">{yieldKg.toFixed(3)} kg</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Not recorded</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {avgQuality !== null ? (
                      <span className="text-yellow-400">{"★".repeat(Math.round(avgQuality))}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-400">
                    {yieldKg > 0
                      ? `₹${earnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {new Date(tray.expected_harvest_date).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
            {!trays.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  You have no completed trays in your history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
