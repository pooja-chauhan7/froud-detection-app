"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  CreditCard, Shield, Lock, Unlock, AlertTriangle, 
  CheckCircle2, Clock, Search, Ban, ShieldAlert
} from 'lucide-react'
import type { CardStatus } from '@/lib/alert-service'
import { cn } from '@/lib/utils'

interface CardManagementProps {
  blockedCards: CardStatus[]
  onBlockCard: (cardId: string, reason: string) => void
  onUnblockCard: (cardId: string) => void
}

function formatTime(date?: Date): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: CardStatus['status']): string {
  switch (status) {
    case 'active': return 'bg-accent text-accent-foreground'
    case 'blocked': return 'bg-destructive text-destructive-foreground'
    case 'suspended': return 'bg-warning text-warning-foreground'
    case 'frozen': return 'bg-info text-info-foreground'
    default: return 'bg-muted text-muted-foreground'
  }
}

export function CardManagement({ blockedCards, onBlockCard, onUnblockCard }: CardManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCard, setSelectedCard] = useState<CardStatus | null>(null)
  const [showUnblockDialog, setShowUnblockDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  const filteredCards = blockedCards.filter(card =>
    card.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.cardNumber.includes(searchQuery) ||
    card.userId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: blockedCards.length,
    blocked: blockedCards.filter(c => c.status === 'blocked').length,
    suspended: blockedCards.filter(c => c.status === 'suspended').length,
    frozen: blockedCards.filter(c => c.status === 'frozen').length
  }

  const handleUnblock = () => {
    if (selectedCard) {
      onUnblockCard(selectedCard.cardId)
      setShowUnblockDialog(false)
      setSelectedCard(null)
    }
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Card Management
            </span>
            <Badge variant="destructive" className="text-[10px]">
              {stats.blocked} Blocked
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Manage blocked and suspended cards due to fraud detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-secondary/50">
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">Total Cards</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-destructive/10">
              <p className="text-lg font-bold text-destructive">{stats.blocked}</p>
              <p className="text-[10px] text-muted-foreground">Blocked</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-warning/10">
              <p className="text-lg font-bold text-warning">{stats.suspended}</p>
              <p className="text-[10px] text-muted-foreground">Suspended</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-info/10">
              <p className="text-lg font-bold text-info">{stats.frozen}</p>
              <p className="text-[10px] text-muted-foreground">Frozen</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, card number, or user ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-secondary/50"
            />
          </div>

          {/* Cards List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mb-3" />
                  <p className="text-sm">No blocked cards</p>
                  <p className="text-xs">Cards will appear here when blocked</p>
                </div>
              ) : (
                filteredCards.map((card, index) => (
                  <div
                    key={card.cardId}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      card.status === 'blocked' 
                        ? "border-destructive/30 bg-destructive/5" 
                        : "border-border bg-secondary/30",
                      index === 0 && "animate-in slide-in-from-top-2"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          card.status === 'blocked' ? "bg-destructive/10" : "bg-secondary"
                        )}>
                          <CreditCard className={cn(
                            "h-5 w-5",
                            card.status === 'blocked' ? "text-destructive" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{card.userName}</p>
                          <p className="text-xs font-mono text-muted-foreground">{card.cardNumber}</p>
                        </div>
                      </div>
                      <Badge className={cn("text-[10px]", getStatusColor(card.status))}>
                        {card.status === 'blocked' && <Lock className="h-3 w-3 mr-1" />}
                        {card.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Block Details */}
                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono text-foreground">{card.userId}</span>
                      </div>
                      {card.blockedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Blocked At:</span>
                          <span className="text-foreground">{formatTime(card.blockedAt)}</span>
                        </div>
                      )}
                      {card.blockedReason && (
                        <div className="flex items-start justify-between">
                          <span className="text-muted-foreground">Reason:</span>
                          <span className="text-destructive text-right max-w-[60%]">{card.blockedReason}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Blocked By:</span>
                        <Badge variant="outline" className="text-[10px]">
                          {card.blockedBy || 'SYSTEM'}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    {card.canUnblock && card.status === 'blocked' && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => {
                            setSelectedCard(card)
                            setShowUnblockDialog(true)
                          }}
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          Unblock Card
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-primary"
                        >
                          View History
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Unblock Confirmation Dialog */}
      <Dialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Unlock className="h-5 w-5 text-accent" />
              Unblock Card Confirmation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to unblock this card? The user will be able to make transactions again.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCard && (
            <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Card Holder:</span>
                <span className="font-medium text-foreground">{selectedCard.userName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Card Number:</span>
                <span className="font-mono text-foreground">{selectedCard.cardNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Block Reason:</span>
                <span className="text-destructive">{selectedCard.blockedReason}</span>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-warning">
              Unblocking this card will allow all pending and future transactions. 
              Make sure the fraud investigation is complete.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnblockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnblock} className="bg-accent hover:bg-accent/90">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Unblock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
