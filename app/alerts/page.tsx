"use client"

import { Bell, TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Sample alert data
const alerts = [
  {
    id: 1,
    type: "price",
    severity: "high",
    title: "Price Alert: AAPL",
    message: "Apple Inc. has reached your target price of $180.00",
    timestamp: "2024-01-15 14:32:00",
    symbol: "AAPL",
    price: 180.0,
    change: 2.5,
    read: false,
  },
  {
    id: 2,
    type: "profit",
    severity: "medium",
    title: "Profit Target Reached",
    message: "Your TSLA position has reached +15% profit target",
    timestamp: "2024-01-15 12:15:00",
    symbol: "TSLA",
    price: 245.8,
    change: 15.2,
    read: false,
  },
  {
    id: 3,
    type: "loss",
    severity: "high",
    title: "Stop Loss Warning",
    message: "NVDA is approaching your stop loss level of $450.00",
    timestamp: "2024-01-15 10:45:00",
    symbol: "NVDA",
    price: 455.0,
    change: -8.3,
    read: true,
  },
  {
    id: 4,
    type: "news",
    severity: "low",
    title: "Market News Alert",
    message: "Federal Reserve announces interest rate decision",
    timestamp: "2024-01-15 09:00:00",
    symbol: "SPY",
    price: 478.5,
    change: 0.8,
    read: true,
  },
  {
    id: 5,
    type: "price",
    severity: "medium",
    title: "Price Alert: MSFT",
    message: "Microsoft has dropped below $380.00",
    timestamp: "2024-01-14 16:20:00",
    symbol: "MSFT",
    price: 378.5,
    change: -1.2,
    read: true,
  },
  {
    id: 6,
    type: "profit",
    severity: "high",
    title: "Major Profit Alert",
    message: "Your GOOGL position has gained +25% since entry",
    timestamp: "2024-01-14 14:10:00",
    symbol: "GOOGL",
    price: 142.3,
    change: 25.4,
    read: true,
  },
]

function getAlertIcon(type: string) {
  switch (type) {
    case "price":
      return Bell
    case "profit":
      return TrendingUp
    case "loss":
      return TrendingDown
    case "news":
      return Info
    default:
      return AlertTriangle
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "high":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    case "medium":
      return "bg-primary/10 text-primary border-primary/20"
    case "low":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function AlertsPage() {
  const unreadCount = alerts.filter((alert) => !alert.read).length

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-3xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground mt-1">Monitor your trading alerts and notifications</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default" className="bg-primary text-primary-foreground px-3 py-1">
            {unreadCount} Unread
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type)
          const isPositive = alert.change > 0

          return (
            <Card
              key={alert.id}
              className={`transition-all hover:border-primary/50 ${
                !alert.read ? "border-primary/30 bg-card/80" : "bg-card/50"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base font-semibold">{alert.title}</CardTitle>
                        {!alert.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <CardDescription className="text-sm">{alert.message}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-medium text-foreground">{alert.symbol}</div>
                    <div className="font-mono text-sm text-muted-foreground">${alert.price.toFixed(2)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{alert.timestamp}</span>
                  <span className={`font-mono font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}
                    {alert.change.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
