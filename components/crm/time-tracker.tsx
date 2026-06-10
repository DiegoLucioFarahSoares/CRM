"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Pause, Square, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function TimeTracker() {
  const [time, setTime] = useState(4850) // 1:20:50 in seconds
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <Card className="border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.1) 20px,
              rgba(255,255,255,0.1) 40px
            )`,
          }}
        />
        <CardHeader className="pb-2 relative">
          <CardTitle className="text-sm font-medium text-primary-foreground/80">
            Tempo de Trabalho
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <motion.div
            key={time}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold font-mono tracking-wider"
          >
            {formatTime(time)}
          </motion.div>
          <div className="flex gap-2 mt-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 border-0"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <Pause className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Play className="w-5 h-5 text-primary-foreground" />
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="secondary"
                className="w-10 h-10 rounded-full bg-destructive hover:bg-destructive/90 border-0"
                onClick={() => {
                  setIsRunning(false)
                  setTime(0)
                }}
              >
                <Square className="w-5 h-5 text-white" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
