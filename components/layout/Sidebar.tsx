'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Table, BarChart3, Download, Settings } from 'lucide-react'

const navItems = [
  { href: '/projects', label: 'Projects', icon: Table },
  { href: '/summary', label: 'Summary', icon: BarChart3 },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl hidden md:flex">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">CIP Maker</h1>
        <p className="text-sm text-slate-400 mt-1">Project Management</p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">Municipal CIP Tool</p>
      </div>
    </aside>
  )
}
