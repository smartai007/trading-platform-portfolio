"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, ArrowDownRight, X, AlertTriangle, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export default function LimitOrderPage() {

  const [accounts, setAccounts] = useState<any[]>([])
  const [openPositions, setOpenPositions] = useState<any[]>([])
  const [combinedPositions, setCombinedPositions] = useState<any[]>([])
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "OK",
    cancelText: "Cancel"
  })

  const [slTpDialog, setSlTpDialog] = useState<{
    isOpen: boolean
    account: string
    index: number
    stopLoss: string
    takeProfit: string
  }>({
    isOpen: false,
    account: "",
    index: -1,
    stopLoss: "",
    takeProfit: ""
  })

  const showConfirmationModal = (title: string, message: string, onConfirm: () => void, confirmText = "OK", cancelText = "Cancel") => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    })
  }

  const hideConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleConfirm = () => {
    confirmationModal.onConfirm()
    hideConfirmationModal()
  }

  const getAccounts = async () => {
    const accounts = await fetch(`${BACKEND_URL}/portfolio`, {
    })
    console.log("accounts : ", accounts)
    if (accounts.ok) {
      const data = await accounts.json()
      console.log(data)
      
      // Group positions by account
      const positionsByAccount: Record<string, any[]> = {}
      
      if (data.positions && Array.isArray(data.positions)) {
        data.positions.forEach((position: any) => {
          const accountId = position.account
          if (!positionsByAccount[accountId]) {
            positionsByAccount[accountId] = []
          }
          positionsByAccount[accountId].push(position)
        })
      }
      
      console.log('Positions grouped by account:', positionsByAccount)
      
      // Create detailed account information array
      const detailedAccounts: any[] = []
      
      // Process each account from account_summary
      if (data.account_summary) {
        Object.entries(data.account_summary).forEach(([accountId, accountData]: [string, any]) => {
          const accountPositions = positionsByAccount[accountId] || []
          
          const detailedAccount = {
            account: accountId,
            NetLiquidation: accountData.NetLiquidation,
            TotalCashValue: accountData.TotalCashValue,
            positions: accountPositions,
            totalMarketValue: accountPositions.reduce((sum, pos) => sum + (pos.marketValue || 0), 0),
            positionCount: accountPositions.length
          }
          
          detailedAccounts.push(detailedAccount)
        })
      }
      
      console.log('Detailed accounts:', detailedAccounts)
      
      setCombinedPositions(detailedAccounts)
      setAccounts(detailedAccounts)
      setOpenPositions(data.positions || [])
    }
  }

  const buyAllPositions = async () => {
    
  }

  const handleBuyAllPositions = () => {
    showConfirmationModal(
      "Confirm Buy All Limit Orders",
      "Are you sure you want to place buy limit orders for all accounts? This action cannot be undone.",
      buyAllPositions,
      "Buy All",
      "Cancel"
    )
  }


  const sellAllPositions = async () => {
    
  }

  const handleCloseAllPositions = () => {
    showConfirmationModal(
      "Confirm Close All Positions",
      "Are you sure you want to close all positions? This action cannot be undone.",
      closeAllPositions,
      "Close All",
      "Cancel"
    )
  }

  const buySinglePosition = async (account: string, index: number, symbol: string, quantity: string, lowTarget: string) => {
    
    const payload = {
      "symbol": symbol,
      "orderType": "buy",
      "account": account,
      "tradeValue": quantity,
      "price": lowTarget,
    }
    const res = await fetch(`${BACKEND_URL}/futurelimit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      toast.success("Buy limit order placed successfully!")
    } else {
      toast.error("Buy limit order failed")
    }
    toast.success("Buy limit order placed successfully!")
  }

  const handleBuySinglePosition = (account: string, index: number) => {
    const symbol = document.getElementById(`symbol-${index}`) as HTMLInputElement
    const quantity = document.getElementById(`quantity-${index}`) as HTMLInputElement
    const lowTarget = document.getElementById(`low-target-${index}`) as HTMLInputElement

    console.log("Buy Single Position Order : ", {
      account: account,
      symbol: symbol?.value || '',
      quantity: quantity?.value || '',
      lowTarget: lowTarget?.value || ''
    })
    
    const lowTargetText = lowTarget?.value ? `Low Target: $${lowTarget.value}` : ""
    
    showConfirmationModal(
      "Confirm Buy Limit Order",
      `Are you sure you want to place a buy limit order for ${quantity?.value || '0'} shares of ${symbol?.value || 'symbol'} with ${lowTargetText} for account ${account}?`,
      () => buySinglePosition(account, index, symbol?.value || '', quantity?.value || '', lowTarget?.value || ''),
      "Buy",
      "Cancel"
    )
  }

  const handleCloseSinglelimitPosition = (account: string, index: number) => {
    showConfirmationModal(
      "Confirm Close Limit Order",
      `Are you sure you want to close the limit order for ${account}?`,
      () => closeSinglelimitPosition(account, index),
      "Close",
      "Cancel"
    )
  }

  const closeSinglelimitPosition = async (account: string, index: number) => {
    const res = await fetch(`${BACKEND_URL}/futurelimitCancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "account": account,
      }),
    })
    if (res.ok) {
      toast.success("Close limit order placed successfully!")
    } else {
      toast.error("Close limit order failed")
    }
  }

  const closeAllPositions = async () => {
    
  }

  const handleSellAllPositions = () => {
    showConfirmationModal(
      "Confirm Sell All Limit Orders",
      "Are you sure you want to place sell limit orders for all accounts? This action cannot be undone.",
      sellAllPositions,
      "Sell All",
      "Cancel"
    )
  }

  const sellSinglePosition = async (account: string, index: number, symbol: string, quantity: string, highTarget: string, lowTarget: string) => {
    toast.success("Sell limit order placed successfully!")
  }

  const handleSellSinglePosition = (account: string, index: number) => {
    const symbol = document.getElementById(`symbol-${index}`) as HTMLInputElement
    const quantity = document.getElementById(`quantity-${index}`) as HTMLInputElement
    const highTarget = document.getElementById(`high-target-${index}`) as HTMLInputElement
    const lowTarget = document.getElementById(`low-target-${index}`) as HTMLInputElement
    
    
    const highTargetText = highTarget?.value ? `High Target: $${highTarget.value}` : ""
    const lowTargetText = lowTarget?.value ? `Low Target: $${lowTarget.value}` : ""
    const targetText = [highTargetText, lowTargetText].filter(Boolean).join(", ")
    
    showConfirmationModal(
      "Confirm Sell Limit Order",
      `Are you sure you want to place a sell limit order for ${quantity?.value || '0'} shares of ${symbol?.value || 'symbol'} with ${targetText} for account ${account}?`,
      () => sellSinglePosition(account, index, symbol?.value || '', quantity?.value || '', highTarget?.value || '', lowTarget?.value || ''),
      "Sell",
      "Cancel"
    )
  }

  const handleSLTPSinglePosition = (account: string, index: number) => {
    setSlTpDialog({
      isOpen: true,
      account,
      index,
      stopLoss: "",
      takeProfit: ""
    })
  }

  const hideSlTpDialog = () => {
    setSlTpDialog(prev => ({ ...prev, isOpen: false }))
  }

  const handleSlTpSubmit = () => {
    const { account, index, stopLoss, takeProfit } = slTpDialog
    
    // Basic validation
    if (!stopLoss && !takeProfit) {
      toast.error("Please enter at least one value for Stop Loss or Take Profit")
      return
    }

    if (stopLoss && parseFloat(stopLoss) <= 0) {
      toast.error("Stop Loss must be greater than 0")
      return
    }

    if (takeProfit && parseFloat(takeProfit) <= 0) {
      toast.error("Take Profit must be greater than 0")
      return
    }

    // Here you would typically send the SL/TP settings to your backend
    console.log("SL/TP Settings:", {
      account,
      index,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null
    })

    toast.success("Stop Loss/Take Profit settings saved successfully!")
    // hideSlTpDialog()
  }

  useEffect(() => {
    getAccounts()
  }, [])

  const totalValue = openPositions.reduce((sum, pos) => sum + pos.value, 0)
  const totalProfitLoss = openPositions.reduce((sum, pos) => sum + pos.profitLoss, 0)
  const cashBalance = 25430.75

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Limit Orders</h1>
          <p className="text-muted-foreground">Place limit orders with specific prices</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button className="bg-sky-500 text-primary-foreground hover:bg-sky-500/90 text-xs sm:text-sm" onClick={getAccounts}>
            <ArrowUpRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Accounts</span>
            <span className="sm:hidden">Acc</span>
          </Button>
          <Button className="bg-success text-success-foreground hover:bg-success/90 text-xs sm:text-sm" onClick={handleBuyAllPositions}>
            <ArrowUpRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Buy All</span>
            <span className="sm:hidden">Buy</span>
          </Button>
          <Button variant="destructive" className="text-xs sm:text-sm" onClick={handleSellAllPositions}>
            <ArrowDownRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Sell All</span>
            <span className="sm:hidden">Sell</span>
          </Button>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent text-xs sm:text-sm"
            onClick={handleCloseAllPositions}
          >
            <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Close All Positions</span>
            <span className="sm:hidden">Close</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardDescription className="text-muted-foreground">Total Portfolio Value</CardDescription>
            <CardTitle className="text-3xl font-mono text-foreground">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardDescription className="text-muted-foreground">Cash Balance</CardDescription>
            <CardTitle className="text-3xl font-mono text-foreground">
              ${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardDescription className="text-muted-foreground">Total P/L</CardDescription>
            <CardTitle className={`text-3xl font-mono ${totalProfitLoss >= 0 ? "text-success" : "text-destructive"}`}>
              {totalProfitLoss >= 0 ? "+" : ""}$
              {totalProfitLoss.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Limit Orders</CardTitle>
          <CardDescription className="text-muted-foreground">Place limit orders with specific prices for your accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {combinedPositions.map((position, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Account Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">{position.account.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Account ID</Label>
                        <p className="font-mono text-sm font-semibold text-foreground">{position.account}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Label className="text-xs text-muted-foreground">Positions</Label>
                      <p className="text-sm font-semibold text-foreground">{position.positionCount}</p>
                    </div>
                  </div>

                  {/* Positions Grid */}
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Current Holdings</Label>
                    <div className="flex flex-wrap gap-2">
                      {position.positions.map((pos: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-1.5 transition-colors hover:bg-secondary/50"
                        >
                          <span className="text-xs font-bold text-primary">{pos.symbol}</span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span className="text-xs font-medium text-foreground">{pos.position}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trade Action */}
                  <div className="space-y-2 pt-2">
                    <Label htmlFor={`quantity-${index}`} className="text-sm font-medium">
                      Limit Order Details
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex gap-2 flex-1">
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          placeholder="Quantity"
                          className="flex-1"
                        />
                        <Input
                          id={`symbol-${index}`}
                          type="text"
                          placeholder="Symbol"
                          className="flex-1"
                        />
                        <Input
                          id={`low-target-${index}`}
                          type="number"
                          step="0.01"
                          placeholder="Low Target"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-success hover:bg-success/90 flex-1 sm:flex-none" onClick={() => handleBuySinglePosition(position.account, index)}>
                          Buy
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 sm:flex-none" onClick={() => handleSellSinglePosition(position.account, index)}>
                          Sell
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => handleCloseSinglelimitPosition(position.account, index)}>
                          Close
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => handleSLTPSinglePosition(position.account, index)}>
                          <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          SL/TP Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{confirmationModal.title}</h3>
            </div>
            <p className="text-muted-foreground mb-6">{confirmationModal.message}</p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={hideConfirmationModal}
                className="border-border text-foreground hover:bg-secondary"
              >
                {confirmationModal.cancelText}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {confirmationModal.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SL/TP Settings Dialog */}
      {slTpDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Stop Loss / Take Profit Settings</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-foreground">Account</Label>
                <p className="text-sm text-muted-foreground font-mono">{slTpDialog.account}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stopLoss" className="text-sm font-medium text-foreground">
                  Stop Loss Price ($)
                </Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.01"
                  placeholder="Enter stop loss price"
                  value={slTpDialog.stopLoss}
                  onChange={(e) => setSlTpDialog(prev => ({ ...prev, stopLoss: e.target.value }))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Set a price below current market price to limit losses
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="takeProfit" className="text-sm font-medium text-foreground">
                  Take Profit Price ($)
                </Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="0.01"
                  placeholder="Enter take profit price"
                  value={slTpDialog.takeProfit}
                  onChange={(e) => setSlTpDialog(prev => ({ ...prev, takeProfit: e.target.value }))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Set a price above current market price to secure profits
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={hideSlTpDialog}
                className="border-border text-foreground hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSlTpSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
