"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { Transaction, StreamMetrics } from '@/lib/types'
import { TrendingUp, PieChartIcon, BarChart3 } from 'lucide-react'

interface StreamChartsProps {
  transactions: Transaction[]
  metrics: StreamMetrics
}

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6']

export function StreamCharts({ transactions, metrics }: StreamChartsProps) {
  // Process data for charts
  const chartData = useMemo(() => {
    // Transaction volume over time (last 20 transactions grouped)
    const volumeData = []
    for (let i = 0; i < Math.min(20, Math.ceil(transactions.length / 5)); i++) {
      const slice = transactions.slice(i * 5, (i + 1) * 5)
      volumeData.push({
        time: `T-${20 - i}`,
        volume: slice.length * (2 + Math.random()),
        frauds: slice.filter(t => t.isFraud).length
      })
    }

    // Channel distribution
    const channelCounts = transactions.reduce((acc, t) => {
      acc[t.channel] = (acc[t.channel] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const channelData = Object.entries(channelCounts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }))

    // Risk score distribution
    const riskBuckets = [
      { range: '0-25', count: 0 },
      { range: '26-50', count: 0 },
      { range: '51-75', count: 0 },
      { range: '76-100', count: 0 },
    ]

    transactions.forEach(t => {
      if (t.riskScore <= 25) riskBuckets[0].count++
      else if (t.riskScore <= 50) riskBuckets[1].count++
      else if (t.riskScore <= 75) riskBuckets[2].count++
      else riskBuckets[3].count++
    })

    return { volumeData, channelData, riskBuckets }
  }, [transactions])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Transaction Volume Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Spark Streaming Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.volumeData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#888', fontSize: 10 }}
                  axisLine={{ stroke: '#333' }}
                />
                <YAxis 
                  tick={{ fill: '#888', fontSize: 10 }}
                  axisLine={{ stroke: '#333' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#6366f1"
                  fill="url(#volumeGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="frauds"
                  stroke="#ef4444"
                  fill="url(#fraudGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Volume</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-danger" />
              <span className="text-muted-foreground">Frauds</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Distribution */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-success" />
            Channel Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
            {chartData.channelData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Score Distribution */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-warning" />
            Risk Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.riskBuckets}>
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: '#888', fontSize: 10 }}
                  axisLine={{ stroke: '#333' }}
                />
                <YAxis 
                  tick={{ fill: '#888', fontSize: 10 }}
                  axisLine={{ stroke: '#333' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.riskBuckets.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index === 0 ? '#22c55e' :
                        index === 1 ? '#6366f1' :
                        index === 2 ? '#eab308' :
                        '#ef4444'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            <span className="text-success">Low</span>
            <span className="text-primary">Medium</span>
            <span className="text-warning">High</span>
            <span className="text-danger">Critical</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
