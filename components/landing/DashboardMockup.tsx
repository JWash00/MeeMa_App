'use client'

import { motion } from 'framer-motion'
import { Home, GitBranch, Library, BarChart3, Settings, Search, Bell, User, ChevronDown, FolderOpen } from 'lucide-react'

const sidebarItems = [
  { icon: Home, label: 'Home', active: false },
  { icon: GitBranch, label: 'Workflows', active: false },
  { icon: Library, label: 'Prompt Library', active: true },
  { icon: BarChart3, label: 'Analytics', active: false },
  { icon: Settings, label: 'Settings', active: false },
]

const tableData = [
  { category: 'Prompt Generation', cost: '$2.00', status: 'Boosted', statusColor: 'bg-blue-100 text-blue-700' },
  { category: 'Prompt Generation', cost: '$2.00', status: 'Boosted', statusColor: 'bg-blue-100 text-blue-700' },
  { category: 'AI Validation', cost: '$2.00', status: 'Pass', statusColor: 'bg-green-100 text-green-700' },
  { category: 'Content Optimization', cost: '$2.50', status: 'Passed', statusColor: 'bg-green-100 text-green-700' },
  { category: 'Automated Fixes', cost: '$1.00', status: 'Imported', statusColor: 'bg-gray-100 text-gray-600' },
]

const workflowItems = [
  { name: 'Social Media', description: 'Sample prompt template...' },
  { name: 'Blog Posts', description: 'Sample prompt about marketing coises commonation inamtions...' },
  { name: 'Email Campaigns', description: 'Sample prompt templates, marketing and treaar email address' },
]

export default function DashboardMockup() {
  return (
    <motion.div
      className="relative w-full max-w-[600px]"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Main dashboard card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-meema-blue-500 to-meema-violet-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-gray-800 text-sm">MeeMa</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-gray-400" />
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-40 bg-gray-50/80 border-r border-gray-100 py-4 px-3">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    item.active
                      ? 'bg-meema-blue-500/10 text-meema-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Dashboard</h2>
              <button className="bg-meema-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                + Create Workflow
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-4">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Search</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Category</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Cost</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 px-3 text-gray-700">{row.category}</td>
                      <td className="py-2 px-3 text-gray-700">{row.cost}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Floating panel overlay */}
      <motion.div
        className="absolute -right-4 top-16 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-100 text-xs">
          <button className="flex-1 py-2 px-3 text-meema-blue-600 font-medium border-b-2 border-meema-blue-500">
            Workflow
          </button>
          <button className="flex-1 py-2 px-3 text-gray-500">
            Prompt Library
          </button>
        </div>

        {/* Items */}
        <div className="p-3 space-y-3">
          {workflowItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <ChevronDown className="w-3 h-3 text-gray-400 mt-0.5" />
              <div>
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">{item.name}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom button */}
        <div className="p-3 pt-0">
          <button className="w-full bg-meema-blue-500 text-white text-xs py-2 rounded-lg font-medium">
            Create New Workflow
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
