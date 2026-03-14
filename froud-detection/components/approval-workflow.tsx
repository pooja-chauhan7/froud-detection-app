'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { FraudAlert, ResolutionAction } from '@/lib/types'
import { AlertCircle, CheckCircle2, XCircle, Clock, User, MessageSquare } from 'lucide-react'

interface ApprovalWorkflowProps {
  alert: FraudAlert
  proposedAction: ResolutionAction['type']
  proposedNotes?: string
  onApprove?: (alert: FraudAlert) => void
  onReject?: () => void
  onClose?: () => void
}

export function ApprovalWorkflow({
  alert,
  proposedAction,
  proposedNotes,
  onApprove,
  onReject,
  onClose
}: ApprovalWorkflowProps) {
  const [approvalNotes, setApprovalNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')

  const isCriticalAction = ['block_transaction', 'report_authority'].includes(proposedAction)

  const actionDetails: Record<ResolutionAction['type'], { label: string; description: string; risk: 'high' | 'medium' | 'low' }> = {
    block_transaction: {
      label: 'Block Transaction',
      description: 'Immediately block and flag this transaction for fraud prevention',
      risk: 'high'
    },
    flag_account: {
      label: 'Flag Account',
      description: 'Flag the account for investigation and enhanced monitoring',
      risk: 'medium'
    },
    mark_safe: {
      label: 'Mark as Safe',
      description: 'Mark as false positive and whitelist the merchant/transaction',
      risk: 'medium'
    },
    report_authority: {
      label: 'Report to Authority',
      description: 'Escalate case to financial crime authorities and regulatory bodies',
      risk: 'high'
    }
  }

  const details = actionDetails[proposedAction]

  const handleApprove = async () => {
    if (isCriticalAction && !approvalNotes.trim()) {
      toast.error('Approval notes are required for critical actions')
      return
    }

    setLoading(true)

    try {
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            setStatus('approved')
            onApprove?.(alert)
            resolve(true)
          }, 1000)
        }),
        {
          loading: 'Processing approval...',
          success: `✓ Action "${details.label}" approved and executed`,
          error: 'Approval failed'
        }
      )
    } catch (error) {
      console.error('Approval failed:', error)
      toast.error('Failed to process approval')
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!approvalNotes.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setLoading(true)

    try {
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            setStatus('rejected')
            onReject?.()
            toast.info('Action rejected. Returning to alert view.')
            resolve(true)
          }, 800)
        }),
        {
          loading: 'Processing rejection...',
          success: '✓ Action rejected',
          error: 'Rejection failed'
        }
      )
    } catch (error) {
      console.error('Rejection failed:', error)
      toast.error('Failed to process rejection')
      setLoading(false)
    }
  }

  if (status === 'approved') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">Action Approved</h3>
          <p className="text-green-800 mb-4">
            The resolution action has been approved and is now being executed.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Action Rejected</h3>
          <p className="text-red-800 mb-4">
            The resolution action has been rejected. The alert remains in pending status.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900">Approval Required</h2>
        </div>
        <p className="text-sm text-gray-600 ml-9">
          This action requires supervisor approval due to its impact level
        </p>
      </div>

      {/* Risk Level Banner */}
      <div
        className={`p-4 rounded-lg border-2 mb-6 ${
          details.risk === 'high'
            ? 'bg-red-50 border-red-200'
            : details.risk === 'medium'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className={`w-5 h-5 flex-shrink-0 mt-1 ${
              details.risk === 'high' ? 'text-red-600' : details.risk === 'medium' ? 'text-yellow-600' : 'text-blue-600'
            }`}
          />
          <div>
            <p
              className={`font-semibold ${
                details.risk === 'high'
                  ? 'text-red-900'
                  : details.risk === 'medium'
                    ? 'text-yellow-900'
                    : 'text-blue-900'
              }`}
            >
              {details.risk === 'high' ? 'HIGH IMPACT ACTION' : 'MEDIUM IMPACT ACTION'}
            </p>
            <p
              className={`text-sm mt-1 ${
                details.risk === 'high'
                  ? 'text-red-800'
                  : details.risk === 'medium'
                    ? 'text-yellow-800'
                    : 'text-blue-800'
              }`}
            >
              {details.description}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Details */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Alert Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Alert ID</p>
            <p className="font-mono text-gray-900">#{alert.id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-gray-600">Severity</p>
            <p className="font-semibold text-gray-900 capitalize">{alert.severity}</p>
          </div>
          <div>
            <p className="text-gray-600">Amount</p>
            <p className="font-semibold text-gray-900">₹{alert.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Account Holder</p>
            <p className="font-semibold text-gray-900">{alert.accountHolder}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600">Description</p>
            <p className="text-gray-900">{alert.description}</p>
          </div>
        </div>
      </div>

      {/* Proposed Action */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Proposed Resolution Action</h3>
        <div className="mb-3 pb-3 border-b border-blue-200">
          <p className="text-sm text-gray-600">Action</p>
          <p className="text-lg font-semibold text-blue-900">{details.label}</p>
        </div>
        {proposedNotes && (
          <div>
            <p className="text-sm text-gray-600">Analyst Notes</p>
            <p className="text-gray-900 italic">"{proposedNotes}"</p>
          </div>
        )}
      </div>

      {/* Approval Notes */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {isCriticalAction ? 'Approval Notes (Required)' : 'Approval Notes (Optional)'}
        </label>
        <textarea
          value={approvalNotes}
          onChange={(e) => setApprovalNotes(e.target.value)}
          placeholder={
            isCriticalAction
              ? 'Please provide your approval reason and any relevant context...'
              : 'Add any additional approval comments or context...'
          }
          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Supervisor Info */}
      <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg mb-6 flex items-start gap-3">
        <User className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-gray-900">Supervisor Approval</p>
          <p className="text-gray-700 mt-1">
            This action will be logged in the audit trail and attributed to your user account.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={loading || (isCriticalAction && !approvalNotes.trim())}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            loading || (isCriticalAction && !approvalNotes.trim())
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <CheckCircle2 size={18} />
          {loading ? 'Processing...' : 'Approve Action'}
        </button>

        <button
          onClick={handleReject}
          disabled={loading || !approvalNotes.trim()}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            loading || !approvalNotes.trim()
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <XCircle size={18} />
          {loading ? 'Processing...' : 'Reject Action'}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
