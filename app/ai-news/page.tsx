"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User } from "lucide-react"
import { useEffect, useRef } from "react"
import { TradingViewChart } from "@/components/trading-view-chart"

export default function AINewsPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const input = formData.get("message") as string

    if (input.trim()) {
      sendMessage({ text: input })
      e.currentTarget.reset()
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex h-screen flex-col gap-6 p-6 lg:flex-row">
      <div className="flex-1">
        <Card className="h-full bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Market Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)]">
            <TradingViewChart />
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full flex-col lg:w-[450px]">
        <Card className="flex h-full flex-col bg-card border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bot className="h-5 w-5 text-primary" />
              AI Trading Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="space-y-2">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Ask me about market trends, trading strategies, or news analysis
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <p key={index} className="text-sm leading-relaxed whitespace-pre-wrap">
                            {part.text}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {status === "in_progress" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="rounded-lg bg-secondary px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                name="message"
                placeholder="Ask about market trends..."
                disabled={status === "in_progress"}
                className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                disabled={status === "in_progress"}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
