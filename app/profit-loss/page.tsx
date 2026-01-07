"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Cell } from "recharts"
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
  const [historyAll, setHistoryAll] = useState<any[]>([])
  const [dailyChartData, setDailyChartData] = useState<Record<string, any[]>>({})

  useEffect(() => {
    getAccounts()
  }, [])

  const getAccounts = async () => {
    const res = await fetch(`${BACKEND_URL}/historypnldaily`, {
    })
    const response = await res.json()
    const accounts = response.portfolio
    const history = response.history
    const historyAll = response.historyAll
    console.log('historyAll : ', historyAll)
    
    // Process historyAll for daily chart
    if (historyAll && Array.isArray(historyAll)) {
      setHistoryAll(historyAll)
      processDailyChartData(historyAll)
    }
    
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
          const NetLiquidation = accountData.NetLiquidation.value
          
          // Find matching history entry for this account
          const historyEntry = history?.find((h: any) => h["account Number"] === accountId)
          // Calculate difference: history value (Exit Price) - totalMarketValue
          const historyValue = historyEntry ? (historyEntry["Exit Price"] || 0) : 0
          const difference =  NetLiquidation - historyValue
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

  const processDailyChartData = (historyData: any[]) => {
    // First, group and sort data by account and date
    const accountEntriesMap: Record<string, any[]> = {}
    
    // Group entries by account
    historyData.forEach((entry: any) => {
      // Extract account identifier - check common field names
      const accountId = entry.account || entry["account Number"] || entry.Account || "Unknown"
      
      // Use Entry Date for grouping by day
      const entryDate = entry["Entry Date"] || entry.EntryDate || entry.entryDate
      if (!entryDate) return
      
      // Parse date and get YYYY-MM-DD format
      const dateObj = new Date(entryDate)
      const dateKey = dateObj.toISOString().split('T')[0]
      
      // Initialize account if not exists
      if (!accountEntriesMap[accountId]) {
        accountEntriesMap[accountId] = []
      }
      
      // Store entry with date key and entry price
      const entryPrice = parseFloat(entry["Entry Price"] || entry.EntryPrice || entry.entryPrice || 0)
      accountEntriesMap[accountId].push({
        date: dateKey,
        entryPrice: entryPrice,
        timestamp: dateObj.getTime()
      })
    })
    
    // Create separate chart data for each account
    const accountChartData: Record<string, any[]> = {}
    
    Object.keys(accountEntriesMap).forEach((accountId) => {
      // Sort entries by date (timestamp)
      const sortedEntries = accountEntriesMap[accountId].sort((a, b) => a.timestamp - b.timestamp)
      
      // Group by date and get the last entry price for each day
      const datePriceMap: Record<string, number> = {}
      sortedEntries.forEach((entry) => {
        // Use the last entry price for each date (in case of multiple entries per day)
        datePriceMap[entry.date] = entry.entryPrice
      })
      
      const sortedDates = Object.keys(datePriceMap).sort()
      
      // Calculate P&L: current day entry price - previous day entry price
      let cumulativePL = 0
      const chartData = sortedDates.map((date, index) => {
        const currentEntryPrice = datePriceMap[date]
        const previousEntryPrice = index > 0 ? datePriceMap[sortedDates[index - 1]] : currentEntryPrice
        
        // P/L = current entry price - previous day entry price
        const dailyPL = currentEntryPrice - previousEntryPrice
        cumulativePL += dailyPL
        
        return {
          date: date,
          pl: parseFloat(dailyPL.toFixed(2)),
          cumulativePL: parseFloat(cumulativePL.toFixed(2))
        }
      })
      
      accountChartData[accountId] = chartData
    })
    
    setDailyChartData(accountChartData)
    console.log('accountChartData🎉🎉: ', accountChartData)
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
              <>
                {/* Profit/Loss Chart for All Accounts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Profit/Loss by Account</CardTitle>
                    <CardDescription>
                      Current profit and loss for each account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const chartData = accounts
                        .filter((account) => account.positions && account.positions.length > 0)
                        .map((account) => ({
                          account: account.account,
                          profitLoss: parseFloat((account.difference || 0).toFixed(2)),
                        }))
                      
                      return (
                        <ChartContainer
                          config={{
                            profitLoss: {
                              label: "Profit/Loss",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                          className="h-[400px] w-full"
                        >
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="account"
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis
                              tickFormatter={(value) => `$${value.toLocaleString()}`}
                            />
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const value = payload[0].value as number
                                  return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                      <div className="grid gap-2">
                                        <div className="font-medium">
                                          {payload[0].payload.account}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: payload[0].color }}
                                          />
                                          <span className="text-sm text-muted-foreground">
                                            Profit/Loss:
                                          </span>
                                          <span
                                            className={cn(
                                              "font-medium",
                                              value >= 0
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-rose-600 dark:text-rose-400"
                                            )}
                                          >
                                            {value >= 0 ? '+' : ''}
                                            ${value.toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar
                              dataKey="profitLoss"
                              radius={[4, 4, 0, 0]}
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.profitLoss >= 0
                                      ? "hsl(142, 76%, 36%)" // emerald-600
                                      : "hsl(0, 72%, 51%)" // rose-600
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Account Cards */}
                {accounts.map((account) => {
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
                          Profit/Loss: {account.difference >= 0 ? '+' : '-'} ${Math.abs(account.difference).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm mb-2">POSITIONS:</h3>
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
              })}
              </>
            )}
          </div>
        )}
        
        {activeTab === "total" && (
          <div className="space-y-6">
            {Object.keys(dailyChartData).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No historical data available
              </div>
            ) : (
              Object.keys(dailyChartData).map((accountId) => {
                const chartData = dailyChartData[accountId]
                if (!chartData || chartData.length === 0) return null
                
                const lastDataPoint = chartData[chartData.length - 1]
                const totalPL = lastDataPoint.cumulativePL || 0
                
                return (
                  <Card key={accountId}>
                    <CardHeader>
                      <CardTitle className="text-red-600">{accountId}</CardTitle>
                      <CardDescription>
                        <span
                          className={cn(
                            "text-lg font-semibold",
                            totalPL >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          Total P/L: {totalPL >= 0 ? '+' : ''}
                          ${totalPL.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          pl: {
                            label: "Daily P/L",
                            color: "hsl(var(--chart-1))",
                          },
                          cumulativePL: {
                            label: "Cumulative P/L",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[400px] w-full"
                      >
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) => {
                              const date = new Date(value)
                              return `${date.getMonth() + 1}/${date.getDate()}`
                            }}
                          />
                          <YAxis
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid gap-2">
                                      <div className="font-medium">
                                        {payload[0]?.payload?.date
                                          ? new Date(payload[0].payload.date).toLocaleDateString()
                                          : ''}
                                      </div>
                                      {payload.map((entry: any, index: number) => {
                                        const value = entry.value || 0
                                        return (
                                          <div key={index} className="flex items-center gap-2">
                                            <div
                                              className="h-2.5 w-2.5 rounded-full"
                                              style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                              {entry.name}:
                                            </span>
                                            <span
                                              className={cn(
                                                "font-medium",
                                                value >= 0
                                                  ? "text-emerald-600 dark:text-emerald-400"
                                                  : "text-rose-600 dark:text-rose-400"
                                              )}
                                            >
                                              ${value.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}
                                            </span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="cumulativePL"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 6 }}
                            name="Cumulative P/L"
                            connectNulls={true}
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
