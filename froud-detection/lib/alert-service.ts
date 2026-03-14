// Alert Service for SMS/Email notifications and Card Management

import type { ResolutionAction, FraudAlert } from './types'

export interface AlertNotification {
  id: string
  type: 'sms' | 'email' | 'both'
  recipient: {
    name: string
    email?: string
    phone?: string
  }
  subject: string
  message: string
  timestamp: Date
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  transactionId: string
  alertType: 'fraud_detected' | 'otp_sent' | 'card_blocked' | 'suspicious_location' | 'high_risk'
}

export interface OTPVerification {
  id: string
  transactionId: string
  userId: string
  otp: string
  expiresAt: Date
  verified: boolean
  attempts: number
  maxAttempts: number
  createdAt: Date
  phone?: string
  email?: string
}

export interface CardStatus {
  cardId: string
  cardNumber: string
  userId: string
  userName: string
  status: 'active' | 'blocked' | 'suspended' | 'frozen'
  blockedAt?: Date
  blockedReason?: string
  blockedBy?: string
  canUnblock: boolean
  lastTransaction?: Date
}

export interface SuspiciousLocation {
  id: string
  transactionId: string
  userId: string
  detectedLocation: {
    city: string
    country: string
    lat: number
    lng: number
  }
  userRegisteredLocation: {
    city: string
    country: string
  }
  distanceFromHome: number // in km
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  reason: string
  timestamp: Date
}

// High-risk countries for suspicious location detection
const highRiskCountries = [
  'Nigeria', 'Russia', 'Ukraine', 'North Korea', 'Iran', 'Syria', 'Venezuela'
]

// Known fraud hotspot cities
const fraudHotspots = [
  { city: 'Lagos', country: 'Nigeria' },
  { city: 'Moscow', country: 'Russia' },
  { city: 'Kiev', country: 'Ukraine' },
]

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

// Create SMS Alert
export function createSMSAlert(
  phone: string,
  userName: string,
  transactionId: string,
  amount: number,
  location: string,
  alertType: AlertNotification['alertType']
): AlertNotification {
  const messages: Record<AlertNotification['alertType'], string> = {
    fraud_detected: `ALERT: Suspicious transaction of Rs.${amount.toLocaleString()} detected at ${location}. If not you, call 1800-XXX-XXXX immediately. Ref: ${transactionId.slice(-8)}`,
    otp_sent: `Your OTP for transaction verification is: [OTP]. Valid for 5 minutes. Do not share with anyone.`,
    card_blocked: `Your card has been BLOCKED due to suspicious activity. Transaction of Rs.${amount.toLocaleString()} at ${location} was declined. Call 1800-XXX-XXXX to unblock.`,
    suspicious_location: `ALERT: Transaction attempted from unusual location (${location}). If this wasn't you, please verify or block your card immediately.`,
    high_risk: `HIGH RISK: Multiple suspicious activities detected. Please review your recent transactions and contact support.`
  }

  return {
    id: generateId('SMS'),
    type: 'sms',
    recipient: { name: userName, phone },
    subject: `FraudGuard Alert - ${alertType.replace('_', ' ').toUpperCase()}`,
    message: messages[alertType],
    timestamp: new Date(),
    status: 'sent',
    transactionId,
    alertType
  }
}

// Create Email Alert
export function createEmailAlert(
  email: string,
  userName: string,
  transactionId: string,
  amount: number,
  location: string,
  merchantName: string,
  alertType: AlertNotification['alertType'],
  fraudReasons?: string[]
): AlertNotification {
  const subjects: Record<AlertNotification['alertType'], string> = {
    fraud_detected: `[URGENT] Suspicious Transaction Detected - Action Required`,
    otp_sent: `Your Transaction Verification Code`,
    card_blocked: `Your Card Has Been Blocked - Security Alert`,
    suspicious_location: `Unusual Login Location Detected`,
    high_risk: `High Risk Alert - Immediate Action Required`
  }

  const emailBody = alertType === 'fraud_detected' 
    ? `Dear ${userName},

A suspicious transaction has been detected on your account:

Transaction Details:
- Amount: Rs. ${amount.toLocaleString()}
- Merchant: ${merchantName}
- Location: ${location}
- Transaction ID: ${transactionId}
- Time: ${new Date().toLocaleString('en-IN')}

Detection Reasons:
${fraudReasons?.map(r => `• ${r}`).join('\n') || '• Unusual activity pattern detected'}

If you did not authorize this transaction:
1. Do NOT share your OTP with anyone
2. Block your card immediately from the app
3. Call our 24/7 helpline: 1800-XXX-XXXX

If this was you, please verify the transaction using the OTP sent to your registered mobile.

Stay safe,
FraudGuard Security Team`
    : `Dear ${userName},

This is to notify you about activity on your account.

${alertType === 'card_blocked' ? 'Your card has been blocked for security.' : ''}
${alertType === 'suspicious_location' ? `Unusual location detected: ${location}` : ''}

Transaction ID: ${transactionId}

Contact support if you need assistance.

FraudGuard Security Team`

  return {
    id: generateId('EMAIL'),
    type: 'email',
    recipient: { name: userName, email },
    subject: subjects[alertType],
    message: emailBody,
    timestamp: new Date(),
    status: 'sent',
    transactionId,
    alertType
  }
}

// Create OTP Verification
export function createOTPVerification(
  transactionId: string,
  userId: string,
  phone?: string,
  email?: string
): OTPVerification {
  const otp = generateOTP()
  return {
    id: generateId('OTP'),
    transactionId,
    userId,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    verified: false,
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date(),
    phone,
    email
  }
}

// Verify OTP
export function verifyOTP(
  otpRecord: OTPVerification,
  enteredOTP: string
): { success: boolean; message: string; attemptsLeft?: number } {
  if (new Date() > otpRecord.expiresAt) {
    return { success: false, message: 'OTP has expired. Please request a new one.' }
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    return { success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' }
  }

  if (otpRecord.otp === enteredOTP) {
    return { success: true, message: 'OTP verified successfully!' }
  }

  const attemptsLeft = otpRecord.maxAttempts - otpRecord.attempts - 1
  return { 
    success: false, 
    message: `Incorrect OTP. ${attemptsLeft} attempts remaining.`,
    attemptsLeft 
  }
}

// Block Card
export function blockCard(
  cardId: string,
  cardNumber: string,
  userId: string,
  userName: string,
  reason: string,
  blockedBy: string = 'SYSTEM'
): CardStatus {
  return {
    cardId,
    cardNumber: `XXXX-XXXX-XXXX-${cardNumber.slice(-4)}`,
    userId,
    userName,
    status: 'blocked',
    blockedAt: new Date(),
    blockedReason: reason,
    blockedBy,
    canUnblock: true,
    lastTransaction: new Date()
  }
}

// Detect Suspicious Location
export function detectSuspiciousLocation(
  transactionId: string,
  userId: string,
  transactionLocation: { city: string; country: string; lat: number; lng: number },
  userRegisteredLocation: { city: string; country: string } = { city: 'Mumbai', country: 'India' }
): SuspiciousLocation | null {
  
  // Calculate distance from home location (simplified)
  const distance = calculateDistanceFromHome(transactionLocation, userRegisteredLocation)
  
  let riskLevel: SuspiciousLocation['riskLevel'] = 'low'
  let reason = ''

  // Check high-risk countries
  if (highRiskCountries.includes(transactionLocation.country)) {
    riskLevel = 'critical'
    reason = `Transaction from high-risk country: ${transactionLocation.country}`
  }
  // Check known fraud hotspots
  else if (fraudHotspots.some(h => h.city === transactionLocation.city && h.country === transactionLocation.country)) {
    riskLevel = 'high'
    reason = `Transaction from known fraud hotspot: ${transactionLocation.city}, ${transactionLocation.country}`
  }
  // Check international transaction
  else if (transactionLocation.country !== userRegisteredLocation.country) {
    riskLevel = 'medium'
    reason = `International transaction from ${transactionLocation.city}, ${transactionLocation.country}. User registered in ${userRegisteredLocation.country}`
  }
  // Check significant distance within same country
  else if (distance > 1000) {
    riskLevel = 'medium'
    reason = `Transaction ${distance.toFixed(0)}km from registered location (${userRegisteredLocation.city})`
  }
  // Check moderate distance
  else if (distance > 500) {
    riskLevel = 'low'
    reason = `Transaction ${distance.toFixed(0)}km from usual location`
  }
  else {
    return null // No suspicious location detected
  }

  return {
    id: generateId('LOC'),
    transactionId,
    userId,
    detectedLocation: transactionLocation,
    userRegisteredLocation,
    distanceFromHome: distance,
    riskLevel,
    reason,
    timestamp: new Date()
  }
}

// Helper: Calculate distance between two points
function calculateDistanceFromHome(
  txnLocation: { lat: number; lng: number },
  homeLocation: { city: string; country: string }
): number {
  // Approximate coordinates for registered cities
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.076, lng: 72.8777 },
    'Delhi': { lat: 28.6139, lng: 77.209 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Hyderabad': { lat: 17.385, lng: 78.4867 },
  }

  const homeCoords = cityCoordinates[homeLocation.city] || { lat: 19.076, lng: 72.8777 }
  
  // Haversine formula
  const R = 6371 // Earth's radius in km
  const dLat = toRad(txnLocation.lat - homeCoords.lat)
  const dLon = toRad(txnLocation.lng - homeCoords.lng)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(homeCoords.lat)) * Math.cos(toRad(txnLocation.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Get all alert statistics
export function getAlertStats(alerts: AlertNotification[]): {
  totalSent: number
  smsSent: number
  emailSent: number
  fraudAlerts: number
  otpSent: number
  cardsBlocked: number
} {
  return {
    totalSent: alerts.length,
    smsSent: alerts.filter(a => a.type === 'sms').length,
    emailSent: alerts.filter(a => a.type === 'email').length,
    fraudAlerts: alerts.filter(a => a.alertType === 'fraud_detected').length,
    otpSent: alerts.filter(a => a.alertType === 'otp_sent').length,
    cardsBlocked: alerts.filter(a => a.alertType === 'card_blocked').length
  }
}

// Resolution Service Functions

// Create resolution action
export function createResolutionAction(
  type: ResolutionAction['type'],
  executedBy: string = 'ANALYST',
  notes: string = ''
): ResolutionAction {
  return {
    id: generateId('RES'),
    type,
    timestamp: new Date(),
    executedBy,
    notes,
    status: 'pending'
  }
}

// Generate AI-based recommendation based on severity and risk
export function generateRiskBasedRecommendation(alert: Omit<FraudAlert, 'resolutionStatus' | 'resolutionAction' | 'resolutionHistory' | 'riskBasedRecommendation'>) {
  const severityMap: Record<string, { action: string; priority: 'immediate' | 'high' | 'medium' | 'low' }> = {
    critical: {
      action: 'block_transaction',
      priority: 'immediate'
    },
    high: {
      action: 'flag_account',
      priority: 'high'
    },
    medium: {
      action: 'flag_account',
      priority: 'medium'
    },
    low: {
      action: 'mark_safe',
      priority: 'low'
    }
  }

  const recommendation = severityMap[alert.severity] || { action: 'flag_account', priority: 'high' as const }
  const reasonMap: Record<string, string> = {
    block_transaction: 'Critical fraud indicators detected. Immediate transaction blocking recommended.',
    flag_account: 'Multiple risk factors identified. Account requires investigation and monitoring.',
    mark_safe: 'Low risk factors. Transaction can be safely approved with monitoring.',
    report_authority: 'Suspicious patterns suggest organized fraud. Authority reporting recommended.'
  }

  return {
    action: recommendation.action,
    priority: recommendation.priority,
    reason: reasonMap[recommendation.action] || 'Review recommended based on transaction analysis.'
  }
}

// Execute resolution action
export function executeResolutionAction(
  alert: FraudAlert,
  actionType: ResolutionAction['type'],
  executedBy: string,
  notes: string
): { success: boolean; message: string; updatedAlert?: FraudAlert } {
  const action = createResolutionAction(actionType, executedBy, notes)
  
  const actionOutcomes: Record<ResolutionAction['type'], string> = {
    block_transaction: 'Transaction blocked and flagged for review.',
    flag_account: 'Account flagged for investigation and monitoring.',
    mark_safe: 'Alert marked as false positive. Merchant added to whitelist.',
    report_authority: 'Case escalated to financial crime authorities.'
  }

  const updatedAlert: FraudAlert = {
    ...alert,
    resolved: true,
    resolvedBy: executedBy,
    resolvedAt: new Date(),
    resolutionStatus: actionType === 'mark_safe' ? 'false_positive' : 'confirmed_fraud',
    resolutionAction: { ...action, status: 'completed' },
    resolutionHistory: [...(alert.resolutionHistory || []), action]
  }

  return {
    success: true,
    message: actionOutcomes[actionType],
    updatedAlert
  }
}

// Get resolution timeline
export function getResolutionTimeline(alert: FraudAlert): ResolutionAction[] {
  return alert.resolutionHistory || (alert.resolutionAction ? [alert.resolutionAction] : [])
}
