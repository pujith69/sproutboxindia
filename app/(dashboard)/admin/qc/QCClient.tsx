"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle } from "lucide-react"

interface QCItem {
  id: string
  tray_code: string
  crop_name: string
  seed_type: string
  seed_batch_id: string
  grower_name: string
}

export default function QCClient({ initialItems }: { initialItems: QCItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleQC(id: string, approve: boolean) {
    setProcessing(id)
    const supabase = createClient()
    const newStatus = approve ? "approved" : "assigned" // 'assigned' = sent back, valid in CHECK constraint
    const { error } = await supabase
      .from("tray_assignments")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      alert("Failed to update QC status: " + error.message)
    } else {
      // Optimistic removal — approved/rejected items leave the pending queue
      setItems(prev => prev.filter(item => item.id !== id))
    }
    setProcessing(null)
  }

  if (items.length === 0) {
    return (
      <div className="text-center p-12 border border-white/[0.06] rounded-2xl bg-white/[0.02]">
        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
        <p className="mt-4 font-medium">All clear!</p>
        <p className="text-sm text-muted-foreground mt-1">No batches are currently pending Quality Control.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(batch => (
        <div key={batch.id} className="border border-yellow-500/30 bg-yellow-500/[0.02] rounded-2xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-bold">{batch.crop_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{batch.grower_name}</p>
            </div>
            <span className="bg-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold px-2 py-1 rounded">
              QC Pending
            </span>
          </div>

          <div className="space-y-1 text-sm font-mono text-xs bg-black/20 p-3 rounded-lg mb-4">
            <p>Batch: {batch.tray_code}</p>
            <p>Seed Type: {batch.seed_type}</p>
            <p>Seed Batch: {batch.seed_batch_id}</p>
          </div>

          <div className="flex gap-2 w-full">
            <button
              disabled={processing === batch.id}
              onClick={() => handleQC(batch.id, true)}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold py-2 rounded-lg transition-colors text-sm border border-green-500/20 disabled:opacity-50"
            >
              {processing === batch.id ? "..." : "Approve"}
            </button>
            <button
              disabled={processing === batch.id}
              onClick={() => handleQC(batch.id, false)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-semibold py-2 rounded-lg transition-colors text-sm border border-red-500/20 disabled:opacity-50"
            >
              {processing === batch.id ? "..." : "Reject"}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
