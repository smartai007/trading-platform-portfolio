"use client"

import { Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState , useEffect } from "react"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function StrategyManagementPage() {
  const [micromesStatus, setMicromesStatus] = useState<string>("")
  const [micromnqStatus, setMicromnqStatus] = useState<string>("")

  useEffect(() => {
    getStrategyStatus()
  }, [])

  const getStrategyStatus = async () => {
    const response = await fetch(`${BACKEND_URL}/getfuturemicroswingtradestatus`)
    const data = await response.json()

    const mes = data.current_status['mes_status']
    const mnq = data.current_status['mnq_status']
    console.log(mes, mnq)

    setMicromesStatus(String(mes))
    setMicromnqStatus(String(mnq))

    console.log(data)
  }

  const setmicromesStatus = async (status: string) => {
    console.log(status)
    setMicromesStatus(status)
    const payload = {
        "mes_status": status,
        "mnq_status": micromnqStatus
    }
    const res = await fetch(`${BACKEND_URL}/futuremicroswingtradestatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      toast.success("MicroMES Strategy status set successfully")
    } else {
      toast.error("MicroMES Strategy status set failed")
    }
  }

  const setmicromnqStatus = async (status: string) => {
    console.log(status)
    setMicromnqStatus(status)
    const payload = {
        "mes_status": micromesStatus,
        "mnq_status": status
    }
    const res = await fetch(`${BACKEND_URL}/futuremicroswingtradestatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      toast.success("MicroMNQ Strategy status set successfully")
    } else {
      toast.error("MicroMNQ Strategy status set failed")
    }
  }
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-3xl font-bold text-foreground">Strategy Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your trading strategies</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* MicroMES Strategy Status */}
        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">MicroMES Strategy</CardTitle>
            </div>
            <CardDescription>Micro E-mini S&P 500 Trading Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label className="text-base font-medium">Current Status</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="mes-true"
                    name="mes-status"
                    checked={micromesStatus === "true"}
                    onChange={() => {setmicromesStatus("true")}}
                    className="h-4 w-4 cursor-default"
                  />
                  <Label htmlFor="mes-true" className="font-normal cursor-default">
                    True (Active)
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="mes-false"
                    name="mes-status"
                    checked={micromesStatus === "false"}
                    onChange={() => {setmicromesStatus("false")}}
                    className="h-4 w-4 cursor-default"
                  />
                  <Label htmlFor="mes-false" className="font-normal cursor-default">
                    False (Inactive)
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MicroMNQ Strategy Status */}
        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">MicroMNQ Strategy</CardTitle>
            </div>
            <CardDescription>Micro E-mini NASDAQ-100 Trading Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label className="text-base font-medium">Current Status</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="mnq-true"
                    name="mnq-status"
                    checked={micromnqStatus === "true"}
                    onChange={() => {setmicromnqStatus("true")}}
                    className="h-4 w-4 cursor-default"
                  />
                  <Label htmlFor="mnq-true" className="font-normal cursor-default">
                    True (Active)
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="mnq-false"
                    name="mnq-status"
                    checked={micromnqStatus === "false"}
                    onChange={() => {setmicromnqStatus("false")}}
                    className="h-4 w-4 cursor-default"
                  />
                  <Label htmlFor="mnq-false" className="font-normal cursor-default">
                    False (Inactive)
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
