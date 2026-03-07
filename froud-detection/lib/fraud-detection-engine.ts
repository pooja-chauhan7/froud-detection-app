import type { Transaction, FraudAlert, UserProfile } from './types'

// Indian cities with coordinates
export const indianCities = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.076, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.209 },
  { city: 'Bangalore', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.385, lng: 78.4867 },
  { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714 },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462 },
  { city: 'Surat', state: 'Gujarat', country: 'India', lat: 21.1702, lng: 72.8311 },
  { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India', lat: 26.4499, lng: 80.3319 },
  { city: 'Nagpur', state: 'Maharashtra', country: 'India', lat: 21.1458, lng: 79.0882 },
  { city: 'Indore', state: 'Madhya Pradesh', country: 'India', lat: 22.7196, lng: 75.8577 },
  { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', lat: 23.2599, lng: 77.4126 },
  { city: 'Patna', state: 'Bihar', country: 'India', lat: 25.5941, lng: 85.1376 },
  { city: 'Vadodara', state: 'Gujarat', country: 'India', lat: 22.3072, lng: 73.1812 },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', lat: 28.6692, lng: 77.4538 },
  { city: 'Ludhiana', state: 'Punjab', country: 'India', lat: 30.901, lng: 75.8573 },
  { city: 'Agra', state: 'Uttar Pradesh', country: 'India', lat: 27.1767, lng: 78.0081 },
]

// International cities for fraud patterns
export const internationalCities = [
  { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.006 },
  { city: 'London', state: 'England', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Singapore', state: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { city: 'Dubai', state: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { city: 'Hong Kong', state: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694 },
  { city: 'Moscow', state: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  { city: 'Lagos', state: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
]

// High-risk merchants
export const highRiskMerchants = [
  { name: 'Unknown Merchant #1247', category: 'Unknown', risk: 0.9 },
  { name: 'Crypto Exchange XYZ', category: 'Cryptocurrency', risk: 0.85 },
  { name: 'Offshore Gaming Ltd', category: 'Gambling', risk: 0.8 },
  { name: 'Quick Cash Loans', category: 'Lending', risk: 0.75 },
  { name: 'Anonymous VPN Services', category: 'Digital Services', risk: 0.7 },
  { name: 'Luxury Goods Import', category: 'Import/Export', risk: 0.65 },
]

// Normal merchants
export const normalMerchants = [
  { name: 'Amazon India', category: 'E-commerce', risk: 0.1 },
  { name: 'Flipkart', category: 'E-commerce', risk: 0.1 },
  { name: 'Big Bazaar', category: 'Retail', risk: 0.05 },
  { name: 'Reliance Fresh', category: 'Grocery', risk: 0.05 },
  { name: 'ICICI Bank ATM', category: 'ATM', risk: 0.15 },
  { name: 'HDFC Bank ATM', category: 'ATM', risk: 0.15 },
  { name: 'SBI ATM', category: 'ATM', risk: 0.15 },
  { name: 'PVR Cinemas', category: 'Entertainment', risk: 0.1 },
  { name: 'Swiggy', category: 'Food Delivery', risk: 0.1 },
  { name: 'Zomato', category: 'Food Delivery', risk: 0.1 },
  { name: 'Uber India', category: 'Transportation', risk: 0.1 },
  { name: 'Ola Cabs', category: 'Transportation', risk: 0.1 },
  { name: 'Apollo Pharmacy', category: 'Healthcare', risk: 0.05 },
  { name: 'Croma Electronics', category: 'Electronics', risk: 0.15 },
  { name: 'Tanishq Jewellers', category: 'Jewelry', risk: 0.3 },
  { name: 'MakeMyTrip', category: 'Travel', risk: 0.2 },
  { name: 'IRCTC', category: 'Travel', risk: 0.1 },
  { name: 'Paytm Mall', category: 'E-commerce', risk: 0.1 },
  { name: 'DMart', category: 'Retail', risk: 0.05 },
  { name: 'Myntra', category: 'E-commerce', risk: 0.1 },
]

// Indian names
export const indianNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh',
  'Ananya Reddy', 'Rahul Verma', 'Pooja Nair', 'Suresh Iyer', 'Meera Joshi',
  'Arjun Malhotra', 'Kavita Desai', 'Nikhil Agarwal', 'Divya Kapoor', 'Rohit Menon',
  'Aisha Khan', 'Sanjay Tiwari', 'Neha Saxena', 'Karan Bhatia', 'Ritu Choudhary',
  'Deepak Mishra', 'Anjali Pillai', 'Manish Dubey', 'Shweta Bansal', 'Vivek Sinha'
]

// ML-based fraud detection rules
export interface FraudDetectionResult {
  riskScore: number
  isFraud: boolean
  fraudProbability: number
  fraudReasons: string[]
  mlFeatures: {
    velocityScore: number
    amountAnomaly: number
    locationAnomaly: number
    timeAnomaly: number
    merchantRisk: number
    deviceRisk: number
  }
  recommendedAction: string
}

export function detectFraudAdvanced(
  transaction: Partial<Transaction>,
  userHistory: Transaction[] = [],
  userProfile?: UserProfile
): FraudDetectionResult {
  const reasons: string[] = []
  let totalScore = 0
  
  const mlFeatures = {
    velocityScore: 0,
    amountAnomaly: 0,
    locationAnomaly: 0,
    timeAnomaly: 0,
    merchantRisk: 0,
    deviceRisk: 0
  }

  const amount = transaction.amount || 0
  const merchantCategory = transaction.merchantCategory || ''
  const merchantName = transaction.merchantName || ''
  const location = transaction.location
  const channel = transaction.channel || 'online'
  const hour = transaction.timestamp ? new Date(transaction.timestamp).getHours() : new Date().getHours()

  // Rule 1: Amount Analysis (0-20 points)
  if (amount > 500000) {
    mlFeatures.amountAnomaly = 20
    reasons.push(`Critical: Extremely high transaction amount: ${amount.toLocaleString('en-IN')}`)
  } else if (amount > 200000) {
    mlFeatures.amountAnomaly = 15
    reasons.push(`High: Very high transaction amount: ${amount.toLocaleString('en-IN')}`)
  } else if (amount > 100000) {
    mlFeatures.amountAnomaly = 10
    reasons.push(`Medium: High value transaction: ${amount.toLocaleString('en-IN')}`)
  } else if (amount < 50) {
    mlFeatures.amountAnomaly = 8
    reasons.push('Testing pattern: Very small amount (card testing)')
  }
  totalScore += mlFeatures.amountAnomaly

  // Rule 2: Merchant Risk Analysis (0-25 points)
  const highRiskMerchant = highRiskMerchants.find(m => 
    merchantName.toLowerCase().includes(m.name.toLowerCase()) ||
    merchantCategory.toLowerCase() === m.category.toLowerCase()
  )
  
  if (highRiskMerchant) {
    mlFeatures.merchantRisk = Math.round(highRiskMerchant.risk * 25)
    reasons.push(`High-risk merchant: ${merchantName} (${merchantCategory})`)
  } else if (['Gambling', 'Cryptocurrency', 'Unknown', 'Adult'].includes(merchantCategory)) {
    mlFeatures.merchantRisk = 20
    reasons.push(`Suspicious merchant category: ${merchantCategory}`)
  } else if (['Jewelry', 'Electronics', 'Gift Cards'].includes(merchantCategory)) {
    mlFeatures.merchantRisk = 10
    reasons.push(`High-value resale category: ${merchantCategory}`)
  }
  totalScore += mlFeatures.merchantRisk

  // Rule 3: Location Analysis (0-20 points)
  if (location) {
    const isInternational = location.country !== 'India'
    if (isInternational) {
      const highRiskCountries = ['Nigeria', 'Russia', 'China', 'Ukraine']
      if (highRiskCountries.some(c => location.country?.includes(c))) {
        mlFeatures.locationAnomaly = 20
        reasons.push(`High-risk country: ${location.country}`)
      } else {
        mlFeatures.locationAnomaly = 12
        reasons.push(`International transaction: ${location.city}, ${location.country}`)
      }
    }

    // Check for impossible travel (if history exists)
    if (userHistory.length > 0) {
      const lastTransaction = userHistory[0]
      if (lastTransaction.location && location) {
        const timeDiff = (new Date(transaction.timestamp || Date.now()).getTime() - 
                         new Date(lastTransaction.timestamp).getTime()) / (1000 * 60) // minutes
        const distance = calculateDistance(
          lastTransaction.location.lat, lastTransaction.location.lng,
          location.lat, location.lng
        )
        
        // If distance > 500km and time < 60 minutes = impossible travel
        if (distance > 500 && timeDiff < 60) {
          mlFeatures.locationAnomaly = Math.max(mlFeatures.locationAnomaly, 18)
          reasons.push(`Impossible travel: ${distance.toFixed(0)}km in ${timeDiff.toFixed(0)} minutes`)
        }
      }
    }
  }
  totalScore += mlFeatures.locationAnomaly

  // Rule 4: Time Analysis (0-15 points)
  if (hour >= 0 && hour < 5) {
    mlFeatures.timeAnomaly = 12
    reasons.push(`Unusual timing: Transaction at ${hour}:00 (late night)`)
  } else if (hour >= 23 || hour < 6) {
    mlFeatures.timeAnomaly = 8
    reasons.push(`Off-hours transaction: ${hour}:00`)
  }
  totalScore += mlFeatures.timeAnomaly

  // Rule 5: Velocity Check (0-15 points)
  if (userHistory.length > 0) {
    const last5Minutes = userHistory.filter(t => {
      const timeDiff = (new Date(transaction.timestamp || Date.now()).getTime() - 
                       new Date(t.timestamp).getTime()) / (1000 * 60)
      return timeDiff < 5
    })

    if (last5Minutes.length >= 5) {
      mlFeatures.velocityScore = 15
      reasons.push(`Velocity alert: ${last5Minutes.length} transactions in 5 minutes`)
    } else if (last5Minutes.length >= 3) {
      mlFeatures.velocityScore = 10
      reasons.push(`Multiple rapid transactions: ${last5Minutes.length} in 5 minutes`)
    }
  }
  totalScore += mlFeatures.velocityScore

  // Rule 6: Channel & Device Analysis (0-10 points)
  if (channel === 'atm' && amount > 50000) {
    mlFeatures.deviceRisk = 8
    reasons.push(`Large ATM withdrawal: ${amount.toLocaleString('en-IN')}`)
  }
  if (channel === 'online' && amount > 100000 && !transaction.deviceInfo) {
    mlFeatures.deviceRisk = Math.max(mlFeatures.deviceRisk, 6)
    reasons.push('Online high-value transaction without device verification')
  }
  totalScore += mlFeatures.deviceRisk

  // Rule 7: User Profile Risk
  if (userProfile) {
    if (userProfile.riskLevel === 'high') {
      totalScore += 10
      reasons.push('Account flagged as high-risk user')
    }
    if (userProfile.fraudulentTransactions > 0) {
      totalScore += 8
      reasons.push(`Previous fraud history: ${userProfile.fraudulentTransactions} incidents`)
    }
    if (userProfile.kycStatus !== 'verified') {
      totalScore += 5
      reasons.push(`KYC not verified: ${userProfile.kycStatus}`)
    }
  }

  // Calculate final fraud probability
  const fraudProbability = Math.min(totalScore / 100, 1)
  const isFraud = totalScore >= 50

  // Determine recommended action
  let recommendedAction = 'Approve'
  if (totalScore >= 80) {
    recommendedAction = 'Block & Alert User'
  } else if (totalScore >= 60) {
    recommendedAction = 'Require OTP Verification'
  } else if (totalScore >= 40) {
    recommendedAction = 'Flag for Manual Review'
  }

  return {
    riskScore: Math.min(totalScore, 100),
    isFraud,
    fraudProbability,
    fraudReasons: reasons,
    mlFeatures,
    recommendedAction
  }
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Create fraud alert from transaction
export function createFraudAlert(transaction: Transaction): FraudAlert {
  let severity: FraudAlert['severity'] = 'low'
  if (transaction.riskScore >= 80) severity = 'critical'
  else if (transaction.riskScore >= 65) severity = 'high'
  else if (transaction.riskScore >= 50) severity = 'medium'

  const recommendedActions: Record<string, string> = {
    critical: 'Immediately block card and contact customer',
    high: 'Require additional verification before processing',
    medium: 'Flag for review and monitor closely',
    low: 'Log and continue monitoring'
  }

  return {
    id: `ALERT${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    transactionId: transaction.id,
    userId: transaction.userId,
    severity,
    type: transaction.fraudReasons?.[0] || 'Suspicious Activity',
    description: transaction.fraudReasons?.join(' | ') || 'Flagged for review',
    timestamp: new Date(),
    location: transaction.location,
    amount: transaction.amount,
    accountHolder: transaction.accountHolder,
    email: transaction.email,
    phone: transaction.phone,
    resolved: false,
    recommendedAction: recommendedActions[severity]
  }
}

// Get city coordinates
export function getCityCoordinates(cityName: string): { lat: number; lng: number; city: string; country: string; state?: string } | null {
  const allCities = [...indianCities, ...internationalCities]
  const found = allCities.find(c => c.city.toLowerCase() === cityName.toLowerCase())
  if (found) return found
  
  // Try partial match
  const partial = allCities.find(c => 
    c.city.toLowerCase().includes(cityName.toLowerCase()) ||
    cityName.toLowerCase().includes(c.city.toLowerCase())
  )
  
  return partial || null
}

// Generate transaction ID
export function generateTransactionId(): string {
  return `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

// Generate user ID
export function generateUserId(): string {
  return `USR${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}
