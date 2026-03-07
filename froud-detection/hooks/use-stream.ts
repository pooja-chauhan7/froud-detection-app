"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Transaction, FraudAlert, StreamMetrics, LocationData, CSVTransaction } from '@/lib/types'
import { generateRandomTransaction, processManualTransaction, processCSVTransactions } from '@/lib/transaction-generator'
import { createFraudAlert } from '@/lib/fraud-detection-engine'
import { 
  createSMSAlert, 
  createEmailAlert, 
  createOTPVerification, 
  verifyOTP,
  blockCard,
  detectSuspiciousLocation,
  type AlertNotification,
  type OTPVerification,
  type CardStatus,
  type SuspiciousLocation
} from '@/lib/alert-service'

interface StreamState {
  transactions: Transaction[]
  fraudAlerts: FraudAlert[]
  metrics: StreamMetrics
  locationData: Map<string, LocationData>
  isRunning: boolean
  userTransactions: Map<string, Transaction[]>
  // New security features
  notifications: AlertNotification[]
  blockedCards: CardStatus[]
  suspiciousLocations: SuspiciousLocation[]
  pendingOTPs: Map<string, OTPVerification>
}

export function useStream() {
  const [state, setState] = useState<StreamState>({
    transactions: [],
    fraudAlerts: [],
    metrics: {
      messagesPerSecond: 0,
      totalProcessed: 0,
      fraudsDetected: 0,
      avgProcessingTime: 0,
      kafkaLag: 0,
      sparkPartitions: 8,
      activeWorkers: 4,
      truePositives: 0,
      falsePositives: 0,
      accuracy: 98.5,
      manualEntries: 0,
      csvUploads: 0
    },
    locationData: new Map(),
    isRunning: true,
    userTransactions: new Map(),
    notifications: [],
    blockedCards: [],
    suspiciousLocations: [],
    pendingOTPs: new Map()
  })

  const transactionCountRef = useRef(0)
  const lastSecondCountRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const processingTimesRef = useRef<number[]>([])

  // Send SMS Alert
  const sendSMSAlert = useCallback((transaction: Transaction, alertType: AlertNotification['alertType']) => {
    if (!transaction.phone) return null
    
    const smsAlert = createSMSAlert(
      transaction.phone,
      transaction.accountHolder,
      transaction.id,
      transaction.amount,
      `${transaction.location.city}, ${transaction.location.country}`,
      alertType
    )

    setState(prev => ({
      ...prev,
      notifications: [smsAlert, ...prev.notifications].slice(0, 100)
    }))

    return smsAlert
  }, [])

  // Send Email Alert
  const sendEmailAlert = useCallback((transaction: Transaction, alertType: AlertNotification['alertType']) => {
    if (!transaction.email) return null
    
    const emailAlert = createEmailAlert(
      transaction.email,
      transaction.accountHolder,
      transaction.id,
      transaction.amount,
      `${transaction.location.city}, ${transaction.location.country}`,
      transaction.merchantName,
      alertType,
      transaction.fraudReasons
    )

    setState(prev => ({
      ...prev,
      notifications: [emailAlert, ...prev.notifications].slice(0, 100)
    }))

    return emailAlert
  }, [])

  // Request OTP Verification
  const requestOTP = useCallback((transaction: Transaction): OTPVerification => {
    const otpData = createOTPVerification(
      transaction.id,
      transaction.userId,
      transaction.phone,
      transaction.email
    )

    setState(prev => {
      const newPendingOTPs = new Map(prev.pendingOTPs)
      newPendingOTPs.set(transaction.id, otpData)
      return {
        ...prev,
        pendingOTPs: newPendingOTPs
      }
    })

    // Send OTP via SMS and Email
    if (transaction.phone) {
      sendSMSAlert({ ...transaction }, 'otp_sent')
    }
    if (transaction.email) {
      sendEmailAlert({ ...transaction }, 'otp_sent')
    }

    return otpData
  }, [sendSMSAlert, sendEmailAlert])

  // Verify OTP
  const verifyTransactionOTP = useCallback((transactionId: string, enteredOTP: string): { success: boolean; message: string } => {
    const otpData = state.pendingOTPs.get(transactionId)
    if (!otpData) {
      return { success: false, message: 'OTP session expired. Please try again.' }
    }

    const result = verifyOTP(otpData, enteredOTP)
    
    if (result.success) {
      setState(prev => {
        const newPendingOTPs = new Map(prev.pendingOTPs)
        newPendingOTPs.delete(transactionId)
        return {
          ...prev,
          pendingOTPs: newPendingOTPs
        }
      })
    } else {
      // Update attempts
      setState(prev => {
        const newPendingOTPs = new Map(prev.pendingOTPs)
        const existingOTP = newPendingOTPs.get(transactionId)
        if (existingOTP) {
          newPendingOTPs.set(transactionId, {
            ...existingOTP,
            attempts: existingOTP.attempts + 1
          })
        }
        return {
          ...prev,
          pendingOTPs: newPendingOTPs
        }
      })
    }

    return result
  }, [state.pendingOTPs])

  // Block Card
  const blockUserCard = useCallback((
    userId: string, 
    userName: string, 
    cardNumber: string, 
    reason: string,
    transaction?: Transaction
  ) => {
    const cardStatus = blockCard(
      `CARD${Date.now()}`,
      cardNumber || 'XXXX-XXXX-XXXX-' + Math.random().toString().slice(2, 6),
      userId,
      userName,
      reason
    )

    setState(prev => ({
      ...prev,
      blockedCards: [cardStatus, ...prev.blockedCards]
    }))

    // Send card blocked notification
    if (transaction) {
      sendSMSAlert(transaction, 'card_blocked')
      sendEmailAlert(transaction, 'card_blocked')
    }

    return cardStatus
  }, [sendSMSAlert, sendEmailAlert])

  // Unblock Card
  const unblockCard = useCallback((cardId: string) => {
    setState(prev => ({
      ...prev,
      blockedCards: prev.blockedCards.map(card =>
        card.cardId === cardId 
          ? { ...card, status: 'active' as const, blockedAt: undefined, blockedReason: undefined }
          : card
      )
    }))
  }, [])

  // Check for suspicious location
  const checkSuspiciousLocation = useCallback((transaction: Transaction): SuspiciousLocation | null => {
    const suspiciousLoc = detectSuspiciousLocation(
      transaction.id,
      transaction.userId,
      transaction.location,
      { city: 'Mumbai', country: 'India' } // Default registered location
    )

    if (suspiciousLoc) {
      setState(prev => ({
        ...prev,
        suspiciousLocations: [suspiciousLoc, ...prev.suspiciousLocations].slice(0, 50)
      }))

      // Send alert for high-risk locations
      if (suspiciousLoc.riskLevel === 'critical' || suspiciousLoc.riskLevel === 'high') {
        sendSMSAlert(transaction, 'suspicious_location')
        sendEmailAlert(transaction, 'suspicious_location')
      }
    }

    return suspiciousLoc
  }, [sendSMSAlert, sendEmailAlert])

  const addTransaction = useCallback((transaction: Transaction) => {
    transactionCountRef.current += 1
    if (transaction.processingTime) {
      processingTimesRef.current.push(transaction.processingTime)
      if (processingTimesRef.current.length > 100) {
        processingTimesRef.current.shift()
      }
    }

    // Check for suspicious location
    const suspiciousLoc = checkSuspiciousLocation(transaction)

    setState(prev => {
      const newTransactions = [transaction, ...prev.transactions].slice(0, 200)
      const newFraudAlerts = [...prev.fraudAlerts]
      const newLocationData = new Map(prev.locationData)
      const newUserTransactions = new Map(prev.userTransactions)
      let newBlockedCards = [...prev.blockedCards]
      const newNotifications = [...prev.notifications]

      // Update user transaction history
      const userTxns = newUserTransactions.get(transaction.userId) || []
      newUserTransactions.set(transaction.userId, [transaction, ...userTxns].slice(0, 50))

      // Update location data
      const locationKey = `${transaction.location.lat.toFixed(4)},${transaction.location.lng.toFixed(4)}`
      const existingLocation = newLocationData.get(locationKey)
      
      if (existingLocation) {
        existingLocation.transactions = [transaction, ...existingLocation.transactions].slice(0, 20)
        existingLocation.totalAmount += transaction.amount
        if (transaction.isFraud) {
          existingLocation.fraudCount += 1
        }
      } else {
        newLocationData.set(locationKey, {
          lat: transaction.location.lat,
          lng: transaction.location.lng,
          city: transaction.location.city,
          country: transaction.location.country,
          fraudCount: transaction.isFraud ? 1 : 0,
          totalAmount: transaction.amount,
          transactions: [transaction]
        })
      }

      // Create fraud alert and send notifications if fraud detected
      if (transaction.isFraud) {
        const alert = createFraudAlert(transaction)
        newFraudAlerts.unshift(alert)
        if (newFraudAlerts.length > 100) {
          newFraudAlerts.pop()
        }

        // Send SMS/Email alerts for fraud
        if (transaction.phone) {
          const smsAlert = createSMSAlert(
            transaction.phone,
            transaction.accountHolder,
            transaction.id,
            transaction.amount,
            `${transaction.location.city}, ${transaction.location.country}`,
            'fraud_detected'
          )
          newNotifications.unshift(smsAlert)
        }

        if (transaction.email) {
          const emailAlert = createEmailAlert(
            transaction.email,
            transaction.accountHolder,
            transaction.id,
            transaction.amount,
            `${transaction.location.city}, ${transaction.location.country}`,
            transaction.merchantName,
            'fraud_detected',
            transaction.fraudReasons
          )
          newNotifications.unshift(emailAlert)
        }

        // Auto-block card for critical fraud (risk score >= 80)
        if (transaction.riskScore >= 80) {
          const cardBlocked = blockCard(
            `CARD${Date.now()}`,
            transaction.cardLastFour || Math.random().toString().slice(2, 6),
            transaction.userId,
            transaction.accountHolder,
            `Auto-blocked: ${transaction.fraudReasons?.[0] || 'Critical fraud detected'}`
          )
          newBlockedCards = [cardBlocked, ...newBlockedCards]
        }
      }

      const avgProcessingTime = processingTimesRef.current.length > 0
        ? processingTimesRef.current.reduce((a, b) => a + b, 0) / processingTimesRef.current.length
        : 0

      return {
        ...prev,
        transactions: newTransactions,
        fraudAlerts: newFraudAlerts,
        locationData: newLocationData,
        userTransactions: newUserTransactions,
        blockedCards: newBlockedCards,
        notifications: newNotifications.slice(0, 100),
        metrics: {
          ...prev.metrics,
          totalProcessed: prev.metrics.totalProcessed + 1,
          fraudsDetected: prev.metrics.fraudsDetected + (transaction.isFraud ? 1 : 0),
          avgProcessingTime: Math.round(avgProcessingTime * 100) / 100,
          kafkaLag: Math.floor(Math.random() * 30),
          manualEntries: prev.metrics.manualEntries + (transaction.isManualEntry ? 1 : 0)
        }
      }
    })

    return transaction
  }, [checkSuspiciousLocation])

  const processTransaction = useCallback(() => {
    const userHistory = Array.from(state.userTransactions.values()).flat().slice(0, 20)
    const transaction = generateRandomTransaction(userHistory)
    addTransaction(transaction)
  }, [addTransaction, state.userTransactions])

  const addManualTransaction = useCallback((data: {
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
  }) => {
    const userHistory = Array.from(state.userTransactions.values()).flat().slice(0, 20)
    const transaction = processManualTransaction(data, userHistory)
    return addTransaction(transaction)
  }, [addTransaction, state.userTransactions])

  const addCSVTransactions = useCallback((csvData: CSVTransaction[]) => {
    const userHistory = Array.from(state.userTransactions.values()).flat().slice(0, 20)
    const transactions = processCSVTransactions(csvData, userHistory)
    
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        csvUploads: prev.metrics.csvUploads + transactions.length
      }
    }))

    transactions.forEach((txn, index) => {
      setTimeout(() => {
        addTransaction(txn)
      }, index * 100)
    })

    return transactions
  }, [addTransaction, state.userTransactions])

  const updateMetrics = useCallback(() => {
    const currentCount = transactionCountRef.current
    const messagesPerSecond = currentCount - lastSecondCountRef.current
    lastSecondCountRef.current = currentCount

    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        messagesPerSecond,
        sparkPartitions: 6 + Math.floor(Math.random() * 4),
        activeWorkers: 3 + Math.floor(Math.random() * 3),
        accuracy: 97 + Math.random() * 2.5
      }
    }))
  }, [])

  const startStream = useCallback(() => {
    if (intervalRef.current) return

    setState(prev => ({ ...prev, isRunning: true }))
    
    intervalRef.current = setInterval(() => {
      const burst = Math.random() < 0.15 ? Math.floor(Math.random() * 3) + 2 : 1
      for (let i = 0; i < burst; i++) {
        processTransaction()
      }
    }, 400 + Math.random() * 300)

    metricsIntervalRef.current = setInterval(updateMetrics, 1000)
  }, [processTransaction, updateMetrics])

  const stopStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current)
      metricsIntervalRef.current = null
    }
    setState(prev => ({ ...prev, isRunning: false }))
  }, [])

  const toggleStream = useCallback(() => {
    if (state.isRunning) {
      stopStream()
    } else {
      startStream()
    }
  }, [state.isRunning, startStream, stopStream])

  const resolveAlert = useCallback((alertId: string, notes?: string) => {
    setState(prev => ({
      ...prev,
      fraudAlerts: prev.fraudAlerts.map(alert =>
        alert.id === alertId 
          ? { ...alert, resolved: true, resolvedAt: new Date(), notes } 
          : alert
      )
    }))
  }, [])

  const clearAllData = useCallback(() => {
    setState(prev => ({
      ...prev,
      transactions: [],
      fraudAlerts: [],
      locationData: new Map(),
      userTransactions: new Map(),
      notifications: [],
      blockedCards: [],
      suspiciousLocations: [],
      pendingOTPs: new Map(),
      metrics: {
        ...prev.metrics,
        totalProcessed: 0,
        fraudsDetected: 0,
        manualEntries: 0,
        csvUploads: 0
      }
    }))
    transactionCountRef.current = 0
    lastSecondCountRef.current = 0
    processingTimesRef.current = []
  }, [])

  useEffect(() => {
    startStream()
    return () => {
      stopStream()
    }
  }, [])

  return {
    ...state,
    toggleStream,
    resolveAlert,
    addManualTransaction,
    addCSVTransactions,
    clearAllData,
    locationDataArray: Array.from(state.locationData.values()),
    // New security functions
    sendSMSAlert,
    sendEmailAlert,
    requestOTP,
    verifyTransactionOTP,
    blockUserCard,
    unblockCard,
    checkSuspiciousLocation,
    getOTPForTransaction: (txnId: string) => state.pendingOTPs.get(txnId)
  }
}
