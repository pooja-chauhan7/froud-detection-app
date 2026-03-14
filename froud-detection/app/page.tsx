"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardHeader } from '@/components/dashboard-header'
import { MetricsCards } from '@/components/metrics-cards'
import { TransactionFeed } from '@/components/transaction-feed'
import { FraudAlerts } from '@/components/fraud-alerts'
import { FraudMap } from '@/components/fraud-map'
import { StreamCharts } from '@/components/stream-charts'
import { SystemStatus } from '@/components/system-status'
import { ManualTransactionForm } from '@/components/manual-transaction-form'
import { CSVUploader } from '@/components/csv-uploader'
import { UserTracking } from '@/components/user-tracking'
import { NotificationAlerts } from '@/components/notification-alerts'
import { CardManagement } from '@/components/card-management'
import { SuspiciousLocations } from '@/components/suspicious-locations'
import { FraudResolutionPanel } from '@/components/fraud-resolution-panel'
import type { FraudAlert } from '@/lib/types'
import { useStream } from '@/hooks/use-stream'
import { 
  LayoutDashboard, UserPlus, FileSpreadsheet, Users, 
  Map, BarChart3, Shield, Bell, CreditCard, MapPin
} from 'lucide-react'

export default function FraudDetectionDashboard() {
  const {
    transactions,
    fraudAlerts,
    metrics,
    isRunning,
    toggleStream,
    resolveAlert,
    addManualTransaction,
    addCSVTransactions,
    clearAllData,
    locationDataArray,
    // Security features
    notifications,
    blockedCards,
    suspiciousLocations,
    sendSMSAlert,
    sendEmailAlert,
    requestOTP,
    verifyTransactionOTP,
    blockUserCard,
    unblockCard,
    // Resolution features
    applyResolutionAction,
    generateRecommendation
  } = useStream()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedAlertForResolution, setSelectedAlertForResolution] = useState<FraudAlert | null>(null)
  const unresolvedAlerts = fraudAlerts.filter(a => !a.resolved).length

  const handleResolveAlert = (alertId: string, updatedAlert: FraudAlert) => {
    // Update the alert state
    resolveAlert(alertId, updatedAlert.notes)
    setSelectedAlertForResolution(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        isRunning={isRunning} 
        onToggle={toggleStream}
        unresolvedAlerts={unresolvedAlerts}
      />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-1 h-auto p-1 bg-secondary/50">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 py-2 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1.5 py-2 text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Check</span>
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-1.5 py-2 text-xs">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 py-2 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1.5 py-2 text-xs">
              <Map className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5 py-2 text-xs relative">
              <Bell className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Alerts</span>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-1.5 py-2 text-xs relative">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
              {blockedCards.filter(c => c.status === 'blocked').length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-destructive-foreground">
                  {blockedCards.filter(c => c.status === 'blocked').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-1.5 py-2 text-xs relative">
              <MapPin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Suspicious</span>
              {suspiciousLocations.filter(l => l.riskLevel === 'critical').length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning text-[10px] flex items-center justify-center animate-pulse">
                  {suspiciousLocations.filter(l => l.riskLevel === 'critical').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5 py-2 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1.5 py-2 text-xs relative">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fraud</span>
              {unresolvedAlerts > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-destructive-foreground animate-pulse">
                  {unresolvedAlerts > 9 ? '9+' : unresolvedAlerts}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <MetricsCards metrics={metrics} />
            <SystemStatus isRunning={isRunning} />
            <StreamCharts transactions={transactions} metrics={metrics} />
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TransactionFeed transactions={transactions} />
              <FraudAlerts 
                alerts={fraudAlerts} 
                onResolve={resolveAlert}
                onOpenPanel={setSelectedAlertForResolution}
              />
            </div>
            
            <FraudMap locationData={locationDataArray} fraudAlerts={fraudAlerts} />
          </TabsContent>

          {/* Manual Transaction Check Tab */}
          <TabsContent value="manual" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Manual Transaction Check</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your transaction details to analyze for fraud. SMS/Email alerts and OTP verification will be triggered automatically.
              </p>
            </div>
            <ManualTransactionForm 
              onSubmit={addManualTransaction}
              onRequestOTP={requestOTP}
              onVerifyOTP={verifyTransactionOTP}
              onBlockCard={blockUserCard}
              onSendSMSAlert={sendSMSAlert}
              onSendEmailAlert={sendEmailAlert}
            />
          </TabsContent>

          {/* CSV Upload Tab */}
          <TabsContent value="csv" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Bulk CSV Upload</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload multiple transactions at once for batch fraud analysis with automatic alerts
              </p>
            </div>
            <CSVUploader onUpload={addCSVTransactions} />
          </TabsContent>

          {/* User Tracking Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">User Activity Tracking</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor user behavior, identify suspicious patterns, and track high-risk accounts
              </p>
            </div>
            <UserTracking transactions={transactions} />
          </TabsContent>

          {/* Live Map Tab */}
          <TabsContent value="map" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Live Transaction Map</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time geographic visualization of transactions and fraud hotspots
              </p>
            </div>
            <FraudMap locationData={locationDataArray} fraudAlerts={fraudAlerts} />
          </TabsContent>

          {/* SMS/Email Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">SMS / Email Alerts Center</h2>
              <p className="text-sm text-muted-foreground mt-1">
                View all SMS and Email notifications sent to users for fraud alerts and OTP verification
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <NotificationAlerts notifications={notifications} />
              <FraudAlerts 
                alerts={fraudAlerts} 
                onResolve={resolveAlert}
                onOpenPanel={setSelectedAlertForResolution}
              />
            </div>
          </TabsContent>

          {/* Card Management Tab */}
          <TabsContent value="cards" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Card Management</h2>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage blocked cards. Unblock cards after fraud investigation is complete.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <CardManagement 
                blockedCards={blockedCards}
                onBlockCard={(cardId, reason) => {
                  // This is for manual blocking from the card management panel
                }}
                onUnblockCard={unblockCard}
              />
              <NotificationAlerts 
                notifications={notifications.filter(n => n.alertType === 'card_blocked')} 
              />
            </div>
          </TabsContent>

          {/* Suspicious Locations Tab */}
          <TabsContent value="locations" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Suspicious Location Detection</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Transactions from unusual or high-risk locations that require attention
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <SuspiciousLocations 
                locations={suspiciousLocations}
                onBlockCard={(userId) => {
                  const user = transactions.find(t => t.userId === userId)
                  if (user) {
                    blockUserCard(
                      userId,
                      user.accountHolder,
                      user.cardLastFour || '****',
                      'Blocked due to suspicious location activity',
                      user
                    )
                  }
                }}
              />
              <FraudMap locationData={locationDataArray} fraudAlerts={fraudAlerts} />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Stream Analytics</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time charts and metrics from Apache Spark streaming pipeline
              </p>
            </div>
            <MetricsCards metrics={metrics} />
            <div className="mt-6">
              <StreamCharts transactions={transactions} metrics={metrics} />
            </div>
          </TabsContent>

          {/* Fraud Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Fraud Alerts Center</h2>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all fraud alerts detected by the ML model
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <FraudAlerts 
                alerts={fraudAlerts} 
                onResolve={resolveAlert}
                onOpenPanel={setSelectedAlertForResolution}
              />
              <TransactionFeed transactions={transactions.filter(t => t.isFraud)} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Fraud Resolution Panel Modal */}
        {selectedAlertForResolution && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Resolve Fraud Alert</h3>
                <button
                  onClick={() => setSelectedAlertForResolution(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <FraudResolutionPanel
                  alert={selectedAlertForResolution}
                  onResolve={handleResolveAlert}
                  onClose={() => setSelectedAlertForResolution(null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-border mt-8 pt-6 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">FraudGuard</span> - Real-Time Fraud Detection System
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                Apache Kafka v3.5
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Apache Spark v3.4
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-warning" />
                ML Model v2.3.1
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-info" />
                Latency: {'<'}15ms
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
