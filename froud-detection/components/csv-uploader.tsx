"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertTriangle, 
  Download, Trash2, Play, FileText 
} from 'lucide-react'
import type { CSVTransaction, Transaction } from '@/lib/types'

interface CSVUploaderProps {
  onUpload: (data: CSVTransaction[]) => Transaction[]
}

export function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [csvData, setCSVData] = useState<CSVTransaction[]>([])
  const [results, setResults] = useState<Transaction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const [error, setError] = useState<string>('')

  const parseCSV = (text: string): CSVTransaction[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) throw new Error('CSV must have header and at least one data row')

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    
    return lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.trim())
      const row: Record<string, string> = {}
      
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })

      // Validate required fields
      if (!row.user_name && !row.name && !row.username) {
        throw new Error(`Row ${idx + 2}: Missing user name`)
      }
      if (!row.amount) {
        throw new Error(`Row ${idx + 2}: Missing amount`)
      }
      if (!row.merchant_name && !row.merchant) {
        throw new Error(`Row ${idx + 2}: Missing merchant name`)
      }
      if (!row.city) {
        throw new Error(`Row ${idx + 2}: Missing city`)
      }

      return {
        user_id: row.user_id || row.id,
        user_name: row.user_name || row.name || row.username,
        email: row.email,
        phone: row.phone || row.mobile,
        amount: row.amount,
        merchant_name: row.merchant_name || row.merchant,
        merchant_category: row.merchant_category || row.category,
        city: row.city,
        country: row.country,
        card_type: row.card_type || row.card,
        transaction_type: row.transaction_type || row.type,
        channel: row.channel,
        timestamp: row.timestamp || row.date || row.time
      }
    })
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setFileName(file.name)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = parseCSV(text)
        setCSVData(parsed)
        setResults([])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV')
        setCSVData([])
      }
    }
    reader.readAsText(file)
  }, [])

  const handleProcess = useCallback(() => {
    if (csvData.length === 0) return
    
    setIsProcessing(true)
    
    // Process with delay for visual effect
    setTimeout(() => {
      const processedResults = onUpload(csvData)
      setResults(processedResults)
      setIsProcessing(false)
    }, 1000)
  }, [csvData, onUpload])

  const handleClear = () => {
    setCSVData([])
    setResults([])
    setFileName('')
    setError('')
  }

  const downloadSampleCSV = () => {
    const sample = `user_name,email,phone,amount,merchant_name,merchant_category,city,country,card_type,transaction_type,channel
Rajesh Kumar,rajesh@gmail.com,+91 9876543210,25000,Amazon India,E-commerce,Mumbai,India,Visa,purchase,online
Priya Sharma,priya@yahoo.com,+91 8765432109,150000,Unknown Merchant,Unknown,Lagos,Nigeria,Mastercard,transfer,online
Amit Patel,amit@outlook.com,+91 7654321098,5000,Swiggy,Food Delivery,Delhi,India,RuPay,purchase,mobile
Sneha Gupta,sneha@gmail.com,+91 6543210987,500000,Crypto Exchange XYZ,Cryptocurrency,Dubai,UAE,American Express,purchase,online
Vikram Singh,vikram@hotmail.com,+91 5432109876,8500,Big Bazaar,Retail,Bangalore,India,Visa,purchase,pos`

    const blob = new Blob([sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const fraudCount = results.filter(r => r.isFraud).length
  const safeCount = results.length - fraudCount

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Bulk CSV Upload
          </CardTitle>
          <CardDescription>
            Upload a CSV file with transaction data to analyze multiple transactions at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/20 p-8 text-center hover:border-primary/50 hover:bg-secondary/30 transition-colors">
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop your CSV file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">
                Required columns: user_name, amount, merchant_name, city
              </p>
            </div>
          </div>

          {/* File Info & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {fileName && (
              <Badge variant="secondary" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {fileName} ({csvData.length} rows)
              </Badge>
            )}
            
            <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
              <Download className="h-4 w-4 mr-1.5" />
              Download Sample CSV
            </Button>

            {csvData.length > 0 && (
              <>
                <Button 
                  size="sm" 
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  <Play className="h-4 w-4 mr-1.5" />
                  {isProcessing ? 'Processing...' : 'Analyze All'}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Clear
                </Button>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg">
                Analysis Results
              </span>
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {fraudCount} Fraud
                </Badge>
                <Badge variant="default" className="gap-1 bg-accent">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {safeCount} Safe
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Detection rate: {((fraudCount / results.length) * 100).toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-xs">Transaction ID</TableHead>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Merchant</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Risk Score</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Reasons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((txn) => (
                    <TableRow 
                      key={txn.id} 
                      className={txn.isFraud ? 'bg-destructive/5' : ''}
                    >
                      <TableCell className="font-mono text-xs">{txn.id.slice(-10)}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium">{txn.accountHolder}</p>
                          {txn.email && <p className="text-muted-foreground">{txn.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {txn.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p>{txn.merchantName}</p>
                          <p className="text-muted-foreground">{txn.merchantCategory}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {txn.location.city}, {txn.location.country}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                txn.riskScore >= 60 ? 'bg-destructive' : 
                                txn.riskScore >= 30 ? 'bg-warning' : 'bg-accent'
                              }`}
                              style={{ width: `${txn.riskScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono">{txn.riskScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={txn.isFraud ? 'destructive' : 'default'}
                          className="text-[10px]"
                        >
                          {txn.isFraud ? 'FRAUD' : 'SAFE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {txn.fraudReasons && txn.fraudReasons.length > 0 ? (
                          <div className="text-xs text-muted-foreground truncate" title={txn.fraudReasons.join(', ')}>
                            {txn.fraudReasons[0]}
                            {txn.fraudReasons.length > 1 && ` +${txn.fraudReasons.length - 1} more`}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {csvData.length > 0 && results.length === 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Preview Data ({csvData.length} transactions)</CardTitle>
            <CardDescription>Review your data before processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Merchant</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">City</TableHead>
                    <TableHead className="text-xs">Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 10).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">{row.user_name}</TableCell>
                      <TableCell className="text-xs font-mono">{row.amount}</TableCell>
                      <TableCell className="text-xs">{row.merchant_name}</TableCell>
                      <TableCell className="text-xs">{row.merchant_category || '-'}</TableCell>
                      <TableCell className="text-xs">{row.city}</TableCell>
                      <TableCell className="text-xs">{row.country || 'India'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {csvData.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing 10 of {csvData.length} rows
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
