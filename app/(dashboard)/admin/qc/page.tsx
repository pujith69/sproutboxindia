import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/auth"
import { redirect } from "next/navigation"
import QCClient from "./QCClient"

export default async function AdminQCPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "admin") redirect("/login")

  const supabase = await createClient()

  const { data: qcPending } = await supabase
    .from("tray_assignments")
    .select(`*, profiles:grower_id (full_name, email)`)
    .eq("status", "qc_pending")

  const formattedQC = qcPending?.map(tray => ({
    id: tray.id,
    tray_code: tray.tray_code,
    crop_name: tray.crop_name,
    seed_type: tray.seed_type,
    seed_batch_id: tray.seed_batch_id,
    grower_name: (tray.profiles as any)?.full_name || (tray.profiles as any)?.email || "Unknown Grower",
  })) || []

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-blue-500">QC Operations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review batches awaiting manual quality control approval
        </p>
      </div>
      <QCClient initialItems={formattedQC} />
    </div>
  )
}
