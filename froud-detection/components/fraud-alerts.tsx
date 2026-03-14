"use client"

import { AlertTriangle, MapPin, Clock, CheckCircle2, Shield, User, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { FraudAlert } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FraudAlertsProps {
  alerts: FraudAlert[]
  onResolve: (alertId: string) => void
  onOpenPanel?: (alert: FraudAlert) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getSeverityColor(severity: FraudAlert['severity']): string {
  switch (severity) {
    case 'critical':
      return 'bg-destructive text-destructive-foreground'
    case 'high':
      return 'bg-destructive/80 text-destructive-foreground'
    case 'medium':
      return 'bg-warning text-warning-foreground'
    case 'low':
      return 'bg-info text-info-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getSeverityBorder(severity: FraudAlert['severity']): string {
  switch (severity) {
    case 'critical':
      return 'border-l-4 border-l-destructive'
    case 'high':
      return 'border-l-4 border-l-destructive/70'
    case 'medium':
      return 'border-l-4 border-l-warning'
    case 'low':
      return 'border-l-4 border-l-info'
    default:
      return ''
  }
}

export function FraudAlerts({ alerts, onResolve, onOpenPanel }: FraudAlertsProps) {
  const unresolvedCount = alerts.filter(a => !a.resolved).length
  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length
  const highCount = alerts.filter(a => !a.resolved && a.severity === 'high').length

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-destructive" />
            Fraud Alerts
          </span>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse text-[10px]">
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="destructive" className="bg-destructive/70 text-[10px]">
                {highCount} High
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {unresolvedCount} Active
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 px-4 pb-4">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-3 text-accent" />
                <p className="text-sm">No fraud alerts</p>
                <p className="text-xs">All transactions are clean</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    alert.resolved 
                      ? "bg-muted/30 border-border opacity-60" 
                      : cn("bg-destructive/5 border-destructive/30", getSeverityBorder(alert.severity)),
                    index === 0 && !alert.resolved && "animate-in slide-in-from-top-2"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertTriangle className={cn(
                        "h-4 w-4 flex-shrink-0",
                        alert.resolved ? "text-muted-foreground" : "text-destructive"
                      )} />
                      <Badge className={cn("text-[10px]", getSeverityColor(alert.severity))}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        #{alert.id.slice(-8)}
                      </span>
                      {alert.resolutionStatus && (
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {alert.resolutionStatus.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    {!alert.resolved ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs hover:bg-blue-200/30 hover:text-blue-600"
                          onClick={() => onOpenPanel?.(alert)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 text-[10px]">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm font-medium text-foreground mb-1">{alert.type}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                  </div>

                  {/* User Info */}
                  <div className="mb-2 p-2 rounded bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{alert.accountHolder}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                      {alert.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-2.5 w-2.5" />
                          {alert.email}
                        </span>
                      )}
                      {alert.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />
                          {alert.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.location.city}, {alert.location.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <span className={cn(
                      "font-bold text-sm",
                      alert.resolved ? "text-muted-foreground" : "text-destructive"
                    )}>
                      {formatCurrency(alert.amount)}
                    </span>
                  </div>

                  {/* Recommended Action */}
                  {!alert.resolved && alert.recommendedAction && (
                    <div className="mt-2 pt-2 border-t border-destructive/20">
                      <p className="text-[10px] text-destructive">
                        <span className="font-medium">Recommended:</span> {alert.recommendedAction}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
