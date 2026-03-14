'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { FraudAlert } from '@/lib/types'
import { Download, FileSpreadsheet, FileText, Sheet } from 'lucide-react'

interface ExportResolutionReportsProps {
  alerts: FraudAlert[]
}

export function ExportResolutionReports({ alerts }: ExportResolutionReportsProps) {
  const [filterType, setFilterType] = useState<'all' | 'resolved' | 'unresolved'>('all')
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [loading, setLoading] = useState(false)

  // Calculate statistics
  const alertStats = {
    total: alerts.length,
    resolved: alerts.filter(a => a.resolved).length,
    unresolved: alerts.filter(a => !a.resolved).length
  }

  // Filter alerts based on selection
  const filteredAlerts = alerts.filter(alert => {
    if (filterType === 'resolved') return alert.resolved
    if (filterType === 'unresolved') return !alert.resolved
    return true
  })

  // Generate CSV content
  const generateCSV = () => {
    const headers = ['Alert ID', 'User ID', 'Amount', 'Severity', 'Type', 'Status', 'Resolution Status', 'Account Holder', 'Location', 'Resolved By', 'Resolved At', 'Notes']
    const rows = filteredAlerts.map(alert => [
      alert.id,
      alert.userId,
      alert.amount,
      alert.severity,
      alert.type,
      alert.resolved ? 'Resolved' : 'Open',
      alert.resolutionStatus || 'N/A',
      alert.accountHolder,
      alert.location.city + ', ' + alert.location.country,
      alert.resolvedBy || 'N/A',
      alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : 'N/A',
      alert.notes || 'N/A'
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => {
        const str = String(cell)
        return '"' + str.replace(/"/g, '""') + '"'
      }).join(','))
      .join('\n')

    return csvContent
  }

  // Generate JSON content
  const generateJSON = () => {
    return JSON.stringify(filteredAlerts, null, 2)
  }

  // Handle export
  const handleExport = useCallback(() => {
    if (filteredAlerts.length === 0) {
      toast.error('No alerts to export')
      return
    }

    setLoading(true)

    try {
      let content = ''
      let filename = ''
      let mimeType = ''

      if (exportFormat === 'csv') {
        content = generateCSV()
        filename = 'fraud-resolution-report-' + new Date().toISOString().split('T')[0] + '.csv'
        mimeType = 'text/csv'
      } else {
        content = generateJSON()
        filename = 'fraud-resolution-report-' + new Date().toISOString().split('T')[0] + '.json'
        mimeType = 'application/json'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Report exported successfully as ' + filename)
      setLoading(false)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export report')
      setLoading(false)
    }
  }, [filteredAlerts, exportFormat])

  return (
    <div className="space-y-6">
      {/* Filter Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-900">Filter by Status</label>
        <div className="grid grid-cols-3 gap-3">
          {getFilterButtons(filterType, setFilterType, alertStats)}
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-900">Export Format</label>
        <div className="grid grid-cols-2 gap-3">
          {getFormatButtons(exportFormat, setExportFormat)}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{filteredAlerts.length}</p>
          <p className="text-xs text-gray-600">Alerts to Export</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{filteredAlerts.filter(a => a.resolved).length}</p>
          <p className="text-xs text-gray-600">Resolved</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{filteredAlerts.filter(a => !a.resolved).length}</p>
          <p className="text-xs text-gray-600">Unresolved</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="pt-2">
        {getExportButton(loading, handleExport, filteredAlerts.length, exportFormat)}
      </div>
    </div>
  )
}

// Helper components to avoid template literals in JSX
function getFilterButtons(filterType: string, setFilterType: (t: any) => void, stats: any) {
  return [
    { id: 'all', label: 'All Alerts', count: stats.total },
    { id: 'resolved', label: 'Resolved', count: stats.resolved },
    { id: 'unresolved', label: 'Unresolved', count: stats.unresolved }
  ].map(option => {
    const isSelected = filterType === option.id
    const btnClass = 'p-3 rounded-lg border-2 transition-all text-center ' + (isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300')
    return (
      <button
        key={option.id}
        onClick={() => setFilterType(option.id)}
        className={btnClass}
      >
        <p className="font-semibold text-gray-900">{option.label}</p>
        <p className="text-sm text-gray-600">{option.count} alerts</p>
      </button>
    )
  })
}

function getFormatButtons(exportFormat: string, setExportFormat: (f: any) => void) {
  return [
    {
      id: 'csv',
      label: 'CSV Format',
      desc: 'Excel-compatible spreadsheet',
      icon: Sheet,
      color: 'text-green-600'
    },
    {
      id: 'json',
      label: 'JSON Format',
      desc: 'Structured data format',
      icon: FileText,
      color: 'text-blue-600'
    }
  ].map(option => {
    const isSelected = exportFormat === option.id
    const btnClass = 'p-4 rounded-lg border-2 transition-all text-left ' + (isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300')
    const Icon = option.icon
    return (
      <button
        key={option.id}
        onClick={() => setExportFormat(option.id)}
        className={btnClass}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className={'w-5 h-5 ' + option.color} />
          <span className="font-semibold text-gray-900">{option.label}</span>
        </div>
        <p className="text-xs text-gray-600">{option.desc}</p>
      </button>
    )
  })
}

function getExportButton(loading: boolean, handleExport: () => void, alertCount: number, exportFormat: string) {
  const isDisabled = loading || alertCount === 0
  const btnClass = 'w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ' + (isDisabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700')
  const alertWord = alertCount === 1 ? 'Alert' : 'Alerts'
  const formatName = exportFormat.toUpperCase()
  const btnText = loading ? 'Exporting...' : 'Export ' + alertCount + ' ' + alertWord + ' as ' + formatName

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className={btnClass}
    >
      <Download size={18} />
      {btnText}
    </button>
  )
}
