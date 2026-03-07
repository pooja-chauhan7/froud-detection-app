"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, AlertTriangle, MapPin, CreditCard, TrendingUp, Shield } from 'lucide-react'
import type { Transaction } from '@/lib/types'

interface UserTrackingProps {
  transactions: Transaction[]
}

interface UserStats {
  userId: string
  userName: string
  email?: string
  phone?: string
  totalTransactions: number
  totalAmount: number
  fraudulentTransactions: number
  avgRiskScore: number
  lastLocation: { city: string; country: string }
  lastActivity: Date
  riskLevel: 'low' | 'medium' | 'high'
  locations: Set<string>
  transactions: Transaction[]
}

export function UserTracking({ transactions }: UserTrackingProps) {
  const userStats = useMemo(() => {
    const stats = new Map<string, UserStats>()

    transactions.forEach(txn => {
      const existing = stats.get(txn.userId)
      
      if (existing) {
        existing.totalTransactions += 1
        existing.totalAmount += txn.amount
        existing.fraudulentTransactions += txn.isFraud ? 1 : 0
        existing.avgRiskScore = (existing.avgRiskScore * (existing.totalTransactions - 1) + txn.riskScore) / existing.totalTransactions
        existing.lastLocation = { city: txn.location.city, country: txn.location.country }
        existing.lastActivity = txn.timestamp
        existing.locations.add(`${txn.location.city}, ${txn.location.country}`)
        existing.transactions.unshift(txn)
      } else {
        stats.set(txn.userId, {
          userId: txn.userId,
          userName: txn.accountHolder,
          email: txn.email,
          phone: txn.phone,
          totalTransactions: 1,
          totalAmount: txn.amount,
          fraudulentTransactions: txn.isFraud ? 1 : 0,
          avgRiskScore: txn.riskScore,
          lastLocation: { city: txn.location.city, country: txn.location.country },
          lastActivity: txn.timestamp,
          riskLevel: 'low',
          locations: new Set([`${txn.location.city}, ${txn.location.country}`]),
          transactions: [txn]
        })
      }
    })

    // Calculate risk levels
    stats.forEach(user => {
      const fraudRate = user.fraudulentTransactions / user.totalTransactions
      if (fraudRate > 0.5 || user.avgRiskScore > 60) {
        user.riskLevel = 'high'
      } else if (fraudRate > 0.2 || user.avgRiskScore > 35) {
        user.riskLevel = 'medium'
      }
    })

    return Array.from(stats.values()).sort((a, b) => b.avgRiskScore - a.avgRiskScore)
  }, [transactions])

  const highRiskUsers = userStats.filter(u => u.riskLevel === 'high')
  const mediumRiskUsers = userStats.filter(u => u.riskLevel === 'medium')

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Summary Cards */}
      <div className="lg:col-span-3 grid gap-4 sm:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userStats.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card border-destructive/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">High Risk Users</p>
                <p className="text-2xl font-bold text-destructive">{highRiskUsers.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-warning">{mediumRiskUsers.length}</p>
              </div>
              <Shield className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <div className="lg:col-span-2">
        <Card className="border-border bg-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              User Activity Tracking
            </CardTitle>
            <CardDescription>
              Monitor user behavior and identify suspicious patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {userStats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No user data yet</p>
                  </div>
                ) : (
                  userStats.map(user => (
                    <div 
                      key={user.userId}
                      className={`rounded-lg border p-4 transition-colors ${
                        user.riskLevel === 'high' 
                          ? 'border-destructive/50 bg-destructive/5' 
                          : user.riskLevel === 'medium'
                          ? 'border-warning/50 bg-warning/5'
                          : 'border-border bg-secondary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{user.userName}</h4>
                            <Badge 
                              variant={
                                user.riskLevel === 'high' ? 'destructive' : 
                                user.riskLevel === 'medium' ? 'secondary' : 'default'
                              }
                              className="text-[10px]"
                            >
                              {user.riskLevel.toUpperCase()} RISK
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mb-2">
                            {user.userId}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            {user.email && (
                              <div className="truncate text-muted-foreground">{user.email}</div>
                            )}
                            {user.phone && (
                              <div className="text-muted-foreground">{user.phone}</div>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <CreditCard className="h-3 w-3" />
                              {user.totalTransactions} transactions
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {user.locations.size} location{user.locations.size > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold">
                            {user.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Avg Risk: <span className={`font-mono ${user.avgRiskScore > 50 ? 'text-destructive' : user.avgRiskScore > 30 ? 'text-warning' : 'text-accent'}`}>
                              {user.avgRiskScore.toFixed(0)}
                            </span>
                          </p>
                          {user.fraudulentTransactions > 0 && (
                            <p className="text-xs text-destructive mt-1">
                              {user.fraudulentTransactions} fraud detected
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Location Trail */}
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          Location Trail
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(user.locations).slice(0, 5).map((loc, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px]">
                              {loc}
                            </Badge>
                          ))}
                          {user.locations.size > 5 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{user.locations.size - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Users Detail */}
      <div>
        <Card className="border-border bg-card border-destructive/30 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="h-5 w-5" />
              High Risk Users
            </CardTitle>
            <CardDescription>
              Users flagged for suspicious activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {highRiskUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="h-12 w-12 text-accent/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No high-risk users detected</p>
                    <p className="text-xs text-muted-foreground">System is operating normally</p>
                  </div>
                ) : (
                  highRiskUsers.map(user => (
                    <div 
                      key={user.userId}
                      className="rounded-lg border border-destructive/50 bg-destructive/5 p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{user.userName}</h4>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {user.userId}
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-[10px]">
                          RISK: {user.avgRiskScore.toFixed(0)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fraud Count:</span>
                          <span className="text-destructive font-medium">
                            {user.fraudulentTransactions}/{user.totalTransactions}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-medium">
                            {user.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Seen:</span>
                          <span>{user.lastLocation.city}</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-destructive/20">
                        <p className="text-[10px] text-destructive">
                          Recommended: Block account for review
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
