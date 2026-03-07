"use client"

import { Play, Pause, Shield, RefreshCw, Bell, Settings, Zap, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  isRunning: boolean
  onToggle: () => void
  unresolvedAlerts: number
}

export function DashboardHeader({ isRunning, onToggle, unresolvedAlerts }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="h-9 w-9 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-card animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">FraudGuard</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Real-Time Fraud Detection</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1.5 py-1">
                <Zap className="h-3 w-3" />
                Apache Kafka
              </Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1.5 py-1">
                <Database className="h-3 w-3" />
                Apache Spark
              </Badge>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 gap-1.5 py-1">
                <Shield className="h-3 w-3" />
                ML Engine v2.3
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unresolvedAlerts > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-pulse">
                    {unresolvedAlerts > 99 ? '99+' : unresolvedAlerts}
                  </span>
                )}
              </Button>
            </div>
            
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button
              onClick={onToggle}
              size="sm"
              className={cn(
                "gap-2 min-w-[130px] font-medium",
                isRunning 
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                  : "bg-accent hover:bg-accent/90 text-accent-foreground"
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop Stream
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Stream
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stream Status Bar */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn(
              "h-2 w-2 rounded-full",
              isRunning ? "bg-accent animate-pulse" : "bg-muted"
            )} />
            <span className="text-xs text-muted-foreground">
              Status: <span className={isRunning ? "text-accent font-medium" : "text-muted-foreground"}>
                {isRunning ? 'LIVE' : 'PAUSED'}
              </span>
            </span>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <RefreshCw className={cn("h-3 w-3", isRunning && "animate-spin")} />
            Processing bank transactions
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="text-xs text-muted-foreground shrink-0">
            Topic: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">bank-transactions</code>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="text-xs text-muted-foreground shrink-0">
            Consumer: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">fraud-detector-group</code>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="text-xs text-muted-foreground shrink-0">
            Region: <span className="text-foreground">ap-south-1</span> (Mumbai)
          </div>
        </div>
      </div>
    </header>
  )
}
