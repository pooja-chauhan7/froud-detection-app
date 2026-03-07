"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, Mail, Bell, CheckCircle2, Clock, 
  AlertTriangle, Shield, Send, Smartphone, Filter
} from 'lucide-react'
import type { AlertNotification } from '@/lib/alert-service'
import { cn } from '@/lib/utils'

interface NotificationAlertsProps {
  notifications: AlertNotification[]
  onResendNotification?: (id: string) => void
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getStatusColor(status: AlertNotification['status']): string {
  switch (status) {
    case 'delivered': return 'bg-accent text-accent-foreground'
    case 'sent': return 'bg-primary text-primary-foreground'
    case 'pending': return 'bg-warning text-warning-foreground'
    case 'failed': return 'bg-destructive text-destructive-foreground'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getAlertTypeIcon(type: AlertNotification['alertType']) {
  switch (type) {
    case 'fraud_detected': return <AlertTriangle className="h-4 w-4 text-destructive" />
    case 'otp_sent': return <Shield className="h-4 w-4 text-primary" />
    case 'card_blocked': return <Shield className="h-4 w-4 text-warning" />
    case 'suspicious_location': return <AlertTriangle className="h-4 w-4 text-warning" />
    case 'high_risk': return <AlertTriangle className="h-4 w-4 text-destructive" />
    default: return <Bell className="h-4 w-4" />
  }
}

function getAlertTypeLabel(type: AlertNotification['alertType']): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function NotificationAlerts({ notifications, onResendNotification }: NotificationAlertsProps) {
  const [filter, setFilter] = useState<'all' | 'sms' | 'email'>('all')

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.type === filter
  )

  const stats = {
    total: notifications.length,
    sms: notifications.filter(n => n.type === 'sms').length,
    email: notifications.filter(n => n.type === 'email').length,
    delivered: notifications.filter(n => n.status === 'delivered').length,
    failed: notifications.filter(n => n.status === 'failed').length
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            SMS / Email Alerts
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] gap-1">
              <Smartphone className="h-3 w-3" />
              {stats.sms}
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Mail className="h-3 w-3" />
              {stats.email}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time notifications sent to users for fraud alerts and verification
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-3">
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total Sent</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-accent">{stats.delivered}</p>
            <p className="text-[10px] text-muted-foreground">Delivered</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-primary">{notifications.filter(n => n.alertType === 'fraud_detected').length}</p>
            <p className="text-[10px] text-muted-foreground">Fraud Alerts</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-warning">{notifications.filter(n => n.alertType === 'otp_sent').length}</p>
            <p className="text-[10px] text-muted-foreground">OTPs Sent</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
            <Button
              variant={filter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => setFilter('all')}
            >
              <Filter className="h-3 w-3 mr-1" />
              All
            </Button>
            <Button
              variant={filter === 'sms' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => setFilter('sms')}
            >
              <Smartphone className="h-3 w-3 mr-1" />
              SMS
            </Button>
            <Button
              variant={filter === 'email' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => setFilter('email')}
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[350px]">
          <div className="space-y-2 px-4 pb-4">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Send className="h-12 w-12 mb-3" />
                <p className="text-sm">No notifications sent yet</p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border border-border bg-secondary/30 transition-all",
                    index === 0 && "animate-in slide-in-from-top-2"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {notification.type === 'sms' ? (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-accent" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {notification.recipient.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {notification.type === 'sms' ? notification.recipient.phone : notification.recipient.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={cn("text-[10px]", getStatusColor(notification.status))}>
                        {notification.status === 'delivered' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {notification.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {notification.status.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Alert Type */}
                  <div className="flex items-center gap-2 mb-2">
                    {getAlertTypeIcon(notification.alertType)}
                    <span className="text-xs font-medium text-foreground">
                      {getAlertTypeLabel(notification.alertType)}
                    </span>
                  </div>

                  {/* Message Preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2 bg-background/50 p-2 rounded">
                    {notification.message.slice(0, 150)}...
                  </p>

                  {/* Transaction ID */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      TXN: {notification.transactionId.slice(-10)}
                    </span>
                    {notification.status === 'failed' && onResendNotification && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary"
                        onClick={() => onResendNotification(notification.id)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Resend
                      </Button>
                    )}
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
