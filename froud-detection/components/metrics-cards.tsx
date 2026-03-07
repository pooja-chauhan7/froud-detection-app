"use client"

import { 
  Activity, AlertTriangle, CheckCircle2, Clock, Database, 
  Cpu, Zap, Server, UserPlus, FileSpreadsheet, Target 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StreamMetrics } from '@/lib/types'

interface MetricsCardsProps {
  metrics: StreamMetrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const fraudRate = metrics.totalProcessed > 0 
    ? ((metrics.fraudsDetected / metrics.totalProcessed) * 100).toFixed(1)
    : '0'

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Messages/sec</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metrics.messagesPerSecond}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <p className="text-xs text-accent">Kafka Stream</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Total Processed</CardTitle>
          <Database className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metrics.totalProcessed.toLocaleString()}</div>
          <div className="flex gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {metrics.manualEntries > 0 && (
                <span className="text-info">+{metrics.manualEntries} manual</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border border-destructive/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Frauds Detected</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{metrics.fraudsDetected}</div>
          <p className="text-xs text-muted-foreground">{fraudRate}% detection rate</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Avg Processing</CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metrics.avgProcessingTime.toFixed(2)}ms</div>
          <p className="text-xs text-accent">Low latency</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Spark Partitions</CardTitle>
          <Cpu className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{metrics.sparkPartitions}</div>
          <div className="flex items-center gap-1 mt-1">
            <Server className="h-3 w-3 text-accent" />
            <p className="text-xs text-accent">{metrics.activeWorkers} workers</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border border-accent/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">ML Accuracy</CardTitle>
          <Target className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{metrics.accuracy.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Detection model</p>
        </CardContent>
      </Card>
    </div>
  )
}
