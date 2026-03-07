"use client"

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Shield, Clock, CheckCircle2, XCircle, RefreshCw, Smartphone, Mail } from 'lucide-react'
import type { OTPVerification } from '@/lib/alert-service'

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  otpData: OTPVerification | null
  onVerify: (otp: string) => { success: boolean; message: string; attemptsLeft?: number }
  onResend: () => void
  transactionDetails: {
    amount: number
    merchant: string
    location: string
  }
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  otpData,
  onVerify,
  onResend,
  transactionDetails
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !otpData) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, otpData])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', ''])
      setVerificationResult(null)
      setTimeLeft(300)
      setCanResend(false)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take last character
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp]
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  const handleVerify = async () => {
    const enteredOtp = otp.join('')
    if (enteredOtp.length !== 6) {
      setVerificationResult({ success: false, message: 'Please enter complete 6-digit OTP' })
      return
    }

    setIsVerifying(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const result = onVerify(enteredOtp)
    setVerificationResult(result)
    setIsVerifying(false)

    if (result.success) {
      setTimeout(() => onClose(), 2000)
    }
  }

  const handleResend = () => {
    onResend()
    setOtp(['', '', '', '', '', ''])
    setVerificationResult(null)
    setTimeLeft(300)
    setCanResend(false)
    inputRefs.current[0]?.focus()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!otpData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Transaction Verification Required
          </DialogTitle>
          <DialogDescription>
            This transaction requires additional verification for your security
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Details */}
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Transaction Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-warning">
                  {transactionDetails.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merchant:</span>
                <span className="text-foreground">{transactionDetails.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="text-foreground">{transactionDetails.location}</span>
              </div>
            </div>
          </div>

          {/* OTP Sent Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {otpData.phone && (
                <span className="flex items-center gap-1">
                  <Smartphone className="h-4 w-4" />
                  {otpData.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')}
                </span>
              )}
              {otpData.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {otpData.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              OTP has been sent to your registered mobile/email
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={el => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-secondary border-border focus:border-primary"
                disabled={verificationResult?.success}
              />
            ))}
          </div>

          {/* Timer and Resend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className={`h-4 w-4 ${timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <span className={timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'}>
                {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={!canResend && timeLeft > 0}
              className="text-primary hover:text-primary/80"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Resend OTP
            </Button>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className={`rounded-lg p-3 flex items-center gap-2 ${
              verificationResult.success 
                ? 'bg-accent/10 border border-accent/30' 
                : 'bg-destructive/10 border border-destructive/30'
            }`}>
              {verificationResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-accent" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className={`text-sm ${verificationResult.success ? 'text-accent' : 'text-destructive'}`}>
                {verificationResult.message}
              </span>
            </div>
          )}

          {/* Demo OTP Display */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Demo OTP (for testing):</span>
              <Badge variant="outline" className="font-mono text-lg tracking-widest">
                {otpData.otp}
              </Badge>
            </div>
          </div>

          {/* Verify Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel Transaction
            </Button>
            <Button
              className="flex-1"
              onClick={handleVerify}
              disabled={otp.join('').length !== 6 || isVerifying || verificationResult?.success}
            >
              {isVerifying ? (
                <span className="animate-pulse">Verifying...</span>
              ) : verificationResult?.success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verified
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
