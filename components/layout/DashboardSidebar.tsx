"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  TrendingUp,
  ListChecks,
  Users,
  Package,
  ShieldCheck,
  Map,
  Truck,
  CheckSquare,
  Sprout,
  UploadCloud,
  History,
  ShoppingCart,
  Receipt,
  RotateCw,
  MessageSquare,
  FileText,
  BarChart3
} from "lucide-react"

export type Role = "admin" | "grower" | "restaurant"

interface SidebarItem {
  name: string
  href: string
  icon: React.ElementType
}

const roleNav: Record<Role, SidebarItem[]> = {
  admin: [
    { name: "Overview", href: "/admin/overview", icon: LayoutDashboard },
    { name: "Demand", href: "/admin/demand", icon: TrendingUp },
    { name: "Allocation", href: "/admin/allocation", icon: ListChecks },
    { name: "Growers", href: "/admin/growers", icon: Users },
    { name: "Batches", href: "/admin/batches", icon: Package },
    { name: "QC", href: "/admin/qc", icon: ShieldCheck },
    { name: "Clusters", href: "/admin/clusters", icon: Map },
    { name: "Deliveries", href: "/admin/deliveries", icon: Truck },
    { name: "Invoices", href: "/admin/invoices", icon: FileText },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  ],
  grower: [
    { name: "Today's Task", href: "/grower/dashboard", icon: LayoutDashboard },
    { name: "My Tasks", href: "/grower/tasks", icon: CheckSquare },
    { name: "Milestones", href: "/grower/milestones", icon: Sprout },
    { name: "Upload / QC", href: "/grower/uploads", icon: UploadCloud },
    { name: "History", href: "/grower/history", icon: History },
  ],
  restaurant: [
    { name: "Overview", href: "/restaurant/dashboard", icon: LayoutDashboard },
    { name: "Place Order", href: "/restaurant/place-order", icon: ShoppingCart },
    { name: "Orders", href: "/restaurant/orders", icon: Receipt },
    { name: "Subscriptions", href: "/restaurant/subscriptions", icon: RotateCw },
    { name: "Feedback", href: "/restaurant/feedback", icon: MessageSquare },
  ],
}

interface DashboardSidebarProps {
  role: Role | null
}

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()

  if (!role) return null

  const items = roleNav[role]

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-black/40 backdrop-blur-3xl hidden md:flex flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-sprout-400" />
          <span className="font-bold tracking-tight text-white text-lg">SproutBox</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="mb-4 px-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {role} MENU
          </p>
        </div>

        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon 
                className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-sprout-400" : "text-muted-foreground group-hover:text-white"}`} 
                aria-hidden="true" 
              />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 h-6 w-1 rounded-r-full bg-sprout-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

