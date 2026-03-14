'use client'

import type { FraudAlert } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, CheckCircle2, AlertCircle, Clock, ArrowUpRight } from 'lucide-react'

interface ResolutionStatsDashboardProps {
  alerts: FraudAlert[]
}

export function ResolutionStatsDashboard({ alerts }: ResolutionStatsDashboardProps) {
  // Calculate statistics
  const totalAlerts = alerts.length
  const resolvedAlerts = alerts.filter(a => a.resolved).length
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length
  const falsePositives = alerts.filter(a => a.resolutionStatus === 'false_positive').length
  const confirmedFrauds = alerts.filter(a => a.resolutionStatus === 'confirmed_fraud').length
  const resolutionRate = totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0

  // Resolution status breakdown
  const statusBreakdown = [
    { name: 'Pending', value: unresolvedAlerts, color: '#ef4444' },
    { name: 'False Positive', value: falsePositives, color: '#3b82f6' },
    { name: 'Confirmed Fraud', value: confirmedFrauds, color: '#f97316' }
  ]

  // Action type breakdown (from resolved alerts)
  const actionBreakdown = [
    {
      name: 'Block Transaction',
      count: alerts.filter(a => a.resolutionAction?.type === 'block_transaction').length
    },
    {
      name: 'Flag Account',
      count: alerts.filter(a => a.resolutionAction?.type === 'flag_account').length
    },
    {
      name: 'Mark Safe',
      count: alerts.filter(a => a.resolutionAction?.type === 'mark_safe').length
    },
    {
      name: 'Report Authority',
      count: alerts.filter(a => a.resolutionAction?.type === 'report_authority').length
    }
  ]

  // Severity distribution of unresolved alerts
  const severityBreakdown = [
    {
      name: 'Critical',
      unresolved: alerts.filter(a => !a.resolved && a.severity === 'critical').length,
      resolved: alerts.filter(a => a.resolved && a.severity === 'critical').length
    },
    {
      name: 'High',
      unresolved: alerts.filter(a => !a.resolved && a.severity === 'high').length,
      resolved: alerts.filter(a => a.resolved && a.severity === 'high').length
    },
    {
      name: 'Medium',
      unresolved: alerts.filter(a => !a.resolved && a.severity === 'medium').length,
      resolved: alerts.filter(a => a.resolved && a.severity === 'medium').length
    },
    {
      name: 'Low',
      unresolved: alerts.filter(a => !a.resolved && a.severity === 'low').length,
      resolved: alerts.filter(a => a.resolved && a.severity === 'low').length
    }
  ]

  // Top merchants by fraud count
  const merchantFraudCount = alerts.reduce((acc, alert) => {
    const merchant = alert.accountHolder
    acc[merchant] = (acc[merchant] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topMerchants = Object.entries(merchantFraudCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return (
    <div className="w-full space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalAlerts}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500 opacity-70" />
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{resolvedAlerts}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500 opacity-70" />
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Unresolved</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{unresolvedAlerts}</p>
            </div>
            <Clock className="w-8 h-8 text-red-500 opacity-70" />
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resolution Rate</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{resolutionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500 opacity-70" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resolution Status Pie Chart */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Resolution Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Action Type Breakdown Bar Chart */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Resolution Actions Used</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={actionBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Resolution Rate by Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" stackId="a" fill="#22c55e" name="Resolved" />
              <Bar dataKey="unresolved" stackId="a" fill="#ef4444" name="Unresolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Merchants by Fraud Count */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Top 5 Merchants by Fraud Count</h3>
          <div className="space-y-2">
            {topMerchants.length > 0 ? (
              topMerchants.map((merchant, index) => (
                <div key={merchant.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-gray-500 w-6">{index + 1}</span>
                    <span className="text-sm text-gray-700 flex-1">{merchant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{merchant.count}</span>
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">False Positives</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{falsePositives}</p>
          <p className="text-xs text-green-600 mt-2">
            {totalAlerts > 0 ? Math.round((falsePositives / totalAlerts) * 100) : 0}% of all alerts
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700 font-medium">Confirmed Frauds</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">{confirmedFrauds}</p>
          <p className="text-xs text-orange-600 mt-2">
            {totalAlerts > 0 ? Math.round((confirmedFrauds / totalAlerts) * 100) : 0}% of all alerts
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">Average Resolution Time</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">N/A</p>
          <p className="text-xs text-blue-600 mt-2">Coming soon with timestamp tracking</p>
        </div>
      </div>
    </div>
  )
}
