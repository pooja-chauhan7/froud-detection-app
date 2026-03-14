'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { FraudAlert, ResolutionAction } from '@/lib/types'
import { executeResolutionAction } from '@/lib/alert-service'
import { AlertCircle, CheckCircle2, Settings, Zap } from 'lucide-react'

interface BulkResolutionActionsProps {
  selectedAlerts: FraudAlert[]
  onResolve?: (updatedAlerts: FraudAlert[]) => void
  onClose?: () => void
}

export function BulkResolutionActions({
  selectedAlerts,
  onResolve,
  onClose
}: BulkResolutionActionsProps) {
  const [selectedAction, setSelectedAction] = useState<ResolutionAction['type'] | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const actionOptions = [
    {
      id: 'block_transaction' as const,
      label: 'Block All Transactions',
      description: 'Block all selected transactions',
      color: 'red'
    },
    {
      id: 'flag_account' as const,
      label: 'Flag All Accounts',
      description: 'Flag all associated accounts for investigation',
      color: 'orange'
    },
    {
      id: 'mark_safe' as const,
      label: 'Mark All as Safe',
      description: 'Mark all as false positives',
      color: 'green'
    },
    {
      id: 'report_authority' as const,
      label: 'Report All to Authority',
      description: 'Escalate all cases to authorities',
      color: 'purple'
    }
  ]

  const handleBulkResolve = async () => {
    if (!selectedAction) {
      toast.error('Please select an action')
      return
    }

    if (selectedAlerts.length === 0) {
      toast.error('No alerts selected')
      return
    }

    setLoading(true)
    const updatedAlerts: FraudAlert[] = []
    const actionLabel = actionOptions.find(a => a.id === selectedAction)?.label || selectedAction

    try {
      for (let i = 0; i < selectedAlerts.length; i++) {
        const alert = selectedAlerts[i]
        const result = executeResolutionAction(
          alert,
          selectedAction,
          'ANALYST',
          notes || `Bulk resolved: ${actionLabel}`
        )

        if (result.updatedAlert) {
          updatedAlerts.push(result.updatedAlert)
        }

        setProgress(Math.round(((i + 1) / selectedAlerts.length) * 100))
      }

      toast.success(
        `✓ Successfully resolved ${updatedAlerts.length}/${selectedAlerts.length} alerts with action: ${actionLabel}`,
        { duration: 4000 }
      )

      onResolve?.(updatedAlerts)
      setSelectedAction(null)
      setNotes('')
      setProgress(0)
      
      setTimeout(() => {
        onClose?.()
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Bulk resolution failed:', error)
      toast.error(`Failed to resolve alerts. ${updatedAlerts.length} alerts were processed.`)
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Bulk Resolution</h2>
          </div>
          <p className="text-sm text-gray-600 ml-9">
            Resolving {selectedAlerts.length} alert{selectedAlerts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-blue-900">Selected Alerts</p>
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              {selectedAlerts.slice(0, 3).map((alert) => (
                <p key={alert.id} className="flex items-center gap-2">
                  <span className="text-xs font-mono">#{alert.id.slice(-6)}</span>
                  <span>{alert.accountHolder}</span>
                  <span className="text-xs text-blue-600">₹{alert.amount.toLocaleString()}</span>
                </p>
              ))}
              {selectedAlerts.length > 3 && (
                <p className="text-xs text-blue-600 italic">+{selectedAlerts.length - 3} more...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Actions */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings size={18} />
          Select Action for All Alerts
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {actionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedAction(option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedAction === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-sm text-gray-900 mb-1">{option.label}</div>
              <p className="text-xs text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>

        {/* Notes Section */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Resolution Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add context or reason for bulk resolution..."
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={loading}
          />
        </div>

        {/* Progress Bar */}
        {loading && progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Processing...</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBulkResolve}
            disabled={!selectedAction || loading || selectedAlerts.length === 0}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              !selectedAction || loading || selectedAlerts.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Zap size={16} />
            {loading ? `Resolving ${progress}%...` : `Resolve ${selectedAlerts.length} Alert${selectedAlerts.length !== 1 ? 's' : ''}`}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
