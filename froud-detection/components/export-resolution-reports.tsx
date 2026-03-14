'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { FraudAlert } from '@/lib/types'
import { Download, FileText, Sheet, Calendar } from 'lucide-react'

interface ExportResolutionReportsProps {
  alerts: FraudAlert[]
}

export function ExportResolutionReports({ alerts }: ExportResolutionReportsProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [filterType, setFilterType] = useState<'all' | 'resolved' | 'unresolved'>('all')
  const [loading, setLoading] = useState(false)

  const getFilteredAlerts = () => {
    return alerts.filter(alert => {
      if (filterType === 'resolved') return alert.resolved
      if (filterType === 'unresolved') return !alert.resolved
      return true
    })
  }

  const generateCSVReport = () => {
    const filteredAlerts = getFilteredAlerts()
    if (filteredAlerts.length === 0) {
      toast.error('No alerts to export')
      return
    }

    setLoading(true)

    try {
      const headers = [
        'Alert ID',
        'Transaction ID',
        'User ID',
        'Severity',
        'Type',
        'Description',
        'Amount',
        'Account Holder',
        'Location',
        'Status',
        'Resolution Status',
        'Resolution Action',
        'Resolved By',
        'Resolved At',
        'Notes'
      ]

      const rows = filteredAlerts.map(alert => [
        alert.id,
        alert.transactionId,
        alert.userId,
        alert.severity,
        alert.type,
        alert.description,
        alert.amount,
        alert.accountHolder,
        `${alert.location.city}, ${alert.location.country}`,
        alert.resolved ? 'Resolved' : 'Pending',
        alert.resolutionStatus || 'N/A',
        alert.resolutionAction?.type || 'N/A',
        alert.resolvedBy || 'N/A',
        alert.resolvedAt?.toISOString() || 'N/A',
        alert.notes || ''
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row =>
          row.map(cell => {
            const cellStr = String(cell)
            return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
              ? `"${cellStr.replace(/"/g, '""')}"`
              : cellStr
          }).join(',')
        )
      ].join('\n')

      downloadFile(csvContent, `fraud-resolution-report-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
      toast.success(`✓ Exported ${filteredAlerts.length} alerts to CSV`)
    } catch (error) {
      console.error('CSV export failed:', error)
      toast.error('Failed to export CSV report')
    } finally {
      setLoading(false)
    }
  }

  const generateJSONReport = () => {
    const filteredAlerts = getFilteredAlerts()
    if (filteredAlerts.length === 0) {
      toast.error('No alerts to export')
      return
    }

    setLoading(true)

    try {
      const report = {
        exportDate: new Date().toISOString(),
        totalAlerts: filteredAlerts.length,
        resolved: filteredAlerts.filter(a => a.resolved).length,
        unresolved: filteredAlerts.filter(a => !a.resolved).length,
        alerts: filteredAlerts.map(alert => ({
          id: alert.id,
          transactionId: alert.transactionId,
          userId: alert.userId,
          severity: alert.severity,
          type: alert.type,
          description: alert.description,
          amount: alert.amount,
          accountHolder: alert.accountHolder,
          location: {
            city: alert.location.city,
            country: alert.location.country,
            coordinates: { lat: alert.location.lat, lng: alert.location.lng }
          },
          status: alert.resolved ? 'Resolved' : 'Pending',
          resolutionStatus: alert.resolutionStatus || null,
          resolutionAction: alert.resolutionAction ? {
            type: alert.resolutionAction.type,
            timestamp: alert.resolutionAction.timestamp.toISOString(),
            executedBy: alert.resolutionAction.executedBy,
            notes: alert.resolutionAction.notes,
            status: alert.resolutionAction.status
          } : null,
          resolutionHistory: alert.resolutionHistory?.map(action => ({
            type: action.type,
            timestamp: action.timestamp.toISOString(),
            executedBy: action.executedBy,
            notes: action.notes,
            status: action.status
          })) || [],
          resolvedBy: alert.resolvedBy || null,
          resolvedAt: alert.resolvedAt?.toISOString() || null,
          notes: alert.notes || null,
          riskBasedRecommendation: alert.riskBasedRecommendation || null
        }))
      }

      const jsonContent = JSON.stringify(report, null, 2)
      downloadFile(jsonContent, `fraud-resolution-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json')
      toast.success(`✓ Exported ${filteredAlerts.length} alerts to JSON`)
    } catch (error) {
      console.error('JSON export failed:', error)
      toast.error('Failed to export JSON report')
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    if (exportFormat === 'csv') {
      generateCSVReport()
    } else {
      generateJSONReport()
    }
  }

  const filteredAlerts = getFilteredAlerts()
  const alertStats = {
    total: alerts.length,
    resolved: alerts.filter(a => a.resolved).length,
    unresolved: alerts.filter(a => !a.resolved).length
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Export Resolution Reports</h2>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-700 font-medium">Total Alerts</p>
          <p className="text-2xl font-bold text-blue-900">{alertStats.total}</p>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-sm text-green-700 font-medium">Resolved</p>
          <p className="text-2xl font-bold text-green-900">{alertStats.resolved}</p>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm text-red-700 font-medium">Unresolved</p>
          <p className="text-2xl font-bold text-red-900">{alertStats.unresolved}</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Filter Alerts
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'all' as const, label: 'All Alerts', count: alertStats.total },
            { id: 'resolved' as const, label: 'Resolved', count: alertStats.resolved },
            { id: 'unresolved' as const, label: 'Unresolved', count: alertStats.unresolved }
          ].map(option => (
            <button
              key={option.id}
              onClick={() => setFilterType(option.id)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                filterType === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-600">{option.count} alerts</p>
            </button>
          ))}
        </div>
      </div>

      {/* Export Format Options */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setExportFormat('csv')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              exportFormat === 'csv'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sheet className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">CSV Format</span>
            </div>
            <p className="text-xs text-gray-600">Excel-compatible spreadsheet</p>
          </button>

          <button
            onClick={() => setExportFormat('json')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              exportFormat === 'json'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">JSON Format</span>
            </div>
            <p className="text-xs text-gray-600">Structured data format</p>
          </button>
        </div>
      </div>

      {/* Export Info */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-700">
            <p className="font-medium">Export Details</p>
            <p className="mt-1 text-xs">
              Format: <span className="font-semibold uppercase">{exportFormat}</span> | 
              Filter: <span className="font-semibold capitalize">{filterType}</span> | 
              Alerts: <span className="font-semibold">{filteredAlerts.length}</span>
            </p>
            <p className="mt-2 text-xs text-gray-600">
              File will be named: <span className="font-mono text-gray-700">fraud-resolution-report-{new Date().toISOString().split('T')[0]}.{exportFormat}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <button
        onClick={handleExport}
        disabled={loading || filteredAlerts.length === 0}
        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          loading || filteredAlerts.length === 0
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <Download size={18} />
        {loading ? 'Exporting...' : `Export ${filteredAlerts.length} Alert${filteredAlerts.length !== 1 ? 's'} as ${exportFormat.toUpperCase()}`}
      </button>
    </div>
  )
}
