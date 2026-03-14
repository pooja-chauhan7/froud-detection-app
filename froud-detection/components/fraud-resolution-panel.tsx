'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { FraudAlert, ResolutionAction } from '@/lib/types'
import { executeResolutionAction, getResolutionTimeline } from '@/lib/alert-service'
import { AlertCircle, CheckCircle2, Clock, Shield, AlertTriangle } from 'lucide-react'

interface FraudResolutionPanelProps {
  alert: FraudAlert
  onResolve?: (alertId: string, alert: FraudAlert) => void
  onClose?: () => void
}

export function FraudResolutionPanel({
  alert,
  onResolve,
  onClose
}: FraudResolutionPanelProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  const timeline = getResolutionTimeline(alert)
  const severityColors: Record<string, string> = {
    critical: 'bg-red-100 border-red-300 text-red-900',
    high: 'bg-orange-100 border-orange-300 text-orange-900',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    low: 'bg-blue-100 border-blue-300 text-blue-900'
  }

  const actionOptions = [
    {
      id: 'block_transaction',
      label: 'Block Transaction',
      description: 'Immediately block and flag this transaction',
      icon: '🛑',
      color: 'red'
    },
    {
      id: 'flag_account',
      label: 'Flag Account',
      description: 'Flag account for investigation and monitoring',
      icon: '⚠️',
      color: 'orange'
    },
    {
      id: 'mark_safe',
      label: 'Mark as Safe',
      description: 'Mark as false positive and whitelist merchant',
      icon: '✓',
      color: 'green'
    },
    {
      id: 'report_authority',
      label: 'Report to Authority',
      description: 'Escalate to financial crime authorities',
      icon: '🚨',
      color: 'purple'
    }
  ]

  const handleResolve = async () => {
    if (!selectedAction) {
      toast.error('Please select a resolution action')
      return
    }

    setLoading(true)
    try {
      const actionLabel = actionOptions.find(a => a.id === selectedAction)?.label || selectedAction
      
      toast.promise(
        new Promise((resolve) => {
          const result = executeResolutionAction(
            alert,
            selectedAction as ResolutionAction['type'],
            'ANALYST',
            notes || 'Resolved via resolution panel'
          )

          if (result.success && result.updatedAlert) {
            onResolve?.(alert.id, result.updatedAlert)
            setTimeout(() => {
              setLoading(false)
              onClose?.()
              resolve(true)
            }, 500)
          } else {
            setLoading(false)
            throw new Error('Failed to resolve alert')
          }
        }),
        {
          loading: `Resolving fraud alert with action: ${actionLabel}...`,
          success: () => {
            return `✓ Alert successfully resolved! Action: ${actionLabel}`
          },
          error: (err) => {
            return `✗ Failed to resolve alert: ${err.message}`
          }
        }
      )
    } catch (error) {
      console.error('Resolution failed:', error)
      toast.error('Failed to resolve fraud alert. Please try again.')
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (alert.resolved) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
          <CheckCircle2 size={16} />
          Resolved
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
        <Clock size={16} />
        Pending
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Fraud Alert Resolution</h2>
          </div>
          <p className="text-sm text-gray-600 ml-9">Alert ID: {alert.id}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Alert Summary */}
      <div className={`p-4 border-2 rounded-lg mb-6 ${severityColors[alert.severity]}`}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Severity:</span>
            <span className="ml-2 capitalize">{alert.severity}</span>
          </div>
          <div>
            <span className="font-semibold">Amount:</span>
            <span className="ml-2">₹{alert.amount.toLocaleString()}</span>
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>
            <span className="ml-2">{alert.accountHolder}</span>
          </div>
          <div>
            <span className="font-semibold">Location:</span>
            <span className="ml-2">{alert.location.city}, {alert.location.country}</span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Description:</span>
            <p className="ml-2 mt-1">{alert.description}</p>
          </div>
        </div>
      </div>

      {/* Risk-Based Recommendation */}
      {alert.riskBasedRecommendation && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-blue-900">AI Recommendation</p>
              <p className="text-sm text-blue-800 mt-1">{alert.riskBasedRecommendation.reason}</p>
              <p className="text-xs text-blue-700 mt-2">
                Priority: <span className="font-semibold uppercase">{alert.riskBasedRecommendation.priority}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Actions */}
      {!alert.resolved && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} />
            Select Resolution Action
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
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-semibold text-sm text-gray-900">{option.label}</span>
                </div>
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
              placeholder="Add any additional notes or context for this resolution..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleResolve}
              disabled={!selectedAction || loading}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                !selectedAction || loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Resolve Alert'}
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
      )}

      {/* Resolution History Timeline */}
      {timeline.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="font-semibold text-gray-900 mb-3 flex items-center gap-2 hover:text-blue-600"
          >
            <Clock size={18} />
            Resolution History ({timeline.length})
          </button>

          {showTimeline && (
            <div className="space-y-3">
              {timeline.map((action, index) => (
                <div key={action.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 capitalize">
                        {action.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {action.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {action.timestamp.toLocaleString('en-IN')} by {action.executedBy}
                    </p>
                    {action.notes && (
                      <p className="text-sm text-gray-700 mt-1 italic">"{action.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resolved Alert Info */}
      {alert.resolved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-green-900">Alert Resolved</p>
              <p className="text-sm text-green-800 mt-1">
                Resolved by {alert.resolvedBy} on {alert.resolvedAt?.toLocaleString('en-IN')}
              </p>
              {alert.notes && (
                <p className="text-sm text-green-700 mt-2">
                  <span className="font-semibold">Notes:</span> {alert.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
