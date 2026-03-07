"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MapPin, AlertTriangle, Globe, Navigation, 
  Home, ArrowRight, Shield, Eye
} from 'lucide-react'
import type { SuspiciousLocation } from '@/lib/alert-service'
import { cn } from '@/lib/utils'

interface SuspiciousLocationsProps {
  locations: SuspiciousLocation[]
  onViewOnMap?: (location: SuspiciousLocation) => void
  onBlockCard?: (userId: string) => void
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getRiskColor(level: SuspiciousLocation['riskLevel']): string {
  switch (level) {
    case 'critical': return 'bg-destructive text-destructive-foreground'
    case 'high': return 'bg-destructive/80 text-destructive-foreground'
    case 'medium': return 'bg-warning text-warning-foreground'
    case 'low': return 'bg-info text-info-foreground'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getRiskBorder(level: SuspiciousLocation['riskLevel']): string {
  switch (level) {
    case 'critical': return 'border-l-4 border-l-destructive'
    case 'high': return 'border-l-4 border-l-destructive/70'
    case 'medium': return 'border-l-4 border-l-warning'
    case 'low': return 'border-l-4 border-l-info'
    default: return ''
  }
}

export function SuspiciousLocations({ locations, onViewOnMap, onBlockCard }: SuspiciousLocationsProps) {
  const stats = {
    total: locations.length,
    critical: locations.filter(l => l.riskLevel === 'critical').length,
    high: locations.filter(l => l.riskLevel === 'high').length,
    international: locations.filter(l => l.detectedLocation.country !== 'India').length
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-warning" />
            Suspicious Locations
          </span>
          <div className="flex items-center gap-2">
            {stats.critical > 0 && (
              <Badge variant="destructive" className="animate-pulse text-[10px]">
                {stats.critical} Critical
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {stats.total} Detected
            </Badge>
          </div>
        </CardTitle>
        <CardDescription className="text-xs">
          Transactions from unusual or high-risk locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <p className="text-lg font-bold text-destructive">{stats.critical}</p>
            <p className="text-[10px] text-muted-foreground">Critical</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-warning/10">
            <p className="text-lg font-bold text-warning">{stats.high}</p>
            <p className="text-[10px] text-muted-foreground">High Risk</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-info/10">
            <p className="text-lg font-bold text-info">{stats.international}</p>
            <p className="text-[10px] text-muted-foreground">International</p>
          </div>
        </div>

        {/* Locations List */}
        <ScrollArea className="h-[350px]">
          <div className="space-y-2">
            {locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mb-3" />
                <p className="text-sm">No suspicious locations detected</p>
                <p className="text-xs">Unusual locations will appear here</p>
              </div>
            ) : (
              locations.map((location, index) => (
                <div
                  key={location.id}
                  className={cn(
                    "p-3 rounded-lg border border-border bg-secondary/30 transition-all",
                    getRiskBorder(location.riskLevel),
                    index === 0 && "animate-in slide-in-from-top-2"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        location.riskLevel === 'critical' || location.riskLevel === 'high' 
                          ? 'text-destructive' 
                          : 'text-warning'
                      )} />
                      <Badge className={cn("text-[10px]", getRiskColor(location.riskLevel))}>
                        {location.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(location.timestamp)}
                    </span>
                  </div>

                  {/* Location Comparison */}
                  <div className="flex items-center gap-2 mb-3 p-2 rounded bg-background/50">
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Home className="h-3 w-3 text-accent" />
                        <span className="text-[10px] text-muted-foreground">Registered</span>
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        {location.userRegisteredLocation.city}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {location.userRegisteredLocation.country}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Navigation className="h-3 w-3 text-destructive" />
                        <span className="text-[10px] text-muted-foreground">Detected</span>
                      </div>
                      <p className="text-xs font-medium text-destructive">
                        {location.detectedLocation.city}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {location.detectedLocation.country}
                      </p>
                    </div>
                  </div>

                  {/* Distance & Reason */}
                  <div className="space-y-2 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Distance from home:</span>
                      <span className={cn(
                        "font-medium",
                        location.distanceFromHome > 1000 ? "text-destructive" : "text-warning"
                      )}>
                        {location.distanceFromHome.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="text-foreground text-right max-w-[60%]">
                        {location.reason}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Transaction:</span>
                      <span className="font-mono text-foreground">
                        {location.transactionId.slice(-10)}
                      </span>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="text-[10px] text-muted-foreground mb-3 font-mono bg-background/50 p-2 rounded">
                    Lat: {location.detectedLocation.lat.toFixed(4)}, Lng: {location.detectedLocation.lng.toFixed(4)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {onViewOnMap && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => onViewOnMap(location)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View on Map
                      </Button>
                    )}
                    {onBlockCard && (location.riskLevel === 'critical' || location.riskLevel === 'high') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => onBlockCard(location.userId)}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Block Card
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
