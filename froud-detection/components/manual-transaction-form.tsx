"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, CheckCircle, UserPlus, CreditCard, MapPin, Store, 
  Shield, Lock, Send, Bell, Smartphone, Mail, ShieldAlert
} from 'lucide-react'
import { OTPVerificationModal } from './otp-verification'
import type { Transaction } from '@/lib/types'
import type { OTPVerification, AlertNotification } from '@/lib/alert-service'
import { cn } from '@/lib/utils'

interface ManualTransactionFormProps {
  onSubmit: (data: {
    userName: string
    email?: string
    phone?: string
    amount: number
    merchantName: string
    merchantCategory: string
    city: string
    country: string
    cardType: string
    transactionType: Transaction['transactionType']
    channel: Transaction['channel']
  }) => Transaction
  onRequestOTP?: (transaction: Transaction) => OTPVerification
  onVerifyOTP?: (transactionId: string, otp: string) => { success: boolean; message: string }
  onBlockCard?: (userId: string, userName: string, cardNumber: string, reason: string, transaction: Transaction) => void
  onSendSMSAlert?: (transaction: Transaction, alertType: AlertNotification['alertType']) => void
  onSendEmailAlert?: (transaction: Transaction, alertType: AlertNotification['alertType']) => void
}

const merchantCategories = [
  'E-commerce', 'Retail', 'Grocery', 'ATM', 'Entertainment', 'Food Delivery',
  'Transportation', 'Healthcare', 'Electronics', 'Jewelry', 'Travel', 
  'Gambling', 'Cryptocurrency', 'Unknown', 'Gift Cards', 'Adult'
]

const cardTypes = ['Visa', 'Mastercard', 'RuPay', 'American Express', 'Diners Club']
const transactionTypes = ['purchase', 'withdrawal', 'transfer', 'refund', 'deposit']
const channels = ['online', 'pos', 'atm', 'mobile', 'bank_transfer']

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Kanpur', 'Nagpur', 'Indore',
  'New York', 'London', 'Singapore', 'Dubai', 'Tokyo', 'Lagos', 'Moscow'
]

export function ManualTransactionForm({ 
  onSubmit, 
  onRequestOTP, 
  onVerifyOTP,
  onBlockCard,
  onSendSMSAlert,
  onSendEmailAlert
}: ManualTransactionFormProps) {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    amount: '',
    merchantName: '',
    merchantCategory: 'E-commerce',
    city: 'Mumbai',
    country: 'India',
    cardType: 'Visa',
    transactionType: 'purchase' as Transaction['transactionType'],
    channel: 'online' as Transaction['channel']
  })

  const [result, setResult] = useState<Transaction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [currentOTP, setCurrentOTP] = useState<OTPVerification | null>(null)
  const [cardBlocked, setCardBlocked] = useState(false)
  const [alertsSent, setAlertsSent] = useState<{ sms: boolean; email: boolean }>({ sms: false, email: false })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setAlertsSent({ sms: false, email: false })
    setCardBlocked(false)

    setTimeout(() => {
      const transaction = onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        email: formData.email || undefined,
        phone: formData.phone || undefined
      })
      setResult(transaction)
      setIsProcessing(false)

      // If fraud detected and risk score is between 50-80, request OTP
      if (transaction.isFraud && transaction.riskScore >= 50 && transaction.riskScore < 80 && onRequestOTP) {
        const otpData = onRequestOTP(transaction)
        setCurrentOTP(otpData)
        setShowOTPModal(true)
      }

      // Auto-send alerts for all fraud detections
      if (transaction.isFraud) {
        if (formData.phone && onSendSMSAlert) {
          onSendSMSAlert(transaction, 'fraud_detected')
          setAlertsSent(prev => ({ ...prev, sms: true }))
        }
        if (formData.email && onSendEmailAlert) {
          onSendEmailAlert(transaction, 'fraud_detected')
          setAlertsSent(prev => ({ ...prev, email: true }))
        }
      }
    }, 500)
  }

  const handleBlockCard = () => {
    if (result && onBlockCard) {
      onBlockCard(
        result.userId,
        result.accountHolder,
        result.cardLastFour || '****',
        result.fraudReasons?.[0] || 'Manual block by user',
        result
      )
      setCardBlocked(true)
    }
  }

  const handleVerifyOTP = (otp: string): { success: boolean; message: string } => {
    if (!result || !onVerifyOTP) {
      return { success: false, message: 'No pending transaction' }
    }
    return onVerifyOTP(result.id, otp)
  }

  const handleResendOTP = () => {
    if (result && onRequestOTP) {
      const otpData = onRequestOTP(result)
      setCurrentOTP(otpData)
    }
  }

  const handleReset = () => {
    setFormData({
      userName: '',
      email: '',
      phone: '',
      amount: '',
      merchantName: '',
      merchantCategory: 'E-commerce',
      city: 'Mumbai',
      country: 'India',
      cardType: 'Visa',
      transactionType: 'purchase',
      channel: 'online'
    })
    setResult(null)
    setCardBlocked(false)
    setAlertsSent({ sms: false, email: false })
    setCurrentOTP(null)
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-primary" />
              Manual Transaction Check
            </CardTitle>
            <CardDescription>
              Enter transaction details to check for fraud detection with real-time alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Details */}
              <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> User Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="userName" className="text-xs">Full Name *</Label>
                    <Input
                      id="userName"
                      placeholder="Rajesh Kumar"
                      value={formData.userName}
                      onChange={e => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email (for alerts)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@email.com"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs flex items-center gap-1">
                      <Smartphone className="h-3 w-3" /> Phone (for SMS/OTP)
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cardType" className="text-xs">Card Type</Label>
                    <Select 
                      value={formData.cardType} 
                      onValueChange={value => setFormData(prev => ({ ...prev, cardType: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cardTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Transaction Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs">Amount (INR) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="50000"
                      value={formData.amount}
                      onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                      min="1"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="transactionType" className="text-xs">Transaction Type</Label>
                    <Select 
                      value={formData.transactionType} 
                      onValueChange={value => setFormData(prev => ({ ...prev, transactionType: value as Transaction['transactionType'] }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transactionTypes.map(type => (
                          <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="channel" className="text-xs">Channel</Label>
                    <Select 
                      value={formData.channel} 
                      onValueChange={value => setFormData(prev => ({ ...prev, channel: value as Transaction['channel'] }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map(ch => (
                          <SelectItem key={ch} value={ch} className="capitalize">{ch.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Merchant Details */}
              <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Store className="h-4 w-4" /> Merchant Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="merchantName" className="text-xs">Merchant Name *</Label>
                    <Input
                      id="merchantName"
                      placeholder="Amazon India"
                      value={formData.merchantName}
                      onChange={e => setFormData(prev => ({ ...prev, merchantName: e.target.value }))}
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="merchantCategory" className="text-xs">Category</Label>
                    <Select 
                      value={formData.merchantCategory} 
                      onValueChange={value => setFormData(prev => ({ ...prev, merchantCategory: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {merchantCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs">City</Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={value => {
                        const isIndia = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Kanpur', 'Nagpur', 'Indore'].includes(value)
                        setFormData(prev => ({ 
                          ...prev, 
                          city: value,
                          country: isIndia ? 'India' : value === 'New York' ? 'USA' : value === 'London' ? 'UK' : value === 'Tokyo' ? 'Japan' : value === 'Dubai' ? 'UAE' : value === 'Lagos' ? 'Nigeria' : value === 'Moscow' ? 'Russia' : 'Singapore'
                        }))
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="h-9"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isProcessing || !formData.userName || !formData.amount || !formData.merchantName}
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Analyzing...</span>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Check for Fraud
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className={cn(
          "border-border bg-card",
          result && (result.isFraud ? 'border-destructive/50' : 'border-accent/50')
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {result ? (
                result.isFraud ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Fraud Detected
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-accent" />
                    Transaction Safe
                  </>
                )
              ) : (
                'Analysis Result'
              )}
            </CardTitle>
            <CardDescription>
              {result ? `Transaction ID: ${result.id}` : 'Submit a transaction to see results'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* Risk Score */}
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Risk Score</span>
                    <Badge variant={result.riskScore >= 60 ? 'destructive' : result.riskScore >= 30 ? 'secondary' : 'default'}>
                      {result.riskScore}/100
                    </Badge>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        result.riskScore >= 60 ? 'bg-destructive' : 
                        result.riskScore >= 30 ? 'bg-warning' : 'bg-accent'
                      )}
                      style={{ width: `${result.riskScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Low Risk</span>
                    <span>Medium</span>
                    <span>High Risk</span>
                  </div>
                </div>

                {/* Alerts Sent Status */}
                {result.isFraud && (alertsSent.sms || alertsSent.email) && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      Alerts Sent
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {alertsSent.sms && (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                          <Smartphone className="h-3 w-3 mr-1" />
                          SMS Alert Sent
                        </Badge>
                      )}
                      {alertsSent.email && (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                          <Mail className="h-3 w-3 mr-1" />
                          Email Alert Sent
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Blocked Status */}
                {cardBlocked && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Card Blocked</p>
                      <p className="text-xs text-muted-foreground">This card has been blocked for security</p>
                    </div>
                  </div>
                )}

                {/* ML Features */}
                {result.mlFeatures && (
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <h4 className="text-sm font-medium mb-3">ML Feature Analysis</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.mlFeatures).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={cn(
                            "font-mono",
                            value > 10 ? 'text-destructive' : value > 5 ? 'text-warning' : 'text-accent'
                          )}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fraud Reasons */}
                {result.fraudReasons && result.fraudReasons.length > 0 && (
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <h4 className="text-sm font-medium mb-2">Detection Reasons</h4>
                    <ul className="space-y-1.5">
                      {result.fraudReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Transaction Summary */}
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <h4 className="text-sm font-medium mb-3">Transaction Summary</h4>
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    <dt className="text-muted-foreground">User</dt>
                    <dd className="font-medium">{result.accountHolder}</dd>
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium text-primary">{result.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</dd>
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium">{result.location.city}, {result.location.country}</dd>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge variant={result.status === 'flagged' ? 'destructive' : 'default'} className="text-[10px]">
                        {result.status.toUpperCase()}
                      </Badge>
                    </dd>
                    <dt className="text-muted-foreground">Processing Time</dt>
                    <dd className="font-mono">{result.processingTime}ms</dd>
                  </dl>
                </div>

                {/* Action Buttons for Fraud */}
                {result.isFraud && !cardBlocked && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleBlockCard}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Block Card
                    </Button>
                    {result.riskScore >= 50 && result.riskScore < 80 && onRequestOTP && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const otpData = onRequestOTP(result)
                          setCurrentOTP(otpData)
                          setShowOTPModal(true)
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Verify with OTP
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Fill in the transaction details and click &quot;Check for Fraud&quot; to analyze
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  SMS/Email alerts and OTP verification will be triggered for suspicious transactions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        otpData={currentOTP}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        transactionDetails={{
          amount: result?.amount || 0,
          merchant: result?.merchantName || '',
          location: result ? `${result.location.city}, ${result.location.country}` : ''
        }}
      />
    </>
  )
}
