"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, MapPin, AlertTriangle, X, CreditCard, User, Clock } from 'lucide-react'
import type { LocationData, FraudAlert } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FraudMapProps {
  locationData: LocationData[]
  fraudAlerts: FraudAlert[]
}

// Extended city coordinates
const cityCoordinates: Record<string, { x: number; y: number }> = {
  'Mumbai': { x: 58, y: 52 },
  'Delhi': { x: 57, y: 42 },
  'Bangalore': { x: 56, y: 60 },
  'Chennai': { x: 58, y: 62 },
  'Kolkata': { x: 62, y: 48 },
  'Hyderabad': { x: 57, y: 55 },
  'Pune': { x: 55, y: 54 },
  'Ahmedabad': { x: 54, y: 48 },
  'Jaipur': { x: 55, y: 44 },
  'Lucknow': { x: 58, y: 44 },
  'Surat': { x: 54, y: 50 },
  'Kanpur': { x: 58, y: 44 },
  'Nagpur': { x: 57, y: 50 },
  'Indore': { x: 55, y: 48 },
  'Bhopal': { x: 56, y: 48 },
  'Patna': { x: 61, y: 44 },
  'Vadodara': { x: 54, y: 50 },
  'Ghaziabad': { x: 57, y: 43 },
  'Ludhiana': { x: 55, y: 40 },
  'Agra': { x: 56, y: 44 },
  'New York': { x: 25, y: 38 },
  'London': { x: 40, y: 30 },
  'Singapore': { x: 70, y: 58 },
  'Dubai': { x: 52, y: 46 },
  'Tokyo': { x: 82, y: 38 },
  'Hong Kong': { x: 75, y: 48 },
  'Moscow': { x: 50, y: 28 },
  'Lagos': { x: 38, y: 54 },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

export function FraudMap({ locationData, fraudAlerts }: FraudMapProps) {
  const [selectedCity, setSelectedCity] = useState<LocationData | null>(null)
  const [pulsingCities, setPulsingCities] = useState<Set<string>>(new Set())

  useEffect(() => {
    const recentFrauds = fraudAlerts
      .filter(a => !a.resolved && Date.now() - new Date(a.timestamp).getTime() < 10000)
      .map(a => a.location.city)
    
    setPulsingCities(new Set(recentFrauds))
  }, [fraudAlerts])

  const activeFraudLocations = locationData.filter(loc => loc.fraudCount > 0)
  const totalFraudAmount = activeFraudLocations.reduce((sum, loc) => 
    sum + loc.transactions.filter(t => t.isFraud).reduce((s, t) => s + t.amount, 0), 0
  )

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Live Fraud Detection Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {activeFraudLocations.length} Hotspots
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {locationData.length} Locations
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[450px] bg-secondary/30 rounded-lg overflow-hidden border border-border">
          {/* World Map Background */}
          <svg
            viewBox="0 0 100 60"
            className="w-full h-full opacity-20"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* India outline approximation */}
            <path
              d="M52,38 L58,36 L62,40 L64,46 L62,52 L58,60 L54,62 L50,58 L52,50 L50,44 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.4"
              className="text-primary"
            />
            {/* World continents rough outline */}
            <path
              d="M5,30 Q10,25 18,28 L25,32 L28,38 L22,42 L15,40 L8,35 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-muted-foreground"
            />
            <path
              d="M35,22 Q40,18 48,20 L50,28 L45,35 L38,32 L35,26 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-muted-foreground"
            />
            <path
              d="M68,35 Q75,30 85,35 L88,45 L82,52 L72,50 L68,42 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-muted-foreground"
            />
            {/* Grid lines */}
            {[20, 40, 60, 80].map(x => (
              <line key={`v${x}`} x1={x} y1="5" x2={x} y2="55" stroke="currentColor" strokeWidth="0.05" className="text-border" />
            ))}
            {[15, 30, 45].map(y => (
              <line key={`h${y}`} x1="5" y1={y} x2="95" y2={y} stroke="currentColor" strokeWidth="0.05" className="text-border" />
            ))}
          </svg>

          {/* Connection lines between fraud locations */}
          {activeFraudLocations.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice">
              {activeFraudLocations.slice(0, -1).map((loc, idx) => {
                const next = activeFraudLocations[idx + 1]
                const coords1 = cityCoordinates[loc.city]
                const coords2 = cityCoordinates[next?.city]
                if (!coords1 || !coords2) return null
                
                return (
                  <line
                    key={idx}
                    x1={coords1.x}
                    y1={coords1.y}
                    x2={coords2.x}
                    y2={coords2.y}
                    stroke="currentColor"
                    strokeWidth="0.2"
                    strokeDasharray="1,1"
                    className="text-destructive/30"
                  />
                )
              })}
            </svg>
          )}

          {/* Location markers */}
          {locationData.map((loc) => {
            const coords = cityCoordinates[loc.city]
            if (!coords) return null

            const hasFraud = loc.fraudCount > 0
            const isPulsing = pulsingCities.has(loc.city)
            const size = Math.min(loc.transactions.length * 1.5, 12) + 6

            return (
              <div
                key={`${loc.lat}-${loc.lng}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                }}
                onClick={() => setSelectedCity(loc)}
              >
                {/* Pulse animation for fraud locations */}
                {hasFraud && (
                  <>
                    <div 
                      className={cn(
                        "absolute rounded-full bg-destructive/20",
                        isPulsing && "animate-ping"
                      )} 
                      style={{ 
                        width: `${size + 16}px`, 
                        height: `${size + 16}px`, 
                        left: `${-(size + 16) / 2 + size / 2}px`, 
                        top: `${-(size + 16) / 2 + size / 2}px` 
                      }} 
                    />
                    <div 
                      className="absolute rounded-full bg-destructive/10 animate-pulse" 
                      style={{ 
                        width: `${size + 24}px`, 
                        height: `${size + 24}px`, 
                        left: `${-(size + 24) / 2 + size / 2}px`, 
                        top: `${-(size + 24) / 2 + size / 2}px` 
                      }} 
                    />
                  </>
                )}
                
                {/* Marker */}
                <div 
                  className={cn(
                    "relative z-10 rounded-full border-2 transition-all duration-300 hover:scale-125 flex items-center justify-center",
                    hasFraud 
                      ? "bg-destructive border-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                      : "bg-accent border-accent shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                  )}
                  style={{ width: `${size}px`, height: `${size}px` }}
                >
                  {hasFraud && loc.fraudCount > 1 && (
                    <span className="text-[8px] font-bold text-destructive-foreground">{loc.fraudCount}</span>
                  )}
                </div>

                {/* City label */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {loc.city}
                </div>

                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                  <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap">
                    <div className="font-semibold text-foreground">{loc.city}, {loc.country}</div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {loc.transactions.length} transactions
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      Total: {formatCurrency(loc.totalAmount)}
                    </div>
                    {hasFraud && (
                      <div className="text-destructive mt-1 flex items-center gap-1 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        {loc.fraudCount} fraud detected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/95 border border-border rounded-lg px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">Legend</div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-accent border border-accent" />
                <span className="text-foreground">Normal Transaction</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive border border-destructive animate-pulse" />
                <span className="text-foreground">Fraud Detected</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-0.5 border-t border-dashed border-destructive/50" />
                <span className="text-foreground">Fraud Link</span>
              </div>
            </div>
          </div>

          {/* Stats overlay */}
          <div className="absolute top-4 right-4 bg-card/95 border border-border rounded-lg px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Live Stats</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-muted-foreground">Locations:</span>
                <span className="font-bold text-foreground">{locationData.length}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-muted-foreground">Fraud Amount:</span>
                <span className="font-bold text-destructive">{formatCurrency(totalFraudAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected city details */}
        {selectedCity && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">{selectedCity.city}, {selectedCity.country}</span>
                {selectedCity.fraudCount > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {selectedCity.fraudCount} FRAUD
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCity(null)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
              <div className="bg-background/50 rounded p-2">
                <div className="text-muted-foreground">Transactions</div>
                <div className="font-bold text-lg text-foreground">{selectedCity.transactions.length}</div>
              </div>
              <div className="bg-background/50 rounded p-2">
                <div className="text-muted-foreground">Total Amount</div>
                <div className="font-bold text-lg text-primary">{formatCurrency(selectedCity.totalAmount)}</div>
              </div>
              <div className="bg-background/50 rounded p-2">
                <div className="text-muted-foreground">Fraud Count</div>
                <div className={cn("font-bold text-lg", selectedCity.fraudCount > 0 ? "text-destructive" : "text-accent")}>
                  {selectedCity.fraudCount}
                </div>
              </div>
              <div className="bg-background/50 rounded p-2">
                <div className="text-muted-foreground">Coordinates</div>
                <div className="font-mono text-foreground">{selectedCity.lat.toFixed(4)}, {selectedCity.lng.toFixed(4)}</div>
              </div>
            </div>

            {/* Recent transactions in this location */}
            <div className="text-xs font-medium text-muted-foreground mb-2">Recent Transactions</div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {selectedCity.transactions.slice(0, 5).map(txn => (
                <div 
                  key={txn.id} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded border",
                    txn.isFraud ? "bg-destructive/5 border-destructive/30" : "bg-background/50 border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{txn.accountHolder}</span>
                    {txn.isFraud && (
                      <Badge variant="destructive" className="text-[8px] px-1 py-0">FRAUD</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-xs">{formatCurrency(txn.amount)}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(txn.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
