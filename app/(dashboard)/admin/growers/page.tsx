import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/auth"
import { redirect } from "next/navigation"

const PRICE_PER_KG = 120 // ₹ per kg

export default async function AdminGrowersPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "admin") redirect("/login")

  const supabase = await createClient()

  const { data: growers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "grower")

  const { data: trays } = await supabase
    .from("tray_assignments")
    .select("grower_id, status")

  // Fetch yield records joined to tray assignments for earnings
  const { data: yields } = await supabase
    .from("yield_records")
    .select(`
      weight_grams,
      tray_assignments!inner (grower_id)
    `)

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-blue-500">Growers Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor active trays, completion rates and earnings per grower
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.04] text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-semibold">Grower</th>
              <th className="px-6 py-4 font-semibold">Trays Assigned</th>
              <th className="px-6 py-4 font-semibold">Active Growing</th>
              <th className="px-6 py-4 font-semibold">Completion Rate</th>
              <th className="px-6 py-4 font-semibold">Total Yield</th>
              <th className="px-6 py-4 font-semibold text-right">Est. Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {growers?.map((grower) => {
              const growerTrays = trays?.filter(t => t.grower_id === grower.id) || []
              const growing = growerTrays.filter(t => t.status === "growing").length
              const completed = growerTrays.filter(
                t => t.status === "completed" || t.status === "approved"
              ).length
              const rate = growerTrays.length
                ? Math.round((completed / growerTrays.length) * 100)
                : 0

              const growerYields = (yields || []).filter(
                (y: any) => y.tray_assignments?.grower_id === grower.id
              )
              const totalKg = growerYields.reduce(
                (sum: number, y: any) => sum + y.weight_grams / 1000, 0
              )
              const earnings = totalKg * PRICE_PER_KG

              return (
                <tr key={grower.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium">{grower.full_name || grower.email}</td>
                  <td className="px-6 py-4">{growerTrays.length}</td>
                  <td className="px-6 py-4">{growing}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      rate > 80 ? "bg-sprout-500/20 text-sprout-400" : "bg-white/10"
                    }`}>
                      {rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-blue-400">
                    {totalKg > 0 ? `${totalKg.toFixed(2)} kg` : "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                    {earnings > 0
                      ? `₹${earnings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                      : "—"}
                  </td>
                </tr>
              )
            })}
            {!growers?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No growers found in the network.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
