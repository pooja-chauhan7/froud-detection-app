import type { Transaction, UserProfile, CSVTransaction } from './types'
import { 
  indianCities, 
  internationalCities, 
  highRiskMerchants, 
  normalMerchants,
  indianNames,
  detectFraudAdvanced,
  generateTransactionId,
  generateUserId,
  getCityCoordinates
} from './fraud-detection-engine'

const cardTypes = ['Visa', 'Mastercard', 'RuPay', 'American Express', 'Diners Club']
const transactionTypes: Transaction['transactionType'][] = ['purchase', 'withdrawal', 'transfer', 'refund', 'deposit']
const channels: Transaction['channel'][] = ['online', 'pos', 'atm', 'mobile', 'bank_transfer']

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateAmount(potentialFraud: boolean): number {
  if (potentialFraud) {
    const pattern = Math.random()
    if (pattern < 0.25) {
      return Math.round(Math.random() * 99 + 1) // Small test amounts (1-99)
    } else if (pattern < 0.5) {
      return Math.round(Math.random() * 1000000 + 200000) // Very large (2L-12L)
    } else {
      return Math.round(Math.random() * 100000 + 50000) // Large (50K-1.5L)
    }
  }
  // Normal distribution for regular transactions
  const ranges = [
    { min: 50, max: 500, weight: 0.3 },      // Small purchases
    { min: 500, max: 2000, weight: 0.3 },    // Medium purchases  
    { min: 2000, max: 10000, weight: 0.25 }, // Large purchases
    { min: 10000, max: 50000, weight: 0.15 } // Major purchases
  ]
  
  const rand = Math.random()
  let cumWeight = 0
  for (const range of ranges) {
    cumWeight += range.weight
    if (rand < cumWeight) {
      return Math.round(Math.random() * (range.max - range.min) + range.min)
    }
  }
  return Math.round(Math.random() * 5000 + 500)
}

export function generateRandomTransaction(userHistory: Transaction[] = []): Transaction {
  const potentialFraud = Math.random() < 0.18 // 18% fraud rate for demo
  
  // Select location based on fraud potential
  let location
  if (potentialFraud && Math.random() < 0.4) {
    location = randomElement(internationalCities)
  } else {
    location = randomElement(indianCities)
  }

  // Select merchant based on fraud potential
  let merchant
  if (potentialFraud && Math.random() < 0.5) {
    merchant = randomElement(highRiskMerchants)
  } else {
    merchant = randomElement(normalMerchants)
  }

  const userId = generateUserId()
  const accountHolder = randomElement(indianNames)
  const amount = generateAmount(potentialFraud)
  const transactionType = randomElement(transactionTypes)
  const channel = randomElement(channels)

  const baseTransaction: Partial<Transaction> = {
    id: generateTransactionId(),
    timestamp: new Date(),
    userId,
    accountId: `ACC${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    accountHolder,
    email: `${accountHolder.toLowerCase().replace(' ', '.')}@${randomElement(['gmail', 'yahoo', 'outlook', 'hotmail'])}.com`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
    amount,
    currency: 'INR',
    merchantName: merchant.name,
    merchantCategory: merchant.category,
    merchantId: `MID${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    location: {
      city: location.city,
      state: location.state,
      country: location.country,
      lat: location.lat,
      lng: location.lng,
      pincode: `${Math.floor(100000 + Math.random() * 900000)}`
    },
    cardType: randomElement(cardTypes),
    cardLastFour: `${Math.floor(1000 + Math.random() * 9000)}`,
    transactionType,
    channel,
    status: 'pending',
    deviceInfo: {
      deviceId: `DEV${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      browser: randomElement(['Chrome', 'Safari', 'Firefox', 'Edge', 'Mobile App']),
      os: randomElement(['Windows 11', 'macOS', 'Android', 'iOS', 'Linux']),
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    },
    isManualEntry: false
  }

  // Run fraud detection
  const fraudResult = detectFraudAdvanced(baseTransaction, userHistory)
  const startTime = performance.now()

  const transaction: Transaction = {
    ...baseTransaction,
    riskScore: fraudResult.riskScore,
    isFraud: fraudResult.isFraud,
    fraudProbability: fraudResult.fraudProbability,
    fraudReasons: fraudResult.fraudReasons,
    mlFeatures: fraudResult.mlFeatures,
    status: fraudResult.isFraud ? 'flagged' : 'approved',
    processingTime: Math.round((performance.now() - startTime) * 100) / 100
  } as Transaction

  return transaction
}

// Process manual transaction input
export function processManualTransaction(data: {
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
}, userHistory: Transaction[] = []): Transaction {
  const startTime = performance.now()
  
  // Get coordinates for the city
  const cityCoords = getCityCoordinates(data.city)
  const location = cityCoords || {
    city: data.city,
    country: data.country,
    lat: 20.5937 + (Math.random() - 0.5) * 10,
    lng: 78.9629 + (Math.random() - 0.5) * 10,
    state: undefined
  }

  const baseTransaction: Partial<Transaction> = {
    id: generateTransactionId(),
    timestamp: new Date(),
    userId: generateUserId(),
    accountId: `ACC${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    accountHolder: data.userName,
    email: data.email,
    phone: data.phone,
    amount: data.amount,
    currency: 'INR',
    merchantName: data.merchantName,
    merchantCategory: data.merchantCategory,
    merchantId: `MID${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    location: {
      city: location.city,
      state: location.state,
      country: location.country,
      lat: location.lat,
      lng: location.lng,
      pincode: `${Math.floor(100000 + Math.random() * 900000)}`
    },
    cardType: data.cardType,
    cardLastFour: `${Math.floor(1000 + Math.random() * 9000)}`,
    transactionType: data.transactionType,
    channel: data.channel,
    status: 'pending',
    isManualEntry: true
  }

  // Run fraud detection
  const fraudResult = detectFraudAdvanced(baseTransaction, userHistory)

  const transaction: Transaction = {
    ...baseTransaction,
    riskScore: fraudResult.riskScore,
    isFraud: fraudResult.isFraud,
    fraudProbability: fraudResult.fraudProbability,
    fraudReasons: fraudResult.fraudReasons,
    mlFeatures: fraudResult.mlFeatures,
    status: fraudResult.isFraud ? 'flagged' : 'approved',
    processingTime: Math.round((performance.now() - startTime) * 100) / 100
  } as Transaction

  return transaction
}

// Process CSV data
export function processCSVTransactions(csvData: CSVTransaction[], userHistory: Transaction[] = []): Transaction[] {
  return csvData.map(row => {
    const cityCoords = getCityCoordinates(row.city)
    const location = cityCoords || {
      city: row.city,
      country: row.country || 'India',
      lat: 20.5937 + (Math.random() - 0.5) * 10,
      lng: 78.9629 + (Math.random() - 0.5) * 10,
      state: undefined
    }

    const baseTransaction: Partial<Transaction> = {
      id: generateTransactionId(),
      timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
      userId: row.user_id || generateUserId(),
      accountId: `ACC${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      accountHolder: row.user_name,
      email: row.email,
      phone: row.phone,
      amount: typeof row.amount === 'string' ? parseFloat(row.amount) : row.amount,
      currency: 'INR',
      merchantName: row.merchant_name,
      merchantCategory: row.merchant_category || 'General',
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
        lat: location.lat,
        lng: location.lng
      },
      cardType: row.card_type || 'Visa',
      transactionType: (row.transaction_type as Transaction['transactionType']) || 'purchase',
      channel: (row.channel as Transaction['channel']) || 'online',
      status: 'pending',
      isManualEntry: true
    }

    const startTime = performance.now()
    const fraudResult = detectFraudAdvanced(baseTransaction, userHistory)

    return {
      ...baseTransaction,
      riskScore: fraudResult.riskScore,
      isFraud: fraudResult.isFraud,
      fraudProbability: fraudResult.fraudProbability,
      fraudReasons: fraudResult.fraudReasons,
      mlFeatures: fraudResult.mlFeatures,
      status: fraudResult.isFraud ? 'flagged' : 'approved',
      processingTime: Math.round((performance.now() - startTime) * 100) / 100
    } as Transaction
  })
}
