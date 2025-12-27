"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const performanceData = [
  { date: "Jan", profit: 1250, loss: -450, net: 800 },
  { date: "Feb", profit: 2100, loss: -680, net: 1420 },
  { date: "Mar", profit: 1800, loss: -920, net: 880 },
  { date: "Apr", profit: 2450, loss: -550, net: 1900 },
  { date: "May", profit: 3200, loss: -1100, net: 2100 },
  { date: "Jun", profit: 2800, loss: -780, net: 2020 },
]

const positionPL = [
  { symbol: "AAPL", realized: 1250, unrealized: 212.5, total: 1462.5 },
  { symbol: "TSLA", realized: -450, unrealized: -183.75, total: -633.75 },
  { symbol: "NVDA", realized: 2100, unrealized: 801, total: 2901 },
  { symbol: "MSFT", realized: 880, unrealized: 145, total: 1025 },
  { symbol: "GOOGL", realized: -320, unrealized: 92, total: -228 },
]

const metrics = [
  { label: "Total Realized P/L", value: 3460, change: 12.5, icon: DollarSign },
  { label: "Total Unrealized P/L", value: 1066.75, change: 8.2, icon: TrendingUp },
  { label: "Win Rate", value: 68.5, change: 3.1, icon: Percent, isPercentage: true },
  { label: "Average Win", value: 1850, change: 5.4, icon: TrendingUp },
]

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ProfitLossPage() {

  const [accounts, setAccounts] = useState<any[]>([])
  const [openPositions, setOpenPositions] = useState<any[]>([])
  const [combinedPositions, setCombinedPositions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"current" | "total">("current")

  useEffect(() => {
    getAccounts()
  }, [])

  const getAccounts = async () => {
    const res = await fetch(`${BACKEND_URL}/historypnl`, {
    })
    const response = await res.json()
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
          const totalMarketValue = accountData.TotalCashValue.value
          
          // Find matching history entry for this account
          const historyEntry = history?.find((h: any) => h["account Number"] === accountId)
          // Calculate difference: history value (Exit Price) - totalMarketValue
          const historyValue = historyEntry ? (historyEntry["Exit Price"] || 0) : 0
          const difference = historyValue - totalMarketValue
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
  }
  const totalPL = metrics[0].value + metrics[1].value
  const totalChange = (totalPL / (totalPL - metrics[0].value * (metrics[0].change / 100)) - 1) * 100

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-6">Profit/Loss</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("current")}
            className={cn(
              "rounded-none border-b-2 border-transparent -mb-[1px]",
              activeTab === "current" && "border-primary text-primary"
            )}
          >
            Current
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("total")}
            className={cn(
              "rounded-none border-b-2 border-transparent -mb-[1px]",
              activeTab === "total" && "border-primary text-primary"
            )}
          >
            Total
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "current" && (
          <div className="space-y-4">
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No accounts found
              </div>
            ) : (
              accounts.map((account) => {
                // Only show accounts that have positions
                if (!account.positions || account.positions.length === 0) {
                  return null
                }
                
                return (
                  <Card key={account.account}>
                    <CardHeader>
                      <CardTitle className="text-red-600">{account.account}</CardTitle>
                      <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                        <span>
                          Total Cash Value: {account.TotalCashValue?.currency || 'USD'} {parseFloat(account.TotalCashValue?.value || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={account.difference >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                          Profit/Loss: {account.difference >= 0 ? '+' : '-'} ${account.difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm mb-2">Positions:</h3>
                        {account.positions.map((position: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <span className="font-medium">{position.symbol || 'N/A'}</span>
                              {position.secType && (
                                <span className="text-xs text-muted-foreground ml-2">({position.secType})</span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                Position Size: {position.position || '0'}
                              </div>
                              {position.marketValue !== undefined && (
                                <div className="text-sm text-muted-foreground">
                                  Market Value: {position.currency || 'USD'} {parseFloat(position.marketValue || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
        
        {activeTab === "total" && (
          <div>
            {/* Total Page Content */}
          </div>
        )}
      </div>
    </div>
  )
}
