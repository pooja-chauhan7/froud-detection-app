"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Cpu, HardDrive, Network, Database, Flame, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemStatusProps {
  isRunning: boolean
}

export function SystemStatus({ isRunning }: SystemStatusProps) {
  const services = [
    { 
      name: 'Apache Kafka', 
      status: isRunning ? 'running' : 'stopped',
      icon: Activity,
      details: 'Topic: bank-transactions | Partitions: 8',
      usage: 67
    },
    { 
      name: 'Apache Spark', 
      status: isRunning ? 'running' : 'stopped',
      icon: Flame,
      details: 'Streaming Mode | Workers: 4',
      usage: 78
    },
    { 
      name: 'ML Model Server', 
      status: 'running',
      icon: Cpu,
      details: 'Fraud Detection v2.3 | GPU Enabled',
      usage: 45
    },
    { 
      name: 'PostgreSQL', 
      status: 'running',
      icon: Database,
      details: 'Transaction Store | 2.3TB',
      usage: 52
    },
    { 
      name: 'Redis Cache', 
      status: 'running',
      icon: HardDrive,
      details: 'Session Store | 12GB',
      usage: 34
    },
    { 
      name: 'Load Balancer', 
      status: 'running',
      icon: Network,
      details: 'NGINX | 3 Upstream',
      usage: 23
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          System Infrastructure
          <Badge 
            variant="outline" 
            className={cn(
              "ml-2",
              isRunning 
                ? "bg-success/20 text-success border-success/30" 
                : "bg-danger/20 text-danger border-danger/30"
            )}
          >
            {isRunning ? 'All Systems Operational' : 'Stream Paused'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {services.map((service) => {
            const Icon = service.icon
            const isActive = service.status === 'running'
            
            return (
              <div
                key={service.name}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  isActive 
                    ? "bg-secondary/50 border-border" 
                    : "bg-danger/5 border-danger/30"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn(
                    "h-4 w-4",
                    isActive ? "text-success" : "text-danger"
                  )} />
                  <span className="text-xs font-medium text-foreground truncate">
                    {service.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <CheckCircle2 className={cn(
                    "h-3 w-3",
                    isActive ? "text-success" : "text-danger"
                  )} />
                  <span className={cn(
                    "text-[10px] uppercase",
                    isActive ? "text-success" : "text-danger"
                  )}>
                    {service.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">CPU</span>
                    <span className="text-[10px] text-foreground">{service.usage}%</span>
                  </div>
                  <Progress 
                    value={service.usage} 
                    className="h-1 bg-secondary"
                  />
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground truncate">
                  {service.details}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
