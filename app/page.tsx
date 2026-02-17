"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, ArrowDownRight, X, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_URL = "https://f657778c48c0.ngrok-free.app";
// const BACKEND_URL = "https://freedomtracker.net";

// Helper function to get headers with conditional ngrok support
const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  
  // ngrok free tier requires this header to skip the browser warning page
  if (BACKEND_URL.includes('ngrok')) {
    headers["ngrok-skip-browser-warning"] = "true"
  }
  
  return headers
}

export default function PortfolioPage() {

  const [symbol, setSymbol] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(0)
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
    console.log("BACKEND_URL🎉🎉🎉 : ", BACKEND_URL)
    try {
      const res = await fetch(`${BACKEND_URL}/historypnldaily`, {
        method: "GET",
        headers: getHeaders(),
      })
      
      // Read response as text first to check if it's HTML
      const responseText = await res.text()
      
      if (!res.ok) {
        console.error("HTTP Error Response:", responseText.substring(0, 200))
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      // Check if response is HTML (ngrok warning page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error("Received HTML instead of JSON (ngrok warning page):", responseText.substring(0, 500))
        throw new Error("Received HTML response from ngrok. The ngrok-skip-browser-warning header might not be working. Try: 1) Using ngrok paid tier, 2) Using freedomtracker.net instead, or 3) Check if ngrok tunnel is active.")
      }
      
      // Parse as JSON
      let response
      try {
        response = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error. Response:", responseText.substring(0, 500))
        throw new Error("Failed to parse JSON response. Received: " + responseText.substring(0, 100))
      }
      const accounts = response.portfolio
      const history = response.history
    
    if (accounts) {
      const data = accounts
      
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
      
      // Create detailed account information array
      const detailedAccounts: any[] = []
      
      // Process each account from account_summary
      if (data.account_summary) {
        Object.entries(data.account_summary).forEach(([accountId, accountData]: [string, any]) => {
          const accountPositions = positionsByAccount[accountId] || []
          const totalMarketValue = accountData.NetLiquidation.value
          
          // Find matching history entry for this account
          const historyEntry = history?.find((h: any) => h["account Number"] === accountId)
          // Calculate difference: history value (Exit Price) - totalMarketValue
          const historyValue = historyEntry ? (historyEntry["Exit Price"] || 0) : 0
          const difference = totalMarketValue
          const detailedAccount = {
            account: accountId,
            NetLiquidation: accountData.NetLiquidation,
            TotalCashValue: accountData.TotalCashValue,
            positions: accountPositions,
            totalMarketValue: totalMarketValue,
            positionCount: accountPositions.length,
            historyValue: historyValue,
            difference: difference
          }
          
          detailedAccounts.push(detailedAccount)
        })
      }
      
      console.log('Detailed accounts:', detailedAccounts)
      
      setCombinedPositions(detailedAccounts)
      setAccounts(detailedAccounts)
      setOpenPositions(data.positions || [])
    }
    } catch (error) {
      console.error("Error fetching accounts:", error)
      toast.error(`Failed to fetch accounts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const buyAllPositions = async () => {
    // Collect all accounts with their quantities
    
    // Extract account IDs
    const accountIds = accounts.map(acc => acc.account)


    const payload = {
      "symbol": symbol,
      "type": "buy",
      "quantity": quantity,
      "account": accountIds,
    }


    const res = await fetch(`${BACKEND_URL}/futuresignal`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      getAccounts()
      toast.success("Buy orders executed successfully across all accounts")
    } else {
      toast.error("Buy orders failed")
    }
  }

  const handleBuyAllPositions = () => {
    showConfirmationModal(
      "Confirm Buy All Positions",
      "Are you sure you want to buy positions for all accounts? This action cannot be undone.",
      buyAllPositions,
      "Buy All",
      "Cancel"
    )
  }


  const sellAllPositions = async () => {
    // Collect all accounts with their quantities
    
    // Extract account IDs
    const accountIds = accounts.map(acc => acc.account)


    const payload = {
      "symbol": symbol,
      "type": "sell",
      "quantity": quantity,
      "account": accountIds,
    }


    const res = await fetch(`${BACKEND_URL}/futuresignal`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      getAccounts()
      toast.success("Sell order executed successfully")
    } else {
      toast.error("Sell order failed")
    }
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

  const buySinglePosition = async (account: string, index: number) => {
    const symbol = document.getElementById(`symbol-${index}`) as HTMLInputElement
    const quantity = document.getElementById(`quantity-${index}`) as HTMLInputElement
    const payload = {
      "symbol": symbol.value,
      "type": "buy",
      "quantity": parseInt(quantity.value),
      "account": account,
    }
    const res = await fetch(`${BACKEND_URL}/futuresignal`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      getAccounts()
      toast.success("Buy order executed successfully")
    } else {
      toast.error("Buy order failed")
    }
  }

  const handleBuySinglePosition = (account: string, index: number) => {
    const symbol = document.getElementById(`symbol-${index}`) as HTMLInputElement
    const quantity = document.getElementById(`quantity-${index}`) as HTMLInputElement
    
    showConfirmationModal(
      "Confirm Buy Position",
      `Are you sure you want to buy ${quantity?.value || '0'} shares of ${symbol?.value || 'symbol'} for account ${account}?`,
      () => buySinglePosition(account, index),
      "Buy",
      "Cancel"
    )
  }

  const closeAllPositions = async () => {
    const res = await fetch(`${BACKEND_URL}/closeall`, {
      method: "GET",
      headers: getHeaders(),
    })
    if (res.ok) {
      const data = await res.json()
      getAccounts()
      toast.success("All positions closed successfully")
    } else {
      toast.error("Failed to close positions")
    }
  }

  const handleSellAllPositions = () => {
    showConfirmationModal(
      "Confirm Sell All Positions",
      "Are you sure you want to sell all positions? This action cannot be undone.",
      sellAllPositions,
      "Sell All",
      "Cancel"
    )
  }

  const sellSinglePosition = async (account: string, index: number) => {
    const symbol = document.getElementById(`symbol-${index}`) as HTMLInputElement
    const quantity = document.getElementById(`quantity-${index}`) as HTMLInputElement
    const payload = {
      "symbol": symbol.value,
      "type": "sell",
      "quantity": parseInt(quantity.value),
      "account": account,
    }

    const res = await fetch(`${BACKEND_URL}/futuresignal`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      getAccounts()
      toast.success("Sell order executed successfully")
    } else {
      toast.error("Sell order failed")
    }
  }

  const handleSellSinglePosition = (account: string, index: number) => {
    const symbol = document.getElementById(`symbol-${index}`) as HTMLInputElement
    const quantity = document.getElementById(`quantity-${index}`) as HTMLInputElement
    
    showConfirmationModal(
      "Confirm Sell Position",
      `Are you sure you want to sell ${quantity?.value || '0'} shares of ${symbol?.value || 'symbol'} for account ${account}?`,
      () => sellSinglePosition(account, index),
      "Sell",
      "Cancel"
    )
  }

  useEffect(() => {
    getAccounts()
  }, [])

  const totalValue = openPositions.reduce((sum, pos) => sum + pos.value, 0)
  const totalProfitLoss1 = accounts.reduce((sum, acc) => {
  return sum + (acc.difference || 0)
}, 0)

const totalProfitLoss = totalProfitLoss1 - 25000
  
  const cashBalance = accounts.reduce((sum, acc) => {
    const cashValue = parseFloat(acc.NetLiquidation?.value || "0")
    return sum + cashValue
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Portfolio Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Monitor and execute trades across multiple accounts</p>
          </div>
          
          {/* Trading Controls Card */}
          <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Symbol and Quantity Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol" className="text-sm font-medium text-foreground">Trading Symbol</Label>
                    <Input 
                      id="symbol" 
                      type="text" 
                      placeholder="e.g., ES, NQ, AAPL" 
                      className="h-11 border-border/60 focus:border-primary transition-colors"
                      onChange={(e) => setSymbol(e.target.value)}
                      value={symbol}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-foreground">Quantity</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="Enter quantity" 
                      className="h-11 border-border/60 focus:border-primary transition-colors"
                      step="1"
                      value={quantity || ""}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all text-sm font-medium h-11 w-full sm:w-auto sm:min-w-[140px]" 
                    onClick={getAccounts}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Refresh Accounts
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all text-sm font-medium h-11 w-full sm:w-auto sm:min-w-[120px]" 
                    onClick={handleBuyAllPositions}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Buy All
                  </Button>
                  <Button 
                    className="bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all text-sm font-medium h-11 w-full sm:w-auto sm:min-w-[120px]"
                    onClick={handleSellAllPositions}
                  >
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    Sell All
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30 shadow-sm hover:shadow transition-all text-sm font-medium h-11 w-full sm:w-auto sm:flex-1"
                    onClick={handleCloseAllPositions}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Close All Positions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4 sm:pb-6 space-y-2">
              <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Portfolio Value
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-foreground">
                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card> */}

          <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4 sm:pb-6 space-y-2">
              <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Cash Balance
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-foreground">
                ${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className={`border-border/50 shadow-lg backdrop-blur-sm hover:shadow-xl transition-shadow ${
            totalProfitLoss >= 0 
              ? "bg-gradient-to-br from-emerald-50 to-card dark:from-emerald-950/20 dark:to-card" 
              : "bg-gradient-to-br from-rose-50 to-card dark:from-rose-950/20 dark:to-card"
          }`}>
            <CardHeader className="pb-4 sm:pb-6 space-y-2">
              <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Profit/Loss
              </CardDescription>
              <CardTitle className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-mono ${
                totalProfitLoss >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {totalProfitLoss >= 0 ? "+" : ""}${totalProfitLoss.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Open Positions Card */}
        <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Account Positions</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">Manage holdings across all accounts</CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-medium text-foreground">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {combinedPositions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No positions found. Click "Refresh Accounts" to load data.</p>
                </div>
              ) : (
                combinedPositions.map((position, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/10 p-4 sm:p-6 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="space-y-4">
                      {/* Account Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-sm">
                            <span className="text-sm sm:text-base font-bold text-primary">{position.account.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account</Label>
                            <p className="font-mono text-sm sm:text-base font-bold text-foreground">{position.account}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 sm:gap-6 sm:flex-row flex-col">
                          <div className="text-right">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cash Balance</Label>
                            <p className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              ${parseFloat(position.NetLiquidation?.value || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-right">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profit/Loss</Label>
                            <p className="text-lg sm:text-xl font-bold text-foreground">{position.difference >= 0 ? '+' : '-'} ${Math.abs(position.difference).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <div className="text-right">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Holdings</Label>
                            <p className="text-lg sm:text-xl font-bold text-foreground">{position.positionCount}</p>
                          </div>
                        </div>
                      </div>

                      {/* Positions Grid */}
                      {position.positions.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Positions</Label>
                          <div className="flex flex-wrap gap-2">
                            {position.positions.map((pos: any, idx: number) => (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-gradient-to-r from-secondary/40 to-secondary/20 px-3 py-2 transition-all hover:shadow-md hover:scale-105"
                              >
                                <span className="text-sm font-bold text-primary">{pos.symbol}</span>
                                <div className="h-4 w-px bg-border"></div>
                                <span className="text-sm font-semibold text-foreground">{pos.position}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trade Action */}
                      <div className="space-y-3 pt-2 border-t border-border/30">
                        <Label className="text-sm font-semibold text-foreground">Execute Trade</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            id={`symbol-${index}`}
                            type="text"
                            placeholder="Symbol"
                            className="h-11 border-border/60 focus:border-primary transition-colors font-medium"
                          />
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            placeholder="Quantity"
                            className="h-11 border-border/60 focus:border-primary transition-colors font-medium"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all h-11 font-medium" 
                            onClick={() => handleBuySinglePosition(position.account, index)}
                          >
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Buy
                          </Button>
                          <Button 
                            className="bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all h-11 font-medium"
                            onClick={() => handleSellSinglePosition(position.account, index)}
                          >
                            <ArrowDownRight className="mr-2 h-4 w-4" />
                            Sell
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        {confirmationModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 border-b border-border/50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{confirmationModal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Please review before proceeding</p>
                  </div>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <p className="text-sm sm:text-base text-foreground leading-relaxed">
                  {confirmationModal.message}
                </p>
              </div>
              
              {/* Modal Footer */}
              <div className="bg-muted/30 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={hideConfirmationModal}
                  className="border-border hover:bg-secondary h-11 font-medium w-full sm:w-auto sm:min-w-[120px] transition-all"
                >
                  {confirmationModal.cancelText}
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-md hover:shadow-lg h-11 font-medium w-full sm:w-auto sm:min-w-[120px] transition-all"
                >
                  {confirmationModal.confirmText}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
