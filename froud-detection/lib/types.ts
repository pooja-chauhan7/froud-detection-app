export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  accountNumber: string
  bankName: string
  accountType: 'savings' | 'current' | 'credit'
  cardNumber: string
  cardType: string
  kycStatus: 'verified' | 'pending' | 'rejected'
  riskLevel: 'low' | 'medium' | 'high'
  totalTransactions: number
  fraudulentTransactions: number
  lastActivity: Date
  registeredDate: Date
  address: {
    city: string
    state: string
    country: string
    pincode: string
  }
  deviceFingerprints: string[]
  ipAddresses: string[]
}

export interface Transaction {
  id: string
  timestamp: Date
  userId: string
  accountId: string
  accountHolder: string
  email?: string
  phone?: string
  amount: number
  currency: string
  merchantName: string
  merchantCategory: string
  merchantId?: string
  location: {
    city: string
    state?: string
    country: string
    lat: number
    lng: number
    pincode?: string
  }
  cardType: string
  cardLastFour?: string
  transactionType: 'purchase' | 'withdrawal' | 'transfer' | 'refund' | 'deposit'
  channel: 'online' | 'pos' | 'atm' | 'mobile' | 'bank_transfer'
  status: 'pending' | 'approved' | 'declined' | 'flagged' | 'under_review'
  riskScore: number
  isFraud: boolean
  fraudReasons?: string[]
  fraudProbability?: number
  mlFeatures?: {
    velocityScore: number
    amountAnomaly: number
    locationAnomaly: number
    timeAnomaly: number
    merchantRisk: number
    deviceRisk: number
  }
  deviceInfo?: {
    deviceId: string
    browser: string
    os: string
    ipAddress: string
  }
  isManualEntry?: boolean
  processingTime?: number
}

export interface FraudAlert {
  id: string
  transactionId: string
  userId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  description: string
  timestamp: Date
  location: {
    city: string
    country: string
    lat: number
    lng: number
  }
  amount: number
  accountHolder: string
  email?: string
  phone?: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  notes?: string
  recommendedAction?: string
}

export interface StreamMetrics {
  messagesPerSecond: number
  totalProcessed: number
  fraudsDetected: number
  avgProcessingTime: number
  kafkaLag: number
  sparkPartitions: number
  activeWorkers: number
  truePositives: number
  falsePositives: number
  accuracy: number
  manualEntries: number
  csvUploads: number
}

export interface LocationData {
  lat: number
  lng: number
  city: string
  country: string
  fraudCount: number
  totalAmount: number
  transactions: Transaction[]
}

export interface FraudPattern {
  id: string
  name: string
  description: string
  indicators: string[]
  riskWeight: number
  occurrences: number
}

export interface AnalyticsData {
  hourlyVolume: { hour: string; count: number; frauds: number }[]
  categoryBreakdown: { category: string; count: number; fraudRate: number }[]
  locationHotspots: { city: string; fraudCount: number; totalCount: number }[]
  riskDistribution: { level: string; count: number }[]
}

export interface CSVTransaction {
  user_id?: string
  user_name: string
  email?: string
  phone?: string
  amount: string | number
  merchant_name: string
  merchant_category?: string
  city: string
  country?: string
  card_type?: string
  transaction_type?: string
  channel?: string
  timestamp?: string
}
