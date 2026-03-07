"use client"

import { CreditCard, MapPin, Clock, AlertTriangle, CheckCircle2, User, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Transaction } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TransactionFeedProps {
  transactions: Transaction[]
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

function getRiskBadgeColor(score: number): string {
  if (score >= 75) return 'bg-destructive/20 text-destructive border-destructive/30'
  if (score >= 50) return 'bg-warning/20 text-warning border-warning/30'
  if (score >= 25) return 'bg-info/20 text-info border-info/30'
  return 'bg-accent/20 text-accent border-accent/30'
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  const fraudCount = transactions.filter(t => t.isFraud).length
  
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Live Transaction Stream
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted-foreground font-normal">{transactions.length} total</span>
            {fraudCount > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                {fraudCount} flagged
              </Badge>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 px-4 pb-4">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No transactions yet</p>
                <p className="text-xs">Waiting for stream data...</p>
              </div>
            ) : (
              transactions.map((txn, index) => (
                <div
                  key={txn.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-300",
                    txn.isFraud 
                      ? "bg-destructive/5 border-destructive/30" 
                      : "bg-secondary/50 border-border hover:bg-secondary/80",
                    index === 0 && "ring-1 ring-primary/50 animate-in slide-in-from-top-2"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {txn.isFraud ? (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm text-foreground truncate">
                          {txn.merchantName}
                        </span>
                        {txn.isManualEntry && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1 bg-primary/10 text-primary border-primary/30">
                            MANUAL
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-foreground">{txn.accountHolder}</span>
                        <span className="text-xs text-muted-foreground">({txn.userId?.slice(-6)})</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {txn.cardType}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {txn.location.city}, {txn.location.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(txn.timestamp)}
                        </span>
                      </div>
                      
                      {txn.isFraud && txn.fraudReasons && txn.fraudReasons.length > 0 && (
                        <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                          <p className="text-[10px] uppercase tracking-wider text-destructive font-medium mb-1">
                            Detection Reasons
                          </p>
                          <div className="text-xs text-destructive/80">
                            {txn.fraudReasons.slice(0, 2).map((reason, idx) => (
                              <div key={idx} className="flex items-start gap-1">
                                <span className="text-destructive">-</span>
                                <span>{reason}</span>
                              </div>
                            ))}
                            {txn.fraudReasons.length > 2 && (
                              <span className="text-muted-foreground">+{txn.fraudReasons.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right flex-shrink-0 space-y-1">
                      <div className={cn(
                        "font-bold text-sm",
                        txn.isFraud ? "text-destructive" : "text-foreground"
                      )}>
                        {formatCurrency(txn.amount)}
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] h-5", getRiskBadgeColor(txn.riskScore))}>
                        Risk: {txn.riskScore}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        {txn.channel?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
